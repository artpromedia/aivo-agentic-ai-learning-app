"""
District Reports API endpoints.
Handles report generation, scheduling, and file downloads with PDF/Excel/CSV support.
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app.api.deps import get_db, require_admin
from app.models.report import (
    Report,
    ScheduledReport,
    ReportTemplate,
    ReportType,
    ReportFormat,
    ReportStatus,
    ScheduleFrequency,
)
from app.models.user import User

router = APIRouter()


# ============================================================================
# Pydantic Models
# ============================================================================

class ReportGenerateRequest(BaseModel):
    """Request model for generating a new report."""
    report_type: str = Field(..., description="Type of report to generate")
    report_name: str = Field(..., description="Custom name for the report")
    format: str = Field(default="pdf", description="Export format: pdf, excel, or csv")
    date_range_start: Optional[datetime] = Field(None, description="Start date for data range")
    date_range_end: Optional[datetime] = Field(None, description="End date for data range")
    filters: Optional[dict] = Field(None, description="Additional filters/parameters")


class ReportResponse(BaseModel):
    """Response model for report details."""
    id: int
    report_type: str
    report_name: str
    description: Optional[str]
    format: str
    status: str
    file_name: Optional[str]
    file_size: Optional[int]
    date_range_start: Optional[datetime]
    date_range_end: Optional[datetime]
    generated_by: int
    generated_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    
    class Config:
        from_attributes = True


class ScheduledReportCreate(BaseModel):
    """Request model for creating a scheduled report."""
    name: str = Field(..., description="Name of the scheduled report")
    description: Optional[str] = Field(None, description="Description")
    report_type: str = Field(..., description="Type of report")
    format: str = Field(default="pdf", description="Export format")
    frequency: str = Field(..., description="daily, weekly, monthly, quarterly, annually")
    schedule_config: Optional[dict] = Field(None, description="Day of week, time, etc.")
    date_range_type: Optional[str] = Field(None, description="last_week, last_month, etc.")
    filters: Optional[dict] = Field(None, description="Report filters")
    email_recipients: Optional[List[str]] = Field(None, description="Email addresses")
    save_to_dashboard: bool = Field(True, description="Save to dashboard")


class ScheduledReportUpdate(BaseModel):
    """Request model for updating a scheduled report."""
    name: Optional[str] = None
    description: Optional[str] = None
    format: Optional[str] = None
    frequency: Optional[str] = None
    schedule_config: Optional[dict] = None
    date_range_type: Optional[str] = None
    filters: Optional[dict] = None
    email_recipients: Optional[List[str]] = None
    save_to_dashboard: Optional[bool] = None
    is_active: Optional[bool] = None


class ScheduledReportResponse(BaseModel):
    """Response model for scheduled report details."""
    id: int
    name: str
    description: Optional[str]
    report_type: str
    format: str
    frequency: str
    schedule_config: Optional[dict]
    date_range_type: Optional[str]
    filters: Optional[dict]
    email_recipients: Optional[List[str]]
    save_to_dashboard: bool
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
    last_run_at: Optional[datetime]
    next_run_at: Optional[datetime]
    last_run_status: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================================================
# Report Generation Helper Functions
# ============================================================================

def generate_report_file(
    report: Report,
    db: Session,
) -> str:
    """
    Generate the actual report file based on type and format.
    Returns the file path where the report was saved.
    
    This is a placeholder implementation. In production, you would:
    1. Query the necessary data based on report_type and filters
    2. Generate PDF using ReportLab, Excel using openpyxl, or CSV
    3. Save to a secure file storage location
    4. Return the file path
    """
    import os
    import json
    from pathlib import Path
    
    # Create reports directory if it doesn't exist
    reports_dir = Path("storage/reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = report.format
    if file_extension == "excel":
        file_extension = "xlsx"
    
    safe_name = report.report_name.replace(" ", "_").replace("/", "-")
    file_name = f"{safe_name}_{timestamp}.{file_extension}"
    file_path = reports_dir / file_name
    
    # Generate file based on format
    if report.format == "pdf":
        generate_pdf_report(report, str(file_path), db)
    elif report.format == "excel":
        generate_excel_report(report, str(file_path), db)
    elif report.format == "csv":
        generate_csv_report(report, str(file_path), db)
    else:
        raise ValueError(f"Unsupported format: {report.format}")
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    return str(file_path), file_name, file_size


def generate_pdf_report(report: Report, file_path: str, db: Session):
    """Generate PDF report using ReportLab."""
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
        from reportlab.platypus import Image as RLImage
        
        # Create PDF document
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#4F46E5'),
            spaceAfter=30,
        )
        story.append(Paragraph(report.report_name, title_style))
        story.append(Spacer(1, 0.3 * inch))
        
        # Report metadata
        if report.description:
            story.append(Paragraph(f"<b>Description:</b> {report.description}", styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
        
        date_range = ""
        if report.date_range_start and report.date_range_end:
            date_range = f"{report.date_range_start.strftime('%Y-%m-%d')} to {report.date_range_end.strftime('%Y-%m-%d')}"
        elif report.date_range_start:
            date_range = f"From {report.date_range_start.strftime('%Y-%m-%d')}"
        elif report.date_range_end:
            date_range = f"Until {report.date_range_end.strftime('%Y-%m-%d')}"
        else:
            date_range = "All available data"
        
        story.append(Paragraph(f"<b>Date Range:</b> {date_range}", styles['Normal']))
        story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        story.append(Spacer(1, 0.5 * inch))
        
        # Add report-specific content based on report type
        story.extend(get_report_content(report, db, styles))
        
        # Build PDF
        doc.build(story)
        
    except ImportError:
        # If ReportLab is not installed, create a simple text file as fallback
        with open(file_path, 'w') as f:
            f.write(f"Report: {report.report_name}\n")
            f.write(f"Type: {report.report_type}\n")
            f.write(f"Generated: {datetime.now()}\n")
            f.write("\n" + "="*50 + "\n")
            f.write("\nPDF generation requires ReportLab library.\n")
            f.write("Install with: pip install reportlab\n")
            f.write("\nThis is a placeholder report file.\n")


def generate_excel_report(report: Report, file_path: str, db: Session):
    """Generate Excel report using openpyxl."""
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
        
        wb = Workbook()
        ws = wb.active
        ws.title = "Report Summary"
        
        # Header styling
        header_fill = PatternFill(start_color="4F46E5", end_color="4F46E5", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=14)
        
        # Title
        ws['A1'] = report.report_name
        ws['A1'].font = Font(bold=True, size=18, color="4F46E5")
        ws.merge_cells('A1:D1')
        
        # Metadata
        ws['A3'] = "Report Type:"
        ws['B3'] = report.report_type
        ws['A4'] = "Generated:"
        ws['B4'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        if report.date_range_start and report.date_range_end:
            ws['A5'] = "Date Range:"
            ws['B5'] = f"{report.date_range_start.strftime('%Y-%m-%d')} to {report.date_range_end.strftime('%Y-%m-%d')}"
        
        # Add report-specific data
        data = get_report_data(report, db)
        
        # Data table
        row = 7
        ws[f'A{row}'] = "Data Section"
        ws[f'A{row}'].font = header_font
        ws[f'A{row}'].fill = header_fill
        
        # Add sample data structure
        row += 2
        headers = ["Metric", "Value", "Status", "Notes"]
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=row, column=col, value=header)
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="E0E7FF", end_color="E0E7FF", fill_type="solid")
        
        # Add data rows (placeholder)
        sample_data = [
            ["Total Students", "1,234", "✓", "Active enrollment"],
            ["IEP Compliance", "94.5%", "✓", "Above target"],
            ["Teacher Adoption", "87.2%", "⚠", "Needs improvement"],
        ]
        
        for row_data in sample_data:
            row += 1
            for col, value in enumerate(row_data, start=1):
                ws.cell(row=row, column=col, value=value)
        
        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column = [cell for cell in column]
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(cell.value)
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column[0].column_letter].width = adjusted_width
        
        wb.save(file_path)
        
    except ImportError:
        # Fallback to CSV if openpyxl is not installed
        generate_csv_report(report, file_path.replace('.xlsx', '.csv'), db)


def generate_csv_report(report: Report, file_path: str, db: Session):
    """Generate CSV report."""
    import csv
    
    with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # Metadata rows
        writer.writerow(['Report Name', report.report_name])
        writer.writerow(['Report Type', report.report_type])
        writer.writerow(['Generated', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        
        if report.date_range_start and report.date_range_end:
            writer.writerow(['Date Range', f"{report.date_range_start.strftime('%Y-%m-%d')} to {report.date_range_end.strftime('%Y-%m-%d')}"])
        
        writer.writerow([])  # Empty row
        
        # Data section
        writer.writerow(['Metric', 'Value', 'Status', 'Notes'])
        
        # Add sample data (placeholder)
        sample_data = [
            ['Total Students', '1,234', 'Active', 'Active enrollment'],
            ['IEP Compliance', '94.5%', 'Good', 'Above target'],
            ['Teacher Adoption', '87.2%', 'Warning', 'Needs improvement'],
        ]
        
        writer.writerows(sample_data)


def get_report_content(report: Report, db: Session, styles):
    """Get report-specific content for PDF generation."""
    from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    
    content = []
    
    # Add report-type specific sections
    content.append(Paragraph(f"<b>{report.report_type.replace('-', ' ').title()} Report</b>", styles['Heading2']))
    content.append(Spacer(1, 0.2 * inch))
    
    # Sample data table
    data = [
        ['Metric', 'Value', 'Status'],
        ['Total Students', '1,234', '✓ Active'],
        ['IEP Compliance', '94.5%', '✓ Good'],
        ['Teacher Adoption', '87.2%', '⚠ Warning'],
        ['Parent Engagement', '76.8%', '✓ Good'],
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
    ]))
    
    content.append(table)
    content.append(Spacer(1, 0.3 * inch))
    
    # Additional notes
    content.append(Paragraph("<b>Notes:</b>", styles['Heading3']))
    content.append(Paragraph(
        "This is a generated report based on the selected criteria. "
        "For more detailed analysis, please refer to the individual school reports or contact the district office.",
        styles['Normal']
    ))
    
    return content


def get_report_data(report: Report, db: Session) -> dict:
    """Fetch report-specific data from database."""
    # Placeholder - in production, this would query actual data based on report_type
    return {
        "metrics": [
            {"name": "Total Students", "value": 1234},
            {"name": "IEP Compliance", "value": 94.5},
            {"name": "Teacher Adoption", "value": 87.2},
        ]
    }


async def process_report_generation(report_id: int, db: Session):
    """Background task to process report generation."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return
    
    try:
        # Update status to processing
        report.status = ReportStatus.PROCESSING
        db.commit()
        
        # Generate the report file
        file_path, file_name, file_size = generate_report_file(report, db)
        
        # Update report with file details
        report.file_path = file_path
        report.file_name = file_name
        report.file_size = file_size
        report.status = ReportStatus.COMPLETED
        report.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        report.status = ReportStatus.FAILED
        report.error_message = str(e)
        db.commit()


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(
    request: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Generate a new district report.
    Supports PDF, Excel, and CSV formats with optional date range filtering.
    """
    # Create report record
    report = Report(
        report_type=request.report_type,
        report_name=request.report_name,
        description=f"Generated {request.format.upper()} report for {request.report_type}",
        format=request.format,
        status=ReportStatus.PENDING,
        date_range_start=request.date_range_start,
        date_range_end=request.date_range_end,
        filters=request.filters,
        generated_by=admin.id,
        generated_at=datetime.utcnow(),
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Schedule background task for report generation
    background_tasks.add_task(process_report_generation, report.id, db)
    
    return report


@router.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100, description="Number of reports to return"),
    offset: int = Query(0, ge=0, description="Number of reports to skip"),
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    List all generated reports with optional filtering.
    Returns reports ordered by generation date (newest first).
    """
    query = db.query(Report)
    
    # Apply filters
    if report_type:
        query = query.filter(Report.report_type == report_type)
    
    if status:
        query = query.filter(Report.status == status)
    
    # Order by date descending
    query = query.order_by(desc(Report.generated_at))
    
    # Pagination
    reports = query.offset(offset).limit(limit).all()
    
    return reports


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Get details of a specific report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.get("/reports/{report_id}/download")
async def download_report(
    report_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Download a generated report file.
    Returns the file for download with appropriate content-type headers.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.status != ReportStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Report is not ready for download. Current status: {report.status}"
        )
    
    if not report.file_path or not report.file_name:
        raise HTTPException(status_code=404, detail="Report file not found")
    
    # Check if file exists
    from pathlib import Path
    file_path = Path(report.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report file no longer exists")
    
    # Determine media type
    media_type_map = {
        "pdf": "application/pdf",
        "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "csv": "text/csv",
    }
    media_type = media_type_map.get(report.format, "application/octet-stream")
    
    return FileResponse(
        path=str(file_path),
        filename=report.file_name,
        media_type=media_type,
    )


@router.post("/schedule", response_model=ScheduledReportResponse, status_code=201)
async def create_scheduled_report(
    request: ScheduledReportCreate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """
    Create a new scheduled automated report.
    Supports recurring reports with various frequencies.
    """
    # Create scheduled report
    scheduled_report = ScheduledReport(
        name=request.name,
        description=request.description,
        report_type=request.report_type,
        format=request.format,
        frequency=request.frequency,
        schedule_config=request.schedule_config,
        date_range_type=request.date_range_type,
        filters=request.filters,
        email_recipients=request.email_recipients,
        save_to_dashboard=request.save_to_dashboard,
        is_active=True,
        created_by=admin.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    # Calculate next_run_at based on frequency (simplified)
    if request.frequency == "daily":
        scheduled_report.next_run_at = datetime.utcnow() + timedelta(days=1)
    elif request.frequency == "weekly":
        scheduled_report.next_run_at = datetime.utcnow() + timedelta(weeks=1)
    elif request.frequency == "monthly":
        scheduled_report.next_run_at = datetime.utcnow() + timedelta(days=30)
    elif request.frequency == "quarterly":
        scheduled_report.next_run_at = datetime.utcnow() + timedelta(days=90)
    elif request.frequency == "annually":
        scheduled_report.next_run_at = datetime.utcnow() + timedelta(days=365)
    
    db.add(scheduled_report)
    db.commit()
    db.refresh(scheduled_report)
    
    return scheduled_report


@router.get("/scheduled", response_model=List[ScheduledReportResponse])
async def list_scheduled_reports(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """List all scheduled automated reports."""
    query = db.query(ScheduledReport)
    
    if is_active is not None:
        query = query.filter(ScheduledReport.is_active == is_active)
    
    scheduled_reports = query.order_by(desc(ScheduledReport.created_at)).all()
    
    return scheduled_reports


@router.patch("/scheduled/{schedule_id}", response_model=ScheduledReportResponse)
async def update_scheduled_report(
    schedule_id: int,
    request: ScheduledReportUpdate,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Update an existing scheduled report."""
    scheduled_report = db.query(ScheduledReport).filter(
        ScheduledReport.id == schedule_id
    ).first()
    
    if not scheduled_report:
        raise HTTPException(status_code=404, detail="Scheduled report not found")
    
    # Update fields if provided
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scheduled_report, field, value)
    
    scheduled_report.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(scheduled_report)
    
    return scheduled_report


@router.delete("/scheduled/{schedule_id}", status_code=204)
async def delete_scheduled_report(
    schedule_id: int,
    admin: User = Depends(require_admin()),
    db: Session = Depends(get_db),
):
    """Delete a scheduled report."""
    scheduled_report = db.query(ScheduledReport).filter(
        ScheduledReport.id == schedule_id
    ).first()
    
    if not scheduled_report:
        raise HTTPException(status_code=404, detail="Scheduled report not found")
    
    db.delete(scheduled_report)
    db.commit()
    
    return None
