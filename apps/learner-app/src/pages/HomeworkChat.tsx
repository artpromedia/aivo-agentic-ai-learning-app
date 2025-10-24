/**
 * Homework Chat Interface
 * ChatGPT-style interface for homework help with image/document upload
 */

import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@aivo/ui';
import { Camera, Upload, Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'document';
    url: string;
    size: number;
  }>;
}

export default function HomeworkChat() {
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Aivo, your homework helper! 👋\n\nYou can:\n• 📸 Take a photo of your homework\n• 📄 Upload a document\n• ✍️ Type your question\n\nI'll help you understand and solve your homework step by step!",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    file: File;
    preview: string;
    type: 'image' | 'document';
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>, _type: 'camera' | 'file') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type === 'application/pdf' || 
                        file.type.includes('document') || 
                        file.type.includes('text');

      if (!isImage && !isDocument) {
        alert('Please upload only images or documents (PDF, DOC, TXT)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          file,
          preview: e.target?.result as string,
          type: isImage ? 'image' : 'document',
        }]);
      };
      reader.readAsDataURL(file);
    });

    setShowUploadMenu(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim() || '(Image/document attached)',
      timestamp: new Date(),
      attachments: attachments.map(a => ({
        id: a.id,
        name: a.file.name,
        type: a.type,
        url: a.preview,
        size: a.file.size,
      })),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachments([]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAIResponse = (userMsg: Message): string => {
    // This is a placeholder - replace with actual AI API call
    if (userMsg.attachments && userMsg.attachments.length > 0) {
      return "Great! I can see your homework. Let me analyze it...\n\n" +
             "I see you're working on a math problem. Let's break it down step by step:\n\n" +
             "1. First, identify what the problem is asking\n" +
             "2. What information do we already have?\n" +
             "3. What do we need to find?\n\n" +
             "Can you tell me what you think the first step should be? I'm here to guide you!";
    }
    return "That's a great question! Let me help you think through this.\n\n" +
           "Instead of giving you the answer, let me ask you:\n" +
           "• What have you tried so far?\n" +
           "• What part are you finding challenging?\n\n" +
           "This will help me guide you better!";
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 shadow-md border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/subjects')}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Back"
            >
              <span className="text-2xl">←</span>
            </button>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(to bottom right, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})`,
                }}
              >
                🤖
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Aivo Homework Helper
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Upload homework & get guided help
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/homework-helper')}
            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg font-medium transition-colors text-sm"
          >
            📋 View History
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-md'
                }`}
              >
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {message.attachments.map(att => (
                      <div
                        key={att.id}
                        className={`rounded-lg overflow-hidden ${
                          message.role === 'user' ? 'bg-blue-700' : 'bg-neutral-100 dark:bg-neutral-700'
                        }`}
                      >
                        {att.type === 'image' ? (
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full max-h-64 object-contain"
                          />
                        ) : (
                          <div className="p-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Message Content */}
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {message.content}
                </div>
                
                {/* Timestamp */}
                <div
                  className={`mt-2 text-xs ${
                    message.role === 'user' ? 'text-blue-200' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Aivo is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map(att => (
                <div
                  key={att.id}
                  className="relative bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden"
                >
                  {att.type === 'image' ? (
                    <img
                      src={att.preview}
                      alt={att.file.name}
                      className="w-20 h-20 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 flex flex-col items-center justify-center gap-1 p-2">
                      <FileText className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-xs text-center truncate w-full">
                        {att.file.name}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2 items-end">
            {/* Upload Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="p-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
                aria-label="Attach files"
              >
                <Paperclip className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>

              {/* Upload Menu Dropdown */}
              {showUploadMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-2 min-w-[200px]">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                  >
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Take Photo</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                  >
                    <Upload className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Upload File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'camera')}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'file')}
            />

            {/* Text Input */}
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-700 rounded-xl p-3">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question or describe your homework..."
                className="w-full bg-transparent resize-none outline-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 max-h-32"
                rows={1}
                disabled={isLoading}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Tips */}
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 text-center">
            💡 Tip: Take a photo of your homework for the best help!
          </div>
        </div>
      </div>
    </div>
  );
}
