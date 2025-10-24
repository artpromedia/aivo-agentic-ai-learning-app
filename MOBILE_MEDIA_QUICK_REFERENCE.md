# Mobile Learner - Camera & Media Quick Reference

## 📸 Camera Service

```typescript
import {cameraService} from '@/services/media';

// Capture photo
const photo = await cameraService.takePhoto();

// Record video (max 60 seconds)
const video = await cameraService.recordVideo(60);

// Pick from gallery
const image = await cameraService.pickFromGallery();
const video = await cameraService.pickVideoFromGallery();

// Compress image
const compressed = await cameraService.compressImage(filePath, {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1920,
  format: 'JPEG',
});

// Save to database for upload
const uploadId = await cameraService.saveToDatabase(
  filePath,
  'image', // 'image' | 'video' | 'audio'
  userId,
  activityId,
  lessonId
);

// File management
await cameraService.copyToAppStorage(filePath, 'homework.jpg');
await cameraService.deleteTempFile(tempPath);
await cameraService.clearCache();
```

## ⬆️ Upload Service

```typescript
import {uploadService} from '@/services/media';

// Queue upload
await uploadService.queueUpload(uploadId);

// Get progress
const progress = await uploadService.getUploadProgress(uploadId);

// Get statistics
const stats = await uploadService.getUploadStats();
// Returns: {total, uploaded, pending, failed}

// Retry failed uploads
await uploadService.retryFailedUploads();

// Cancel upload
await uploadService.cancelUpload(uploadId);

// Delete upload
await uploadService.deleteUpload(uploadId);

// Clear old uploads (30 days default)
await uploadService.clearOldUploads(30);

// Start background processing
uploadService.startBackgroundProcessing();
```

## 📷 Homework Camera Component

```tsx
import {HomeworkCamera} from '@/components/HomeworkCamera';

<HomeworkCamera
  userId="user123"
  activityId="activity456"
  lessonId="lesson789"
  onCapture={(asset) => {
    console.log('Captured:', asset.fileName);
    console.log('Size:', asset.fileSize);
  }}
  onError={(error) => {
    console.error('Error:', error.message);
  }}
  onClose={() => navigation.goBack()}
/>
```

**Features:**
- Grid overlay (toggleable)
- Guide box for alignment
- Gallery picker
- Review before save
- Auto-compression
- Auto-upload queuing
- Haptic feedback

## 🎥 Video Player Component

```tsx
import {VideoPlayer} from '@/components/VideoPlayer';

<VideoPlayer
  source={{uri: 'https://example.com/video.mp4'}}
  // OR source={require('./local-video.mp4')}
  config={{
    autoplay: false,
    showControls: true,
    loop: false,
    startTime: 0,
    allowFullscreen: true,
    playbackRates: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
  }}
  lessonId="lesson123"
  activityId="activity456"
  onEnd={() => console.log('Video ended')}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Play/pause/skip controls
- Speed control (0.5x - 2x)
- Seek bar
- Captions toggle
- Fullscreen mode
- Auto-hide controls
- Resume from last position
- Progress persistence

## 🎵 Audio Player Component

```tsx
import {AudioPlayer} from '@/components/AudioPlayer';

<AudioPlayer
  source={{uri: 'https://example.com/audio.mp3'}}
  title="Lesson 1: Introduction"
  artist="Teacher Name"
  config={{
    autoplay: false,
    showControls: true,
    loop: false,
    allowBackground: true,
    playbackRates: [0.75, 1.0, 1.25, 1.5, 2.0],
  }}
  lessonId="lesson123"
  activityId="activity456"
  onEnd={() => console.log('Audio ended')}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Play/pause/skip controls
- Speed control (0.75x - 2x)
- Interactive seek bar
- Background playback
- Resume from last position
- Progress persistence
- Title/artist display

## 🎯 Media Types

```typescript
import type {
  MediaAsset,
  MediaType,
  FileType,
  MediaUploadProgress,
  MediaPlayerState,
  VideoPlayerConfig,
  AudioPlayerConfig,
  CameraConfig,
  CompressOptions,
} from '@/types/media';

// MediaAsset
interface MediaAsset {
  uri: string;
  type?: string;
  fileSize?: number;
  fileName?: string;
  width?: number;
  height?: number;
  duration?: number;
}

// Upload Progress
interface MediaUploadProgress {
  id: string;
  progress: number; // 0-100
  status: 'queued' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

// Player State
interface MediaPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
}
```

## 📦 Database Models

```typescript
import {database} from '@/database';
import {MediaUpload} from '@/database/models/MediaUpload';

// Query uploads
const pendingUploads = await database
  .get<MediaUpload>('media_uploads')
  .query(Q.where('is_uploaded', false))
  .fetch();

// Update progress
const upload = await database.get<MediaUpload>('media_uploads').find(uploadId);
await upload.updateProgress(75);

// Mark as uploaded
await upload.markUploaded('https://cdn.example.com/file.jpg');

// Set error
await upload.setError('Network error');

// Reset for retry
await upload.resetForRetry();

// Check if should retry
if (upload.shouldRetry) {
  // Retry logic
}

// Get file size in MB
console.log(`Size: ${upload.fileSizeMB} MB`);
```

## ♿ Accessibility

### Voice Commands:
- "Take photo" - Capture image
- "Flash on/off" - Toggle flash
- "Gallery" - Open gallery

### Haptic Feedback:
```typescript
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Light impact
ReactNativeHapticFeedback.trigger('impactLight');

// Medium impact
ReactNativeHapticFeedback.trigger('impactMedium');

// Success notification
ReactNativeHapticFeedback.trigger('notificationSuccess');

// Error notification
ReactNativeHapticFeedback.trigger('notificationError');
```

### Screen Reader:
- All buttons have `accessibilityLabel`
- Proper `accessibilityRole` assignments
- `accessibilityHint` for complex interactions

## 🔧 Configuration

### Environment Variables:
```env
API_URL=https://api.example.com
```

### iOS Info.plist:
```xml
<key>NSCameraUsageDescription</key>
<string>Capture homework photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Select homework photos</string>

<key>NSMicrophoneUsageDescription</key>
<string>Record homework videos</string>
```

### Android AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## 🐛 Common Issues

### Upload not starting:
```typescript
// Check network connection
import NetInfo from '@react-native-community/netinfo';
const netInfo = await NetInfo.fetch();
console.log('Connected:', netInfo.isConnected);

// Check upload stats
const stats = await uploadService.getUploadStats();
console.log('Pending:', stats.pending);

// Manually trigger
await uploadService.processQueue();
```

### Progress not saving:
```typescript
// Check AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
const progress = await AsyncStorage.getItem('video_progress_lesson_activity');
console.log('Saved progress:', progress);
```

### Permissions denied:
```typescript
// Check permission status (handled automatically by react-native-image-picker)
const hasPermission = await cameraService.checkCameraPermission();
if (!hasPermission) {
  // Show alert to user
  Alert.alert(
    'Permission Required',
    'Camera access is needed to capture homework photos',
    [{text: 'OK', onPress: () => Linking.openSettings()}]
  );
}
```

## 📊 Performance Tips

1. **Compress images before upload:**
   ```typescript
   const compressed = await cameraService.compressImage(filePath, {
     quality: 0.7, // Lower for smaller files
     maxWidth: 1280,
     maxHeight: 1280,
   });
   ```

2. **Limit concurrent uploads:**
   ```typescript
   // In uploadService.ts
   private maxConcurrentUploads = 2; // Adjust as needed
   ```

3. **Clear old uploads:**
   ```typescript
   // Clear uploads older than 7 days
   await uploadService.clearOldUploads(7);
   ```

4. **Clear cache regularly:**
   ```typescript
   await cameraService.clearCache();
   ```

## 🧪 Testing

```typescript
// Test camera
const photo = await cameraService.takePhoto();
expect(photo).toBeTruthy();
expect(photo?.uri).toContain('file://');

// Test upload
const uploadId = await cameraService.saveToDatabase(
  photo.uri,
  'image',
  'user123'
);
expect(uploadId).toBeTruthy();

await uploadService.queueUpload(uploadId);
const progress = await uploadService.getUploadProgress(uploadId);
expect(progress).toBeGreaterThanOrEqual(0);

// Test player
const videoPlayer = render(
  <VideoPlayer source={{uri: 'https://example.com/video.mp4'}} />
);
expect(videoPlayer).toBeTruthy();
```

## 📝 Notes

- All media operations are async
- Progress is persisted to AsyncStorage
- Uploads retry automatically (max 3 times)
- Background processing runs every 30 seconds
- Image compression reduces size by ~70-80%
- Haptic feedback enhances UX
- Full TypeScript support
- Offline-first design

## 🔗 Related Files

- `src/services/media/cameraService.ts` - Camera operations
- `src/services/media/uploadService.ts` - Upload management
- `src/components/HomeworkCamera/` - Camera UI
- `src/components/VideoPlayer/` - Video playback
- `src/components/AudioPlayer/` - Audio playback
- `src/types/media.ts` - Type definitions
- `src/database/models/MediaUpload.ts` - Upload model
- `src/database/schema.ts` - Database schema
