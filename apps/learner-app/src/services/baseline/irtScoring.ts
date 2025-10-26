/**
 * Item Response Theory (IRT) Scoring Engine
 * Implements 3-parameter logistic model (3PL)
 */

import type { Domain } from '../../types/baseline';

/**
 * Calculate probability of correct response using 3PL model
 * P(θ) = c + (1 - c) / (1 + e^(-a(θ - b)))
 * 
 * @param theta - Ability level
 * @param a - Discrimination parameter
 * @param b - Difficulty parameter
 * @param c - Guessing parameter (default 0.25 for 4-choice items)
 */
export function calculateProbability(
  theta: number,
  a: number,
  b: number,
  c: number = 0
): number {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

/**
 * Calculate information function (how much an item tells us about ability)
 * I(θ) = a² * P(θ) * (1 - P(θ)) / (P(θ) - c)²
 */
export function calculateInformation(
  theta: number,
  a: number,
  b: number,
  c: number = 0
): number {
  const p = calculateProbability(theta, a, b, c);
  if (p === c) return 0; // Avoid division by zero
  
  return (a * a * p * (1 - p)) / Math.pow(p - c, 2);
}

/**
 * Estimate ability using Maximum Likelihood Estimation (MLE)
 * Iteratively find theta that maximizes likelihood of observed responses
 */
export function estimateAbilityMLE(
  responses: Array<{
    correct: boolean;
    item: { a: number; b: number; c: number };
  }>,
  initialTheta: number = 0,
  maxIterations: number = 50,
  tolerance: number = 0.001
): { theta: number; standardError: number; iterations: number } {
  let theta = initialTheta;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    let firstDerivative = 0;
    let secondDerivative = 0;
    
    for (const response of responses) {
      const { a, b, c } = response.item;
      const p = calculateProbability(theta, a, b, c);
      const q = 1 - p;
      
      // First derivative (score)
      const u = response.correct ? 1 : 0;
      firstDerivative += a * (u - p) / (p * q);
      
      // Second derivative (information)
      secondDerivative += -a * a * ((u - p) * (q - p - 2 * c * q)) / Math.pow(p * q, 2);
    }
    
    // Newton-Raphson update
    const delta = -firstDerivative / secondDerivative;
    theta += delta;
    
    iteration++;
    
    // Check convergence
    if (Math.abs(delta) < tolerance) {
      break;
    }
  }
  
  // Calculate standard error
  let totalInformation = 0;
  for (const response of responses) {
    const { a, b, c } = response.item;
    totalInformation += calculateInformation(theta, a, b, c);
  }
  
  const standardError = totalInformation > 0 ? 1 / Math.sqrt(totalInformation) : Infinity;
  
  return { theta, standardError, iterations: iteration };
}

/**
 * Estimate ability using Expected A Posteriori (EAP)
 * More stable than MLE for short tests
 */
export function estimateAbilityEAP(
  responses: Array<{
    correct: boolean;
    item: { a: number; b: number; c: number };
  }>,
  priorMean: number = 0,
  priorSD: number = 1,
  quadraturePoints: number = 41
): { theta: number; standardError: number } {
  // Create quadrature points
  const minTheta = priorMean - 4 * priorSD;
  const maxTheta = priorMean + 4 * priorSD;
  const step = (maxTheta - minTheta) / (quadraturePoints - 1);
  
  const thetaPoints: number[] = [];
  const posteriorWeights: number[] = [];
  
  for (let i = 0; i < quadraturePoints; i++) {
    const theta = minTheta + i * step;
    thetaPoints.push(theta);
    
    // Calculate likelihood
    let logLikelihood = 0;
    for (const response of responses) {
      const { a, b, c } = response.item;
      const p = calculateProbability(theta, a, b, c);
      logLikelihood += response.correct ? Math.log(p) : Math.log(1 - p);
    }
    
    // Prior density (normal distribution)
    const priorDensity = normalPDF(theta, priorMean, priorSD);
    
    // Posterior (proportional to likelihood * prior)
    posteriorWeights.push(Math.exp(logLikelihood) * priorDensity);
  }
  
  // Normalize posterior
  const totalWeight = posteriorWeights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = posteriorWeights.map(w => w / totalWeight);
  
  // Calculate EAP estimate (expected value)
  let eapTheta = 0;
  for (let i = 0; i < quadraturePoints; i++) {
    eapTheta += thetaPoints[i] * normalizedWeights[i];
  }
  
  // Calculate posterior standard deviation
  let variance = 0;
  for (let i = 0; i < quadraturePoints; i++) {
    variance += Math.pow(thetaPoints[i] - eapTheta, 2) * normalizedWeights[i];
  }
  const standardError = Math.sqrt(variance);
  
  return { theta: eapTheta, standardError };
}

/**
 * Convert theta (IRT scale) to grade-level equivalent
 * Uses empirical mapping from standardization studies
 */
export function thetaToGradeLevel(
  theta: number,
  domain: Domain,
  gradeBand: 'K-5' | '6-8' | '9-12'
): number {
  // Empirical mappings (simplified - real version would use lookup tables)
  const baseGrade = gradeBand === 'K-5' ? 3.0 : gradeBand === '6-8' ? 7.0 : 10.0;
  
  // Linear approximation: each 1 SD theta ≈ 1 grade level
  const gradeLevel = baseGrade + theta;
  
  // Constrain to reasonable bounds
  const minGrade = gradeBand === 'K-5' ? 0 : gradeBand === '6-8' ? 5 : 8;
  const maxGrade = gradeBand === 'K-5' ? 6 : gradeBand === '6-8' ? 9 : 13;
  
  return Math.max(minGrade, Math.min(maxGrade, gradeLevel));
}

/**
 * Calculate confidence interval for ability estimate
 */
export function calculateConfidenceInterval(
  theta: number,
  standardError: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  // Z-score for confidence level (1.96 for 95%)
  const z = confidenceLevel === 0.95 ? 1.96 : 2.576; // 95% or 99%
  
  return {
    lower: theta - z * standardError,
    upper: theta + z * standardError,
  };
}

// Helper: Normal PDF
function normalPDF(x: number, mean: number, sd: number): number {
  const coefficient = 1 / (sd * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * sd * sd);
  return coefficient * Math.exp(exponent);
}

/**
 * Score multi-select item with partial credit
 * Awards points proportionally based on correct selections
 */
export function scoreMultiSelect(
  selectedOptions: string[],
  correctOptions: string[],
  maxPoints: number = 1
): { score: number; feedback: string } {
  const correctSelected = selectedOptions.filter(opt => correctOptions.includes(opt)).length;
  const incorrectSelected = selectedOptions.filter(opt => !correctOptions.includes(opt)).length;
  const totalCorrect = correctOptions.length;
  
  // Partial credit formula: (correct - incorrect) / total correct, minimum 0
  const rawScore = Math.max(0, (correctSelected - incorrectSelected) / totalCorrect);
  const score = rawScore * maxPoints;
  
  let feedback = '';
  if (score === maxPoints) {
    feedback = 'Perfect! You selected all correct options and none of the incorrect ones.';
  } else if (score > 0) {
    feedback = `Good partial credit. You got ${correctSelected}/${totalCorrect} correct selections.`;
  } else {
    feedback = 'Not quite. Review which options are correct.';
  }
  
  return { score, feedback };
}
