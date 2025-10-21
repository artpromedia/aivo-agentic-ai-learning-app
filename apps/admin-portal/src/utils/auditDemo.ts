import { 
  logUserLogin, 
  logUserRoleChanged, 
  logDataExport,
  logSettingsUpdate,
  logPaymentSucceeded,
  logPaymentFailed,
  logDSRSubmitted,
  logSystemBackup
} from '@aivo/utils';

/**
 * Demo function to populate audit logs with sample data for testing
 * Call this function from the browser console to generate test audit events
 */
export function populateAuditLogs() {
  console.log('Populating audit logs with sample data...');

  // Simulate login events
  logUserLogin('user_001', 'Admin User', 'admin@aivolearning.com');
  logUserLogin('user_002', 'John Smith', 'john.smith@aivolearning.com');

  // Wait a bit between events
  setTimeout(() => {
    // Simulate role changes
    logUserRoleChanged(
      'user_002',
      'John Smith',
      ['teacher'],
      ['teacher', 'admin'],
      { id: 'user_001', name: 'Admin User' }
    );
  }, 500);

  setTimeout(() => {
    // Simulate data export
    logDataExport('students', 150);
    logDataExport('assessments', 450);
  }, 1000);

  setTimeout(() => {
    // Simulate settings changes
    logSettingsUpdate('maxStudentsPerClass', 25, 30);
    logSettingsUpdate('enableNotifications', false, true);
  }, 1500);

  setTimeout(() => {
    // Simulate billing events
    logPaymentSucceeded(9900, 'USD', 'inv_12345');
    logPaymentFailed(4900, 'USD', 'Card declined');
  }, 2000);

  setTimeout(() => {
    // Simulate compliance events
    logDSRSubmitted('data_deletion', 'dsr_001', 'user@example.com');
    logDSRSubmitted('data_export', 'dsr_002', 'another@example.com');
  }, 2500);

  setTimeout(() => {
    // Simulate system events
    logSystemBackup('backup_20250120', 52428800); // 50MB
  }, 3000);

  setTimeout(() => {
    console.log('✅ Audit logs populated successfully!');
    console.log('Navigate to /admin/audit-log to view them.');
  }, 3500);
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).populateAuditLogs = populateAuditLogs;
}
