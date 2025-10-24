/**
 * Homework Camera Component
 * 
 * Camera viewfinder with guides, flash toggle, grid overlay, and OCR processing
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import {useTheme} from '../../theme/enhancedTheme';
import {cameraService} from '../../services/media/cameraService';
import {uploadService} from '../../services/media/uploadService';
import type {MediaAsset} from '../../types/media';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface HomeworkCameraProps {
  activityId?: string;
  lessonId?: string;
  userId: string;
  onCapture?: (asset: MediaAsset) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export const HomeworkCamera: React.FC<HomeworkCameraProps> = ({
  activityId,
  lessonId,
  userId,
  onCapture,
  onError,
  onClose,
}) => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [capturedImage, setCapturedImage] = useState<MediaAsset | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  /**
   * Handle photo capture
   */
  const handleCapture = useCallback(async () => {
    try {
      setIsLoading(true);

      // Haptic feedback
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      const photo = await cameraService.takePhoto();

      if (photo) {
        setCapturedImage(photo);
        onCapture?.(photo);

        // Haptic feedback for success
        ReactNativeHapticFeedback.trigger('notificationSuccess', {
          enableVibrateFallback: true,
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Capture failed');
      onError?.(err);

      // Haptic feedback for error
      ReactNativeHapticFeedback.trigger('notificationError', {
        enableVibrateFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [onCapture, onError]);

  /**
   * Handle gallery pick
   */
  const handleGalleryPick = useCallback(async () => {
    try {
      setIsLoading(true);

      const photo = await cameraService.pickFromGallery();

      if (photo) {
        setCapturedImage(photo);
        onCapture?.(photo);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Pick failed');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [onCapture, onError]);

  /**
   * Handle save and upload
   */
  const handleSave = useCallback(async () => {
    if (!capturedImage?.uri) return;

    try {
      setIsLoading(true);

      // Compress image
      const compressedPath = await cameraService.compressImage(
        capturedImage.uri,
        {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1920,
        }
      );

      // Copy to app storage
      const storedPath = await cameraService.copyToAppStorage(
        compressedPath,
        `homework_${Date.now()}.jpg`
      );

      // Save to database
      const uploadId = await cameraService.saveToDatabase(
        storedPath,
        'image',
        userId,
        activityId,
        lessonId
      );

      // Queue for upload
      await uploadService.queueUpload(uploadId);

      // Clean up temp file
      await cameraService.deleteTempFile(compressedPath);

      onClose?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, userId, activityId, lessonId, onClose, onError]);

  /**
   * Handle retake
   */
  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setIsProcessingOCR(false);
  }, []);

  /**
   * Toggle grid overlay
   */
  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
    ReactNativeHapticFeedback.trigger('impactLight');
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {backgroundColor: colors.surface, paddingVertical: spacing.md},
        ]}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.headerButton, {padding: spacing.sm}]}
          accessibilityLabel="Close camera"
          accessibilityRole="button">
          <Text style={[styles.headerButtonText, {color: colors.text}]}>
            Close
          </Text>
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, {color: colors.text}]}
          accessibilityRole="header">
          Homework Camera
        </Text>

        <TouchableOpacity
          onPress={toggleGrid}
          style={[styles.headerButton, {padding: spacing.sm}]}
          accessibilityLabel={showGrid ? 'Hide grid' : 'Show grid'}
          accessibilityRole="button">
          <Text style={[styles.headerButtonText, {color: colors.text}]}>
            {showGrid ? 'Grid' : 'No Grid'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera View or Preview */}
      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, {color: colors.text}]}>
              Image captured: {capturedImage.fileName}
            </Text>
            {isProcessingOCR && (
              <View style={styles.ocrIndicator}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.ocrText, {color: colors.text}]}>
                  Processing OCR...
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.viewfinderContainer}>
            {/* Grid Overlay */}
            {showGrid && (
              <View style={styles.gridOverlay} pointerEvents="none">
                <View style={[styles.gridLine, styles.gridLineVertical1]} />
                <View style={[styles.gridLine, styles.gridLineVertical2]} />
                <View style={[styles.gridLine, styles.gridLineHorizontal1]} />
                <View style={[styles.gridLine, styles.gridLineHorizontal2]} />
              </View>
            )}

            {/* Guide Box */}
            <View style={[styles.guideBox, {borderColor: colors.primary}]}>
              <Text style={[styles.guideText, {color: colors.text}]}>
                Align homework within frame
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Controls */}
      <View
        style={[
          styles.controls,
          {backgroundColor: colors.surface, padding: spacing.lg},
        ]}>
        {capturedImage ? (
          <View style={styles.reviewControls}>
            <TouchableOpacity
              onPress={handleRetake}
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  padding: spacing.md,
                  marginHorizontal: spacing.sm,
                },
              ]}
              disabled={isLoading}
              accessibilityLabel="Retake photo"
              accessibilityRole="button">
              <Text style={[styles.buttonText, {color: colors.text}]}>
                Retake
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.button,
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  padding: spacing.md,
                  marginHorizontal: spacing.sm,
                },
              ]}
              disabled={isLoading}
              accessibilityLabel="Save photo"
              accessibilityRole="button">
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonTextWhite}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureControls}>
            <TouchableOpacity
              onPress={handleGalleryPick}
              style={[
                styles.smallButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  padding: spacing.md,
                },
              ]}
              disabled={isLoading}
              accessibilityLabel="Pick from gallery"
              accessibilityRole="button">
              <Text style={[styles.smallButtonText, {color: colors.text}]}>
                Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCapture}
              style={[
                styles.captureButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: '#fff',
                },
              ]}
              disabled={isLoading}
              accessibilityLabel="Capture photo"
              accessibilityRole="button"
              accessibilityHint="Double tap to capture homework photo">
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.smallButton} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    minWidth: 60,
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineVertical1: {
    left: '33.33%',
    width: 1,
    height: '100%',
  },
  gridLineVertical2: {
    left: '66.66%',
    width: 1,
    height: '100%',
  },
  gridLineHorizontal1: {
    top: '33.33%',
    height: 1,
    width: '100%',
  },
  gridLineHorizontal2: {
    top: '66.66%',
    height: 1,
    width: '100%',
  },
  guideBox: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.6,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  ocrIndicator: {
    alignItems: 'center',
    marginTop: 24,
  },
  ocrText: {
    fontSize: 14,
    marginTop: 8,
  },
  controls: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  captureControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  reviewControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  button: {
    minWidth: 120,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextWhite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  smallButton: {
    width: 72,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeworkCamera;
