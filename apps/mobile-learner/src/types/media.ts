/**
 * Media Types
 * 
 * Type definitions for camera, gallery, and media playback features
 */

import type {Asset} from 'react-native-image-picker';

export type MediaType = 'photo' | 'video' | 'audio';

export type FileType = 'image' | 'video' | 'audio';

export interface MediaAsset extends Asset {
  uri: string;
  type?: string;
  fileSize?: number;
  fileName?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface MediaUploadProgress {
  id: string;
  progress: number; // 0-100
  status: 'queued' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface MediaPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
}

export interface CaptionTrack {
  language: string;
  label: string;
  src: string;
}

export interface VideoPlayerConfig {
  autoplay?: boolean;
  showControls?: boolean;
  loop?: boolean;
  startTime?: number;
  captions?: CaptionTrack[];
  allowFullscreen?: boolean;
  playbackRates?: number[];
}

export interface AudioPlayerConfig {
  autoplay?: boolean;
  showControls?: boolean;
  loop?: boolean;
  allowBackground?: boolean;
  playbackRates?: number[];
}

export interface CameraConfig {
  showGrid?: boolean;
  showFlash?: boolean;
  maxDuration?: number; // for video
  quality?: number; // 0-1
  captureMode?: 'photo' | 'video';
}

export interface MediaUploadQueueItem {
  id: string;
  filePath: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;
  activityId?: string;
  lessonId?: string;
  userId: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
}

export interface CompressOptions {
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    boundingBox: {x: number; y: number; width: number; height: number};
  }>;
}
