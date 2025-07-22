'use client';

import { useCallback, useRef, useEffect, useMemo, useReducer } from 'react';
import type { VLibrasPlayerOptions, VLibrasPlayerCallbacks, TranslationOptions } from '../types';
import { VLibrasPlayer } from '../core/vlibras-player';

// ========================================
// TIPOS E INTERFACES
// ========================================

interface VLibrasPlayerState {
  // Estados principais
  status: 'idle' | 'initializing' | 'ready' | 'translating' | 'playing' | 'paused' | 'error';
  isLoading: boolean;
  isReady: boolean;
  
  // Estados de reprodução
  isTranslating: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  
  // Dados do player
  progress: number | null;
  region: 'BR' | 'PT';
  currentText?: string;
  currentGloss?: string;
  
  // Gestão de erros
  errors: {
    fatal: string | null;
    warnings: string[];
  };
  
  // Metadados
  lastTranslation?: {
    text: string;
    timestamp: number;
  };
}

type VLibrasPlayerAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS' }
  | { type: 'INITIALIZE_ERROR'; payload: string }
  | { type: 'TRANSLATION_START'; payload: string }
  | { type: 'TRANSLATION_END' }
  | { type: 'TRANSLATION_ERROR'; payload: string }
  | { type: 'PLAYBACK_START' }
  | { type: 'PLAYBACK_PAUSE' }
  | { type: 'PLAYBACK_RESUME' }
  | { type: 'PLAYBACK_STOP' }
  | { type: 'PLAYBACK_RESTART' }
  | { type: 'PROGRESS_UPDATE'; payload: number }
  | { type: 'REGION_CHANGE'; payload: 'BR' | 'PT' }
  | { type: 'WARNING_ADD'; payload: string }
  | { type: 'WARNINGS_CLEAR' }
  | { type: 'RESET' };

interface UseVLibrasPlayerOptions extends Omit<VLibrasPlayerOptions, keyof VLibrasPlayerCallbacks> {
  containerRef?: { current: HTMLElement | null };
  autoInit?: boolean;
  
  // Callbacks organizados (compatibilidade com ambos os nomes)
  onStateChange?: (state: VLibrasPlayerState) => void;
  onPlayerReady?: () => void;
  onLoad?: () => void; // Compatibilidade com VLibrasPlayer
  onPlayerError?: (error: string, isFatal: boolean) => void;
  onTranslationStart?: () => void;
  onTranslationEnd?: () => void;
  onTranslationError?: (error: string) => void;
  onPlay?: () => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onPause?: () => void;
  onPlaybackPause?: () => void;
  onResume?: () => void;
  onPlaybackResume?: () => void;
  onRestart?: () => void;
  onPlaybackRestart?: () => void;
  onStop?: () => void;
  
  // Configurações avançadas
  retryOnError?: boolean;
  maxRetries?: number;
  debounceMs?: number;
}

// ========================================
// REDUCER PARA GERENCIAMENTO DE ESTADO
// ========================================

const initialState: VLibrasPlayerState = {
  status: 'idle',
  isLoading: false,
  isReady: false,
  isTranslating: false,
  isPlaying: false,
  isPaused: false,
  progress: null,
  region: 'BR',
  errors: {
    fatal: null,
    warnings: [],
  },
};

function playerReducer(state: VLibrasPlayerState, action: VLibrasPlayerAction): VLibrasPlayerState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        status: 'initializing',
        isLoading: true,
        errors: { fatal: null, warnings: [] },
      };
      
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        status: 'ready',
        isLoading: false,
        isReady: true,
      };
      
    case 'INITIALIZE_ERROR':
      return {
        ...state,
        status: 'error',
        isLoading: false,
        isReady: false,
        errors: { ...state.errors, fatal: action.payload },
      };
      
    case 'TRANSLATION_START':
      return {
        ...state,
        status: 'translating',
        isTranslating: true,
        currentText: action.payload,
        lastTranslation: {
          text: action.payload,
          timestamp: Date.now(),
        },
      };
      
    case 'TRANSLATION_END':
      return {
        ...state,
        status: 'ready',
        isTranslating: false,
      };
      
    case 'TRANSLATION_ERROR':
      return {
        ...state,
        isTranslating: false,
        errors: {
          ...state.errors,
          warnings: [...state.errors.warnings, action.payload],
        },
      };
      
    case 'PLAYBACK_START':
      return {
        ...state,
        status: 'playing',
        isPlaying: true,
        isPaused: false,
      };
      
    case 'PLAYBACK_PAUSE':
      return {
        ...state,
        status: 'paused',
        isPlaying: false,
        isPaused: true,
      };
      
    case 'PLAYBACK_RESUME':
      return {
        ...state,
        status: 'playing',
        isPlaying: true,
        isPaused: false,
      };
      
    case 'PLAYBACK_STOP':
      return {
        ...state,
        status: 'ready',
        isPlaying: false,
        isPaused: false,
        progress: null,
      };
      
    case 'PLAYBACK_RESTART':
      return {
        ...state,
        status: 'playing',
        isPlaying: true,
        isPaused: false,
        progress: 0,
      };
      
    case 'PROGRESS_UPDATE':
      return {
        ...state,
        progress: action.payload,
      };
      
    case 'REGION_CHANGE':
      return {
        ...state,
        region: action.payload,
      };
      
    case 'WARNING_ADD':
      return {
        ...state,
        errors: {
          ...state.errors,
          warnings: [...state.errors.warnings, action.payload],
        },
      };
      
    case 'WARNINGS_CLEAR':
      return {
        ...state,
        errors: {
          ...state.errors,
          warnings: [],
        },
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}

// ========================================
// HOOK PRINCIPAL
// ========================================

/**
 * Hook React para VLibras Player com melhores práticas
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const player = useVLibrasPlayer({
 *   containerRef,
 *   autoInit: true,
 *   onPlayerReady: () => console.log('Player pronto!'),
 *   onStateChange: (state) => console.log('Estado:', state.status)
 * });
 * 
 * // Usar o player
 * await player.translate('Olá mundo');
 * ```
 */
export function useVLibrasPlayer(options: UseVLibrasPlayerOptions = {}) {
  const {
    containerRef,
    autoInit = false,
    retryOnError = true,
    maxRetries = 3,
    debounceMs = 300,
    onStateChange,
    onPlayerReady,
    onLoad, // Compatibilidade com VLibrasPlayer
    onPlayerError,
    onTranslationStart,
    onTranslationEnd,
    onTranslationError,
    onPlay,
    onPlaybackStart,
    onPlaybackEnd,
    onPause,
    onPlaybackPause,
    onResume,
    onPlaybackResume,
    onRestart,
    onPlaybackRestart,
    onStop,
    ...playerOptions
  } = options;

  // ========================================
  // ESTADO GERENCIADO POR REDUCER
  // ========================================
  
  const [state, dispatch] = useReducer(playerReducer, initialState);
  
  // Refs para instâncias e controle
  const playerRef = useRef<VLibrasPlayer | null>(null);
  const retryCountRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ========================================
  // CALLBACKS MEMOIZADOS
  // ========================================
  
  const handlePlayerReady = useCallback(() => {
    dispatch({ type: 'INITIALIZE_SUCCESS' });
    onPlayerReady?.();
    onLoad?.(); // Compatibilidade com VLibrasPlayer
  }, [onPlayerReady, onLoad]);

  const handlePlayerError = useCallback((errorMessage: string) => {
    const isFatal = errorMessage.includes('failed to load') || errorMessage.includes('network error');
    
    if (isFatal) {
      dispatch({ type: 'INITIALIZE_ERROR', payload: errorMessage });
    } else {
      dispatch({ type: 'WARNING_ADD', payload: errorMessage });
    }
    
    onPlayerError?.(errorMessage, isFatal);
  }, [onPlayerError]);

  const handleTranslationStart = useCallback((text: string) => {
    dispatch({ type: 'TRANSLATION_START', payload: text });
    onTranslationStart?.();
  }, [onTranslationStart]);

  const handleTranslationEnd = useCallback(() => {
    dispatch({ type: 'TRANSLATION_END' });
    onTranslationEnd?.();
  }, [onTranslationEnd]);

  const handleTranslationError = useCallback((errorMessage: string) => {
    dispatch({ type: 'TRANSLATION_ERROR', payload: errorMessage });
    onTranslationError?.(errorMessage);
  }, [onTranslationError]);

  const handlePlaybackStart = useCallback(() => {
    dispatch({ type: 'PLAYBACK_START' });
    onPlaybackStart?.();
    onPlay?.(); // Compatibilidade com VLibrasPlayer
  }, [onPlaybackStart, onPlay]);

  const handlePlaybackPause = useCallback(() => {
    dispatch({ type: 'PLAYBACK_PAUSE' });
    onPlaybackPause?.();
    onPause?.(); // Compatibilidade com VLibrasPlayer
  }, [onPlaybackPause, onPause]);

  const handlePlaybackResume = useCallback(() => {
    dispatch({ type: 'PLAYBACK_RESUME' });
    onPlaybackResume?.();
    onResume?.(); // Compatibilidade com VLibrasPlayer
  }, [onPlaybackResume, onResume]);

  const handlePlaybackStop = useCallback(() => {
    dispatch({ type: 'PLAYBACK_STOP' });
    onPlaybackEnd?.();
    onStop?.(); // Compatibilidade com VLibrasPlayer
  }, [onPlaybackEnd, onStop]);

  const handlePlaybackRestart = useCallback(() => {
    dispatch({ type: 'PLAYBACK_RESTART' });
    onPlaybackRestart?.();
    onRestart?.(); // Compatibilidade com VLibrasPlayer
  }, [onPlaybackRestart, onRestart]);

  // ========================================
  // FUNÇÕES DE CONTROLE DO PLAYER
  // ========================================

  const initializePlayer = useCallback(async (): Promise<void> => {
    if (!containerRef?.current || playerRef.current || state.isLoading) {
      return;
    }

    // Cancelar operação anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    dispatch({ type: 'INITIALIZE_START' });

    try {
      const player = new VLibrasPlayer({
        ...playerOptions,
        // Mapear callbacks do hook para os callbacks da classe
        onLoad: () => {
          const playerState = player.getState();
          if (playerState.loaded) {
            handlePlayerReady();
          }
        },
        onPlayerError: handlePlayerError,
        onTranslationStart: () => handleTranslationStart(state.currentText || ''),
        onTranslationEnd: handleTranslationEnd,
        onTranslationError: handleTranslationError,
        onPlay: handlePlaybackStart,
        onPause: handlePlaybackPause,
        onResume: handlePlaybackResume,
        onStop: handlePlaybackStop,
        onRestart: handlePlaybackRestart,
      });

      await player.load(containerRef.current);
      
      // Verificar se a operação foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        player.dispose();
        return;
      }

      playerRef.current = player;
      retryCountRef.current = 0;

    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao inicializar player';
      
      // Tentar novamente se configurado
      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => initializePlayer(), 1000 * retryCountRef.current);
        return;
      }

      dispatch({ type: 'INITIALIZE_ERROR', payload: errorMessage });
    }
  }, [
    containerRef,
    playerOptions,
    state.isLoading,
    state.currentText,
    handlePlayerReady,
    handlePlayerError,
    handleTranslationStart,
    handleTranslationEnd,
    handleTranslationError,
    handlePlaybackStart,
    handlePlaybackPause,
    handlePlaybackResume,
    handlePlaybackStop,
    handlePlaybackRestart,
    retryOnError,
    maxRetries
  ]);

  const translate = useCallback(async (text: string, translationOptions?: TranslationOptions): Promise<void> => {
    if (!playerRef.current) {
      throw new Error('Player não inicializado. Chame initializePlayer() primeiro.');
    }

    if (!state.isReady) {
      throw new Error('Player não está pronto. Aguarde a inicialização.');
    }

    // Debounce para evitar traduções muito rápidas
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    return new Promise((resolve, reject) => {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          await playerRef.current!.translate(text, translationOptions);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, debounceMs);
    });
  }, [state.isReady, debounceMs]);

  // Métodos de controle memoizados
  const controls = useMemo(() => ({
    play: (gloss?: string | null, options?: TranslationOptions) => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      return playerRef.current.play(gloss, options);
    },
    
    pause: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      return playerRef.current.pause();
    },
    
    resume: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      return playerRef.current.resume();
    },
    
    stop: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      return playerRef.current.stop();
    },
    
    restart: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      return playerRef.current.restart();
    },
    
    repeat: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      return playerRef.current.repeat();
    },
  }), []);

  // Métodos de configuração memoizados
  const settings = useMemo(() => ({
    setSpeed: (speed: number) => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      playerRef.current.setSpeed(speed);
    },
    
    setRegion: (region: 'BR' | 'PT') => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      playerRef.current.setRegion(region);
      dispatch({ type: 'REGION_CHANGE', payload: region });
    },
    
    changeAvatar: (avatarName: string) => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      playerRef.current.changeAvatar(avatarName);
    },
    
    toggleSubtitle: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      playerRef.current.toggleSubtitle();
    },
    
    playWelcome: () => {
      if (!playerRef.current) throw new Error('Player não inicializado');
      playerRef.current.playWelcome();
    },
  }), []);

  // Estados derivados memoizados
  const derivedState = useMemo(() => ({
    canTranslate: state.isReady && !state.isTranslating,
    canPause: state.isPlaying && !state.isPaused,
    canResume: state.isPaused,
    canStop: state.isPlaying || state.isPaused,
    canRestart: state.isReady && (state.isPlaying || state.isPaused || state.lastTranslation),
    hasWarnings: state.errors.warnings.length > 0,
    isBusy: state.isLoading || state.isTranslating,
  }), [state]);

  // Utilitários
  const utils = useMemo(() => ({
    clearWarnings: () => dispatch({ type: 'WARNINGS_CLEAR' }),
    reset: () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      dispatch({ type: 'RESET' });
    },
    getPlayer: () => playerRef.current,
    retry: () => {
      retryCountRef.current = 0;
      return initializePlayer();
    },
  }), [initializePlayer]);

  // ========================================
  // EFEITOS
  // ========================================

  // Callback para mudanças de estado
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Inicialização automática
  useEffect(() => {
    if (autoInit && containerRef?.current && !playerRef.current && !state.isLoading) {
      initializePlayer();
    }
  }, [autoInit, containerRef, initializePlayer, state.isLoading]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  // ========================================
  // RETORNO DO HOOK
  // ========================================

  return {
    // Estado principal
    ...state,
    ...derivedState,
    
    // Métodos principais
    translate,
    initializePlayer,
    
    // Controles agrupados
    controls,
    settings,
    utils,
    
    // Compatibilidade (métodos individuais)
    play: controls.play,
    pause: controls.pause,
    resume: controls.resume,
    stop: controls.stop,
    restart: controls.restart,
    repeat: controls.repeat,
    setSpeed: settings.setSpeed,
    setRegion: settings.setRegion,
    changeAvatar: settings.changeAvatar,
    toggleSubtitle: settings.toggleSubtitle,
    playWelcome: settings.playWelcome,
    
    // Dados legados para compatibilidade
    player: {
      status: state.status,
      loaded: state.isReady,
      translated: !!state.lastTranslation,
      progress: state.progress,
      region: state.region,
      isTranslating: state.isTranslating,
      isPlaying: state.isPlaying,
      text: state.currentText,
      gloss: state.currentGloss,
    },
    error: state.errors.fatal,
    isLoading: state.isLoading,
    isReady: state.isReady,
    isTranslating: state.isTranslating,
    isPlaying: state.isPlaying,
  };
}
