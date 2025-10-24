"""add_licensing_vault_district_management

Revision ID: e91f04f09d50
Revises: 4ff281d56369
Create Date: 2025-10-23 17:05:45.469743

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e91f04f09d50'
down_revision: Union[str, None] = '4ff281d56369'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create district_accounts table
    op.create_table(
        'district_accounts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('district_name', sa.String(length=500), nullable=False),
        sa.Column('district_code', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('city', sa.String(length=255), nullable=True),
        sa.Column('postal_codes', sa.JSON(), nullable=True),
        sa.Column('primary_contact_name', sa.String(length=255), nullable=False),
        sa.Column('primary_contact_email', sa.String(length=255), nullable=False),
        sa.Column('primary_contact_phone', sa.String(length=20), nullable=True),
        sa.Column('billing_contact_name', sa.String(length=255), nullable=True),
        sa.Column('billing_contact_email', sa.String(length=255), nullable=True),
        sa.Column('billing_contact_phone', sa.String(length=20), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED', name='districtstatus'), nullable=False),
        sa.Column('contract_start_date', sa.DateTime(), nullable=False),
        sa.Column('contract_end_date', sa.DateTime(), nullable=False),
        sa.Column('total_seats_purchased', sa.Integer(), nullable=False),
        sa.Column('seats_allocated', sa.Integer(), nullable=False),
        sa.Column('seats_activated', sa.Integer(), nullable=False),
        sa.Column('seats_available', sa.Integer(), nullable=False),
        sa.Column('price_per_seat', sa.DECIMAL(10, 2), nullable=True),
        sa.Column('total_contract_value', sa.DECIMAL(12, 2), nullable=True),
        sa.Column('auto_renewal', sa.Boolean(), nullable=False),
        sa.Column('allow_teacher_self_registration', sa.Boolean(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('district_code')
    )
    op.create_index('ix_district_accounts_district_code', 'district_accounts', ['district_code'])

    # Create school_accounts table
    op.create_table(
        'school_accounts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('district_id', sa.String(length=36), nullable=False),
        sa.Column('school_name', sa.String(length=500), nullable=False),
        sa.Column('school_code', sa.String(length=100), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('city', sa.String(length=255), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('principal_name', sa.String(length=255), nullable=True),
        sa.Column('principal_email', sa.String(length=255), nullable=True),
        sa.Column('admin_email', sa.String(length=255), nullable=True),
        sa.Column('seats_allocated', sa.Integer(), nullable=False),
        sa.Column('seats_used', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['district_id'], ['district_accounts.id'], ondelete='CASCADE')
    )
    op.create_index('ix_school_accounts_district_id', 'school_accounts', ['district_id'])

    # Create license_vault table
    op.create_table(
        'license_vault',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('license_type', sa.Enum('DISTRICT', 'SCHOOL', 'INDIVIDUAL', 'TRIAL', 'ENTERPRISE', name='licensetype'), nullable=False),
        sa.Column('status', sa.Enum('AVAILABLE', 'ASSIGNED', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED', name='licensestatus'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('quantity_remaining', sa.Integer(), nullable=False),
        sa.Column('valid_from', sa.DateTime(), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(length=36), nullable=False),
        sa.Column('created_reason', sa.String(length=500), nullable=True),
        sa.Column('cost_per_license', sa.DECIMAL(10, 2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_license_vault_license_type', 'license_vault', ['license_type'])
    op.create_index('ix_license_vault_status', 'license_vault', ['status'])

    # Create license_pools table
    op.create_table(
        'license_pools',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('district_id', sa.String(length=36), nullable=False),
        sa.Column('vault_entry_id', sa.String(length=36), nullable=True),
        sa.Column('pool_name', sa.String(length=255), nullable=False),
        sa.Column('pool_code', sa.String(length=50), nullable=False),
        sa.Column('total_licenses', sa.Integer(), nullable=False),
        sa.Column('licenses_generated', sa.Integer(), nullable=False),
        sa.Column('licenses_remaining', sa.Integer(), nullable=False),
        sa.Column('valid_from', sa.DateTime(), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_by', sa.String(length=36), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['district_id'], ['district_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vault_entry_id'], ['license_vault.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('pool_code')
    )
    op.create_index('ix_license_pools_district_id', 'license_pools', ['district_id'])
    op.create_index('ix_license_pools_vault_entry_id', 'license_pools', ['vault_entry_id'])

    # Create licenses_v2 table (enhanced license tracking)
    op.create_table(
        'licenses_v2',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('pool_id', sa.String(length=36), nullable=False),
        sa.Column('assigned_teacher_id', sa.String(length=36), nullable=True),
        sa.Column('license_id', sa.String(length=6), nullable=False),
        sa.Column('license_type', sa.Enum('DISTRICT', 'SCHOOL', 'INDIVIDUAL', 'TRIAL', 'ENTERPRISE', name='licensetype'), nullable=False),
        sa.Column('status', sa.Enum('AVAILABLE', 'ASSIGNED', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED', name='licensestatus'), nullable=False),
        sa.Column('total_seats', sa.Integer(), nullable=False),
        sa.Column('used_seats', sa.Integer(), nullable=False),
        sa.Column('available_seats', sa.Integer(), nullable=False),
        sa.Column('valid_from', sa.DateTime(), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), nullable=True),
        sa.Column('assigned_to_school', sa.String(length=500), nullable=True),
        sa.Column('activated_at', sa.DateTime(), nullable=True),
        sa.Column('suspended_at', sa.DateTime(), nullable=True),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['pool_id'], ['license_pools.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_teacher_id'], ['users.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('license_id')
    )
    op.create_index('ix_licenses_v2_license_id', 'licenses_v2', ['license_id'])
    op.create_index('ix_licenses_v2_pool_id', 'licenses_v2', ['pool_id'])
    op.create_index('ix_licenses_v2_assigned_teacher_id', 'licenses_v2', ['assigned_teacher_id'])

    # Create license_assignments_v2 table
    op.create_table(
        'license_assignments_v2',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('license_v2_id', sa.String(length=36), nullable=False),
        sa.Column('learner_id', sa.String(length=36), nullable=False),
        sa.Column('teacher_id', sa.String(length=36), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), nullable=False),
        sa.Column('assigned_by', sa.String(length=36), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('deactivated_at', sa.DateTime(), nullable=True),
        sa.Column('deactivated_reason', sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['license_v2_id'], ['licenses_v2.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['learner_id'], ['learners.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_license_assignments_v2_license_v2_id', 'license_assignments_v2', ['license_v2_id'])
    op.create_index('ix_license_assignments_v2_learner_id', 'license_assignments_v2', ['learner_id'])
    op.create_index('ix_license_assignments_v2_teacher_id', 'license_assignments_v2', ['teacher_id'])

    # Create license_usage_logs table
    op.create_table(
        'license_usage_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('license_v2_id', sa.String(length=36), nullable=True),
        sa.Column('district_id', sa.String(length=36), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('event_description', sa.Text(), nullable=True),
        sa.Column('event_metadata', sa.JSON(), nullable=True),
        sa.Column('performed_by', sa.String(length=36), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['license_v2_id'], ['licenses_v2.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['district_id'], ['district_accounts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL')
    )
    op.create_index('ix_license_usage_logs_event_type', 'license_usage_logs', ['event_type'])
    op.create_index('ix_license_usage_logs_license_v2_id', 'license_usage_logs', ['license_v2_id'])
    op.create_index('ix_license_usage_logs_district_id', 'license_usage_logs', ['district_id'])
    op.create_index('ix_license_usage_logs_user_id', 'license_usage_logs', ['user_id'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('ix_license_usage_logs_user_id', 'license_usage_logs')
    op.drop_index('ix_license_usage_logs_district_id', 'license_usage_logs')
    op.drop_index('ix_license_usage_logs_license_v2_id', 'license_usage_logs')
    op.drop_index('ix_license_usage_logs_event_type', 'license_usage_logs')
    op.drop_table('license_usage_logs')

    op.drop_index('ix_license_assignments_v2_teacher_id', 'license_assignments_v2')
    op.drop_index('ix_license_assignments_v2_learner_id', 'license_assignments_v2')
    op.drop_index('ix_license_assignments_v2_license_v2_id', 'license_assignments_v2')
    op.drop_table('license_assignments_v2')

    op.drop_index('ix_licenses_v2_assigned_teacher_id', 'licenses_v2')
    op.drop_index('ix_licenses_v2_pool_id', 'licenses_v2')
    op.drop_index('ix_licenses_v2_license_id', 'licenses_v2')
    op.drop_table('licenses_v2')

    op.drop_index('ix_license_pools_vault_entry_id', 'license_pools')
    op.drop_index('ix_license_pools_district_id', 'license_pools')
    op.drop_table('license_pools')

    op.drop_index('ix_license_vault_status', 'license_vault')
    op.drop_index('ix_license_vault_license_type', 'license_vault')
    op.drop_table('license_vault')

    op.drop_index('ix_school_accounts_district_id', 'school_accounts')
    op.drop_table('school_accounts')

    op.drop_index('ix_district_accounts_district_code', 'district_accounts')
    op.drop_table('district_accounts')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS districtstatus')
    op.execute('DROP TYPE IF EXISTS licensetype')
    op.execute('DROP TYPE IF EXISTS licensestatus')
