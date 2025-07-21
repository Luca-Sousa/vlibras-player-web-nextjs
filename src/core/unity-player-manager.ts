import type { UnityPlayerInstance } from '@/types';
import { UNITY_GAME_OBJECTS } from './config';

export interface UnityPlayerEvents {
  load: () => void;
  progress: (progress: number) => void;
  stateChange: (isPlaying: boolean, isPaused: boolean, isLoading: boolean) => void;
  counterGloss: (counter: number, length: number) => void;
  getAvatar: (avatar: string) => void;
  finishWelcome: (finished: boolean) => void;
}

/**
 * Adapter para gerenciar a comunicação com o Unity WebGL Player
 */
export class UnityPlayerManager {
  private static instance: UnityPlayerManager | null = null;
  private player: UnityPlayerInstance | null = null;
  private eventListeners: Map<keyof UnityPlayerEvents, Set<Function>> = new Map();
  private subtitle: boolean = true;
  private currentBaseUrl: string = '';

  constructor() {
    if (UnityPlayerManager.instance) {
      return UnityPlayerManager.instance;
    }

    this.setupGlobalCallbacks();
    UnityPlayerManager.instance = this;
  }

  /**
   * Define a referência do player Unity
   */
  setPlayerReference(player: UnityPlayerInstance): void {
    this.player = player;
  }

  /**
   * Envia uma mensagem para o Unity
   */
  private sendMessage(method: string, params?: any): void {
    if (!this.player) {
      console.warn('Unity player not initialized');
      return;
    }

    try {
      this.player.SendMessage(UNITY_GAME_OBJECTS.playerManager, method, params);
    } catch (error) {
      console.error('Error sending message to Unity:', error);
    }
  }

  /**
   * Reproduz uma glosa ou continua a reprodução
   */
  play(gloss?: string): void {
    if (gloss) {
      this.sendMessage('playNow', gloss);
    } else {
      this.sendMessage('setPauseState', 0);
    }
  }

  /**
   * Pausa a reprodução
   */
  pause(): void {
    this.sendMessage('setPauseState', 1);
  }

  /**
   * Para toda a reprodução
   */
  stop(): void {
    this.sendMessage('stopAll');
  }

  /**
   * Define a velocidade de reprodução
   */
  setSpeed(speed: number): void {
    if (speed < 0.5 || speed > 2.0) {
      console.warn('Speed should be between 0.5 and 2.0');
      return;
    }
    this.sendMessage('setSlider', speed);
  }

  /**
   * Alterna a exibição de legendas
   */
  toggleSubtitle(): void {
    this.subtitle = !this.subtitle;
    this.sendMessage('setSubtitlesState', this.subtitle ? 1 : 0);
  }

  /**
   * Reproduz animação de boas-vindas
   */
  playWelcome(): void {
    this.sendMessage('playWellcome');
  }

  /**
   * Troca o avatar
   */
  changeAvatar(avatarName: string): void {
    this.sendMessage('Change', avatarName);
  }

  /**
   * Define a URL base para o dicionário
   */
  setBaseUrl(url: string): void {
    this.sendMessage('setBaseUrl', url);
    this.currentBaseUrl = url;
  }

  /**
   * Define configurações de personalização
   */
  setPersonalization(personalization: string): void {
    if (!this.player) {
      console.warn('Unity player not initialized');
      return;
    }

    try {
      this.player.SendMessage(
        UNITY_GAME_OBJECTS.customizationBridge,
        'setURL',
        personalization
      );
    } catch (error) {
      console.error('Error setting personalization:', error);
    }
  }

  /**
   * Adiciona listener para eventos
   */
  addEventListener<K extends keyof UnityPlayerEvents>(
    event: K,
    listener: UnityPlayerEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove listener de eventos
   */
  removeEventListener<K extends keyof UnityPlayerEvents>(
    event: K,
    listener: UnityPlayerEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emite um evento
   */
  private emit<K extends keyof UnityPlayerEvents>(
    event: K,
    ...args: Parameters<UnityPlayerEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Configura callbacks globais para comunicação com Unity
   */
  private setupGlobalCallbacks(): void {
    if (typeof window === 'undefined') return;

    // Callback para quando o player é carregado
    (window as any).onLoadPlayer = () => {
      this.sendMessage('initRandomAnimationsProcess');
      this.emit('load');
    };

    // Callback para progresso
    (window as any).updateProgress = (progress: number) => {
      this.emit('progress', progress);
    };

    // Callback para mudança de estado
    (window as any).onPlayingStateChange = (
      isPlaying: string,
      isPaused: string,
      isPlayingIntervalAnimation: string,
      isLoading: string,
      isRepeatable: string
    ) => {
      this.emit(
        'stateChange',
        this.toBool(isPlaying),
        this.toBool(isPaused),
        this.toBool(isLoading)
      );
    };

    // Callback para contador de glosa
    (window as any).CounterGloss = (counter: number, length: number) => {
      this.emit('counterGloss', counter, length);
    };

    // Callback para obter avatar
    (window as any).GetAvatar = (avatar: string) => {
      this.emit('getAvatar', avatar);
    };

    // Callback para fim da apresentação
    (window as any).FinishWelcome = (finished: string) => {
      this.emit('finishWelcome', this.toBool(finished));
    };
  }

  /**
   * Converte string Unity para boolean
   */
  private toBool(value: string): boolean {
    return value !== 'False';
  }

  /**
   * Obtém URL base atual
   */
  getCurrentBaseUrl(): string {
    return this.currentBaseUrl;
  }

  /**
   * Verifica se as legendas estão habilitadas
   */
  isSubtitleEnabled(): boolean {
    return this.subtitle;
  }

  /**
   * Limpa todos os listeners
   */
  dispose(): void {
    this.eventListeners.clear();
    this.player = null;
    
    if (typeof window !== 'undefined') {
      delete (window as any).onLoadPlayer;
      delete (window as any).updateProgress;
      delete (window as any).onPlayingStateChange;
      delete (window as any).CounterGloss;
      delete (window as any).GetAvatar;
      delete (window as any).FinishWelcome;
    }
  }
}
