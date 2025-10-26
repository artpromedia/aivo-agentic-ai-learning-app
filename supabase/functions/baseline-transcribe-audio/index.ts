/**
 * Speech-to-Text Transcription
 * Uses OpenAI Whisper API for accurate transcription with word-level timestamps
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface TranscribeRequest {
  audioUrl: string;
  expectedText?: string;
  itemId: string;
  sessionId: string;
}

interface TranscriptionResult {
  transcript: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  duration: number;
  language: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      audioUrl,
      expectedText,
      itemId,
      sessionId,
    }: TranscribeRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download audio file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('baseline-audio')
      .download(audioUrl);

    if (downloadError) {
      throw new Error(`Failed to download audio: ${downloadError.message}`);
    }

    // Transcribe with OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioData, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    if (expectedText) {
      formData.append('prompt', expectedText);
    }

    const whisperResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
        },
        body: formData,
      }
    );

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const whisperData = await whisperResponse.json();

    // Format response
    const result: TranscriptionResult = {
      transcript: whisperData.text,
      words:
        whisperData.words?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
          confidence: 1.0,
        })) || [],
      duration: whisperData.duration || 0,
      language: whisperData.language || 'en',
    };

    // Save transcription to database
    await supabase
      .from('baseline_responses')
      .update({
        constructed_response: result.transcript,
        engagement_metrics: {
          transcription: {
            words: result.words,
            duration: result.duration,
            language: result.language,
          },
        },
      })
      .eq('session_id', sessionId)
      .eq('item_id', itemId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Transcription error:', error);
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
