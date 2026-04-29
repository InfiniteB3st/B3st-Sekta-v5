import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Hls from 'hls.js';

export interface SektaPlayerRef {
  seekTo: (time: number) => void;
  getDuration: () => number;
}

interface SektaPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  isPlaying?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPause?: () => void;
  onPlay?: () => void;
  className?: string;
}

export const SektaPlayer = forwardRef<SektaPlayerRef, SektaPlayerProps>(({ 
  src, 
  poster, 
  autoPlay = false, 
  isPlaying = false,
  onEnded, 
  onTimeUpdate,
  onPause,
  onPlay,
  className 
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (playerRef.current) {
        playerRef.current.currentTime(time);
      }
    },
    getDuration: () => {
      return playerRef.current ? playerRef.current.duration() : 0;
    }
  }));

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js
    const player = videojs(videoRef.current, {
      autoplay: autoPlay,
      controls: false, // We use custom overlays in VideoPlayer.tsx
      responsive: true,
      fluid: true,
      poster: poster,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
    });

    playerRef.current = player;

    player.on('ended', () => {
      if (onEnded) onEnded();
    });

    player.on('pause', () => {
      if (onPause) onPause();
    });

    player.on('play', () => {
      if (onPlay) onPlay();
    });

    player.on('timeupdate', () => {
      if (onTimeUpdate) {
        onTimeUpdate(player.currentTime(), player.duration());
      }
    });

    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !src) return;

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true,
          autoStartLoad: true
        });
        hls.loadSource(src);
        hls.attachMedia(videoRef.current!);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) player.play();
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        player.src({ src, type: 'application/x-mpegURL' });
      }
    } else {
      player.src({ src, type: 'video/mp4' });
    }
  }, [src, autoPlay]);

  return (
    <div data-vjs-player className={className}>
      <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
    </div>
  );
});
