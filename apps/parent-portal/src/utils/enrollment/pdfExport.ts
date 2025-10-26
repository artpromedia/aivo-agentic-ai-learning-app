/**
 * PDF Export Utility
 * 
 * Generates PDF documents for enrollment summaries using jsPDF.
 */

import jsPDF from 'jspdf';
import { LearnerData } from '../../components/Enrollment';

interface EnrollmentSummaryOptions {
  learnerData: LearnerData;
  learnerId?: string;
  enrollmentDate?: Date;
  parentName?: string;
}

/**
 * Generate enrollment summary PDF
 */
export function generateEnrollmentPDF(options: EnrollmentSummaryOptions): void {
  const { learnerData, learnerId, enrollmentDate = new Date(), parentName = 'Parent' } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  
  // Helper function to add text with automatic wrapping
  const addText = (text: string, x: number, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(text, x, yPos);
    yPos += fontSize / 2 + 2;
  };
  
  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    yPos += 5;
    doc.setFillColor(102, 126, 234); // Purple
    doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    addText(title, 20, 14, true);
    doc.setTextColor(0, 0, 0);
    yPos += 3;
  };
  
  // Helper to check if we need a new page
  const checkPageBreak = (spaceNeeded: number = 20) => {
    if (yPos + spaceNeeded > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };
  
  // Header
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AIVO Learning', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Enrollment Summary', pageWidth / 2, 30, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  yPos = 50;
  
  // Document Info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Enrollment Date: ${enrollmentDate.toLocaleDateString()}`, 15, yPos);
  doc.text(`Document Generated: ${new Date().toLocaleString()}`, pageWidth - 15, yPos, { align: 'right' });
  if (learnerId) {
    yPos += 5;
    doc.text(`Learner ID: ${learnerId}`, 15, yPos);
  }
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  
  // Section 1: Basic Information
  addSectionHeader('Basic Information');
  addText(`Full Name: ${learnerData.firstName} ${learnerData.lastName}`, 20, 12, true);
  if (learnerData.preferredName) {
    addText(`Preferred Name: ${learnerData.preferredName}`, 20);
  }
  addText(`Date of Birth: ${learnerData.dateOfBirth}`, 20);
  addText(`Grade Level: ${learnerData.grade}`, 20);
  if (learnerData.gender) {
    addText(`Gender: ${learnerData.gender}`, 20);
  }
  
  // Section 2: Learning Profile
  checkPageBreak(60);
  addSectionHeader('Learning Profile');
  
  if (learnerData.diagnoses && learnerData.diagnoses.length > 0) {
    addText('Diagnoses:', 20, 12, true);
    learnerData.diagnoses.forEach((diagnosis) => {
      addText(`• ${diagnosis}`, 25, 10);
    });
  }
  
  if (learnerData.accommodations && learnerData.accommodations.length > 0) {
    yPos += 3;
    addText('Accommodations:', 20, 12, true);
    learnerData.accommodations.forEach((accommodation) => {
      addText(`• ${accommodation}`, 25, 10);
    });
  }
  
  if (learnerData.learningStrengths) {
    yPos += 3;
    addText('Learning Strengths:', 20, 12, true);
    const strengths = doc.splitTextToSize(learnerData.learningStrengths, pageWidth - 50);
    strengths.forEach((line: string) => {
      addText(line, 25, 10);
    });
  }
  
  if (learnerData.learningChallenges) {
    yPos += 3;
    checkPageBreak(30);
    addText('Learning Challenges:', 20, 12, true);
    const challenges = doc.splitTextToSize(learnerData.learningChallenges, pageWidth - 50);
    challenges.forEach((line: string) => {
      addText(line, 25, 10);
    });
  }
  
  // Section 3: Accessibility Preferences
  checkPageBreak(60);
  addSectionHeader('Accessibility Preferences');
  
  const accessibilityFeatures = learnerData.accessibilityPrefs || {};
  const featureNames: Record<string, string> = {
    textToSpeech: 'Text-to-Speech',
    voiceInput: 'Voice Input',
    largeText: 'Large Text',
    highContrast: 'High Contrast Mode',
    reducedMotion: 'Reduced Motion',
    calmMode: 'Calm Mode',
    dyslexiaFont: 'Dyslexia-Friendly Font',
  };
  
  const enabledFeatures = Object.entries(accessibilityFeatures)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => featureNames[key] || key);
  
  if (enabledFeatures.length > 0) {
    enabledFeatures.forEach((feature) => {
      addText(`✓ ${feature}`, 25, 10);
    });
  } else {
    addText('No accessibility features enabled', 25, 10);
  }
  
  // Section 4: IEP Information
  if (learnerData.hasIEP && learnerData.iepDetails) {
    checkPageBreak(60);
    addSectionHeader('IEP Information');
    addText('This learner has an active IEP', 20, 12, true);
    
    if (learnerData.iepDetails.caseManager) {
      addText(`Case Manager: ${learnerData.iepDetails.caseManager}`, 20);
    }
    
    if (learnerData.iepDetails.reviewDate) {
      addText(`Next Review Date: ${learnerData.iepDetails.reviewDate}`, 20);
    }
    
    if (learnerData.iepDetails.goals && learnerData.iepDetails.goals.length > 0) {
      yPos += 3;
      addText('IEP Goals:', 20, 12, true);
      learnerData.iepDetails.goals.forEach((goal: string, index: number) => {
        addText(`${index + 1}. ${goal}`, 25, 10);
      });
    }
    
    if (learnerData.iepDetails.accommodations && learnerData.iepDetails.accommodations.length > 0) {
      yPos += 3;
      addText('IEP Accommodations:', 20, 12, true);
      learnerData.iepDetails.accommodations.forEach((accommodation: string) => {
        addText(`• ${accommodation}`, 25, 10);
      });
    }
  }
  
  // Section 5: Consent Records
  checkPageBreak(40);
  addSectionHeader('Consent Records');
  addText('The following consents were provided during enrollment:', 20, 10);
  yPos += 2;
  addText('✓ Parental/Guardian Authorization', 25, 10);
  addText('✓ COPPA & FERPA Data Processing Consent', 25, 10);
  addText('✓ Baseline Assessment Consent', 25, 10);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      '© 2025 AIVO - Confidential',
      15,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      'aivoai.com',
      pageWidth - 15,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  // Save the PDF
  const fileName = `AIVO_Enrollment_${learnerData.firstName}_${learnerData.lastName}_${enrollmentDate.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Generate a quick summary PDF (single page)
 */
export function generateQuickSummaryPDF(learnerData: LearnerData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  
  // Header
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AIVO Enrollment Summary', pageWidth / 2, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  yPos = 45;
  
  // Learner Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${learnerData.firstName} ${learnerData.lastName}`, 15, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Key Info
  doc.text(`Grade: ${learnerData.grade}`, 15, yPos);
  yPos += 7;
  doc.text(`DOB: ${learnerData.dateOfBirth}`, 15, yPos);
  yPos += 7;
  doc.text(`IEP: ${learnerData.hasIEP ? 'Yes' : 'No'}`, 15, yPos);
  
  yPos += 15;
  
  // Quick stats
  if (learnerData.diagnoses && learnerData.diagnoses.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnoses:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(learnerData.diagnoses.join(', '), 15, yPos);
    yPos += 10;
  }
  
  // Save
  doc.save(`AIVO_Quick_Summary_${learnerData.firstName}_${learnerData.lastName}.pdf`);
}
