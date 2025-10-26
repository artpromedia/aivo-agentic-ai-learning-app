/**
 * Reading Fluency Scoring
 * Calculates WPM, accuracy, prosody, automaticity, and speech therapy metrics
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { distance as levenshtein } from 'https://deno.land/x/fastest_levenshtein@1.0.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface FluencyScoreRequest {
  sessionId: string;
  itemId: string;
  transcript: string;
  expectedText: string;
  words: Array<{ word: string; start: number; end: number }>;
  audioUrl: string;
  gradeBand: 'K-5' | '6-8' | '9-12';
}

interface FluencyScore {
  wpm: number;
  wcpm: number;
  accuracy: number;
  expression: number;
  automaticity: number;
  errors: ErrorAnalysis[];
  speechTherapy: SpeechTherapyMetrics;
  benchmark: 'below' | 'at' | 'above';
}

interface ErrorAnalysis {
  type:
    | 'omission'
    | 'substitution'
    | 'addition'
    | 'repetition'
    | 'self_correction';
  expected: string;
  actual: string;
  position: number;
  severity: 'minor' | 'moderate' | 'significant';
}

interface SpeechTherapyMetrics {
  articulationErrors: ArticulationError[];
  phonologicalPatterns: string[];
  voiceQuality: {
    pitch: 'appropriate' | 'high' | 'low';
    volume: 'appropriate' | 'loud' | 'soft';
    rate: 'appropriate' | 'fast' | 'slow';
  };
  fluencyDisorders: {
    repetitions: number;
    prolongations: number;
    blocks: number;
  };
  clarity: number;
  intelligibility: number;
}

interface ArticulationError {
  phoneme: string;
  position: 'initial' | 'medial' | 'final';
  context: string;
  errorType: 'substitution' | 'omission' | 'distortion';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      sessionId,
      itemId,
      transcript,
      expectedText,
      words,
      audioUrl,
      gradeBand,
    }: FluencyScoreRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate WPM and WCPM
    const duration = words.length > 0 ? words[words.length - 1].end : 0;
    const totalWords = words.length;
    const wpm = duration > 0 ? (totalWords / duration) * 60 : 0;

    // Calculate accuracy
    const expectedWords = normalizeText(expectedText).split(/\s+/);
    const transcribedWords = normalizeText(transcript).split(/\s+/);

    const { accuracy, errors, correctWords } = calculateAccuracy(
      expectedWords,
      transcribedWords
    );
    const wcpm = duration > 0 ? (correctWords / duration) * 60 : 0;

    // Calculate prosody (expression)
    const expression = calculateProsody(words, expectedText);

    // Calculate automaticity (pace consistency)
    const automaticity = calculateAutomaticity(words);

    // Speech therapy analysis
    const speechTherapy = await analyzeSpeechTherapy(
      transcript,
      expectedText,
      errors,
      audioUrl,
      supabase
    );

    // Benchmark comparison
    const benchmark = compareToNorms(wcpm, gradeBand);

    // Compile fluency score
    const fluencyScore: FluencyScore = {
      wpm: Math.round(wpm),
      wcpm: Math.round(wcpm),
      accuracy: Math.round(accuracy * 100) / 100,
      expression: Math.round(expression * 10) / 10,
      automaticity: Math.round(automaticity * 10) / 10,
      errors,
      speechTherapy,
      benchmark,
    };

    // Save fluency scores to database
    await supabase
      .from('baseline_responses')
      .update({
        engagement_metrics: {
          fluency: fluencyScore,
        },
      })
      .eq('session_id', sessionId)
      .eq('item_id', itemId);

    return new Response(JSON.stringify(fluencyScore), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fluency scoring error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper Functions

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateAccuracy(
  expectedWords: string[],
  transcribedWords: string[]
): { accuracy: number; errors: ErrorAnalysis[]; correctWords: number } {
  const errors: ErrorAnalysis[] = [];
  let correctWords = 0;

  // Dynamic programming for edit distance alignment
  const dp: number[][] = Array(expectedWords.length + 1)
    .fill(null)
    .map(() => Array(transcribedWords.length + 1).fill(0));

  for (let i = 0; i <= expectedWords.length; i++) dp[i][0] = i;
  for (let j = 0; j <= transcribedWords.length; j++) dp[0][j] = j;

  for (let i = 1; i <= expectedWords.length; i++) {
    for (let j = 1; j <= transcribedWords.length; j++) {
      if (expectedWords[i - 1] === transcribedWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j], // Deletion
            dp[i][j - 1], // Insertion
            dp[i - 1][j - 1] // Substitution
          );
      }
    }
  }

  // Backtrack to identify errors
  let i = expectedWords.length;
  let j = transcribedWords.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expectedWords[i - 1] === transcribedWords[j - 1]) {
      correctWords++;
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      // Substitution
      const distance = levenshtein(expectedWords[i - 1], transcribedWords[j - 1]);
      const severity =
        distance <= 2 ? 'minor' : distance <= 4 ? 'moderate' : 'significant';

      errors.push({
        type: 'substitution',
        expected: expectedWords[i - 1],
        actual: transcribedWords[j - 1],
        position: i - 1,
        severity,
      });
      i--;
      j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      // Insertion (addition)
      errors.push({
        type: 'addition',
        expected: '',
        actual: transcribedWords[j - 1],
        position: i,
        severity: 'minor',
      });
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      // Deletion (omission)
      errors.push({
        type: 'omission',
        expected: expectedWords[i - 1],
        actual: '',
        position: i - 1,
        severity: 'moderate',
      });
      i--;
    }
  }

  const accuracy =
    expectedWords.length > 0 ? (correctWords / expectedWords.length) * 100 : 0;

  return { accuracy, errors: errors.reverse(), correctWords };
}

function calculateProsody(
  words: Array<{ word: string; start: number; end: number }>,
  expectedText: string
): number {
  if (words.length === 0) return 5;

  const sentences = expectedText.split(/[.!?]+/).filter((s) => s.trim());
  let appropriatePauses = 0;
  let totalPausePoints = sentences.length - 1;

  for (let i = 0; i < words.length - 1; i++) {
    const pauseDuration = words[i + 1].start - words[i].end;

    if (pauseDuration > 0.3) {
      const wordsSoFar = words
        .slice(0, i + 1)
        .map((w) => w.word)
        .join(' ');

      if (
        sentences.some((s) =>
          normalizeText(wordsSoFar).endsWith(normalizeText(s))
        )
      ) {
        appropriatePauses++;
      }
    }
  }

  const prosodyScore =
    totalPausePoints > 0
      ? Math.min(10, (appropriatePauses / totalPausePoints) * 10)
      : 5;

  return prosodyScore;
}

function calculateAutomaticity(
  words: Array<{ word: string; start: number; end: number }>
): number {
  if (words.length < 3) return 5;

  const durations = words.map((w) => w.end - w.start);
  const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;

  const variance =
    durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    durations.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;

  const automaticityScore = Math.max(0, Math.min(10, 10 - cv * 20));

  return automaticityScore;
}

async function analyzeSpeechTherapy(
  transcript: string,
  expectedText: string,
  errors: ErrorAnalysis[],
  audioUrl: string,
  supabase: any
): Promise<SpeechTherapyMetrics> {
  // Articulation error analysis
  const articulationErrors: ArticulationError[] = [];

  for (const error of errors) {
    if (error.type === 'substitution') {
      const phonemeErrors = analyzePhonemeSubstitution(
        error.expected,
        error.actual
      );
      articulationErrors.push(...phonemeErrors);
    }
  }

  // Phonological pattern detection
  const phonologicalPatterns: string[] = [];
  const transcribedWords = normalizeText(transcript).split(/\s+/);

  const patterns: Record<string, RegExp> = {
    'Final Consonant Deletion': /\w+[aeiou]$/i,
    'Cluster Reduction': /(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sl|sm|sn|sp|st|sw|tr)/gi,
    Stopping: /(th|sh|ch|f|v|s|z)/gi,
    Fronting: /(k|g|ng)/gi,
    Gliding: /(r|l)/gi,
  };

  for (const [patternName, regex] of Object.entries(patterns)) {
    const matchCount = transcribedWords.filter((w) => !regex.test(w)).length;
    const expectedMatchCount = normalizeText(expectedText)
      .split(/\s+/)
      .filter((w) => regex.test(w)).length;

    if (matchCount > expectedMatchCount * 0.3) {
      phonologicalPatterns.push(patternName);
    }
  }

  // Voice quality (placeholder - requires acoustic analysis)
  const voiceQuality = {
    pitch: 'appropriate' as const,
    volume: 'appropriate' as const,
    rate: 'appropriate' as const,
  };

  // Fluency disorders
  const fluencyDisorders = {
    repetitions: errors.filter((e) => e.type === 'repetition').length,
    prolongations: 0,
    blocks: 0,
  };

  // Clarity and intelligibility
  const clarity = Math.max(0, 100 - articulationErrors.length * 5);
  const intelligibility = Math.max(0, 100 - errors.length * 3);

  return {
    articulationErrors,
    phonologicalPatterns,
    voiceQuality,
    fluencyDisorders,
    clarity,
    intelligibility,
  };
}

function analyzePhonemeSubstitution(
  expected: string,
  actual: string
): ArticulationError[] {
  const errors: ArticulationError[] = [];

  const commonSubstitutions = [
    { from: 'th', to: 'f', type: 'Fronting' },
    { from: 'r', to: 'w', type: 'Gliding' },
    { from: 'l', to: 'w', type: 'Gliding' },
    { from: 'k', to: 't', type: 'Fronting' },
    { from: 'g', to: 'd', type: 'Fronting' },
  ];

  for (const sub of commonSubstitutions) {
    if (expected.includes(sub.from) && actual.includes(sub.to)) {
      errors.push({
        phoneme: sub.from,
        position:
          expected.indexOf(sub.from) === 0
            ? 'initial'
            : expected.indexOf(sub.from) === expected.length - sub.from.length
              ? 'final'
              : 'medial',
        context: `${expected} → ${actual}`,
        errorType: 'substitution',
      });
    }
  }

  return errors;
}

function compareToNorms(
  wcpm: number,
  gradeBand: 'K-5' | '6-8' | '9-12'
): 'below' | 'at' | 'above' {
  const norms: Record<string, { below: number; at: number }> = {
    'K-5': { below: 60, at: 100 },
    '6-8': { below: 120, at: 160 },
    '9-12': { below: 150, at: 200 },
  };

  const norm = norms[gradeBand];

  if (wcpm < norm.below) return 'below';
  if (wcpm >= norm.at) return 'above';
  return 'at';
}
