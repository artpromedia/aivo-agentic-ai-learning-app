/**
 * Baseline Assessment Container
 * Main component that orchestrates the adaptive assessment
 */
import { useState, useEffect, useRef, useCallback } from 'react';
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
    domainsCompleted: [],
    status: 'in_progress',
    itemsAnswered: 0,
    totalItems: 0,
    currentAbilityEstimates: {},
    standardErrors: {},
    responses: [],
    totalTimeMs: 0,
    audioRecordingEnabled,
    textToSpeechEnabled
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
        points: 1,
        readAloud: true,
        allowCalculator: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['baseline', 'reading']
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
        points: 1,
        readAloud: true,
        allowCalculator: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['baseline', 'math']
      },
      // Science items
      {
        id: 'science-1',
        domain: 'science',
        subDomain: 'life_science',
        gradeBand,
        type: 'single_choice',
        stem: 'What do plants need to grow?',
        options: [
          { id: 'a', label: 'Only water', correctness: 0 },
          { id: 'b', label: 'Sunlight, water, and air', correctness: 1 },
          { id: 'c', label: 'Only sunlight', correctness: 0 },
          { id: 'd', label: 'Only soil', correctness: 0 }
        ],
        parameters: {
          difficulty: -0.8,
          discrimination: 1.3,
          guessing: 0.25,
          estimatedTime: 35,
          cognitiveLevel: 'remember'
        },
        points: 1,
        readAloud: true,
        allowCalculator: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['baseline', 'science']
      },
      // Writing items
      {
        id: 'writing-1',
        domain: 'writing',
        subDomain: 'grammar',
        gradeBand,
        type: 'single_choice',
        stem: 'Which sentence is correct?',
        options: [
          { id: 'a', label: 'She go to school', correctness: 0 },
          { id: 'b', label: 'She goes to school', correctness: 1 },
          { id: 'c', label: 'She going to school', correctness: 0 },
          { id: 'd', label: 'She goed to school', correctness: 0 }
        ],
        parameters: {
          difficulty: -0.3,
          discrimination: 1.4,
          guessing: 0.25,
          estimatedTime: 40,
          cognitiveLevel: 'apply'
        },
        points: 1,
        readAloud: true,
        allowCalculator: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['baseline', 'writing']
      },
      // SEL items
      {
        id: 'sel-1',
        domain: 'sel',
        subDomain: 'self_awareness',
        gradeBand,
        type: 'single_choice',
        stem: 'How do you feel when you help a friend?',
        options: [
          { id: 'a', label: 'Sad', correctness: 0 },
          { id: 'b', label: 'Happy and proud', correctness: 1 },
          { id: 'c', label: 'Angry', correctness: 0 },
          { id: 'd', label: 'Scared', correctness: 0 }
        ],
        parameters: {
          difficulty: -1.0,
          discrimination: 1.0,
          guessing: 0.25,
          estimatedTime: 25,
          cognitiveLevel: 'understand'
        },
        points: 1,
        readAloud: true,
        allowCalculator: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['baseline', 'sel']
      }
      // TODO: Add more items for all domains in production
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
    
    // Only stop if we have at least answered one question per domain
    if (domainResponses.length > 0 && shouldStopTesting(domainResponses, currentSE, {
      minItems: 1, // Reduced for mock data (only 1 question per domain)
      maxItems: 5,
      targetSE: 0.3
    })) {
      handleDomainComplete();
      return;
    }
    
    // Select next item using adaptive algorithm
    const nextItem = selectNextItem({
      domain: session.currentDomain,
      currentTheta: currentTheta,
      standardError: currentSE,
      responsesInDomain: domainResponses,
      availableItems: domainItems,
      targetAccuracy: 0.7,
      contentBalancing: true,
      exposureControl: false
    });
    
    if (nextItem) {
      setCurrentItem(nextItem);
      questionStartTimeRef.current = Date.now();
      setCurrentQuestionTime(0);
    } else {
      handleDomainComplete();
    }
  }, [availableItems, currentItem, session.currentDomain, session.currentAbilityEstimates, session.standardErrors, session.responses]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
    
    // Convert to format expected by estimateAbilityMLE
    const irtResponses = domainResponses.map((r, i) => ({
      correct: r.score > 0.5,  // Convert score to boolean
      item: {
        a: items[i].parameters.discrimination,
        b: items[i].parameters.difficulty,
        c: items[i].parameters.guessing || 0.25
      }
    }));
    
    const { theta, standardError } = estimateAbilityMLE(irtResponses);
    
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
        [session.currentDomain]: standardError
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
  const handleDomainComplete = useCallback(() => {
    setSession(prev => {
      const completedDomain = prev.currentDomain;
      const domainsCompleted = [...prev.domainsCompleted, completedDomain];
      
      // Determine next domain
      const allDomains: Domain[] = ['reading', 'math', 'science', 'writing', 'sel'];
      const remainingDomains = allDomains.filter(d => !domainsCompleted.includes(d));
      
      if (remainingDomains.length === 0) {
        // Assessment complete!
        const finalSession: BaselineSession = {
          ...prev,
          domainsCompleted,
          status: 'completed',
          completedAt: new Date()
        };
        onComplete(finalSession);
        return prev; // Don't update state, we're done
      }
      
      // Show transition screen
      setShowTransition(true);
      return {
        ...prev,
        domainsCompleted
      };
    });
  }, [onComplete]);
  
  // Handle transition continue
  const handleTransitionContinue = () => {
    console.log('🔄 BaselineAssessment: handleTransitionContinue called');
    console.log('📊 Current session state:', {
      currentDomain: session.currentDomain,
      domainsCompleted: session.domainsCompleted,
      totalResponses: session.responses.length
    });
    
    const allDomains: Domain[] = ['reading', 'math', 'science', 'writing', 'sel'];
    const nextDomain = allDomains.find(d => !session.domainsCompleted.includes(d));
    
    console.log('➡️ Next domain determined:', nextDomain);
    
    if (nextDomain) {
      setSession(prev => ({
        ...prev,
        currentDomain: nextDomain
      }));
      setShowTransition(false);
      setCurrentItem(null); // Trigger next item selection
      console.log('✅ Updated session to continue with domain:', nextDomain);
    } else {
      console.log('⚠️ No next domain found - assessment should be complete');
    }
  };
  
  // Show transition screen
  if (showTransition && session.domainsCompleted.length > 0) {
    const lastCompletedDomain = session.domainsCompleted[session.domainsCompleted.length - 1];
    const allDomains: Domain[] = ['reading', 'math', 'science', 'writing', 'sel'];
    const nextDomain = allDomains.find(d => !session.domainsCompleted.includes(d));
    
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
