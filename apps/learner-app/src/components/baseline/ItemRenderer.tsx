/**
 * Adaptive Item Renderer
 * Renders different question types with accessibility features
 */
import { useState, useEffect, useRef } from 'react';
import type { BaselineItem, ItemResponse } from '../../types/baseline';
import { CheckCircle2, Circle, Square, CheckSquare, Mic, Volume2, AlertCircle } from 'lucide-react';

interface ItemRendererProps {
  item: BaselineItem;
  onSubmit: (response: Partial<ItemResponse>) => void;
  textToSpeechEnabled?: boolean;
  audioRecordingEnabled?: boolean;
}

export function ItemRenderer({ 
  item, 
  onSubmit,
  textToSpeechEnabled = false,
  audioRecordingEnabled = false
}: ItemRendererProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [constructedResponse, setConstructedResponse] = useState('');
  const [selfRating, setSelfRating] = useState<'easy' | 'just_right' | 'hard' | null>(null);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [usedReadAloud, setUsedReadAloud] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const startTimeRef = useRef(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  useEffect(() => {
    // Reset state when item changes
    setSelectedOptions([]);
    setConstructedResponse('');
    setSelfRating(null);
    setHesitationCount(0);
    setAudioUrl(null);
    setUsedReadAloud(false);
    setUsedHint(false);
    startTimeRef.current = Date.now();
  }, [item.id]);
  
  // Text-to-speech
  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(item.stem);
      if (item.stimulus) {
        utterance.text += '. ' + item.stimulus;
      }
      window.speechSynthesis.speak(utterance);
      setUsedReadAloud(true);
    }
  };
  
  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Handle option selection
  const handleOptionToggle = (optionId: string) => {
    setHesitationCount(prev => prev + 1);
    
    if (item.type === 'single_choice' || item.type === 'yes_no') {
      setSelectedOptions([optionId]);
    } else if (item.type === 'multi_select') {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };
  
  // Handle submit
  const handleSubmit = () => {
    const timeSpentMs = Date.now() - startTimeRef.current;
    
    const response: Partial<ItemResponse> = {
      itemId: item.id,
      domain: item.domain,
      subDomain: item.subDomain,
      timeStarted: new Date(startTimeRef.current),
      timeSubmitted: new Date(),
      timeSpentMs,
      hesitationCount,
      skipped: false,
      usedHint,
      usedReadAloud,
      selfRating: selfRating || undefined,
    };
    
    // Add type-specific response data
    if (item.type === 'single_choice' || item.type === 'multi_select' || item.type === 'yes_no') {
      response.selectedOptions = selectedOptions;
    } else if (item.type === 'fill_blank' || item.type === 'constructed_response') {
      response.constructedResponse = constructedResponse;
    } else if (item.type === 'read_aloud') {
      response.audioUrl = audioUrl || undefined;
    }
    
    onSubmit(response);
  };
  
  // Validation
  const canSubmit = () => {
    if (item.type === 'single_choice' || item.type === 'yes_no') {
      return selectedOptions.length > 0 && selfRating !== null;
    } else if (item.type === 'multi_select') {
      return selectedOptions.length > 0 && selfRating !== null;
    } else if (item.type === 'fill_blank' || item.type === 'constructed_response') {
      return constructedResponse.trim().length > 0 && selfRating !== null;
    } else if (item.type === 'read_aloud') {
      return audioUrl !== null && selfRating !== null;
    }
    return false;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.domain}
            </span>
            <span className="text-xs text-gray-500">
              {item.subDomain.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {item.parameters.cognitiveLevel} • {item.parameters.estimatedTime}s
          </div>
        </div>
        
        {/* Accessibility Tools */}
        <div className="flex items-center gap-2">
          {textToSpeechEnabled && item.readAloud && (
            <button
              onClick={handleReadAloud}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
              title="Read question aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
          {item.allowCalculator && (
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              Calculator OK
            </span>
          )}
        </div>
      </div>
      
      {/* Stimulus (reading passage, image, etc.) */}
      {item.stimulus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {item.stimulusType === 'text' && (
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {item.stimulus}
            </p>
          )}
          {item.stimulusType === 'image' && (
            <img 
              src={item.stimulus} 
              alt="Question stimulus" 
              className="max-w-full h-auto rounded"
            />
          )}
        </div>
      )}
      
      {/* Question Stem */}
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed">
          {item.stem}
        </h3>
      </div>
      
      {/* Answer Options */}
      <div className="mb-6">
        {/* Yes/No or Single Choice */}
        {(item.type === 'yes_no' || item.type === 'single_choice') && item.options && (
          <div className="space-y-3">
            {item.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3
                  ${selectedOptions.includes(option.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
              >
                {selectedOptions.includes(option.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-gray-900">{option.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Multi-Select */}
        {item.type === 'multi_select' && item.options && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Select all that apply
            </div>
            {item.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3
                  ${selectedOptions.includes(option.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
              >
                {selectedOptions.includes(option.id) ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-gray-900">{option.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Fill in the Blank */}
        {item.type === 'fill_blank' && (
          <input
            type="text"
            value={constructedResponse}
            onChange={(e) => setConstructedResponse(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            placeholder="Type your answer here..."
          />
        )}
        
        {/* Constructed Response */}
        {item.type === 'constructed_response' && (
          <textarea
            value={constructedResponse}
            onChange={(e) => setConstructedResponse(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Write your answer here..."
          />
        )}
        
        {/* Read Aloud */}
        {item.type === 'read_aloud' && audioRecordingEnabled && (
          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-purple-900 mb-3">
                Read the passage aloud into your microphone.
              </p>
              {!audioUrl && !isRecording && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              )}
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors animate-pulse"
                >
                  <Mic className="w-5 h-5" />
                  Stop Recording
                </button>
              )}
              {audioUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Recording complete!
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                  <button
                    onClick={() => {
                      setAudioUrl(null);
                      setIsRecording(false);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Record again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Self-Rating */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">
          How did this question feel?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {['easy', 'just_right', 'hard'].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelfRating(rating as 'easy' | 'just_right' | 'hard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selfRating === rating
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
            >
              {rating === 'just_right' ? 'Just Right' : rating.charAt(0).toUpperCase() + rating.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit()}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all
          ${canSubmit()
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {canSubmit() ? 'Submit Answer' : 'Please answer the question and rate difficulty'}
      </button>
    </div>
  );
}
