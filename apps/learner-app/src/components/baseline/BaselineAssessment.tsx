/**
 * Enhanced Baseline Assessment Container
 * Main component with accessibility support and 5 questions per domain
 */
import { Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { selectNextItem } from '../../services/baseline/adaptiveSelection';
import { estimateAbilityMLE } from '../../services/baseline/irtScoring';
import type { AccessibilityPreferences, EngagementMetrics } from '../../types/accessibility';
import { DEFAULT_ACCESSIBILITY_PREFS } from '../../types/accessibility';
import type {
    BaselineItem,
    BaselineSession,
    Domain,
    GradeBand,
    ItemResponse
} from '../../types/baseline';
import { AccessibilityPanel } from './AccessibilityPanel';
import { AdaptiveProgress } from './AdaptiveProgress';
import { BreakReminder } from './BreakReminder';
import { DomainTransition } from './DomainTransition';
import { ItemRenderer } from './ItemRenderer';

interface BaselineAssessmentProps {
  learnerId: string;
  gradeBand: GradeBand;
  onComplete: (results: BaselineSession) => void;
}

const DOMAINS: Domain[] = ['reading', 'math', 'science', 'writing', 'sel', 'speech'];
const ITEMS_PER_DOMAIN = 5;
const TOTAL_ITEMS = DOMAINS.length * ITEMS_PER_DOMAIN; // 30 items

export function BaselineAssessment({
  learnerId,
  gradeBand,
  onComplete
}: BaselineAssessmentProps) {
  // Load preferences from localStorage
  const [accessibilityPrefs, setAccessibilityPrefs] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem('aivo_accessibility_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_ACCESSIBILITY_PREFS;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aivo_accessibility_prefs', JSON.stringify(accessibilityPrefs));
  }, [accessibilityPrefs]);

  // Assessment state
  const [session, setSession] = useState<BaselineSession>({
    id: crypto.randomUUID(),
    learnerId,
    gradeBand,
    startedAt: new Date(),
    currentDomain: 'reading', // Start with reading
    domainsCompleted: [],
    status: 'in_progress',
    itemsAnswered: 0,
    totalItems: TOTAL_ITEMS,
    currentAbilityEstimates: {},
    standardErrors: {},
    responses: [],
    totalTimeMs: 0,
    audioRecordingEnabled: false, // Will be enabled if needed
    textToSpeechEnabled: accessibilityPrefs.textToSpeech
  });
  
  const [currentDomain, setCurrentDomain] = useState<Domain>('reading');
  const [itemsAnsweredPerDomain, setItemsAnsweredPerDomain] = useState<Record<Domain, number>>(
    Object.fromEntries(DOMAINS.map(d => [d, 0])) as Record<Domain, number>
  );
  const [currentItem, setCurrentItem] = useState<BaselineItem | null>(null);
  const [availableItems, setAvailableItems] = useState<BaselineItem[]>([]);
  const [showTransition, setShowTransition] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  // Engagement tracking
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    focusLevel: 'high',
    hesitationIndicators: 0,
    avgResponseTime: 0,
    consecutiveQuickResponses: 0,
    consecutiveSlowResponses: 0,
    skippedItems: 0,
    hintsUsed: 0,
    breaksRequested: 0,
    confidenceRatings: []
  });

  const questionStartTimeRef = useRef(Date.now());
  const sessionStartTimeRef = useRef(Date.now());
  
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
    
    const domainItems = availableItems.filter(item => item.domain === currentDomain);
    
    if (domainItems.length === 0) {
      // No more items for this domain - shouldn't happen with our fixed 5 questions per domain
      console.warn('No items available for domain:', currentDomain);
      return;
    }
    
    // Check if we've reached the limit for this domain (5 questions)
    if (itemsAnsweredPerDomain[currentDomain] >= ITEMS_PER_DOMAIN) {
      // Domain complete, should have triggered transition already
      console.log('Domain complete, waiting for transition');
      return;
    }
    
    // Get current ability estimate for domain
    const currentTheta = session.currentAbilityEstimates[currentDomain] ?? 0;
    const currentSE = session.standardErrors[currentDomain] ?? 1;
    
    // Get responses for this domain
    const domainResponses = session.responses.filter(r => r.domain === currentDomain);
    
    // Select next item using adaptive algorithm
    const nextItem = selectNextItem({
      domain: currentDomain,
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
    }
  }, [availableItems, currentItem, currentDomain, itemsAnsweredPerDomain, session.currentAbilityEstimates, session.standardErrors, session.responses]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
    
    // Create complete response object
    const completeResponse: ItemResponse = {
      ...response as ItemResponse,
      score
    };
    
    // Update session with new response
    const updatedResponses = [...session.responses, completeResponse];
    
    // Update items answered for current domain
    const newItemsAnswered = itemsAnsweredPerDomain[currentDomain] + 1;
    setItemsAnsweredPerDomain(prev => ({
      ...prev,
      [currentDomain]: newItemsAnswered
    }));
    
    // Re-estimate ability for this domain
    const domainResponses = updatedResponses.filter(r => r.domain === currentDomain);
    const items = domainResponses.map(r => 
      availableItems.find(item => item.id === r.itemId)!
    );
    
    // Convert to format expected by estimateAbilityMLE
    const irtResponses = domainResponses.map((r, i) => ({
      correct: r.score > 0.5,
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
      itemsAnswered: prev.itemsAnswered + 1,
      currentAbilityEstimates: {
        ...prev.currentAbilityEstimates,
        [currentDomain]: theta
      },
      standardErrors: {
        ...prev.standardErrors,
        [currentDomain]: standardError
      }
    }));
    
    // Update engagement metrics
    const responseTime = (response.timeSubmitted!.getTime() - response.timeStarted!.getTime()) / 1000;
    setEngagementMetrics(prev => {
      const newAvgTime = (prev.avgResponseTime * prev.hesitationIndicators + responseTime) / (prev.hesitationIndicators + 1);
      // Note: confidenceRatings would come from separate confidence slider feature
      const newConfidenceRatings = prev.confidenceRatings;
      
      return {
        ...prev,
        avgResponseTime: newAvgTime,
        hesitationIndicators: prev.hesitationIndicators + (response.hesitationCount ?? 0),
        consecutiveQuickResponses: responseTime < 5 ? prev.consecutiveQuickResponses + 1 : 0,
        consecutiveSlowResponses: responseTime > 60 ? prev.consecutiveSlowResponses + 1 : 0,
        skippedItems: prev.skippedItems + (response.skipped ? 1 : 0),
        hintsUsed: prev.hintsUsed + (response.usedHint ? 1 : 0),
        confidenceRatings: newConfidenceRatings
      };
    });
    
    // Check if domain is complete (5 questions answered)
    if (newItemsAnswered >= ITEMS_PER_DOMAIN) {
      // Mark domain as complete and transition to next
      const completedDomains = [...session.domainsCompleted, currentDomain];
      const nextDomainIndex = DOMAINS.findIndex(d => d === currentDomain) + 1;
      
      if (nextDomainIndex < DOMAINS.length) {
        // Move to next domain
        const nextDomain = DOMAINS[nextDomainIndex];
        setCurrentDomain(nextDomain);
        setSession(prev => ({
          ...prev,
          domainsCompleted: completedDomains,
          currentDomain: nextDomain
        }));
        setShowTransition(true);
      } else {
        // Assessment complete!
        const finalSession: BaselineSession = {
          ...session,
          domainsCompleted: completedDomains,
          status: 'completed',
          completedAt: new Date(),
          totalTimeMs: Date.now() - sessionStartTimeRef.current
        };
        onComplete(finalSession);
      }
    } else {
      // Check if break is needed (every 10 questions if enabled)
      if (accessibilityPrefs.breakReminders && session.itemsAnswered % 10 === 0 && session.itemsAnswered > 0) {
        setShowBreak(true);
      }
    }
    
    // Clear current item to trigger next item selection
    setCurrentItem(null);
  };

  // Show loading if no item selected yet
  if (!currentItem && !showTransition && !showBreak) {
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
        {/* Accessibility Settings Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAccessibilityPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Accessibility
          </button>
        </div>

        {/* Progress */}
        <AdaptiveProgress
          domains={DOMAINS}
          itemsAnsweredPerDomain={itemsAnsweredPerDomain}
          itemsPerDomain={ITEMS_PER_DOMAIN}
          preferences={accessibilityPrefs}
        />

        {/* Break Reminder */}
        {showBreak && (
          <BreakReminder
            questionsCompleted={session.itemsAnswered}
            onContinue={() => {
              setShowBreak(false);
              setEngagementMetrics(prev => ({ ...prev, breaksRequested: prev.breaksRequested + 1 }));
            }}
            onTakeBreak={() => setShowBreak(false)}
            gradeBand={gradeBand}
          />
        )}

        {/* Domain Transition */}
        {showTransition && currentDomain && (
          <DomainTransition
            domain={currentDomain}
            gradeBand={gradeBand}
            preferences={accessibilityPrefs}
            onComplete={() => setShowTransition(false)}
          />
        )}
        
        {/* Item Renderer */}
        {currentItem && !showTransition && !showBreak && (
          <ItemRenderer
            item={currentItem}
            onSubmit={handleItemSubmit}
            preferences={accessibilityPrefs}
            questionNumber={session.itemsAnswered + 1}
            totalQuestions={TOTAL_ITEMS}
          />
        )}

        {/* Accessibility Panel */}
        {showAccessibilityPanel && (
          <AccessibilityPanel
            preferences={accessibilityPrefs}
            onPreferencesChange={setAccessibilityPrefs}
            isOpen={showAccessibilityPanel}
            onToggle={() => setShowAccessibilityPanel(false)}
          />
        )}
      </div>
    </div>
  );
}
