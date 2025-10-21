/**
 * Homework Upload Component
 * Multi-modal input interface supporting photos, documents, and text
 */

import React, { useState, useRef } from 'react';
import { Button, Card, Input } from '@aivo/ui';
import { homeworkService } from '@aivo/utils';
import type { HomeworkSession } from '@aivo/types';

interface HomeworkUploadProps {
  learnerId: string;
  onSessionCreated: (session: HomeworkSession) => void;
}

export const HomeworkUpload: React.FC<HomeworkUploadProps> = ({
  learnerId,
  onSessionCreated,
}) => {
  const [title, setTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() && !pastedText.trim() && files.length === 0) {
      alert('Please provide a title and at least one input (text or file)');
      return;
    }

    setIsProcessing(true);

    try {
      // Determine input method
      let inputMethod: 'photo' | 'document' | 'text' | 'multiple' = 'text';
      if (files.length > 0) {
        const hasImages = files.some(f => f.type.startsWith('image/'));
        const hasDocs = files.some(f => 
          f.type === 'application/pdf' || 
          f.type.includes('word') || 
          f.type.includes('document')
        );
        
        if (hasImages && hasDocs) {
          inputMethod = 'multiple';
        } else if (hasImages) {
          inputMethod = 'photo';
        } else {
          inputMethod = 'document';
        }
      }
      
      // If both text and files, use multiple
      if (pastedText.trim() && files.length > 0) {
        inputMethod = 'multiple';
      }

      const session = await homeworkService.createSession({
        learnerId,
        title: title || 'Homework Assignment',
        inputMethod: (inputMethod === 'multiple' ? 'photo' : inputMethod) as 'photo' | 'document' | 'text',
        text: pastedText || undefined,
        files: files.length > 0 ? files : undefined,
      });

      onSessionCreated(session);

      // Reset form
      setTitle('');
      setPastedText('');
      setFiles([]);
    } catch (error) {
      console.error('Failed to create homework session:', error);
      alert('Failed to start homework session. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '📷';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6" data-testid="homework-upload">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">📚 Homework Helper</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Get step-by-step guidance on your homework. Upload a photo, document, or paste the problem.
        </p>
      </div>

      {/* Title Input */}
      <Card>
        <Input
          label="Homework Title (optional)"
          placeholder="e.g., Math Problem Set #3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="homework-title"
        />
      </Card>

      {/* Input Methods */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Photo Upload */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">📸</div>
          <h3 className="font-semibold mb-2">Take Photo</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Snap a picture of your homework
          </p>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Take photo of homework"
          />
          <Button
            variant="primary"
            fullWidth
            onClick={() => cameraInputRef.current?.click()}
            data-testid="take-photo"
          >
            Open Camera
          </Button>
        </Card>

        {/* Document Upload */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="font-semibold mb-2">Upload File</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            PDF, DOCX, or image files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload homework files"
          />
          <Button
            variant="primary"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-file"
          >
            Choose Files
          </Button>
        </Card>

        {/* Text Input */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-3">✏️</div>
          <h3 className="font-semibold mb-2">Type or Paste</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Copy instructions from email or online
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => document.getElementById('text-input')?.focus()}
            data-testid="use-text"
          >
            Use Text
          </Button>
        </Card>
      </div>

      {/* Text Input Area */}
      <Card>
        <label htmlFor="text-input" className="block mb-2 font-medium">
          Paste homework instructions (optional)
        </label>
        <textarea
          id="text-input"
          className="w-full h-32 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder="Paste your homework problem or instructions here..."
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          data-testid="homework-text-input"
          aria-label="Homework text input"
        />
        <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {pastedText.length > 0 && (
            <span>{pastedText.length} characters</span>
          )}
        </div>
      </Card>

      {/* File Preview */}
      {files.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-3">
            Uploaded Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                data-testid={`file-${index}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl" role="img" aria-label={`File type: ${file.type}`}>
                    {getFileIcon(file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  data-testid={`remove-file-${index}`}
                  aria-label={`Remove ${file.name}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={isProcessing || (!title.trim() && !pastedText.trim() && files.length === 0)}
          data-testid="start-homework"
          aria-label="Start homework session"
        >
          {isProcessing ? (
            <>
              <div 
                className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" 
                role="status"
                aria-label="Processing"
              />
              Processing...
            </>
          ) : (
            '🚀 Start Homework Session'
          )}
        </Button>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span role="img" aria-label="Tips">💡</span>
          Tips for Best Results
        </h4>
        <ul className="text-sm space-y-1 list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Take clear, well-lit photos with all text visible</li>
          <li>Include all parts of multi-step problems</li>
          <li>Upload teacher instructions or rubrics if available</li>
          <li>You can add multiple files for complex assignments</li>
        </ul>
      </Card>
    </div>
  );
};
