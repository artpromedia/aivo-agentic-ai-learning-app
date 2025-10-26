/**
 * Baseline Assessment Container
 * Main component that orchestrates the adaptive assessment
 */
import { useState, useEffect, useRef } from 'react';
import type { 
  BaselineSession, 
  BaselineItem, 
  ItemResponse,
  Domain,
  GradeBand 
} from '../../types/baseline';
import { ItemRenderer } from './ItemRenderer';
import { AdaptiveProgress } from './AdaptiveProgress';
import { EngagementTracker } from './EngagementTracker';
import { DomainTransition } from './DomainTransition';
import { estimateAbilityMLE } from '../../services/baseline/irtScoring';
import { selectNextItem, shouldStopTesting } from '../../services/baseline/adaptiveSelection';

interface BaselineAssessmentProps {
  learnerId: string;
  gradeBand: GradeBand;
  onComplete: (results: BaselineSession) => void;
  textToSpeechEnabled?: boolean;
  audioRecordingEnabled?: boolean;
}

export function BaselineAssessment({
  learnerId,
  gradeBand,
  onComplete,
  textToSpeechEnabled = true,
  audioRecordingEnabled = true
}: BaselineAssessmentProps) {
  const [session, setSession] = useState<BaselineSession>({
    id: crypto.randomUUID(),
    learnerId,
    gradeBand,
    startedAt: new Date(),
    currentDomain: 'reading', // Start with reading
    currentAbilityEstimates: {},
    standardErrors: {},
    responses: [],
    completedDomains: []
  });
  
  const [currentItem, setCurrentItem] = useState<BaselineItem | null>(null);
  const [availableItems, setAvailableItems] = useState<BaselineItem[]>([]);
  const [showTransition, setShowTransition] = useState(false);
  const [engagementMetrics, setEngagementMetrics] = useState({
    focusLevel: 'high' as 'high' | 'medium' | 'low',
    hesitationIndicators: 0,
    avgResponseTime: 0,
    consecutiveQuickResponses: 0,
    consecutiveSlowResponses: 0,
    skippedItems: 0,
    hintsUsed: 0
  });
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  
  const questionStartTimeRef = useRef(Date.now());
  const focusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load items for current domain (mock data - will be replaced with API call)
  useEffect(() => {
    // TODO: Fetch items from API
    // For now, we'll use mock data
    const mockItems: BaselineItem[] = [
      // Reading items
      {
        id: 'reading-1',
        domain: 'reading',
        subDomain: 'comprehension',
        gradeBand,
        type: 'single_choice',
        stem: 'What is the main idea of the passage?',
        stimulus: 'The sun provides light and warmth to Earth. Plants use sunlight to make food through photosynthesis. Animals depend on plants for energy.',
        stimulusType: 'text',
        options: [
          { id: 'a', label: 'The sun is hot', correctness: 0 },
          { id: 'b', label: 'Living things depend on the sun for energy', correctness: 1 },
          { id: 'c', label: 'Plants are green', correctness: 0 },
          { id: 'd', label: 'Animals eat plants', correctness: 0 }
        ],
        parameters: {
          difficulty: 0.0, // b parameter
          discrimination: 1.2, // a parameter
          guessing: 0.25, // c parameter
          estimatedTime: 45,
          cognitiveLevel: 'understand'
        },
        readAloud: true,
        allowCalculator: false
      },
      // Math items
      {
        id: 'math-1',
        domain: 'math',
        subDomain: 'number_sense',
        gradeBand,
        type: 'single_choice',
        stem: 'What is 15 + 28?',
        options: [
          { id: 'a', label: '33', correctness: 0 },
          { id: 'b', label: '43', correctness: 1 },
          { id: 'c', label: '42', correctness: 0 },
          { id: 'd', label: '44', correctness: 0 }
        ],
        parameters: {
          difficulty: -0.5,
          discrimination: 1.5,
          guessing: 0.25,
          estimatedTime: 30,
          cognitiveLevel: 'apply'
        },
        readAloud: true,
        allowCalculator: false
      }
      // TODO: Add more items for all domains
    ];
    
    setAvailableItems(mockItems);
  }, [gradeBand]);
  
  // Select first item or next item after response
  useEffect(() => {
    if (availableItems.length === 0 || currentItem !== null) return;
    
    const domainItems = availableItems.filter(item => item.domain === session.currentDomain);
    
    if (domainItems.length === 0) {
      // No more items for this domain, move to next
      handleDomainComplete();
      return;
    }
    
    // Get current ability estimate for domain
    const currentTheta = session.currentAbilityEstimates[session.currentDomain] ?? 0;
    const currentSE = session.standardErrors[session.currentDomain] ?? 1;
    
    // Check if we should stop testing this domain
    const domainResponses = session.responses.filter(r => r.domain === session.currentDomain);
    if (shouldStopTesting(domainResponses, currentSE, {
      minItems: 10,
      maxItems: 30,
      targetSE: 0.3
    })) {
      handleDomainComplete();
      return;
    }
    
    // Select next item using adaptive algorithm
    const nextItem = selectNextItem({
      availableItems: domainItems,
      currentDomain: session.currentDomain,
      currentAbilityEstimate: currentTheta,
      previousResponses: session.responses,
      gradeBand
    });
    
    if (nextItem) {
      setCurrentItem(nextItem);
      questionStartTimeRef.current = Date.now();
      setCurrentQuestionTime(0);
    } else {
      handleDomainComplete();
    }
  }, [availableItems, currentItem, session]);
  
  // Track time on current question
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuestionTime(Math.floor((Date.now() - questionStartTimeRef.current) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentItem]);
  
  // Monitor focus (page visibility)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setEngagementMetrics(prev => ({
        ...prev,
        focusLevel: document.hidden ? 'low' : 'high'
      }));
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Handle item response submission
  const handleItemSubmit = (response: Partial<ItemResponse>) => {
    if (!currentItem) return;
    
    // Calculate correctness score
    let score = 0;
    if (currentItem.type === 'single_choice' || currentItem.type === 'yes_no') {
      const selectedOption = currentItem.options?.find(opt => 
        response.selectedOptions?.includes(opt.id)
      );
      score = selectedOption?.correctness ?? 0;
    } else if (currentItem.type === 'multi_select' && currentItem.options) {
      const correctCount = response.selectedOptions?.filter(id =>
        currentItem.options?.find(opt => opt.id === id && opt.correctness === 1)
      ).length ?? 0;
      const incorrectCount = (response.selectedOptions?.length ?? 0) - correctCount;
      score = Math.max(0, (correctCount - incorrectCount) / currentItem.options.length);
    }
    // TODO: Handle other item types (constructed response, read aloud, etc.)
    
    // Create complete response object
    const completeResponse: ItemResponse = {
      ...response as ItemResponse,
      score
    };
    
    // Update session with new response
    const updatedResponses = [...session.responses, completeResponse];
    
    // Re-estimate ability for this domain
    const domainResponses = updatedResponses.filter(r => r.domain === session.currentDomain);
    const items = domainResponses.map(r => 
      availableItems.find(item => item.id === r.itemId)!
    );
    
    const { theta, se } = estimateAbilityMLE(domainResponses, items);
    
    // Update session
    setSession(prev => ({
      ...prev,
      responses: updatedResponses,
      currentAbilityEstimates: {
        ...prev.currentAbilityEstimates,
        [session.currentDomain]: theta
      },
      standardErrors: {
        ...prev.standardErrors,
        [session.currentDomain]: se
      }
    }));
    
    // Update engagement metrics
    const responseTime = (response.timeSubmitted!.getTime() - response.timeStarted!.getTime()) / 1000;
    setEngagementMetrics(prev => {
      const newAvgTime = (prev.avgResponseTime * prev.hesitationIndicators + responseTime) / (prev.hesitationIndicators + 1);
      return {
        ...prev,
        avgResponseTime: newAvgTime,
        hesitationIndicators: prev.hesitationIndicators + (response.hesitationCount ?? 0),
        consecutiveQuickResponses: responseTime < 5 ? prev.consecutiveQuickResponses + 1 : 0,
        consecutiveSlowResponses: responseTime > 60 ? prev.consecutiveSlowResponses + 1 : 0,
        skippedItems: prev.skippedItems + (response.skipped ? 1 : 0),
        hintsUsed: prev.hintsUsed + (response.usedHint ? 1 : 0)
      };
    });
    
    // Clear current item to trigger next item selection
    setCurrentItem(null);
  };
  
  // Handle domain completion
  const handleDomainComplete = () => {
    const completedDomain = session.currentDomain;
    const completedDomains = [...session.completedDomains, completedDomain];
    
    // Determine next domain
    const allDomains: Domain[] = ['reading', 'math', 'science', 'writing', 'sel'];
    const remainingDomains = allDomains.filter(d => !completedDomains.includes(d));
    
    if (remainingDomains.length === 0) {
      // Assessment complete!
      const finalSession: BaselineSession = {
        ...session,
        completedDomains,
        completedAt: new Date()
      };
      onComplete(finalSession);
      return;
    }
    
    // Show transition screen
    setSession(prev => ({
      ...prev,
      completedDomains
    }));
    setShowTransition(true);
  };
  
  // Handle transition continue
  const handleTransitionContinue = () => {
    const allDomains: Domain[] = ['reading', 'math', 'science', 'writing', 'sel'];
    const nextDomain = allDomains.find(d => !session.completedDomains.includes(d));
    
    if (nextDomain) {
      setSession(prev => ({
        ...prev,
        currentDomain: nextDomain
      }));
      setShowTransition(false);
      setCurrentItem(null); // Trigger next item selection
    }
  };
  
  // Show transition screen
  if (showTransition && session.completedDomains.length > 0) {
    const lastCompletedDomain = session.completedDomains[session.completedDomains.length - 1];
    const allDomains: Domain[] = ['reading', 'math', 'science', 'writing', 'sel'];
    const nextDomain = allDomains.find(d => !session.completedDomains.includes(d));
    
    if (!nextDomain) return null; // Should not happen
    
    // Calculate accuracy for completed domain
    const domainResponses = session.responses.filter(r => r.domain === lastCompletedDomain);
    const accuracy = domainResponses.length > 0
      ? (domainResponses.reduce((sum, r) => sum + r.score, 0) / domainResponses.length) * 100
      : 0;
    
    return (
      <DomainTransition
        completedDomain={lastCompletedDomain}
        nextDomain={nextDomain}
        completedDomainScore={accuracy}
        questionsCompleted={domainResponses.length}
        totalQuestionsInDomain={domainResponses.length}
        onContinue={handleTransitionContinue}
        allowSkip={true}
      />
    );
  }
  
  // Show loading if no item selected yet
  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading next question...</p>
        </div>
      </div>
    );
  }
  
  // Main assessment view
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress */}
        <AdaptiveProgress
          session={session}
          currentDomain={session.currentDomain}
          showDetailedMetrics={false}
        />
        
        {/* Engagement Tracker */}
        <EngagementTracker
          metrics={engagementMetrics}
          currentQuestionTime={currentQuestionTime}
          showDetailedMetrics={false}
        />
        
        {/* Item Renderer */}
        <ItemRenderer
          item={currentItem}
          onSubmit={handleItemSubmit}
          textToSpeechEnabled={textToSpeechEnabled}
          audioRecordingEnabled={audioRecordingEnabled}
        />
      </div>
    </div>
  );
}
