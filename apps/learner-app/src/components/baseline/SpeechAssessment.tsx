/**
 * Speech Therapy Assessment Component
 * Specialized assessment for speech/language pathology
 */
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Volume2, AlertCircle, CheckCircle2, Activity, Upload } from 'lucide-react';
import { uploadAudioRecording, analyzeAudioMetadata } from '@/services/baseline/audioStorage';
import { supabase } from '@/lib/supabase';

interface SpeechAssessmentProps {
  itemType: 'articulation' | 'fluency' | 'voice' | 'language' | 'pragmatics';
  prompt: string;
  targetSounds?: string[];
  stimulus?: string;
  visualSupport?: string; // Image URL for picture naming
  sessionId: string;
  itemId: string;
  learnerId: string;
  gradeBand: 'K-5' | '6-8' | '9-12';
  onComplete: (audioUrl: string, duration: number, selfRating: string) => void;
}

export function SpeechAssessment({
  itemType,
  prompt,
  targetSounds = [],
  stimulus,
  visualSupport,
  sessionId,
  itemId,
  learnerId,
  gradeBand,
  onComplete
}: SpeechAssessmentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [selfRating, setSelfRating] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [playingModel, setPlayingModel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Get task-specific instructions
  const getInstructions = () => {
    switch (itemType) {
      case 'articulation':
        return {
          title: 'Say the Sound',
          instructions: [
            'Listen carefully to the sound or word',
            'Say it clearly into the microphone',
            'Try your best to make the sound correctly',
            'You can record as many times as you need'
          ],
          icon: Volume2
        };
      case 'fluency':
        return {
          title: 'Speak Smoothly',
          instructions: [
            'Read the sentence or describe the picture',
            'Take your time and speak at your own pace',
            'It\'s okay to pause if you need to',
            'Focus on speaking smoothly and clearly'
          ],
          icon: Activity
        };
      case 'voice':
        return {
          title: 'Use Your Voice',
          instructions: [
            'Say the word or sentence in a clear voice',
            'Use a comfortable pitch and volume',
            'Speak naturally',
            'Listen to how your voice sounds'
          ],
          icon: Mic
        };
      case 'language':
        return {
          title: 'Tell Me About It',
          instructions: [
            'Look at the picture or listen to the question',
            'Tell me what you see or answer in your own words',
            'Use complete sentences if you can',
            'Take your time to think before you speak'
          ],
          icon: Volume2
        };
      case 'pragmatics':
        return {
          title: 'Have a Conversation',
          instructions: [
            'Listen to the scenario',
            'Respond as if you\'re talking to a friend',
            'Make eye contact with the camera',
            'Take turns in the conversation'
          ],
          icon: Volume2
        };
      default:
        return {
          title: 'Speech Activity',
          instructions: ['Follow the prompts'],
          icon: Mic
        };
    }
  };

  const instructions = getInstructions();
  const InstructionIcon = instructions.icon;

  // Play model audio (if provided)
  const playModelAudio = () => {
    if ('speechSynthesis' in window && stimulus) {
      setPlayingModel(true);
      const utterance = new SpeechSynthesisUtterance(stimulus);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher for child-friendliness
      utterance.onend = () => setPlayingModel(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start recording with visualization
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false // Don't auto-adjust for speech assessment
        } 
      });

      // Setup audio visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        
        // Stop visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setShowInstructions(false);
      
      // Start timer
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);

      // Start visualization
      visualizeAudio();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions and try again.');
    }
  };

  // Visualize audio input
  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume for visual feedback
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Update UI based on volume (could show waveform, meter, etc.)
      // For now, this is just preparation for visualization
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(finalDuration);
    }
  };

  // Submit response
  const handleSubmit = async () => {
    if (!audioUrl || !selfRating) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Convert audio URL to Blob
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      // Analyze audio metadata
      const metadata = await analyzeAudioMetadata(audioBlob);

      // Upload to Supabase Storage
      const { publicUrl } = await uploadAudioRecording(
        audioBlob,
        learnerId,
        sessionId,
        itemId,
        metadata
      );

      // Trigger audio processing in background (non-blocking)
      supabase.functions.invoke('baseline-process-audio', {
        body: {
          sessionId,
          itemId,
          audioUrl: publicUrl,
          expectedText: prompt,
          gradeBand,
        },
      });

      // Complete immediately (processing happens async)
      onComplete(publicUrl, duration, selfRating);
    } catch (error) {
      console.error('Error submitting audio:', error);
      setUploadError('Failed to upload recording. Please try again.');
      setIsUploading(false);
    }
  };

  // Reset to record again
  const resetRecording = () => {
    setAudioUrl(null);
    setDuration(0);
    setSelfRating(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-100">
            <InstructionIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {instructions.title}
          </h2>
        </div>
        <p className="text-gray-600">
          Speech Therapy Assessment
        </p>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to do this activity:
          </h3>
          <ul className="space-y-2">
            {instructions.instructions.map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-2 text-blue-800">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it! Let's start
          </button>
        </div>
      )}

      {/* Visual Support (if provided) */}
      {visualSupport && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <img 
            src={visualSupport} 
            alt="Visual prompt" 
            className="max-w-full h-auto mx-auto rounded-lg shadow-md"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      {/* Prompt */}
      <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {prompt}
        </h3>
        
        {/* Target sounds (for articulation) */}
        {targetSounds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm text-gray-600">Target sounds:</span>
            {targetSounds.map((sound, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-semibold"
              >
                /{sound}/
              </span>
            ))}
          </div>
        )}

        {/* Model audio button */}
        {stimulus && (
          <button
            onClick={playModelAudio}
            disabled={playingModel}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <Volume2 className={`w-5 h-5 ${playingModel ? 'animate-pulse' : ''}`} />
            {playingModel ? 'Playing...' : 'Hear it first'}
          </button>
        )}
      </div>

      {/* Recording Controls */}
      {!audioUrl ? (
        <div className="space-y-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full py-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Mic className="w-8 h-8" />
              Start Recording
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-100 rounded-full">
                  <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-2xl font-bold text-red-600">
                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-gray-600 mt-3">Recording in progress...</p>
              </div>
              
              <button
                onClick={stopRecording}
                className="w-full py-6 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-gray-800 hover:to-gray-900 transition-all"
              >
                <Square className="w-8 h-8" />
                Stop Recording
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Playback */}
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Recording complete!</span>
            </div>
            <audio src={audioUrl} controls className="w-full mb-3" />
            <p className="text-sm text-gray-600">
              Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Self-rating */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-700 mb-3">
              How did that feel?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'hard'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelfRating(rating as any)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selfRating === rating
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  {rating === 'easy' ? '😊 Easy' : rating === 'medium' ? '😐 Just Right' : '😅 Hard'}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={resetRecording}
              disabled={isUploading}
              className="py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Record Again
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selfRating || isUploading}
              className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                selfRating && !isUploading
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 animate-bounce" />
                  Uploading...
                </>
              ) : selfRating ? (
                'Submit & Continue →'
              ) : (
                'Rate your recording first'
              )}
            </button>
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{uploadError}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Speech Assessment</span>
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Listening for clarity and fluency
          </span>
        </div>
      </div>
    </div>
  );
}
