import { useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'slow';

export interface QueuedAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private queue: QueuedAction[] = [];
  private readonly STORAGE_KEY = 'offline_queue';
  private readonly MAX_QUEUE_SIZE = 1000;
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private syncInProgress = false;

  private constructor() {
    this.loadQueue();
    this.setupListeners();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QueuedAction[];
        this.queue = parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      const queueToSave = this.queue.slice(-this.MAX_QUEUE_SIZE);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queueToSave));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupListeners(): void {
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
    
    // Check connection quality periodically
    setInterval(() => this.checkConnectionQuality(), 10000); // Every 10 seconds
  }

  private handleConnectionChange(isOnline: boolean): void {
    const status: ConnectionStatus = isOnline ? 'online' : 'offline';
    this.notifyListeners(status);

    if (isOnline && !this.syncInProgress) {
      this.syncQueue();
    }
  }

  private async checkConnectionQuality(): Promise<void> {
    if (!navigator.onLine) {
      this.notifyListeners('offline');
      return;
    }

    try {
      const startTime = performance.now();
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const endTime = performance.now();
      const latency = endTime - startTime;

      if (!response.ok) {
        this.notifyListeners('slow');
      } else if (latency > 2000) {
        this.notifyListeners('slow');
      } else {
        this.notifyListeners('online');
      }
    } catch {
      this.notifyListeners('offline');
    }
  }

  private notifyListeners(status: ConnectionStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  enqueue(type: string, payload: Record<string, unknown>, maxRetries: number = 3): string {
    const action: QueuedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: new Date(),
      retries: 0,
      maxRetries,
      status: 'pending',
    };

    this.queue.push(action);
    this.saveQueue();

    // Try to sync immediately if online
    if (navigator.onLine && !this.syncInProgress) {
      this.syncQueue();
    }

    return action.id;
  }

  async syncQueue(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;

    this.syncInProgress = true;
    const pendingActions = this.queue.filter(a => a.status === 'pending');

    for (const action of pendingActions) {
      try {
        action.status = 'processing';
        await this.processAction(action);
        action.status = 'completed';
      } catch (error) {
        action.retries++;
        
        if (action.retries >= action.maxRetries) {
          action.status = 'failed';
          action.error = error instanceof Error ? error.message : 'Unknown error';
        } else {
          action.status = 'pending';
        }
      }
    }

    // Remove completed actions
    this.queue = this.queue.filter(a => a.status !== 'completed');
    this.saveQueue();
    this.syncInProgress = false;
  }

  private async processAction(action: QueuedAction): Promise<void> {
    // Route action to appropriate handler
    switch (action.type) {
      case 'activity.complete':
        return this.syncActivityCompletion(action.payload);
      case 'progress.update':
        return this.syncProgressUpdate(action.payload);
      case 'drawing.save':
        return this.syncDrawing(action.payload);
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  private async syncActivityCompletion(payload: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/activities/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync activity: ${response.statusText}`);
    }
  }

  private async syncProgressUpdate(payload: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/progress/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync progress: ${response.statusText}`);
    }
  }

  private async syncDrawing(payload: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/drawings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync drawing: ${response.statusText}`);
    }
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(a => a.status === 'pending').length,
      processing: this.queue.filter(a => a.status === 'processing').length,
      failed: this.queue.filter(a => a.status === 'failed').length,
      actions: this.queue,
    };
  }

  clearQueue(): void {
    if (window.confirm('Clear all queued actions? This cannot be undone.')) {
      this.queue = [];
      this.saveQueue();
    }
  }

  retryFailed(): void {
    this.queue.forEach(action => {
      if (action.status === 'failed') {
        action.status = 'pending';
        action.retries = 0;
        action.error = undefined;
      }
    });
    this.saveQueue();
    this.syncQueue();
  }
}

export const offlineManager = OfflineManager.getInstance();

// React Hook
export function useOfflineStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [queueStatus, setQueueStatus] = useState(offlineManager.getQueueStatus());

  useEffect(() => {
    const unsubscribe = offlineManager.onConnectionChange(setStatus);
    
    // Update queue status periodically
    const interval = setInterval(() => {
      setQueueStatus(offlineManager.getQueueStatus());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const enqueue = useCallback((type: string, payload: Record<string, unknown>) => {
    return offlineManager.enqueue(type, payload);
  }, []);

  const retryFailed = useCallback(() => {
    offlineManager.retryFailed();
  }, []);

  const clearQueue = useCallback(() => {
    offlineManager.clearQueue();
  }, []);

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isSlow: status === 'slow',
    queueStatus,
    enqueue,
    retryFailed,
    clearQueue,
  };
}
