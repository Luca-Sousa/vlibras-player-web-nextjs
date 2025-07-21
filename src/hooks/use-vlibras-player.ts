'use client';

import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import type { UseVLibrasPlayer, VLibrasPlayerOptions, TranslationOptions, VLibrasPlayerState } from '../types';
import { VLibrasPlayer } from '../core/vlibras-player';

// Estendendo as opções para incluir containerRef
interface UseVLibrasPlayerExtendedOptions extends VLibrasPlayerOptions {
  containerRef?: RefObject<HTMLElement>;
  autoInit?: boolean;
  onLoad?: () => void;
  onTranslateStart?: (text: string) => void;
  onTranslateEnd?: (gloss: string) => void;
  onError?: (error: string) => void;
}

/**
 * Hook para usar o VLibras Player em componentes React
 * 
 * @example
 * // Uso com containerRef automático (recomendado)
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { translate, isReady } = useVLibrasPlayer({
 *   autoInit: true,
 *   containerRef
 * });
 * 
 * // JSX
 * <div ref={containerRef} className="vlibras-container" />
 * <button onClick={() => translate("Olá mundo!")}>Traduzir</button>
 */
export function useVLibrasPlayer(options: UseVLibrasPlayerExtendedOptions = {}): UseVLibrasPlayer & { 
  isReady: boolean;
  containerRef?: RefObject<HTMLElement>;
} {
  const {
    containerRef,
    autoInit = true,
    onLoad,
    onTranslateStart, 
    onTranslateEnd,
    onError,
    ...playerOptions
  } = options;

  const playerRef = useRef<VLibrasPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [player, setPlayer] = useState<VLibrasPlayerState>(() => ({
    status: 'idle' as const,
    loaded: false,
    translated: false,
    progress: null,
    region: playerOptions.region || 'BR',
  }));

  // Inicializa o player quando autoInit = true
  useEffect(() => {
    if (autoInit && !playerRef.current) {
      try {
        playerRef.current = new VLibrasPlayer(playerOptions);
        setupEventListeners();
        onLoad?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar player';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose?.();
        playerRef.current = null;
      }
    };
  }, [autoInit, onLoad, onError]);

  // 🔥 CORREÇÃO PRINCIPAL: Conecta automaticamente ao container
  useEffect(() => {
    if (playerRef.current && containerRef?.current) {
      try {
        playerRef.current.load(containerRef.current);
        setIsReady(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar container';
        setError(errorMessage);
        setIsReady(false);
        onError?.(errorMessage);
      }
    }
  }, [playerRef.current, containerRef?.current, onError]);

  const setupEventListeners = useCallback(() => {
    if (!playerRef.current) return;

    const playerInstance = playerRef.current;

    playerInstance.addEventListener('load', () => {
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, loaded: true }));
      setIsLoading(false);
    });

    playerInstance.addEventListener('translate:start', (text?: string) => {
      setIsLoading(true);
      setError(null);
      if (text) onTranslateStart?.(text);
    });

    playerInstance.addEventListener('translate:end', (gloss?: string) => {
      setIsLoading(false);
      if (gloss) onTranslateEnd?.(gloss);
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
      onError?.(errorMessage);
    });
  }, [onTranslateStart, onTranslateEnd, onError]);

  const translate = useCallback(async (text: string, options?: TranslationOptions) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado. Use autoInit: true ou chame connect() primeiro.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!text.trim()) {
      const errorMsg = 'Texto não pode estar vazio';
      setError(errorMsg);
      throw new Error(errorMsg);
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
      onError?.(errorMessage);
      throw err;
    }
  }, [onError]);

  const connect = useCallback((container: HTMLElement) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado. Use autoInit: true primeiro.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      playerRef.current.load(container);
      setIsReady(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar container';
      setError(errorMessage);
      setIsReady(false);
      onError?.(errorMessage);
      throw err;
    }
  }, [onError]);

  const play = useCallback((gloss?: string, options?: TranslationOptions) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    if (!isReady) {
      const errorMsg = 'Player não conectado a um container. Use containerRef ou connect()';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.play(gloss, options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reproduzir';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isReady, onError]);

  const pause = useCallback(() => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.pause();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao pausar';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const stop = useCallback(() => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.stop();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao parar';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const repeat = useCallback(() => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.repeat();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao repetir';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const setSpeed = useCallback((speed: number) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.setSpeed(speed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar velocidade';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const toggleSubtitle = useCallback(() => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.toggleSubtitle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alternar legenda';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const changeAvatar = useCallback((avatarName: string) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.changeAvatar(avatarName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar avatar';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const setRegion = useCallback((region: 'BR' | 'PT') => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado';
      setError(errorMsg);
      return;
    }

    try {
      playerRef.current.setRegion(region);
      setPlayer((prev: VLibrasPlayerState) => ({ ...prev, region }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar região';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  return {
    // Estado do player
    player,
    isLoading,
    error,
    isReady,
    
    // Métodos de controle
    translate,
    play,
    pause,
    stop,
    repeat,
    setSpeed,
    toggleSubtitle,
    changeAvatar,
    setRegion,
    
    // Método de conexão manual (para casos especiais)
    connect,
    
    // Ref para casos onde o usuário não fornece containerRef
    containerRef: containerRef || undefined,
  };
}
