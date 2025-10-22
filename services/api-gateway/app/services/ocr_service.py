"""OCR service for text extraction from images and documents."""
import asyncio
import logging
from io import BytesIO
from pathlib import Path
from typing import Dict

from app.core.config import settings  # type: ignore[import-not-found]
from app.core.database import SessionLocal  # type: ignore[import-not-found]
from app.models.homework import HomeworkFile  # type: ignore[import-not-found]

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for OCR (Optical Character Recognition) processing.

    Supports:
    - Tesseract (local, free)
    - Google Vision API (cloud, high accuracy)
    - AWS Textract (cloud, advanced features)
    """

    def __init__(self):
        self.engine = settings.OCR_ENGINE

    async def process_file_async(self, file_id: str, file_url: str):
        """
        Process file with OCR asynchronously.

        Updates database record with extracted text.
        """
        # Run in background
        asyncio.create_task(self._process_file(file_id, file_url))

    async def _process_file(self, file_id: str, file_url: str):
        """Background OCR processing."""
        db = SessionLocal()
        file_record = None

        try:
            # Get file record
            file_record = db.query(HomeworkFile).filter(
                HomeworkFile.id == file_id
            ).first()

            if not file_record:
                logger.error(f"File {file_id} not found")
                return

            # Update status
            file_record.ocr_status = "processing"
            db.commit()

            # Perform OCR based on engine
            if self.engine == "tesseract":
                result = await self._process_with_tesseract(file_url)
            elif self.engine == "google-vision":
                result = await self._process_with_google_vision(file_url)
            elif self.engine == "aws-textract":
                result = await self._process_with_textract(file_url)
            else:
                raise ValueError(f"Unknown OCR engine: {self.engine}")

            # Update record
            file_record.ocr_status = "completed"
            file_record.extracted_text = result["text"]
            file_record.ocr_confidence = result["confidence"]

            db.commit()

            logger.info(f"OCR completed for file {file_id}")

        except Exception as e:
            logger.error(f"OCR failed for file {file_id}: {e}")

            # Update status
            if file_record:
                file_record.ocr_status = "failed"
                db.commit()

        finally:
            db.close()

    async def _process_with_tesseract(self, file_url: str) -> Dict:
        """Process with Tesseract OCR."""
        try:
            import pytesseract
            import requests
            from PIL import Image

            # Download image
            if file_url.startswith('http'):
                response = requests.get(file_url)
                image = Image.open(BytesIO(response.content))
            else:
                # Local file
                file_path = Path(settings.UPLOAD_DIR) / file_url.lstrip('/')
                image = Image.open(file_path)

            # Perform OCR
            text = pytesseract.image_to_string(image)

            # Get confidence (average of all words)
            data = pytesseract.image_to_data(
                image,
                output_type=pytesseract.Output.DICT
            )
            confidences = [
                int(conf) for conf in data['conf'] if conf != '-1'
            ]
            avg_confidence = (
                sum(confidences) / len(confidences) if confidences else 0
            )

            return {
                "text": text.strip(),
                "confidence": int(avg_confidence)
            }

        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            raise

    async def _process_with_google_vision(self, file_url: str) -> Dict:
        """Process with Google Vision API."""
        try:
            from google.cloud import vision

            client = vision.ImageAnnotatorClient()

            # Download image
            if file_url.startswith('http'):
                image = vision.Image()
                image.source.image_uri = file_url
            else:
                # Local file
                file_path = Path(settings.UPLOAD_DIR) / file_url.lstrip('/')
                with open(file_path, 'rb') as f:
                    content = f.read()
                image = vision.Image(content=content)

            # Perform OCR
            response = client.document_text_detection(image=image)

            if response.error.message:
                raise Exception(response.error.message)

            text = response.full_text_annotation.text

            # Calculate average confidence
            confidences = []
            for page in response.full_text_annotation.pages:
                for block in page.blocks:
                    confidences.append(block.confidence)

            avg_confidence = (
                (sum(confidences) / len(confidences) * 100)
                if confidences else 0
            )

            return {
                "text": text.strip(),
                "confidence": int(avg_confidence)
            }

        except Exception as e:
            logger.error(f"Google Vision OCR failed: {e}")
            raise

    async def _process_with_textract(self, file_url: str) -> Dict:
        """Process with AWS Textract."""
        try:
            import boto3
            import requests

            textract = boto3.client(
                'textract',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )

            # Download document
            if file_url.startswith('http'):
                response = requests.get(file_url)
                document_bytes = response.content
            else:
                file_path = Path(settings.UPLOAD_DIR) / file_url.lstrip('/')
                with open(file_path, 'rb') as f:
                    document_bytes = f.read()

            # Perform OCR
            response = textract.detect_document_text(
                Document={'Bytes': document_bytes}
            )

            # Extract text
            text_lines = []
            confidences = []

            for block in response['Blocks']:
                if block['BlockType'] == 'LINE':
                    text_lines.append(block['Text'])
                    confidences.append(block['Confidence'])

            text = '\n'.join(text_lines)
            avg_confidence = (
                sum(confidences) / len(confidences) if confidences else 0
            )

            return {
                "text": text.strip(),
                "confidence": int(avg_confidence)
            }

        except Exception as e:
            logger.error(f"Textract OCR failed: {e}")
            raise

    def process_pdf(self, file_path: str) -> Dict:
        """
        Extract text from PDF.

        For PDFs, we first try to extract text directly.
        If that fails (scanned PDF), we convert to images and OCR.
        """
        try:
            import PyPDF2

            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)

                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()

                if text.strip():
                    # Successfully extracted text
                    return {
                        "text": text.strip(),
                        "confidence": 100  # Direct extraction
                    }
                else:
                    # Scanned PDF - need OCR
                    return self._ocr_pdf_pages(file_path)

        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            raise

    def _ocr_pdf_pages(self, file_path: str) -> Dict:
        """Convert PDF pages to images and OCR."""
        try:
            import pytesseract
            from pdf2image import convert_from_path

            # Convert PDF to images
            images = convert_from_path(file_path)

            all_text = []
            all_confidences = []

            for image in images:
                # OCR each page
                text = pytesseract.image_to_string(image)
                all_text.append(text)

                # Get confidence
                data = pytesseract.image_to_data(
                    image,
                    output_type=pytesseract.Output.DICT
                )
                confidences = [
                    int(conf) for conf in data['conf'] if conf != '-1'
                ]

                if confidences:
                    all_confidences.extend(confidences)

            combined_text = '\n\n'.join(all_text)
            avg_confidence = (
                sum(all_confidences) / len(all_confidences)
                if all_confidences else 0
            )

            return {
                "text": combined_text.strip(),
                "confidence": int(avg_confidence)
            }

        except Exception as e:
            logger.error(f"PDF OCR failed: {e}")
            raise
