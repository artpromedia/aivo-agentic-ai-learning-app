/**
 * Audio Storage Service
 * Handles upload to Supabase Storage with compression and metadata
 */
import { supabase } from '@/lib/supabase';

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  format: string;
  fileSize: number;
  silenceDuration: number;
  volumeLevels: number[];
  peakVolume: number;
  averageVolume: number;
}

/**
 * Upload audio recording to Supabase Storage
 */
export async function uploadAudioRecording(
  audioBlob: Blob,
  learnerId: string,
  sessionId: string,
  itemId: string,
  metadata?: Partial<AudioMetadata>
): Promise<{ url: string; path: string; publicUrl: string }> {
  try {
    // Validate file size (max 5MB)
    if (audioBlob.size > 5 * 1024 * 1024) {
      throw new Error('Audio file too large. Maximum size is 5MB.');
    }

    // Validate MIME type
    const validTypes = [
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      'audio/mpeg',
      'audio/wav',
    ];
    if (!validTypes.includes(audioBlob.type)) {
      throw new Error(
        `Invalid audio format: ${audioBlob.type}. Supported: ${validTypes.join(', ')}`
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = audioBlob.type.split('/')[1].split(';')[0];
    const filename = `${itemId}_${timestamp}.${extension}`;
    const path = `${learnerId}/${sessionId}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('baseline-audio')
      .upload(path, audioBlob, {
        contentType: audioBlob.type,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('baseline-audio')
      .getPublicUrl(path);

    // Store metadata in separate file (optional)
    if (metadata) {
      const metadataPath = `${learnerId}/${sessionId}/${itemId}_${timestamp}_metadata.json`;
      await supabase.storage
        .from('baseline-audio')
        .upload(
          metadataPath,
          new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
          {
            contentType: 'application/json',
            upsert: false,
          }
        );
    }

    return {
      url: data.path,
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw new Error(
      `Failed to upload audio: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get signed URL for audio playback (valid for 1 hour)
 */
export async function getSignedAudioUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('baseline-audio')
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete audio file
 */
export async function deleteAudioRecording(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('baseline-audio')
    .remove([path]);

  if (error) throw error;
}

/**
 * Compress audio blob (reduce bitrate for smaller files)
 */
export async function compressAudio(
  audioBlob: Blob,
  targetBitrate: number = 32000
): Promise<Blob> {
  // Use Web Audio API for compression
  const audioContext = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Create offline context with lower sample rate
  const offlineContext = new OfflineAudioContext(
    1, // mono
    audioBuffer.duration * 16000, // 16kHz sample rate
    16000
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV blob
  const wavBlob = await audioBufferToWav(renderedBuffer);
  return wavBlob;
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, buffer.numberOfChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
  view.setUint16(32, buffer.numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Write audio data
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const int16 = Math.max(-1, Math.min(1, sample)) * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Analyze audio metadata
 */
export async function analyzeAudioMetadata(
  audioBlob: Blob
): Promise<AudioMetadata> {
  const audioContext = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Calculate volume levels
  const channelData = audioBuffer.getChannelData(0);
  const volumeLevels: number[] = [];
  const chunkSize = Math.floor(channelData.length / 100); // 100 samples

  for (let i = 0; i < 100; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, channelData.length);
    let sum = 0;

    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }

    volumeLevels.push(sum / (end - start));
  }

  // Detect silence
  const silenceThreshold = 0.01;
  let silenceDuration = 0;

  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) < silenceThreshold) {
      silenceDuration++;
    }
  }

  silenceDuration = (silenceDuration / audioBuffer.sampleRate) * 1000;

  return {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    format: audioBlob.type,
    fileSize: audioBlob.size,
    silenceDuration,
    volumeLevels,
    peakVolume: Math.max(...volumeLevels),
    averageVolume:
      volumeLevels.reduce((a, b) => a + b, 0) / volumeLevels.length,
  };
}
