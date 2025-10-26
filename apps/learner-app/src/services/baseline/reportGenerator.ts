/**
 * PDF Report Generator
 * Creates downloadable PDF assessment reports
 * 
 * NOTE: Requires installing jsPDF and jspdf-autotable
 * Run: pnpm add jspdf jspdf-autotable
 */

import type { BaselineResults } from '../../types/baseline';

export async function generatePDFReport(
  results: BaselineResults,
  learnerName: string
): Promise<void> {
  // Dynamic import to avoid build issues if jsPDF isn't installed yet
  try {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    let yPos = 20;

    // ─────────────────────────────────────────────────────
    // COVER PAGE
    // ─────────────────────────────────────────────────────

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Baseline Assessment Report', 105, yPos, { align: 'center' as const });
    
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(learnerName, 105, yPos, { align: 'center' as const });
    
    yPos += 10;
    doc.setFontSize(12);
    const completedDate = new Date(results.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Completed: ${completedDate}`, 105, yPos, { align: 'center' as const });
    
    yPos += 10;
    doc.text(`Grade Band: ${results.gradeBand}`, 105, yPos, { align: 'center' as const });

    // Add branding
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Aivo AI - Adaptive Learning Platform', 105, yPos, { align: 'center' as const });
    
    // ─────────────────────────────────────────────────────
    // EXECUTIVE SUMMARY (Page 2)
    // ─────────────────────────────────────────────────────

    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Executive Summary', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const summaryText = [
      `${learnerName} completed the baseline assessment on ${completedDate}.`,
      `The assessment included ${results.itemsAttempted} questions across multiple domains.`,
      `Total time: ${formatDuration(results.totalTimeMs)}.`,
      `Overall accuracy: ${Math.round(results.accuracyRate * 100)}%.`,
    ];
    
    summaryText.forEach(line => {
      doc.text(line, 20, yPos, { maxWidth: 170 });
      yPos += 7;
    });

    // ─────────────────────────────────────────────────────
    // DOMAIN SCORES TABLE
    // ─────────────────────────────────────────────────────

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Domain Scores', 20, yPos);
    
    yPos += 5;
    
    const domains = ['reading', 'math', 'science', 'sel'] as const;
    const domainData = [
      ['Domain', 'Grade Level', 'Ability (θ)', 'Std Error', '95% CI'],
      ...domains.map(domain => [
        domain.charAt(0).toUpperCase() + domain.slice(1),
        results.domainScores[domain].toFixed(1),
        results.abilityEstimates[domain].toFixed(2),
        results.standardErrors[domain].toFixed(3),
        `[${results.confidenceIntervals[domain].lower.toFixed(1)}, ${results.confidenceIntervals[domain].upper.toFixed(1)}]`
      ])
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [domainData[0]],
      body: domainData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // ─────────────────────────────────────────────────────
    // STRENGTHS & GAPS
    // ─────────────────────────────────────────────────────

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths', 20, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    results.strengths.forEach(strength => {
      doc.text(`• ${strength}`, 25, yPos, { maxWidth: 165 });
      yPos += 7;
    });
    
    yPos += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Growth Areas', 20, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    results.gaps.forEach(gap => {
      doc.text(`• ${gap}`, 25, yPos, { maxWidth: 165 });
      yPos += 7;
    });

    // ─────────────────────────────────────────────────────
    // READING FLUENCY (if available)
    // ─────────────────────────────────────────────────────

    if (results.readingFluency) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Reading Fluency Analysis', 20, yPos);
      
      yPos += 15;
      
      const fluencyData = [
        ['Metric', 'Score', 'Benchmark'],
        ['Words Per Minute', `${results.readingFluency.wordsPerMinute}`, results.readingFluency.wordsPerMinute >= 100 ? 'Above Expected' : 'At Expected'],
        ['Accuracy', `${Math.round(results.readingFluency.accuracy)}%`, results.readingFluency.accuracy >= 95 ? 'Above Expected' : 'Developing'],
        ['Expression', `${results.readingFluency.expression.toFixed(1)}/10`, results.readingFluency.expression >= 7 ? 'Strong' : 'Developing'],
        ['Automaticity', `${results.readingFluency.automaticity.toFixed(1)}/10`, results.readingFluency.automaticity >= 7 ? 'Strong' : 'Developing'],
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [fluencyData[0]],
        body: fluencyData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Speech Metrics Section
      if (results.speechMetrics) {
        const st = results.speechMetrics;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Speech & Articulation', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`Phoneme Accuracy: ${Math.round(st.articulation.phonemeAccuracy)}%`, 20, yPos);
        yPos += 7;
        
        if (st.articulation.errorSounds && st.articulation.errorSounds.length > 0) {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Sounds Needing Practice:', 20, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          doc.text(st.articulation.errorSounds.join(', '), 25, yPos);
          yPos += 7;
        }
      }
    }

    // ─────────────────────────────────────────────────────
    // RECOMMENDATIONS
    // ─────────────────────────────────────────────────────

    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Learning Supports:', 20, yPos);
    yPos += 7;
    
    results.scaffolds.forEach(scaffold => {
      doc.text(`• ${scaffold.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`, 25, yPos);
      yPos += 7;
    });
    
    yPos += 5;
    doc.text('Starting Levels:', 20, yPos);
    yPos += 7;
    
    Object.entries(results.startingLevels || {}).forEach(([domain, level]) => {
      doc.text(`• ${domain}: ${level}`, 25, yPos);
      yPos += 7;
    });

    // Save the PDF
    doc.save(`${learnerName}-baseline-assessment-${completedDate}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF generation requires jsPDF library. Please run: pnpm add jspdf jspdf-autotable');
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
