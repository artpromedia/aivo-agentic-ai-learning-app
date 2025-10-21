/**
 * Homework Helper Service
 * Core service for multi-modal homework assistance with OCR, AI analysis, and step-by-step guidance
 */

import type {
  HomeworkSession,
  HomeworkFile,
  ExtractedContent,
  HomeworkStep,
  CreateHomeworkSessionInput,
} from '@aivo/types';

export class HomeworkService {
  private static instance: HomeworkService;

  private constructor() {}

  static getInstance(): HomeworkService {
    if (!HomeworkService.instance) {
      HomeworkService.instance = new HomeworkService();
    }
    return HomeworkService.instance;
  }

  /**
   * Create a new homework session with multi-modal input
   */
  async createSession(input: CreateHomeworkSessionInput): Promise<HomeworkSession> {
    const sessionId = `hw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Process files if provided
    const homeworkFiles: HomeworkFile[] = [];
    if (input.files && input.files.length > 0) {
      for (const file of input.files) {
        const hwFile = await this.uploadFile(sessionId, file);
        homeworkFiles.push(hwFile);
      }
    }

    // Extract content from all sources
    const extractedContent = await this.extractContent(input.text, homeworkFiles);

    // Detect subject and grade level using AI analysis
    const { subject, grade, targetLevel } = await this.analyzeHomework(extractedContent);

    const session: HomeworkSession = {
      id: sessionId,
      learnerId: input.learnerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'in-progress',
      title: input.title,
      inputMethod: input.inputMethod,
      originalText: input.text,
      files: homeworkFiles,
      detectedSubject: subject,
      detectedGrade: grade,
      targetLevel: targetLevel,
      extractedContent,
      problemStatement: this.generateProblemStatement(extractedContent),
      keyQuestions: this.identifyKeyQuestions(extractedContent),
      currentStep: 'understand',
      completedSteps: [],
      workProducts: [],
      settings: {
        readAloud: false,
        parentAssistMode: false,
        showHints: true,
        allowCalculator: true,
        timerEnabled: false,
        breakReminders: true,
      },
      hintsGiven: 0,
      explanationsProvided: [],
      scaffoldingLevel: 'moderate',
    };

    // Save to storage
    this.saveSession(session);

    return session;
  }

  /**
   * Upload file and prepare for OCR processing
   */
  private async uploadFile(_sessionId: string, file: File): Promise<HomeworkFile> {
    // In production, upload to S3/cloud storage
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // For demo/development, convert to base64 data URL
    const dataUrl = await this.fileToDataURL(file);

    const hwFile: HomeworkFile = {
      id: fileId,
      name: file.name,
      type: file.type as HomeworkFile['type'],
      size: file.size,
      url: dataUrl,
      uploadedAt: new Date(),
      ocrStatus: 'pending',
    };

    // Trigger OCR if it's an image or PDF
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      void this.performOCR(hwFile);
    }

    return hwFile;
  }

  /**
   * Convert File to base64 data URL
   */
  private async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Perform OCR on uploaded file
   * In production: integrate Tesseract.js, Google Vision API, or AWS Textract
   */
  private async performOCR(file: HomeworkFile): Promise<void> {
    file.ocrStatus = 'processing';

    // In production, call OCR service (Tesseract.js, Google Vision, AWS Textract)
    // For demo, simulate OCR with timeout
    setTimeout(() => {
      file.ocrStatus = 'completed';
      file.extractedText = this.mockOCR(file.name);
      file.confidence = 85 + Math.floor(Math.random() * 15); // 85-100%
    }, 2000);
  }

  /**
   * Mock OCR for development/demo
   * TODO: Replace with actual OCR service integration
   */
  private mockOCR(filename: string): string {
    const nameLower = filename.toLowerCase();
    
    if (nameLower.includes('math')) {
      return 'Solve for x: 2x + 5 = 13\n\nShow your work and explain each step.';
    }
    if (nameLower.includes('reading') || nameLower.includes('ela')) {
      return 'Read the passage and answer the following questions:\n1. What is the main idea?\n2. List three supporting details.\n3. What can you infer about the author\'s purpose?';
    }
    if (nameLower.includes('science')) {
      return 'Experiment: Plant Growth\n1. Form a hypothesis about which type of soil is best for plant growth.\n2. Design an experiment to test your hypothesis.\n3. Record your observations.';
    }
    if (nameLower.includes('history') || nameLower.includes('social')) {
      return 'Historical Analysis:\n1. What were the main causes of the event?\n2. Who were the key figures involved?\n3. What were the long-term effects?';
    }
    
    return 'Problem statement extracted from image.\n[This would be actual OCR text in production]\n\nPlease complete the following tasks...';
  }

  /**
   * Extract and structure content from all input sources
   */
  private async extractContent(text?: string, files?: HomeworkFile[]): Promise<ExtractedContent> {
    let rawText = text || '';

    // Combine text from all sources
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.extractedText) {
          rawText += '\n\n' + file.extractedText;
        }
      }
    }

    // Parse into structured format
    const structuredContent = this.parseStructuredContent(rawText);

    // Detect special elements
    const detectedElements = {
      hasMathEquations: /[0-9]+\s*[+\-*/=^]\s*[0-9]+|∫|∑|√|π|∞/.test(rawText),
      hasImages: files ? files.some(f => f.type.startsWith('image/')) : false,
      hasTable: /\|.*\|/.test(rawText) || /\t.*\t/.test(rawText),
      hasCode: /```|function |class |def |public |import |const |let |var /.test(rawText),
      language: 'en', // TODO: Add language detection
    };

    return {
      rawText,
      structuredContent,
      detectedElements,
    };
  }

  /**
   * Parse text into structured components
   * In production: use NLP/AI for better parsing
   */
  private parseStructuredContent(text: string) {
    const lines = text.split('\n').filter(l => l.trim());

    // Identify instructions (usually first paragraph or lines with imperative verbs)
    const instructions = lines.find(l => 
      /^(solve|answer|complete|write|read|explain|describe|analyze)/i.test(l.trim())
    );

    // Identify numbered questions
    const questions = lines.filter(l => 
      /^[0-9]+[.)]\s/.test(l.trim()) || l.trim().endsWith('?')
    );

    // Look for rubric keywords
    const rubricLines = lines.filter(l => 
      /points?|score|criteria|grading|rubric/i.test(l)
    );
    const rubric = rubricLines.length > 0 ? rubricLines.join('\n') : undefined;

    return {
      instructions,
      questions: questions.length > 0 ? questions : undefined,
      context: undefined, // TODO: Extract context paragraphs
      rubric,
    };
  }

  /**
   * Analyze homework to detect subject and grade level
   * In production: use AI/ML for accurate detection
   */
  private async analyzeHomework(content: ExtractedContent) {
    const text = content.rawText.toLowerCase();

    // Subject detection
    let subject = 'General';
    if (text.includes('solve') || text.includes('equation') || content.detectedElements.hasMathEquations) {
      subject = 'Math';
    } else if (text.includes('read') || text.includes('passage') || text.includes('essay') || text.includes('paragraph')) {
      subject = 'ELA';
    } else if (text.includes('experiment') || text.includes('hypothesis') || text.includes('observation')) {
      subject = 'Science';
    } else if (text.includes('historical') || text.includes('century') || text.includes('timeline')) {
      subject = 'History';
    } else if (content.detectedElements.hasCode) {
      subject = 'Computer Science';
    }

    // Grade level estimation (in production, use readability metrics like Flesch-Kincaid)
    const grade = 'Auto'; // Will be detected by AI
    const targetLevel = 'Auto'; // Will be adjusted based on learner's IEP

    return { subject, grade, targetLevel };
  }

  /**
   * Generate clear problem statement from extracted content
   */
  private generateProblemStatement(content: ExtractedContent): string {
    const instructions = content.structuredContent.instructions;
    if (instructions) {
      return instructions;
    }

    // Fallback to first substantial line
    const lines = content.rawText.split('\n').filter(l => l.trim().length > 10);
    return lines[0] || 'No problem statement found';
  }

  /**
   * Identify key questions from content
   */
  private identifyKeyQuestions(content: ExtractedContent): string[] {
    const questions = content.structuredContent.questions || [];
    
    if (questions.length > 0) {
      return questions;
    }

    // Look for sentences with question marks
    const sentences = content.rawText.split(/[.!]/);
    return sentences
      .filter(s => s.includes('?'))
      .map(s => s.trim())
      .filter(s => s.length > 5);
  }

  /**
   * Save session to localStorage
   * In production: save to database/API
   */
  private saveSession(session: HomeworkSession): void {
    try {
      const stored = localStorage.getItem('homework_sessions') || '[]';
      const sessions = JSON.parse(stored) as HomeworkSession[];
      sessions.push(session);
      localStorage.setItem('homework_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save homework session:', error);
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): HomeworkSession | null {
    try {
      const stored = localStorage.getItem('homework_sessions') || '[]';
      const sessions: HomeworkSession[] = JSON.parse(stored);
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to get homework session:', error);
      return null;
    }
  }

  /**
   * Update existing session
   */
  updateSession(sessionId: string, updates: Partial<HomeworkSession>): void {
    try {
      const stored = localStorage.getItem('homework_sessions') || '[]';
      const sessions: HomeworkSession[] = JSON.parse(stored);
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index !== -1) {
        sessions[index] = {
          ...sessions[index],
          ...updates,
          updatedAt: new Date(),
        };
        localStorage.setItem('homework_sessions', JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to update homework session:', error);
    }
  }

  /**
   * Get all sessions for a learner
   */
  getAllSessions(learnerId: string): HomeworkSession[] {
    try {
      const stored = localStorage.getItem('homework_sessions') || '[]';
      const sessions: HomeworkSession[] = JSON.parse(stored);
      return sessions
        .filter(s => s.learnerId === learnerId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error('Failed to get homework sessions:', error);
      return [];
    }
  }

  /**
   * Request a contextual hint for current step
   */
  async requestHint(sessionId: string, _studentQuestion?: string): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) return 'Session not found';

    // In production, call AI service for contextual, personalized hints
    // using both session context and optional student question
    const hints = {
      understand: [
        'Try restating the problem in your own words.',
        'What information is given? What are you trying to find?',
        'Can you identify the key words in the problem?',
        'What does the question actually ask you to do?',
      ],
      plan: [
        'Have you solved a similar problem before?',
        'Can you draw a picture or diagram to visualize it?',
        'What strategy would work best here? (diagram, equation, list, etc.)',
        'Break it down - what are the smaller steps you need to take?',
      ],
      solve: [
        'Break the problem into smaller, manageable steps.',
        'Check your calculations as you go.',
        'Does your answer make sense so far?',
        'Show your work clearly so you can check it later.',
      ],
      check: [
        'Can you solve the problem a different way to verify?',
        'Did you answer all parts of the question?',
        'Are your units correct?',
        'Does your final answer make sense in the real world?',
      ],
    };

    const stepHints = hints[session.currentStep];
    const hint = stepHints[session.hintsGiven % stepHints.length];

    this.updateSession(sessionId, {
      hintsGiven: session.hintsGiven + 1,
    });

    return hint;
  }

  /**
   * Get detailed explanation for a homework step
   */
  async explainStep(sessionId: string, step: HomeworkStep): Promise<string> {
    // In production, generate AI explanation based on problem content and step
    const explanations = {
      understand: 
        'Understanding the problem means reading carefully and identifying what you know and what you need to find out. ' +
        'Take your time to highlight key information and circle what the question is asking.',
      
      plan: 
        'Planning involves choosing a strategy like drawing a diagram, writing an equation, making a list, or creating a table. ' +
        'Think about what tools or methods would help you solve this type of problem.',
      
      solve: 
        'Solving means carrying out your plan step by step, showing all your work clearly. ' +
        'Write down each step so you (and others) can follow your thinking.',
      
      check: 
        'Checking means reviewing your answer to make sure it makes sense and fully answers the question. ' +
        'Try solving it another way, or plug your answer back into the problem to verify it works.',
    };

    const session = this.getSession(sessionId);
    if (session) {
      this.updateSession(sessionId, {
        explanationsProvided: [...session.explanationsProvided, step],
      });
    }

    return explanations[step];
  }

  /**
   * Complete current step and move to next
   */
  completeStep(sessionId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const stepOrder: HomeworkStep[] = ['understand', 'plan', 'solve', 'check'];
    const currentIndex = stepOrder.indexOf(session.currentStep);
    
    // Add current step to completed
    const completedSteps = [...session.completedSteps, session.currentStep];
    
    // Move to next step or mark as completed
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      this.updateSession(sessionId, {
        currentStep: nextStep,
        completedSteps,
      });
    } else {
      this.updateSession(sessionId, {
        status: 'completed',
        completedSteps,
      });
    }
  }

  /**
   * Delete a homework session
   */
  deleteSession(sessionId: string): void {
    try {
      const stored = localStorage.getItem('homework_sessions') || '[]';
      const sessions: HomeworkSession[] = JSON.parse(stored);
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('homework_sessions', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete homework session:', error);
    }
  }
}

// Export singleton instance
export const homeworkService = HomeworkService.getInstance();
