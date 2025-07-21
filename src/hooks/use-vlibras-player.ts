'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseVLibrasPlayer, VLibrasPlayerOptions, TranslationOptions, VLibrasPlayerState } from '@/types';
import { VLibrasPlayer } from '@/core/vlibras-player';

/**
 * Hook para usar o VLibras Player em componentes React
 */
export function useVLibrasPlayer(options: VLibrasPlayerOptions = {}): UseVLibrasPlayer {
  const playerRef = useRef<VLibrasPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<VLibrasPlayerState>(() => ({
    status: 'idle' as const,
    loaded: false,
    translated: false,
    progress: null,
    region: options.region || 'BR',
  }));

  // Inicializa o player
  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new VLibrasPlayer(options);
      setupEventListeners();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const setupEventListeners = useCallback(() => {
    if (!playerRef.current) return;

    const playerInstance = playerRef.current;

    playerInstance.addEventListener('load', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, loaded: true }));
      setIsLoading(false);
    });

    playerInstance.addEventListener('translate:start', () => {
      setIsLoading(true);
      setError(null);
    });

    playerInstance.addEventListener('translate:end', () => {
      setIsLoading(false);
    });

    playerInstance.addEventListener('animation:play', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, status: 'playing' }));
    });

    playerInstance.addEventListener('animation:pause', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, status: 'idle' }));
    });

    playerInstance.addEventListener('animation:end', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, status: 'idle' }));
    });

    playerInstance.addEventListener('animation:progress', (progress: number) => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, progress }));
    });

    playerInstance.addEventListener('gloss:start', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, status: 'playing' }));
    });

    playerInstance.addEventListener('gloss:end', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, status: 'idle' }));
    });

    playerInstance.addEventListener('error', (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    });
  }, []);

  const translate = useCallback(async (text: string, options?: TranslationOptions) => {
    if (!playerRef.current) {
      throw new Error('Player não inicializado');
    }

    try {
      setError(null);
      await playerRef.current.translate(text, options);
      setPlayer((prev: VLibrasPlayerState) => ({ 
        ...prev, 
        text, 
        translated: true 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na tradução';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const play = useCallback((gloss?: string, options?: TranslationOptions) => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.play(gloss, options);
  }, []);

  const pause = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.pause();
  }, []);

  const stop = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.stop();
  }, []);

  const repeat = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.repeat();
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.setSpeed(speed);
  }, []);

  const toggleSubtitle = useCallback(() => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.toggleSubtitle();
  }, []);

  const changeAvatar = useCallback((avatarName: string) => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.changeAvatar(avatarName);
  }, []);

  const setRegion = useCallback((region: 'BR' | 'PT') => {
    if (!playerRef.current) {
      console.warn('Player não inicializado');
      return;
    }

    playerRef.current.setRegion(region);
    setPlayer((prev: VLibrasPlayerState) => ({ ...prev, region }));
  }, []);

  return {
    player,
    translate,
    play,
    pause,
    stop,
    repeat,
    setSpeed,
    toggleSubtitle,
    changeAvatar,
    setRegion,
    isLoading,
    error,
  };
}
