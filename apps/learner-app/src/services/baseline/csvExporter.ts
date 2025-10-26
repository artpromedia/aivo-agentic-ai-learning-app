/**
 * CSV Export Service
 * Exports baseline assessment results to CSV format
 */

import type { BaselineResults, Domain } from '../../types/baseline';

export function exportResultsToCSV(results: BaselineResults, learnerName: string): void {
  const rows: string[][] = [];
  
  // Header
  rows.push(['Aivo AI - Baseline Assessment Results']);
  rows.push(['Learner Name', learnerName]);
  rows.push(['Session ID', results.sessionId]);
  rows.push(['Completed', new Date(results.completedAt).toLocaleDateString()]);
  rows.push(['Grade Band', results.gradeBand]);
  rows.push([]);
  
  // Overall Metrics
  rows.push(['Overall Metrics']);
  rows.push(['Total Time (minutes)', (results.totalTimeMs / 60000).toFixed(1)]);
  rows.push(['Items Attempted', results.itemsAttempted.toString()]);
  rows.push(['Accuracy Rate', `${(results.accuracyRate * 100).toFixed(1)}%`]);
  rows.push(['Average Time Per Item (seconds)', (results.averageTimePerItem / 1000).toFixed(1)]);
  rows.push(['Hesitation Rate', (results.hesitationRate * 100).toFixed(1) + '%']);
  rows.push(['Completion Rate', (results.completionRate * 100).toFixed(1) + '%']);
  rows.push([]);
  
  // Domain Scores
  rows.push(['Domain Scores']);
  rows.push(['Domain', 'Grade Level', 'Ability (θ)', 'Standard Error', 'CI Lower', 'CI Upper']);
  
  const domains: Domain[] = ['reading', 'math', 'science', 'sel'];
  domains.forEach(domain => {
    rows.push([
      domain.charAt(0).toUpperCase() + domain.slice(1),
      results.domainScores[domain].toFixed(2),
      results.abilityEstimates[domain].toFixed(3),
      results.standardErrors[domain].toFixed(3),
      results.confidenceIntervals[domain].lower.toFixed(2),
      results.confidenceIntervals[domain].upper.toFixed(2),
    ]);
  });
  rows.push([]);
  
  // Sub-Domain Scores
  if (results.subDomainScores && Object.keys(results.subDomainScores).length > 0) {
    rows.push(['Sub-Domain Scores']);
    rows.push(['Sub-Domain', 'Grade Level']);
    Object.entries(results.subDomainScores).forEach(([subDomain, score]) => {
      rows.push([
        subDomain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        (score as number).toFixed(2),
      ]);
    });
    rows.push([]);
  }
  
  // Strengths
  rows.push(['Strengths']);
  results.strengths.forEach(strength => {
    rows.push([strength]);
  });
  rows.push([]);
  
  // Growth Areas
  rows.push(['Growth Areas']);
  results.gaps.forEach(gap => {
    rows.push([gap]);
  });
  rows.push([]);
  
  // Scaffolds
  rows.push(['Learning Supports']);
  results.scaffolds.forEach(scaffold => {
    rows.push([scaffold.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())]);
  });
  rows.push([]);
  
  // Starting Levels
  rows.push(['Starting Instructional Levels']);
  rows.push(['Domain', 'Level']);
  Object.entries(results.startingLevels || {}).forEach(([domain, level]) => {
    rows.push([domain.charAt(0).toUpperCase() + domain.slice(1), level as string]);
  });
  rows.push([]);
  
  // Reading Fluency (if available)
  if (results.readingFluency) {
    rows.push(['Reading Fluency']);
    rows.push(['Metric', 'Score']);
    rows.push(['Words Per Minute', results.readingFluency.wordsPerMinute.toString()]);
    rows.push(['Accuracy', `${results.readingFluency.accuracy.toFixed(1)}%`]);
    rows.push(['Expression', `${results.readingFluency.expression.toFixed(1)}/10`]);
    rows.push(['Automaticity', `${results.readingFluency.automaticity.toFixed(1)}/10`]);
    rows.push([]);
  }
  
  // Speech Metrics (if available)
  if (results.speechMetrics) {
    rows.push(['Speech & Language Metrics']);
    
    // Articulation
    if (results.speechMetrics.articulation) {
      rows.push(['Articulation']);
      rows.push(['Phoneme Accuracy', `${results.speechMetrics.articulation.phonemeAccuracy.toFixed(1)}%`]);
      rows.push(['Substitutions', results.speechMetrics.articulation.substitutions.toString()]);
      rows.push(['Omissions', results.speechMetrics.articulation.omissions.toString()]);
      rows.push(['Distortions', results.speechMetrics.articulation.distortions.toString()]);
      if (results.speechMetrics.articulation.errorSounds) {
        rows.push(['Error Sounds', results.speechMetrics.articulation.errorSounds.join(', ')]);
      }
      rows.push([]);
    }
    
    // Language
    if (results.speechMetrics.language) {
      rows.push(['Language Skills']);
      rows.push(['Expression Score', results.speechMetrics.language.expressionScore.toFixed(1)]);
      rows.push(['Comprehension Score', results.speechMetrics.language.comprehensionScore.toFixed(1)]);
      rows.push(['Vocabulary Level', results.speechMetrics.language.vocabularyLevel.toFixed(1)]);
      rows.push([]);
    }
    
    // Pragmatics
    if (results.speechMetrics.pragmatics) {
      rows.push(['Social Communication (Pragmatics)']);
      rows.push(['Conversation Turns', `${results.speechMetrics.pragmatics.conversationTurns}/10`]);
      rows.push(['Topic Maintenance', `${results.speechMetrics.pragmatics.topicMaintenance}/10`]);
      rows.push(['Eye Contact', `${results.speechMetrics.pragmatics.eyeContact}/10`]);
      rows.push([]);
    }
  }
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = cell.replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${learnerName}-baseline-assessment-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export detailed item-level data
 */
export function exportDetailedCSV(results: BaselineResults, itemResponses: any[], learnerName: string): void {
  const rows: string[][] = [];
  
  // Header
  rows.push(['Aivo AI - Detailed Assessment Data']);
  rows.push(['Learner', learnerName]);
  rows.push(['Session ID', results.sessionId]);
  rows.push([]);
  
  // Item responses
  rows.push(['Item ID', 'Domain', 'Sub-Domain', 'Difficulty (b)', 'Correct', 'Time (seconds)', 'Hesitation']);
  
  itemResponses.forEach(response => {
    rows.push([
      response.itemId,
      response.domain,
      response.subDomain || '',
      response.difficulty?.toFixed(2) || '',
      response.correct ? 'Yes' : 'No',
      ((response.timeMs || 0) / 1000).toFixed(1),
      response.hesitated ? 'Yes' : 'No',
    ]);
  });
  
  // Convert to CSV
  const csvContent = rows.map(row => 
    row.map(cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${learnerName}-detailed-data-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
