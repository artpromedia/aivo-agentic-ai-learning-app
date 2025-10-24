/**
 * Camera Service
 * 
 * Handles camera access, photo capture, video recording, and media gallery access
 */

import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {database} from '../../database';
import type {MediaAsset, FileType, CompressOptions} from '../../types/media';
import {MediaUpload} from '../../database/models/MediaUpload';

class CameraService {
  /**
   * Check camera permission status
   * Note: Permissions are handled by react-native-image-picker automatically
   */
  async checkCameraPermission(): Promise<boolean> {
    // react-native-image-picker handles permissions internally
    return true;
  }

  /**
   * Check photo library permission
   * Note: Permissions are handled by react-native-image-picker automatically
   */
  async checkPhotoLibraryPermission(): Promise<boolean> {
    // react-native-image-picker handles permissions internally
    return true;
  }

  /**
   * Check microphone permission (for video recording)
   * Note: Permissions are handled by react-native-image-picker automatically
   */
  async checkMicrophonePermission(): Promise<boolean> {
    // react-native-image-picker handles permissions internally
    return true;
  }

  /**
   * Take a photo with the camera
   */
  async takePhoto(): Promise<MediaAsset | null> {
    const hasPermission = await this.checkCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      includeBase64: false,
      saveToPhotos: false,
    });

    if (result.didCancel) return null;
    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to capture photo');
    }

    const asset = result.assets?.[0];
    return asset && asset.uri ? (asset as MediaAsset) : null;
  }

  /**
   * Pick image from gallery
   */
  async pickFromGallery(): Promise<MediaAsset | null> {
    const hasPermission = await this.checkPhotoLibraryPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
      includeBase64: false,
    });

    if (result.didCancel) return null;
    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to pick image');
    }

    const asset = result.assets?.[0];
    return asset && asset.uri ? (asset as MediaAsset) : null;
  }

  /**
   * Record a video
   */
  async recordVideo(maxDuration: number = 60): Promise<MediaAsset | null> {
    const [hasCameraPermission, hasMicPermission] = await Promise.all([
      this.checkCameraPermission(),
      this.checkMicrophonePermission(),
    ]);

    if (!hasCameraPermission) {
      throw new Error('Camera permission denied');
    }
    if (!hasMicPermission) {
      throw new Error('Microphone permission denied');
    }

    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'video',
      videoQuality: 'medium',
      durationLimit: maxDuration,
      saveToPhotos: false,
    });

    if (result.didCancel) return null;
    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to record video');
    }

    const asset = result.assets?.[0];
    return asset && asset.uri ? (asset as MediaAsset) : null;
  }

  /**
   * Pick video from gallery
   */
  async pickVideoFromGallery(): Promise<MediaAsset | null> {
    const hasPermission = await this.checkPhotoLibraryPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
      includeBase64: false,
    });

    if (result.didCancel) return null;
    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to pick video');
    }

    const asset = result.assets?.[0];
    return asset && asset.uri ? (asset as MediaAsset) : null;
  }

  /**
   * Compress image for upload
   */
  async compressImage(
    filePath: string,
    options: CompressOptions = {}
  ): Promise<string> {
    const {
      quality = 0.8,
      maxWidth = 1024,
      maxHeight = 1024,
      format = 'JPEG',
    } = options;

    try {
      // Note: react-native-image-resizer needs to be installed separately
      // This is a placeholder for the actual implementation
      // Install: pnpm add react-native-image-resizer
      const ImageResizer = require('react-native-image-resizer').default;

      const compressed = await ImageResizer.createResizedImage(
        filePath,
        maxWidth,
        maxHeight,
        format,
        quality * 100
      );

      return compressed.uri;
    } catch (error) {
      console.error('Image compression failed:', error);
      // Return original if compression fails
      return filePath;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await RNFS.stat(filePath);
      return stats.size;
    } catch (error) {
      console.error('Failed to get file size:', error);
      return 0;
    }
  }

  /**
   * Get file MIME type
   */
  getMimeType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/mp4',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Save media to database for background upload
   */
  async saveToDatabase(
    filePath: string,
    fileType: FileType,
    userId: string,
    activityId?: string,
    lessonId?: string
  ): Promise<string> {
    const fileSize = await this.getFileSize(filePath);
    const mimeType = this.getMimeType(filePath);

    let uploadId = '';

    await database.write(async () => {
      const upload = await database
        .get<MediaUpload>('media_uploads')
        .create((record) => {
          record.activityId = activityId;
          record.lessonId = lessonId;
          record.userId = userId;
          record.filePath = filePath;
          record.fileType = fileType;
          record.fileSize = fileSize;
          record.mimeType = mimeType;
          record.isUploaded = false;
          record.uploadProgress = 0;
          record.retryCount = 0;
        });

      uploadId = upload.id;
    });

    return uploadId;
  }

  /**
   * Delete temporary file
   */
  async deleteTempFile(filePath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
      }
    } catch (error) {
      console.error('Failed to delete temp file:', error);
    }
  }

  /**
   * Copy file to app's document directory
   */
  async copyToAppStorage(filePath: string, fileName?: string): Promise<string> {
    const destination = `${RNFS.DocumentDirectoryPath}/${fileName || `media_${Date.now()}`}`;

    await RNFS.copyFile(filePath, destination);

    return destination;
  }

  /**
   * Clear cache directory
   */
  async clearCache(): Promise<void> {
    try {
      const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
      
      await Promise.all(
        files
          .filter(file => file.name.startsWith('compressed_'))
          .map(file => RNFS.unlink(file.path))
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

export const cameraService = new CameraService();
export default cameraService;
