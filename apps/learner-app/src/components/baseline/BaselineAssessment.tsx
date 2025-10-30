/**
 * Enhanced Baseline Assessment Container
 * Main component with accessibility support and 5 questions per domain
 * Connected to AI-powered backend for dynamic question generation
 */
import { Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
    EngagementMetrics as APIEngagementMetrics,
    StartSessionRequest
} from '../../services/baseline/api';
import { BaselineAPI } from '../../services/baseline/api';
import type {
    AccessibilityPreferences,
    EngagementMetrics,
} from '../../types/accessibility';
import { DEFAULT_ACCESSIBILITY_PREFS } from '../../types/accessibility';
import type {
    BaselineItem,
    BaselineSession,
    Domain,
    GradeBand,
    ItemResponse,
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
    textToSpeechEnabled: accessibilityPrefs.textToSpeech,
  });

  const [currentDomain, setCurrentDomain] = useState<Domain>('reading');
  const [itemsAnsweredPerDomain, setItemsAnsweredPerDomain] = useState<
    Record<Domain, number>
  >(Object.fromEntries(DOMAINS.map((d) => [d, 0])) as Record<Domain, number>);
  const [currentItem, setCurrentItem] = useState<BaselineItem | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  // API loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const sessionStartTimeRef = useRef(Date.now());

  // ═══════════════════════════════════════════════════════════════════════
  // AI-POWERED BACKEND INITIALIZATION
  // Replaces mock data with real AI-generated questions
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Initialize session with backend AI question generation
   * Uses multi-provider AI (OpenAI, Anthropic, Gemini)
   */
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const request: StartSessionRequest = {
          learner_id: learnerId,
          grade_band: gradeBand,
          audio_enabled: false,
          tts_enabled: accessibilityPrefs.textToSpeech,
          accessibility_preferences: {
            fontSize: accessibilityPrefs.fontSize,
            fontFamily: accessibilityPrefs.fontFamily,
            highContrast: accessibilityPrefs.highContrast,
            colorScheme: accessibilityPrefs.colorScheme,
            reduceAnimations: accessibilityPrefs.reduceAnimations,
            textToSpeech: accessibilityPrefs.textToSpeech,
            ttsVoice: accessibilityPrefs.ttsVoice,
            ttsSpeed: accessibilityPrefs.ttsSpeed,
            soundEffects: accessibilityPrefs.soundEffects,
            showTimer: accessibilityPrefs.showTimer,
            autoAdvance: accessibilityPrefs.autoAdvance,
            keyboardNav: accessibilityPrefs.keyboardNav,
            breakReminders: accessibilityPrefs.breakReminders,
            breakInterval: accessibilityPrefs.breakInterval,
            focusMode: accessibilityPrefs.focusMode,
            showHints: accessibilityPrefs.showHints,
            showConfidenceSlider: accessibilityPrefs.showConfidenceSlider,
            showEncouragement: accessibilityPrefs.showEncouragement,
          },
        };

        const response = await BaselineAPI.startSession(request);

        // Store session ID
        setSessionId(response.session_id);

        // Update session with backend response
        setSession((prev) => ({
          ...prev,
          id: response.session_id,
          currentDomain: response.current_domain as Domain,
          currentAbilityEstimates: response.ability_estimates,
          standardErrors: response.standard_errors,
        }));

        // Convert API item to BaselineItem format
        const firstItem: BaselineItem = {
          id: response.first_item.id,
          domain: response.first_item.domain as Domain,
          subDomain: response.first_item.subDomain as import('../../types/baseline').SubDomain,
          gradeBand,
          type: response.first_item.type as import('../../types/baseline').ItemType,
          stem: response.first_item.stem,
          stimulus: response.first_item.stimulus,
          stimulusType: (response.first_item.stimulusType as 'text' | 'image') || 'text',
          options: Array.isArray(response.first_item.options)
            ? response.first_item.options.map((opt) => ({
                id: opt.id,
                label: opt.label,
                correctness: opt.correct ? 1 : 0,
              }))
            : [],
          parameters: {
            difficulty: response.first_item.parameters.difficulty,
            discrimination: response.first_item.parameters.discrimination,
            guessing: response.first_item.parameters.guessing,
            estimatedTime: 60,
            cognitiveLevel: 'apply',
          },
          points: 1,
          readAloud: response.first_item.readAloud,
          allowCalculator: response.first_item.allowCalculator,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['baseline', response.first_item.domain],
        };

        setCurrentItem(firstItem);
        setCurrentDomain(response.current_domain as Domain);
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to start assessment'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // NOTE: Mock data loading removed - now using real AI backend
  // Adaptive item selection now handled by backend AI system
  
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
  const handleItemSubmit = async (response: Partial<ItemResponse>) => {
    if (!currentItem || !sessionId) return;
    
    setIsLoading(true);
    
    try {
      // Calculate response time in seconds
      const responseTime = (response.timeSubmitted!.getTime() - response.timeStarted!.getTime()) / 1000;
      
      // Update local engagement metrics for this response
      setEngagementMetrics(prev => ({
        ...prev,
        avgResponseTime: (prev.avgResponseTime * session.itemsAnswered + responseTime) / (session.itemsAnswered + 1),
        hesitationIndicators: prev.hesitationIndicators + (response.hesitationCount ?? 0),
        consecutiveQuickResponses: responseTime < 5 ? prev.consecutiveQuickResponses + 1 : 0,
        consecutiveSlowResponses: responseTime > 60 ? prev.consecutiveSlowResponses + 1 : 0,
        skippedItems: prev.skippedItems + (response.skipped ? 1 : 0),
        hintsUsed: prev.hintsUsed + (response.usedHint ? 1 : 0),
      }));
      
      // Convert to API engagement metrics format
      const apiEngagementMetrics: APIEngagementMetrics = {
        hesitationCount: response.hesitationCount ?? 0,
        usedHint: response.usedHint ?? false,
        usedReadAloud: accessibilityPrefs.textToSpeech,
        confidenceLevel: undefined, // Can add confidence slider in future
        focusLevel: engagementMetrics.focusLevel,
        timeSpentMs: responseTime * 1000,
        deviceType: navigator.userAgent,
      };
      
      // Submit response to backend and get next item
      const submitResponse = await BaselineAPI.submitResponse({
        session_id: sessionId,
        item_id: currentItem.id,
        response: {
          selected_options: response.selectedOptions,
          constructed_response: response.constructedResponse,
        },
        engagement_metrics: apiEngagementMetrics,
        time_started: response.timeStarted!.toISOString(),
        time_submitted: response.timeSubmitted!.toISOString(),
      });
      
      // Update items answered for current domain
      const newItemsAnswered = itemsAnsweredPerDomain[currentDomain] + 1;
      setItemsAnsweredPerDomain(prev => ({
        ...prev,
        [currentDomain]: newItemsAnswered
      }));
      
      // Update session with new state from backend
      setSession(prev => ({
        ...prev,
        itemsAnswered: prev.itemsAnswered + 1,
        currentAbilityEstimates: {
          ...prev.currentAbilityEstimates,
          [currentDomain]: submitResponse.updated_theta
        },
        standardErrors: {
          ...prev.standardErrors,
          [currentDomain]: submitResponse.updated_se
        },
        responses: [...prev.responses, {
          ...response as ItemResponse,
          score: submitResponse.score
        }],
      }));
      
      // Check if assessment is complete
      if (submitResponse.assessment_complete) {
        const finalSession: BaselineSession = {
          ...session,
          status: 'completed',
          completedAt: new Date(),
          totalTimeMs: Date.now() - sessionStartTimeRef.current
        };
        onComplete(finalSession);
        return;
      }
      
      // Check if should switch domains
      if (submitResponse.should_stop_domain && submitResponse.next_domain) {
        const completedDomains = [...session.domainsCompleted, currentDomain];
        setCurrentDomain(submitResponse.next_domain as Domain);
        setSession(prev => ({
          ...prev,
          domainsCompleted: completedDomains,
          currentDomain: submitResponse.next_domain as Domain
        }));
        setShowTransition(true);
      } else if (submitResponse.should_suggest_break) {
        // Check if break is needed
        if (accessibilityPrefs.breakReminders) {
          setShowBreak(true);
        }
      }
      
      // Convert next item from API to BaselineItem format
      if (submitResponse.next_item) {
        console.log('📝 Next item received:', submitResponse.next_item.id, submitResponse.next_item.domain);
        
        const nextItem: BaselineItem = {
          id: submitResponse.next_item.id,
          domain: submitResponse.next_item.domain as Domain,
          subDomain: submitResponse.next_item.subDomain as import('../../types/baseline').SubDomain,
          gradeBand,
          type: submitResponse.next_item.type as import('../../types/baseline').ItemType,
          stem: submitResponse.next_item.stem,
          stimulus: submitResponse.next_item.stimulus,
          stimulusType: (submitResponse.next_item.stimulusType as 'text' | 'image') || 'text',
          options: Array.isArray(submitResponse.next_item.options)
            ? submitResponse.next_item.options.map((opt) => ({
                id: opt.id,
                label: opt.label,
                correctness: opt.correct ? 1 : 0,
              }))
            : [],
          parameters: {
            difficulty: submitResponse.next_item.parameters.difficulty,
            discrimination: submitResponse.next_item.parameters.discrimination,
            guessing: submitResponse.next_item.parameters.guessing,
            estimatedTime: 60,
            cognitiveLevel: 'apply',
          },
          points: 1,
          readAloud: submitResponse.next_item.readAloud,
          allowCalculator: submitResponse.next_item.allowCalculator,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['baseline', submitResponse.next_item.domain],
        };
        
        // Set next item and clear loading state
        setCurrentItem(nextItem);
        setIsLoading(false);
      } else {
        console.log('✅ No next item - assessment complete or domain finished');
        
        // If no next item but assessment not marked complete, treat as completion
        if (!submitResponse.assessment_complete) {
          console.warn('⚠️ No next item but assessment_complete=false. Marking as complete.');
          const finalSession: BaselineSession = {
            ...session,
            status: 'completed',
            completedAt: new Date(),
            totalTimeMs: Date.now() - sessionStartTimeRef.current
          };
          setIsLoading(false);
          onComplete(finalSession);
        } else {
          setCurrentItem(null);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to submit response'
      );
      setIsLoading(false);
    }
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
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                🧠
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Generating your personalized question...
              </p>
              <p className="text-sm text-gray-600">
                Our AI is creating a question just for your level ✨
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Oops! Something went wrong
                  </h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      // Retry initialization
                      window.location.reload();
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!isLoading && !error && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
