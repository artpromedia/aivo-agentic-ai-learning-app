/**
 * Cleanup old audio files (90 days)
 * Run as scheduled Edge Function (cron)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    console.log(`[Cleanup] Deleting audio files older than ${cutoffDate.toISOString()}`);

    // List all files in baseline-audio bucket
    const { data: files, error } = await supabase.storage.from('baseline-audio').list('', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'asc' },
    });

    if (error) throw error;

    const filesToDelete: string[] = [];

    for (const file of files) {
      const fileDate = new Date(file.created_at);
      if (fileDate < cutoffDate) {
        filesToDelete.push(file.name);
      }
    }

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('baseline-audio')
        .remove(filesToDelete);

      if (deleteError) throw deleteError;

      console.log(`[Cleanup] Deleted ${filesToDelete.length} files`);
    } else {
      console.log('[Cleanup] No files to delete');
    }

    return new Response(JSON.stringify({ deleted: filesToDelete.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
