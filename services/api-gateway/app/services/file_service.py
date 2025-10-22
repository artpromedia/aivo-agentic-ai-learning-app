"""File service for upload and storage operations."""
import logging
import uuid
from pathlib import Path
from typing import Dict, Optional

import aiofiles
from fastapi import UploadFile

from app.core.config import settings  # type: ignore[import-not-found]

logger = logging.getLogger(__name__)


class FileService:
    """
    Service for handling file uploads and storage.

    Supports:
    - Local file system (development)
    - AWS S3 (production)
    - File validation
    - Cleanup
    """

    def __init__(self):
        self.use_s3 = settings.USE_S3
        self.upload_dir = Path(settings.UPLOAD_DIR)

        # Create upload directory if it doesn't exist
        if not self.use_s3:
            self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_homework_file(self, file: UploadFile) -> Dict:
        """
        Validate homework file upload.

        Returns:
            dict: {"valid": bool, "error": str, "size": int}
        """
        # Check file exists
        if not file:
            return {"valid": False, "error": "No file provided", "size": 0}

        # Get file size
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        # Check size
        if size > settings.MAX_UPLOAD_SIZE:
            max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
            return {
                "valid": False,
                "error": f"File size exceeds {max_mb}MB limit",
                "size": size
            }

        # Check extension
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''

        if ext not in settings.ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "error": f"File type .{ext} not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
                "size": size
            }

        return {"valid": True, "error": None, "size": size}

    def validate_iep_document(self, file: UploadFile) -> Dict:
        """
        Validate IEP document upload.

        Returns:
            dict: {"valid": bool, "error": str, "size": int}
        """
        # IEP documents have stricter requirements
        if not file:
            return {"valid": False, "error": "No file provided", "size": 0}

        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)

        # Check size (5MB limit for IEP docs)
        max_size = settings.IEP_UPLOAD_MAX_SIZE
        if size > max_size:
            max_mb = max_size / (1024 * 1024)
            return {
                "valid": False,
                "error": f"File size exceeds {max_mb}MB limit",
                "size": size
            }

        # Check format
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''

        if ext not in settings.IEP_ALLOWED_FORMATS:
            return {
                "valid": False,
                "error": f"Only {', '.join(settings.IEP_ALLOWED_FORMATS)} files allowed for IEP documents",
                "size": size
            }

        return {"valid": True, "error": None, "size": size}

    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "uploads"
    ) -> str:
        """
        Upload file to storage.

        Args:
            file: File to upload
            folder: Folder path within storage

        Returns:
            str: URL or path to uploaded file
        """
        # Generate unique filename
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'bin'
        unique_filename = f"{uuid.uuid4()}.{ext}"

        if self.use_s3:
            return await self._upload_to_s3(file, folder, unique_filename)
        else:
            return await self._upload_to_local(file, folder, unique_filename)

    async def _upload_to_local(
        self,
        file: UploadFile,
        folder: str,
        filename: str
    ) -> str:
        """Upload to local file system."""
        # Create folder structure
        folder_path = self.upload_dir / folder
        folder_path.mkdir(parents=True, exist_ok=True)

        file_path = folder_path / filename

        # Write file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        # Return relative path
        relative_path = f"/{folder}/{filename}"

        logger.info(f"File uploaded to local storage: {relative_path}")

        return relative_path

    async def _upload_to_s3(
        self,
        file: UploadFile,
        folder: str,
        filename: str
    ) -> str:
        """Upload to AWS S3."""
        import boto3
        from botocore.exceptions import ClientError

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        s3_key = f"{folder}/{filename}"

        try:
            # Read file content
            content = await file.read()

            # Upload to S3
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type
            )

            # Generate URL
            url = f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"

            logger.info(f"File uploaded to S3: {url}")

            return url

        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")

    async def delete_file(self, file_url: str) -> bool:
        """
        Delete file from storage.

        Args:
            file_url: URL or path to file

        Returns:
            bool: Success status
        """
        if self.use_s3:
            return await self._delete_from_s3(file_url)
        else:
            return await self._delete_from_local(file_url)

    async def _delete_from_local(self, file_path: str) -> bool:
        """Delete from local file system."""
        try:
            full_path = self.upload_dir / file_path.lstrip('/')

            if full_path.exists():
                full_path.unlink()
                logger.info(f"File deleted: {file_path}")
                return True

            return False

        except Exception as e:
            logger.error(f"Failed to delete file {file_path}: {e}")
            return False

    async def _delete_from_s3(self, file_url: str) -> bool:
        """Delete from AWS S3."""
        import boto3
        from botocore.exceptions import ClientError

        try:
            # Extract S3 key from URL
            s3_key = file_url.split('.com/')[-1]

            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )

            s3_client.delete_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key
            )

            logger.info(f"File deleted from S3: {s3_key}")
            return True

        except ClientError as e:
            logger.error(f"S3 deletion failed: {e}")
            return False

    def get_file_info(self, file_url: str) -> Optional[Dict]:
        """
        Get file metadata.

        Returns:
            dict: {"exists": bool, "size": int, "modified": datetime}
        """
        if self.use_s3:
            return self._get_s3_info(file_url)
        else:
            return self._get_local_info(file_url)

    def _get_local_info(self, file_path: str) -> Optional[Dict]:
        """Get info for local file."""
        try:
            full_path = self.upload_dir / file_path.lstrip('/')

            if not full_path.exists():
                return None

            stat = full_path.stat()

            return {
                "exists": True,
                "size": stat.st_size,
                "modified": stat.st_mtime
            }

        except Exception as e:
            logger.error(f"Failed to get file info: {e}")
            return None

    def _get_s3_info(self, file_url: str) -> Optional[Dict]:
        """Get info for S3 file."""
        import boto3
        from botocore.exceptions import ClientError

        try:
            s3_key = file_url.split('.com/')[-1]

            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )

            response = s3_client.head_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key
            )

            return {
                "exists": True,
                "size": response['ContentLength'],
                "modified": response['LastModified'].timestamp()
            }

        except ClientError:
            return None
