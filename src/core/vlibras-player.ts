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

    // ✅ CORREÇÃO: Verificar se já existe container
    const existingContainer = wrapper.querySelector('.vlibras-unity-container') as HTMLElement;
    
    if (existingContainer && this.state.loaded && UnityStateManager.isUnityReady(existingContainer)) {
      // ✅ Reutilizar container existente se já carregado E Unity está pronto
      this.container = existingContainer;
      this.emit('load');
      this.callbacks.onPlayerReady?.(); // ✅ Callback de player pronto
      return Promise.resolve();
    }

    // ✅ CORREÇÃO: Limpar containers anteriores se existirem
    const oldContainers = wrapper.querySelectorAll('[id*="vlibras-container"], [id*="vlibras-game-container"]');
    oldContainers.forEach(container => {
      const containerId = container.id;
      UnityStateManager.unregisterUnityInstance(containerId);
      container.remove();
    });

    // ✅ Criar novo container apenas se necessário
    this.container = document.createElement('div');
    const containerId = `vlibras-container-${this.options.region || 'default'}-${Date.now()}`;
    this.container.setAttribute('id', containerId);
    this.container.classList.add('vlibras-unity-container');

    wrapper.appendChild(this.container);

    return new Promise((resolve, reject) => {
      UnityLoader.loadPlayer({
        targetPath: this.options.targetPath,
        gameContainer: this.container!,
        onSuccess: async (player) => {
          try {
            this.unityManager.setPlayerReference(player);
            
            // ✅ Registrar instância Unity para monitoramento
            UnityStateManager.registerUnityInstance(containerId, player);
            
            // ✅ CRITICAL FIX: Aguardar Unity estar REALMENTE pronto
            await UnityStateManager.waitForUnity(this.container!);
            
            this.state.loaded = true; // ✅ Marcar como carregado APENAS após Unity pronto
            this.emit('load');
            this.callbacks.onPlayerReady?.(); // ✅ Callback de player pronto
            resolve();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao aguardar Unity carregar';
            this.emit('error', errorMessage);
            this.callbacks.onPlayerError?.(errorMessage);
            reject(new Error(errorMessage));
          }
        },
        onError: (error) => {
          this.emit('error', error);
          this.callbacks.onPlayerError?.(error); // ✅ Callback de erro no player
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
   * Traduz um texto para Libras
   */
  async translate(text: string, options: TranslationOptions = {}): Promise<void> {
    if (!text || text.trim().length === 0) {
      throw new Error('Texto não pode estar vazio');
    }

    // ✅ CRITICAL FIX: Verificar se Unity está realmente pronto
    if (!this.state.loaded || !UnityStateManager.isUnityReady(this.container!)) {
      throw new Error('Player não está pronto. Aguarde o carregamento completo.');
    }

    this.state.isTranslating = true; // ✅ Marcar estado de tradução
    this.emit('translate:start');
    this.callbacks.onTranslationStart?.(); // ✅ Callback de início de tradução

    if (this.state.loaded) {
      this.stop();
    }

    this.state.text = text;

    try {
      const domain = typeof window !== 'undefined' ? window.location.hostname : '';
      const gloss = await this.translator.translate(text, domain);
      
      this.state.gloss = gloss;
      this.play(gloss, { ...options, fromTranslation: true });
      
      // ✅ CRITICAL FIX: Aguardar animação terminar REALMENTE
      if (this.container) {
        await UnityStateManager.waitForAnimationEnd(this.container);
      }
      
      this.state.isTranslating = false; // ✅ Finalizar estado de tradução
      this.emit('translate:end');
      this.callbacks.onTranslationEnd?.(); // ✅ Callback de fim de tradução
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na tradução';
      
      this.state.isTranslating = false; // ✅ Finalizar estado de tradução em caso de erro
      this.callbacks.onTranslationError?.(errorMessage); // ✅ Callback de erro na tradução
      
      if (errorMessage === 'timeout_error') {
        this.emit('error', 'timeout_error');
      } else {
        this.emit('error', errorMessage);
      }
      
      // Em caso de erro, tenta reproduzir o texto em maiúsculas
      this.play(text.toUpperCase());
      this.emit('translate:end');
      this.callbacks.onTranslationEnd?.(); // ✅ Callback mesmo com erro
    }
  }

  /**
   * Reproduz uma glosa ou continua a reprodução
   */
  play(gloss?: string, options: TranslationOptions = {}): void {
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
    this.state.isPlaying = false; // ✅ Atualizar estado
    this.callbacks.onPause?.(); // ✅ Callback de pausa
  }

  /**
   * Para a reprodução
   */
  stop(): void {
    this.unityManager.stop();
    this.state.isPlaying = false; // ✅ Atualizar estado
    this.callbacks.onStop?.(); // ✅ Callback de parada
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
    // Integrar callbacks com eventos do Unity Manager
    this.addEventListener('animation:play', () => {
      this.state.isPlaying = true;
      this.callbacks.onPlay?.();
    });

    this.addEventListener('animation:pause', () => {
      this.state.isPlaying = false;
      this.callbacks.onPause?.();
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

    this.unityManager.addEventListener('stateChange', (isPlaying, isPaused, isLoading) => {
      if (isPaused) {
        this.emit('animation:pause');
      } else if (isPlaying && !isPaused) {
        this.emit('animation:play');
        this.changeStatus(PLAYER_STATUSES.playing);
      } else if (!isPlaying && !isLoading) {
        this.emit('animation:end');
        this.changeStatus(PLAYER_STATUSES.idle);
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
