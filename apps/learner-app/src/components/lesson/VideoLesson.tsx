import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useTheme } from '@aivo/ui';

interface VideoLessonProps {
  title: string;
  captions?: Array<{ time: number; text: string }>;
  onComplete?: () => void;
}

export function VideoLesson({
  title,
  captions = [],
  onComplete,
}: VideoLessonProps) {
  const { themeConfig } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const duration = '5:30';

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + (1 * playbackSpeed);
          // Simulate 330 seconds (5:30)
          if (newTime >= 330) {
            setIsPlaying(false);
            onComplete?.();
            return 330;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, playbackSpeed, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / 330) * 100;

  const currentCaption = captions.find(
    (caption, index) => {
      const nextCaption = captions[index + 1];
      return currentTime >= caption.time && (!nextCaption || currentTime < nextCaption.time);
    }
  );

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderWidth: '2px',
          borderColor: themeConfig.colors.border,
        }}
      >
        {/* Video Player Area */}
        <div
          ref={videoRef}
          className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center"
          style={{ minHeight: '400px' }}
        >
          {/* Simulated Video Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying && currentTime === 0 ? (
              <div className="text-center">
                <div className="text-8xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-300">{duration} minute lesson</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-9xl mb-4 animate-pulse">
                  {isPlaying ? '▶️' : '⏸️'}
                </div>
                <div className="text-white text-xl font-mono">
                  {formatTime(currentTime)} / {duration}
                </div>
              </div>
            )}
          </div>

          {/* Play/Pause Overlay Button */}
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          />

          {/* Captions */}
          {showCaptions && currentCaption && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4">
              <div className="bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg text-lg">
                {currentCaption.text}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="330"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${themeConfig.colors.primary} 0%, ${themeConfig.colors.primary} ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{duration}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full hover:bg-gray-100 transition"
                style={{ color: themeConfig.colors.primary }}
              >
                <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <span className="text-xl">⏪</span>
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => setCurrentTime(Math.min(330, currentTime + 10))}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <span className="text-xl">⏩</span>
              </button>

              {/* Playback Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="px-3 py-1 rounded-lg border-2 text-sm"
                style={{ borderColor: themeConfig.colors.border }}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Captions Toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  showCaptions
                    ? 'bg-opacity-100'
                    : 'bg-opacity-20'
                }`}
                style={{
                  backgroundColor: showCaptions ? themeConfig.colors.primary : '#e5e7eb',
                  color: showCaptions ? 'white' : themeConfig.colors.text,
                }}
              >
                CC
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <span className="text-xl">⛶</span>
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {currentTime > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${themeConfig.colors.primary}22`,
                  color: themeConfig.colors.primary,
                }}
              >
                {Math.floor(progress)}% Complete
              </div>
              {currentTime >= 330 && (
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                  ✅ Video Completed!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
