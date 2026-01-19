'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2, Pause, Play } from 'lucide-react';

interface AudioDescriptionProps {
  productName: string;
  description: string;
  languageCode?: string;
  className?: string;
}

export function AudioDescription({
  productName,
  description,
  languageCode = 'en-US',
  className,
}: AudioDescriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAudio = async () => {
    if (audioUrl) {
      // Audio already generated, just play it
      playAudio();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audio/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, description, languageCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Create and play audio
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else if (audioUrl) {
      playAudio();
    } else {
      generateAudio();
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlayback}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause audio description' : 'Listen to product description'}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="sr-only">Generating audio…</span>
          </>
        ) : isPlaying ? (
          <>
            <Pause className="h-4 w-4" />
            <span className="hidden sm:inline">Pause</span>
          </>
        ) : error ? (
          <>
            <VolumeX className="h-4 w-4 text-[var(--ds-red-600)]" />
            <span className="hidden sm:inline">Retry</span>
          </>
        ) : (
          <>
            {audioUrl ? <Play className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{audioUrl ? 'Play' : 'Listen'}</span>
          </>
        )}
      </Button>
    </div>
  );
}
