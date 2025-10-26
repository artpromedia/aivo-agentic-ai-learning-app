/**
 * Audio Processing Orchestrator
 * Coordinates transcription → fluency scoring → speech therapy analysis
 * Triggered after audio upload
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ProcessAudioRequest {
  sessionId: string;
  itemId: string;
  audioUrl: string;
  expectedText: string;
  gradeBand: 'K-5' | '6-8' | '9-12';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId, itemId, audioUrl, expectedText, gradeBand }: ProcessAudioRequest =
      await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log(`[Audio Processing] Starting for session=${sessionId}, item=${itemId}`);

    // STEP 1: TRANSCRIBE AUDIO
    console.log('[Step 1/2] Transcribing audio...');

    const transcribeResponse = await fetch(
      `${supabaseUrl}/functions/v1/baseline-transcribe-audio`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl,
          expectedText,
          itemId,
          sessionId,
        }),
      }
    );

    if (!transcribeResponse.ok) {
      throw new Error(`Transcription failed: ${await transcribeResponse.text()}`);
    }

    const transcriptionData = await transcribeResponse.json();
    console.log(`[Step 1/2] Transcription complete: "${transcriptionData.transcript}"`);

    // STEP 2: SCORE FLUENCY
    console.log('[Step 2/2] Scoring fluency...');

    const fluencyResponse = await fetch(`${supabaseUrl}/functions/v1/baseline-score-fluency`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        itemId,
        transcript: transcriptionData.transcript,
        expectedText,
        words: transcriptionData.words,
        audioUrl,
        gradeBand,
      }),
    });

    if (!fluencyResponse.ok) {
      throw new Error(`Fluency scoring failed: ${await fluencyResponse.text()}`);
    }

    const fluencyData = await fluencyResponse.json();
    console.log(
      `[Step 2/2] Fluency scoring complete: WPM=${fluencyData.wpm}, Accuracy=${fluencyData.accuracy}%`
    );

    // RETURN RESULTS
    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcriptionData,
        fluency: fluencyData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Audio Processing] Error:', error);
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
