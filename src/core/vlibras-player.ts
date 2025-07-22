import type {
  VLibrasPlayerOptions,
  VLibrasPlayerState,
  VLibrasPlayerEvents,
  VLibrasPlayerCallbacks,
  TranslationOptions,
  PlayerStatus,
} from '@/types';
import { VLibrasTranslator } from './translator';
import { UnityPlayerManager } from './unity-player-manager';
import { UnityLoader } from './unity-loader';
import { UnityStateManager } from '../utils/unity-state-manager';
import { defaultConfig, PLAYER_STATUSES, DEFAULT_PLAYER_OPTIONS } from './config';

/**
 * Classe principal do VLibras Player para Next.js
 */
export class VLibrasPlayer {
  private options: Required<VLibrasPlayerOptions>;
  private translator: VLibrasTranslator;
  private unityManager: UnityPlayerManager;
  private state: VLibrasPlayerState;
  private eventListeners: Map<keyof VLibrasPlayerEvents, Set<Function>> = new Map();
  private container: HTMLElement | null = null;
  private globalGlossLength: number = 0;
  private callbacks: VLibrasPlayerCallbacks;
  private isInTranslation: boolean = false; // 🔥 Flag para rastrear se estamos em uma tradução
  private isRestarting: boolean = false; // 🔥 NOVO: Flag para rastrear se estamos reiniciando

  constructor(options: VLibrasPlayerOptions = {}) {
    this.options = {
      ...DEFAULT_PLAYER_OPTIONS,
      ...options,
    } as Required<VLibrasPlayerOptions>;

    // Extrair callbacks das opções
    this.callbacks = {
      onTranslationStart: options.onTranslationStart,
      onTranslationEnd: options.onTranslationEnd,
      onTranslationError: options.onTranslationError,
      onPlay: options.onPlay,
      onPause: options.onPause,
      onResume: options.onResume,
      onRestart: options.onRestart,
      onStop: options.onStop,
      onPlayerReady: options.onPlayerReady,
      onPlayerError: options.onPlayerError,
    };

    this.translator = new VLibrasTranslator(this.options.translatorUrl);
    this.unityManager = new UnityPlayerManager();

    this.state = {
      status: PLAYER_STATUSES.idle,
      loaded: false,
      translated: false,
      progress: null,
      region: this.options.region,
      isTranslating: false,
      isPlaying: false,
    };

    this.setupEventListeners();
    this.setupCallbackIntegration();
  }

  /**
   * Carrega o player no container especificado
   */
  async load(wrapper: HTMLElement): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('VLibras Player só pode ser usado no lado cliente');
    }

    if (!UnityLoader.checkWebGLSupport()) {
      throw new Error('Navegador não suporta WebGL');
    }

    // ✅ CORREÇÃO ORIGINAL: Implementar sequência exata do VLibras original
    
    // Limpar containers anteriores se existirem
    const oldContainers = wrapper.querySelectorAll('[id*="vlibras-container"], [id*="gameContainer"]');
    oldContainers.forEach(container => {
      const containerId = container.id;
      UnityStateManager.unregisterUnityInstance(containerId);
      container.remove();
    });

    // ✅ CRITICAL FIX: Criar gameContainer com ID específico que Unity espera
    this.container = document.createElement('div');
    this.container.setAttribute('id', 'gameContainer'); // ✅ Unity original usa gameContainer
    this.container.classList.add('emscripten', 'vlibras-unity-container');

    wrapper.appendChild(this.container);

    return new Promise((resolve, reject) => {
      // ✅ CRITICAL FIX: Implementar window.onLoadPlayer como no original
      const originalOnLoadPlayer = (window as any).onLoadPlayer;
      
      (window as any).onLoadPlayer = () => {
        try {
          // ✅ ORIGINAL SEQUENCE: Exatamente como no Player.js original
          this.state.loaded = true;
          this.emit('load');
          
          // ✅ CRITICAL FIX: Inicializar animações aleatórias (estava faltando!)
          this.unityManager.initRandomAnimationsProcess();
          
          // ✅ ORIGINAL FIX: setBaseUrl SEM região como no original
          this.unityManager.setBaseUrl(defaultConfig.dictionaryUrl);
          
          // ✅ ORIGINAL: Chamar onLoad callback ou play automático
          if (this.options.onLoad) {
            this.options.onLoad();
          } else {
            // ✅ ORIGINAL: Play automático de boas-vindas com null
            this.play(null, { fromTranslation: true });
          }
          
          this.callbacks.onPlayerReady?.();
          resolve();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro na inicialização do player';
          this.emit('error', errorMessage);
          this.callbacks.onPlayerError?.(errorMessage);
          reject(new Error(errorMessage));
        } finally {
          // Restaurar callback original se existia
          if (originalOnLoadPlayer) {
            (window as any).onLoadPlayer = originalOnLoadPlayer;
          }
        }
      };

      // ✅ Usar UnityLoader original
      UnityLoader.loadPlayer({
        targetPath: this.options.targetPath,
        gameContainer: this.container!,
        onSuccess: (player) => {
          // ✅ CRITICAL FIX: Apenas configurar referência, NÃO marcar como pronto
          this.unityManager.setPlayerReference(player);
          UnityStateManager.registerUnityInstance('gameContainer', player);
          
          // ✅ O window.onLoadPlayer será chamado pelo Unity quando estiver realmente pronto
        },
        onError: (error) => {
          // Restaurar callback original se existia
          if (originalOnLoadPlayer) {
            (window as any).onLoadPlayer = originalOnLoadPlayer;
          }
          
          this.emit('error', error);
          this.callbacks.onPlayerError?.(error);
          reject(new Error(error));
        },
        onProgress: (progress) => {
          this.state.progress = progress;
          this.emit('animation:progress', progress);
        },
      });
    });
  }

  /**
   * Traduz um texto para Libras - EXATAMENTE como no código original
   */
  async translate(text: string, options: TranslationOptions = {}): Promise<void> {
    if (!text || text.trim().length === 0) {
      throw new Error('Texto não pode estar vazio');
    }

    if (!this.state.loaded) {
      throw new Error('Player não está pronto. Aguarde o carregamento completo.');
    }

    // ✅ ORIGINAL: Emitir translate:start imediatamente
    this.emit('translate:start');
    this.callbacks.onTranslationStart?.();
    this.isInTranslation = true; // 🔥 Marcar que estamos em uma tradução

    // ✅ ORIGINAL: Parar reprodução atual se estiver carregado
    if (this.state.loaded) {
      this.stop();
    }

    this.state.text = text;

    try {
      const domain = typeof window !== 'undefined' ? window.location.hostname : '';
      const gloss = await this.translator.translate(text, domain);
      
      if (!gloss) {
        // ✅ ORIGINAL: Em caso de erro, finalizar tradução
        this.isInTranslation = false; // 🔥 Finalizar flag de tradução
        this.emit('translate:end');
        this.callbacks.onTranslationEnd?.();
        return;
      }

      this.state.gloss = gloss;
      
      // ✅ CRITICAL FIX: Seguir EXATAMENTE o código original
      this.play(gloss, { ...options, fromTranslation: true, isEnabledStats: options.isEnabledStats });
      
      // 🔥 REMOVED: Não emitir translate:end aqui!
      // Agora será emitido quando animation:end for disparado
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na tradução';
      
      this.callbacks.onTranslationError?.(errorMessage);
      
      if (errorMessage === 'timeout_error') {
        this.emit('error', 'timeout_error');
      } else {
        this.emit('error', errorMessage);
      }
      
      // ✅ ORIGINAL: Em caso de erro, reproduzir texto em maiúsculas
      this.play(text.toUpperCase());
      
      this.emit('translate:end');
    }
  }

  /**
   * Reproduz uma glosa ou continua a reprodução
   */
  play(gloss?: string | null, options: TranslationOptions = {}): void {
    const { fromTranslation = false, isEnabledStats = true } = options;

    // Configura URL do dicionário baseado nas estatísticas
    this.updateDictionaryUrl(isEnabledStats);

    this.state.translated = fromTranslation;
    this.state.gloss = gloss || this.state.gloss;

    if (this.state.gloss && this.state.loaded) {
      this.changeStatus(PLAYER_STATUSES.preparing);
      this.unityManager.play(this.state.gloss);
    }
  }

  /**
   * Reproduz animação de boas-vindas
   */
  playWelcome(): void {
    this.unityManager.playWelcome();
    this.emit('welcome:start');
  }

  /**
   * Continua a reprodução pausada
   */
  continue(): void {
    this.unityManager.play();
  }

  /**
   * Repete a última reprodução
   */
  repeat(): void {
    this.play();
  }

  /**
   * Pausa a reprodução
   */
  pause(): void {
    this.unityManager.pause();
    // 🔥 CORREÇÃO: Não chamar callback aqui - será chamado pelo evento animation:pause
  }

  /**
   * ✅ NOVO: Retoma a reprodução pausada
   */
  resume(): void {
    this.unityManager.resume();
    // 🔥 CORREÇÃO: Não chamar callback aqui - será chamado pelo evento animation:play
  }

  /**
   * ✅ NOVO: Reinicia a animação atual (mesmo se estiver rodando)
   */
  restart(): void {
    if (!this.state.loaded || !this.state.gloss) {
      // Não há glosa para reiniciar
      return;
    }

    // 🔥 CORREÇÃO: Marcar que estamos reiniciando
    this.isRestarting = true;
    
    // Emitir apenas o evento - o callback será chamado pelo listener
    this.emit('animation:restart');
    
    // Parar e reproduzir novamente a glosa atual
    this.unityManager.stop();
    
    // Pequeno delay para garantir que o stop foi processado
    setTimeout(() => {
      if (this.state.gloss && this.isRestarting) {
        this.unityManager.play(this.state.gloss);
        this.isRestarting = false; // Reset flag após iniciar
      }
    }, 100);
  }

  /**
   * Para a reprodução
   */
  stop(): void {
    this.unityManager.stop();
    // 🔥 CORREÇÃO: Não chamar callback aqui - será chamado pelo evento animation:end
    
    // 🔥 Resetar flag de tradução se necessário
    if (this.isInTranslation) {
      this.isInTranslation = false;
      // Note: Não emitir translate:end aqui pois stop() pode ser chamado manualmente
    }
  }

  /**
   * Define a velocidade de reprodução
   */
  setSpeed(speed: number): void {
    this.unityManager.setSpeed(speed);
  }

  /**
   * Define configurações de personalização
   */
  setPersonalization(personalization: string): void {
    this.unityManager.setPersonalization(personalization);
  }

  /**
   * Troca o avatar
   */
  changeAvatar(avatarName: string): void {
    this.unityManager.changeAvatar(avatarName);
    this.emit('avatar:change', avatarName);
  }

  /**
   * Alterna exibição de legendas
   */
  toggleSubtitle(): void {
    this.unityManager.toggleSubtitle();
  }

  /**
   * Define a região do dicionário
   */
  setRegion(region: 'BR' | 'PT'): void {
    this.state.region = region;
    const url = `${defaultConfig.dictionaryUrl}${region}/`;
    this.unityManager.setBaseUrl(url);
  }

  /**
   * Obtém o estado atual do player
   */
  getState(): Readonly<VLibrasPlayerState> {
    return { ...this.state };
  }

  /**
   * Adiciona listener para eventos
   */
  addEventListener<K extends keyof VLibrasPlayerEvents>(
    event: K,
    listener: VLibrasPlayerEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove listener de eventos
   */
  removeEventListener<K extends keyof VLibrasPlayerEvents>(
    event: K,
    listener: VLibrasPlayerEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * ✅ NOVO: Remove todos os listeners de eventos
   */
  removeAllListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Destrói o player e limpa recursos
  /**
   * ✅ MELHORADO: Destrói o player e limpa recursos completamente
   */
  dispose(): void {
    // Limpar listeners
    this.eventListeners.clear();
    
    // Limpar Unity Manager
    if (this.unityManager) {
      this.unityManager.dispose();
    }
    
    // ✅ CORREÇÃO: Limpeza completa do container
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    // ✅ Limpar estado
    this.state.loaded = false;
    this.state.status = 'idle';
    this.state.translated = false;
    this.state.progress = null;
    
    // Limpar referências
    this.globalGlossLength = 0;
  }

  /**
   * Emite um evento
   */
  private emit<K extends keyof VLibrasPlayerEvents>(
    event: K,
    ...args: Parameters<VLibrasPlayerEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args);
        } catch (error) {
          // ✅ CORREÇÃO: Emitir erro em vez de console.error
          this.emit('error', `Error in VLibras event listener for ${event}: ${error}`);
        }
      });
    }
  }

  /**
   * Configura integração dos callbacks com eventos internos
   */
  private setupCallbackIntegration(): void {
    // 🔥 CORREÇÃO: Integrar callbacks APENAS com eventos, evitando duplicação
    
    this.addEventListener('animation:play', () => {
      this.state.isPlaying = true;
      this.callbacks.onPlay?.();
    });

    this.addEventListener('animation:pause', () => {
      this.state.isPlaying = false;
      this.callbacks.onPause?.();
    });

    this.addEventListener('animation:resume', () => {
      this.state.isPlaying = true;
      this.callbacks.onResume?.();
    });

    this.addEventListener('animation:restart', () => {
      this.state.isPlaying = true;
      this.callbacks.onRestart?.();
    });

    this.addEventListener('animation:end', () => {
      this.state.isPlaying = false;
      this.callbacks.onStop?.();
    });

    this.addEventListener('error', (error: string) => {
      this.callbacks.onPlayerError?.(error);
    });
  }

  /**
   * Configura listeners para eventos do Unity
   */
  private setupEventListeners(): void {
    this.unityManager.addEventListener('load', () => {
      this.state.loaded = true;
      this.emit('load');
      this.unityManager.setBaseUrl(`${defaultConfig.dictionaryUrl}${this.state.region}/`);
      
      if (this.options.onLoad) {
        this.options.onLoad();
      }
    });

    this.unityManager.addEventListener('progress', (progress) => {
      this.state.progress = progress;
      this.emit('animation:progress', progress);
    });

    let wasPaused = false; // 🔥 CORREÇÃO: Flag para detectar se estava pausado

    this.unityManager.addEventListener('stateChange', (isPlaying, isPaused, isLoading) => {
      if (isPaused) {
        wasPaused = true; // 🔥 Marcar que foi pausado
        this.emit('animation:pause');
      } else if (isPlaying && !isPaused) {
        // 🔥 CORREÇÃO: Distinguir entre play inicial, resume e restart
        if (this.isRestarting) {
          // Não emitir evento aqui, já foi emitido no método restart()
          this.isRestarting = false;
        } else if (wasPaused) {
          this.emit('animation:resume'); // ✅ Retomar após pausa
          wasPaused = false; // Reset flag
        } else {
          this.emit('animation:play'); // ✅ Play inicial
        }
        this.changeStatus(PLAYER_STATUSES.playing);
      } else if (!isPlaying && !isLoading) {
        wasPaused = false; // Reset flag quando termina
        
        // 🔥 CORREÇÃO: Não emitir animation:end se estivermos reiniciando
        if (!this.isRestarting) {
          this.emit('animation:end');
        }
        
        this.changeStatus(PLAYER_STATUSES.idle);
        
        // 🔥 GENIUS LOGIC: Emitir translate:end quando animação terminar durante uma tradução!
        if (this.isInTranslation && !this.isRestarting) {
          this.isInTranslation = false;
          this.emit('translate:end');
          this.callbacks.onTranslationEnd?.();
        }
      }
    });

    this.unityManager.addEventListener('counterGloss', (counter, length) => {
      this.globalGlossLength = length;
      this.emit('gloss:info', counter, length);
    });

    this.unityManager.addEventListener('getAvatar', (avatar) => {
      this.emit('avatar:change', avatar);
    });

    this.unityManager.addEventListener('finishWelcome', (finished) => {
      this.emit('welcome:end', finished);
    });
  }

  /**
   * Altera o status do player
   */
  private changeStatus(status: PlayerStatus): void {
    const previousStatus = this.state.status;
    
    switch (status) {
      case PLAYER_STATUSES.idle:
        if (previousStatus === PLAYER_STATUSES.playing) {
          this.state.status = status;
          this.emit('gloss:end', this.globalGlossLength);
        }
        break;

      case PLAYER_STATUSES.preparing:
        this.state.status = status;
        break;

      case PLAYER_STATUSES.playing:
        if (previousStatus === PLAYER_STATUSES.preparing) {
          this.state.status = status;
          this.emit('gloss:start');
        }
        break;
    }
  }

  /**
   * Atualiza URL do dicionário baseado nas configurações de estatísticas
   */
  private updateDictionaryUrl(isEnabledStats: boolean): void {
    const currentUrl = this.unityManager.getCurrentBaseUrl();
    const defaultUrl = `${defaultConfig.dictionaryUrl}${this.state.region}/`;
    const staticUrl = `${defaultConfig.dictionaryStaticUrl}${this.state.region}/`;

    if (!isEnabledStats && currentUrl === defaultUrl) {
      this.unityManager.setBaseUrl(staticUrl);
    } else if (isEnabledStats && currentUrl !== defaultUrl) {
      this.unityManager.setBaseUrl(defaultUrl);
    }
  }
}
