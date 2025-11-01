"""add district portal tables for training, integrations, and support

Revision ID: f8a3c2d45678
Revises: e91f04f09d50
Create Date: 2025-10-31 21:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers, used by Alembic.
revision: str = 'f8a3c2d45678'
down_revision: Union[str, None] = 'e91f04f09d50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create training_modules table
    op.create_table(
        'training_modules',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('difficulty', sa.String(50), nullable=False),
        sa.Column('duration', sa.Integer, nullable=False, comment='Duration in minutes'),
        sa.Column('rating', sa.Float, default=0.0),
        sa.Column('thumbnail_url', sa.String(512), nullable=True),
        sa.Column('content_url', sa.String(512), nullable=True),
        sa.Column('is_published', sa.Boolean, default=True),
        sa.Column('order', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()'), onupdate=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_training_modules_category', 'training_modules', ['category'])
    op.create_index('idx_training_modules_type', 'training_modules', ['type'])

    # Create training_enrollments table
    op.create_table(
        'training_enrollments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('module_id', UUID(as_uuid=True), sa.ForeignKey('training_modules.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), default='not_started', nullable=False),
        sa.Column('progress', sa.Integer, default=0, comment='Progress percentage 0-100'),
        sa.Column('started_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('rating', sa.Float, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()'), onupdate=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_training_enrollments_user', 'training_enrollments', ['user_id'])
    op.create_index('idx_training_enrollments_module', 'training_enrollments', ['module_id'])
    op.create_index('idx_training_enrollments_status', 'training_enrollments', ['status'])

    # Create certifications table
    op.create_table(
        'certifications',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('module_id', UUID(as_uuid=True), sa.ForeignKey('training_modules.id', ondelete='CASCADE'), nullable=False),
        sa.Column('certificate_number', sa.String(100), unique=True, nullable=False),
        sa.Column('issued_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('is_valid', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_certifications_user', 'certifications', ['user_id'])
    op.create_index('idx_certifications_module', 'certifications', ['module_id'])

    # Create integrations table
    op.create_table(
        'integrations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('district_id', UUID(as_uuid=True), sa.ForeignKey('districts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('provider', sa.String(100), nullable=False),
        sa.Column('integration_type', sa.String(50), nullable=False, comment='SIS, LMS, Communication, Assessment'),
        sa.Column('status', sa.String(20), default='inactive', nullable=False),
        sa.Column('api_key', sa.String(500), nullable=True),
        sa.Column('api_secret', sa.String(500), nullable=True),
        sa.Column('base_url', sa.String(500), nullable=True),
        sa.Column('oauth_token', sa.Text, nullable=True),
        sa.Column('oauth_refresh_token', sa.Text, nullable=True),
        sa.Column('oauth_expires_at', sa.DateTime, nullable=True),
        sa.Column('sync_frequency', sa.String(50), default='Every 6 hours'),
        sa.Column('last_sync', sa.DateTime, nullable=True),
        sa.Column('next_scheduled_sync', sa.DateTime, nullable=True),
        sa.Column('records_synced', sa.Integer, default=0),
        sa.Column('data_mapping', postgresql.JSONB, nullable=True),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('error_count', sa.Integer, default=0),
        sa.Column('last_error_at', sa.DateTime, nullable=True),
        sa.Column('webhook_url', sa.String(500), nullable=True),
        sa.Column('webhook_secret', sa.String(255), nullable=True),
        sa.Column('webhook_enabled', sa.Boolean, default=False),
        sa.Column('config_metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()'), onupdate=sa.text('NOW()'), nullable=False),
        sa.Column('connected_at', sa.DateTime, nullable=True),
        sa.Column('disconnected_at', sa.DateTime, nullable=True),
    )
    op.create_index('idx_integrations_district', 'integrations', ['district_id'])
    op.create_index('idx_integrations_status', 'integrations', ['status'])
    op.create_index('idx_integrations_provider', 'integrations', ['provider'])

    # Create integration_sync_logs table
    op.create_table(
        'integration_sync_logs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('integration_id', UUID(as_uuid=True), sa.ForeignKey('integrations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sync_type', sa.String(50), default='manual', nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('records_processed', sa.Integer, default=0),
        sa.Column('records_created', sa.Integer, default=0),
        sa.Column('records_updated', sa.Integer, default=0),
        sa.Column('records_failed', sa.Integer, default=0),
        sa.Column('started_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('duration_seconds', sa.Integer, nullable=True),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('error_details', postgresql.JSONB, nullable=True),
        sa.Column('sync_metadata', postgresql.JSONB, nullable=True),
    )
    op.create_index('idx_integration_sync_logs_integration', 'integration_sync_logs', ['integration_id'])
    op.create_index('idx_integration_sync_logs_status', 'integration_sync_logs', ['status'])

    # Create support_tickets table
    op.create_table(
        'support_tickets',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('ticket_number', sa.String(50), unique=True, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('priority', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), default='open', nullable=False),
        sa.Column('submitted_by', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('submitted_by_name', sa.String(255), nullable=True),
        sa.Column('submitted_by_role', sa.String(50), nullable=True),
        sa.Column('school_name', sa.String(255), nullable=True),
        sa.Column('assigned_to', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()'), onupdate=sa.text('NOW()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
        sa.Column('closed_at', sa.DateTime, nullable=True),
    )
    op.create_index('idx_support_tickets_number', 'support_tickets', ['ticket_number'])
    op.create_index('idx_support_tickets_status', 'support_tickets', ['status'])
    op.create_index('idx_support_tickets_priority', 'support_tickets', ['priority'])
    op.create_index('idx_support_tickets_submitter', 'support_tickets', ['submitted_by'])

    # Create ticket_replies table
    op.create_table(
        'ticket_replies',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('ticket_id', UUID(as_uuid=True), sa.ForeignKey('support_tickets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('author_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('author_name', sa.String(255), nullable=True),
        sa.Column('is_staff_reply', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_ticket_replies_ticket', 'ticket_replies', ['ticket_id'])
    op.create_index('idx_ticket_replies_author', 'ticket_replies', ['author_id'])

    # Create knowledge_base_articles table
    op.create_table(
        'kb_articles',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('summary', sa.Text, nullable=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('tags', sa.Text, nullable=True),
        sa.Column('is_published', sa.Boolean, default=True, nullable=False),
        sa.Column('view_count', sa.Integer, default=0, nullable=False),
        sa.Column('helpful_count', sa.Integer, default=0, nullable=False),
        sa.Column('not_helpful_count', sa.Integer, default=0, nullable=False),
        sa.Column('author_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('NOW()'), onupdate=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_kb_articles_category', 'kb_articles', ['category'])
    op.create_index('idx_kb_articles_published', 'kb_articles', ['is_published'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('kb_articles')
    op.drop_table('ticket_replies')
    op.drop_table('support_tickets')
    op.drop_table('integration_sync_logs')
    op.drop_table('integrations')
    op.drop_table('certifications')
    op.drop_table('training_enrollments')
    op.drop_table('training_modules')
