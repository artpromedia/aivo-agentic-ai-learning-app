/**
 * Adaptive Item Selection
 * Chooses next-best item based on current ability estimate
 */
import type { BaselineItem, ItemResponse, Domain, SubDomain, GradeBand } from '../../types/baseline';
import { calculateInformation } from './irtScoring';

interface SelectionContext {
  domain: Domain;
  currentTheta: number;
  standardError: number;
  responsesInDomain: ItemResponse[];
  availableItems: BaselineItem[];
  targetAccuracy: number;      // Aim for items near this difficulty
  contentBalancing: boolean;   // Ensure sub-domain coverage
  exposureControl: boolean;    // Prevent over-using same items
}

/**
 * Select next item using Maximum Information criterion
 * Choose item that provides most information at current theta
 */
export function selectNextItem(context: SelectionContext): BaselineItem | null {
  const {
    currentTheta,
    availableItems,
    responsesInDomain,
    contentBalancing,
    exposureControl,
  } = context;
  
  if (availableItems.length === 0) return null;
  
  // Filter items by constraints
  let candidateItems = [...availableItems];
  
  // Content balancing: prioritize under-represented sub-domains
  if (contentBalancing) {
    const subDomainCounts = getSubDomainCounts(responsesInDomain);
    const underRepresented = findUnderRepresentedSubDomains(subDomainCounts);
    
    if (underRepresented.length > 0) {
      const filtered = candidateItems.filter(item =>
        underRepresented.includes(item.subDomain)
      );
      if (filtered.length > 0) {
        candidateItems = filtered;
      }
    }
  }
  
  // Exposure control: avoid recently used items
  if (exposureControl) {
    const recentItemIds = responsesInDomain.slice(-5).map(r => r.itemId);
    candidateItems = candidateItems.filter(item =>
      !recentItemIds.includes(item.id)
    );
  }
  
  // Calculate information for each candidate item
  const itemsWithInfo = candidateItems.map(item => {
    const { difficulty, discrimination, guessing } = item.parameters;
    const information = calculateInformation(
      currentTheta,
      discrimination,
      difficulty,
      guessing || 0
    );
    
    return { item, information };
  });
  
  // Sort by information (descending)
  itemsWithInfo.sort((a, b) => b.information - a.information);
  
  // Select item with maximum information
  return itemsWithInfo[0]?.item || null;
}

/**
 * Determine if testing should stop
 * Criteria: sufficient items answered AND low standard error
 */
export function shouldStopTesting(
  responsesInDomain: ItemResponse[],
  standardError: number,
  config: {
    minItems: number;
    maxItems: number;
    targetSE: number;
  }
): { stop: boolean; reason: string } {
  const { minItems, maxItems, targetSE } = config;
  const itemCount = responsesInDomain.length;
  
  // Must answer minimum items
  if (itemCount < minItems) {
    return { stop: false, reason: `Need ${minItems - itemCount} more items` };
  }
  
  // Stop if reached maximum items
  if (itemCount >= maxItems) {
    return { stop: true, reason: 'Maximum items reached' };
  }
  
  // Stop if standard error is sufficiently low
  if (standardError <= targetSE) {
    return { stop: true, reason: `Sufficient precision (SE=${standardError.toFixed(3)})` };
  }
  
  return { stop: false, reason: `Continue testing (SE=${standardError.toFixed(3)})` };
}

/**
 * Get sub-domain distribution of answered items
 */
function getSubDomainCounts(responses: ItemResponse[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const response of responses) {
    counts[response.subDomain] = (counts[response.subDomain] || 0) + 1;
  }
  
  return counts;
}

/**
 * Find sub-domains that are under-represented
 */
function findUnderRepresentedSubDomains(
  counts: Record<string, number>
): SubDomain[] {
  // Calculate average count
  const values = Object.values(counts);
  const average = values.length > 0 
    ? values.reduce((sum, v) => sum + v, 0) / values.length 
    : 0;
  
  // Find sub-domains below average
  const underRepresented: SubDomain[] = [];
  for (const [subDomain, count] of Object.entries(counts)) {
    if (count < average * 0.7) {  // 70% of average threshold
      underRepresented.push(subDomain as SubDomain);
    }
  }
  
  return underRepresented;
}

/**
 * Initialize ability estimate for new domain
 * Uses prior from previous domain if available
 */
export function initializeTheta(
  domain: Domain,
  previousEstimates: Record<string, number>,
  gradeBand: GradeBand
): number {
  // If we have estimates from other domains, use average as prior
  const otherDomains = Object.keys(previousEstimates).filter(d => d !== domain);
  if (otherDomains.length > 0) {
    const sum = otherDomains.reduce((acc, d) => acc + previousEstimates[d], 0);
    return sum / otherDomains.length;
  }
  
  // Otherwise use grade-band default
  // Assumes learner is at typical level for their grade band
  const defaults: Record<GradeBand, number> = {
    'K-5': -0.5,   // Slightly below average (more room to grow)
    '6-8': 0.0,    // Average
    '9-12': 0.3,   // Slightly above average
  };
  
  return defaults[gradeBand];
}
