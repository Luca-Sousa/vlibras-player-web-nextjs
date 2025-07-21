'use client';

import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import type { UseVLibrasPlayer, VLibrasPlayerOptions, VLibrasPlayerCallbacks, TranslationOptions, VLibrasPlayerState } from '../types';
import { VLibrasPlayer } from '../core/vlibras-player';
import { UnityStateManager } from '../utils/unity-state-manager';

// Estendendo as opções para incluir containerRef e callbacks
interface UseVLibrasPlayerExtendedOptions extends VLibrasPlayerOptions, VLibrasPlayerCallbacks {
  containerRef?: RefObject<HTMLElement>;
  autoInit?: boolean;
  onLoad?: () => void;
  onTranslateStart?: (_text: string) => void;
  onTranslateEnd?: (_gloss: string) => void;
  onError?: (_error: string) => void;
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
    // ✅ Extrair novos callbacks
    onTranslationStart,
    onTranslationEnd,
    onTranslationError,
    onPlay,
    onPause,
    onStop,
    onPlayerReady,
    onPlayerError,
    ...playerOptions
  } = options;

  const playerRef = useRef<VLibrasPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false); // ✅ Novo estado
  const [isPlaying, setIsPlaying] = useState(false); // ✅ Novo estado
  const [player, setPlayer] = useState<VLibrasPlayerState>(() => ({
    status: 'idle' as const,
    loaded: false,
    translated: false,
    progress: null,
    region: playerOptions.region || 'BR',
    isTranslating: false, // ✅ Novo estado
    isPlaying: false, // ✅ Novo estado
  }));

  // ✅ CRITICAL FIX: Inicialização com cleanup correto
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (autoInit && !playerRef.current) {
      try {
        playerRef.current = new VLibrasPlayer({
          ...playerOptions,
          // ✅ Passar callbacks para o player
          onTranslationStart: () => {
            setIsTranslating(true);
            onTranslationStart?.();
          },
          onTranslationEnd: () => {
            setIsTranslating(false);
            onTranslationEnd?.();
          },
          onTranslationError: (error) => {
            setIsTranslating(false);
            onTranslationError?.(error);
          },
          onPlay: () => {
            setIsPlaying(true);
            onPlay?.();
          },
          onPause: () => {
            setIsPlaying(false);
            onPause?.();
          },
          onStop: () => {
            setIsPlaying(false);
            onStop?.();
          },
          onPlayerReady: () => {
            onPlayerReady?.();
          },
          onPlayerError: (error) => {
            onPlayerError?.(error);
          },
        });
        cleanup = setupEventListeners();
        onLoad?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar player';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    }

    return () => {
      cleanup?.(); // ✅ Executar cleanup dos event listeners
      if (playerRef.current) {
        playerRef.current.dispose?.();
        playerRef.current = null;
      }
    };
  }, [autoInit, onLoad, onError, onTranslationStart, onTranslationEnd, onTranslationError, onPlay, onPause, onStop, onPlayerReady, onPlayerError]);

  // ✅ CRITICAL FIX: Conecta automaticamente ao container com verificações robustas
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (playerRef.current && containerRef?.current && !isReady) {
      const initializeConnection = async () => {
        try {
          setError(null);
          
          // Carregar o player no container
          await playerRef.current!.load(containerRef.current!);
          
          // ✅ CRITICAL FIX: Aguardar Unity estar REALMENTE pronto
          await UnityStateManager.waitForUnity(containerRef.current!);
          
          setIsReady(true);
          onLoad?.(); // ✅ Callback onLoad SOMENTE quando Unity estiver pronto
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar container';
          setError(errorMessage);
          setIsReady(false);
          onError?.(errorMessage);
        }
      };
      
      initializeConnection();
    }
    
    return () => {
      cleanup?.(); // ✅ Limpar event listeners quando componente desmonta
    };
  }, [playerRef.current, containerRef?.current, onLoad, onError]);

  const setupEventListeners = useCallback(() => {
    if (!playerRef.current) return;

    const playerInstance = playerRef.current;

    // Função para limpar event listeners
    const cleanup = () => {
      if (playerInstance) {
        playerInstance.removeAllListeners?.();
      }
    };

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

    // Retornar função de cleanup
    return cleanup;
  }, [onTranslateStart, onTranslateEnd, onError]);

  const translate = useCallback(async (text: string, options?: TranslationOptions) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado. Use autoInit: true ou chame connect() primeiro.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!isReady) {
      const errorMsg = 'Player não está pronto. Aguarde o carregamento completo.';
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
      setIsLoading(true);
      
      // ✅ CRITICAL FIX: Aguardar tradução E animação terminarem
      await playerRef.current.translate(text, options);
      
      setPlayer((prev: VLibrasPlayerState) => ({ 
        ...prev, 
        text, 
        translated: true 
      }));
      
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na tradução';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      throw err;
    }
  }, [isReady, onError]);

  const connect = useCallback(async (container: HTMLElement) => {
    if (!playerRef.current) {
      const errorMsg = 'Player não inicializado. Use autoInit: true primeiro.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setError(null);
      setIsReady(false);
      
      // Carregar o player no container
      await playerRef.current.load(container);
      
      // ✅ CRITICAL FIX: Aguardar Unity estar REALMENTE pronto
      await UnityStateManager.waitForUnity(container);
      
      setIsReady(true);
      onLoad?.(); // ✅ Callback onLoad SOMENTE quando Unity estiver pronto
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar container';
      setError(errorMessage);
      setIsReady(false);
      onError?.(errorMessage);
      throw err;
    }
  }, [onLoad, onError]);

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
    
    // ✅ Novos estados baseados em eventos reais
    isTranslating,
    isPlaying,
    
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
