/**
 * Download Enrollment Summary Button Component
 * 
 * Allows parents to download a PDF summary of their child's enrollment information.
 */

import { generateEnrollmentPDF, generateQuickSummaryPDF } from '../utils/enrollment/pdfExport';
import type { LearnerData } from './Enrollment';

interface DownloadEnrollmentButtonProps {
  learnerData: LearnerData;
  learnerId?: string;
  variant?: 'full' | 'quick';
  className?: string;
}

export function DownloadEnrollmentButton({
  learnerData,
  learnerId,
  variant = 'full',
  className = '',
}: DownloadEnrollmentButtonProps) {
  const handleDownload = () => {
    try {
      if (variant === 'quick') {
        generateQuickSummaryPDF(learnerData);
      } else {
        generateEnrollmentPDF({
          learnerData,
          learnerId,
          enrollmentDate: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download enrollment summary. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors ${className}`}
    >
      <span className="text-xl">📄</span>
      <span>Download {variant === 'quick' ? 'Quick' : 'Full'} Summary</span>
    </button>
  );
}

/**
 * Usage example in Dashboard or Learner Profile:
 * 
 * ```tsx
 * import { DownloadEnrollmentButton } from './DownloadEnrollmentButton';
 * 
 * // In component:
 * <DownloadEnrollmentButton
 *   learnerData={learnerInfo}
 *   learnerId={learnerId}
 *   variant="full"
 * />
 * ```
 */
