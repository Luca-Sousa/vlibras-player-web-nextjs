import type { UnityDebugInfo } from '../types';

/**
 * Utilitário para gerenciamento de estado do Unity WebGL
 * Resolve problemas de detecção de carregamento e estado de animação
 */

export interface UnityInstance {
  Module?: {
    ready?: boolean;
    canvas?: HTMLCanvasElement;
    isAnimationPlaying?: () => boolean;
    isAnimationComplete?: () => boolean;
  };
  SendMessage?: (gameObject: string, methodName: string, value?: any) => void;
}

declare global {
  interface Window {
    unityInstance?: UnityInstance;
    unityInstances?: Map<string, UnityInstance>;
  }
}

export class UnityStateManager {
  /**
   * Verifica se o Unity WebGL carregou completamente
   */
  static isUnityReady(container: HTMLElement): boolean {
    try {
      const canvas = container.querySelector('canvas');
      const unityInstance = this.getUnityInstance(container);
      
      // ✅ Verificação mais robusta
      const hasValidCanvas = canvas && 
        canvas.clientWidth > 0 && 
        canvas.clientHeight > 0 && 
        typeof canvas.getContext === 'function' &&
        !canvas.style.display?.includes('none');
        
      const hasValidUnity = unityInstance && 
        unityInstance.Module && 
        unityInstance.Module.ready === true &&
        unityInstance.SendMessage &&
        typeof unityInstance.SendMessage === 'function';
        
      // ✅ Verificação adicional: tentar enviar mensagem de teste
      let canSendMessage = false;
      if (hasValidUnity && unityInstance?.SendMessage) {
        try {
          // Teste silencioso - não vai gerar erro se Unity estiver pronto
          unityInstance.SendMessage('NonExistentObject', 'NonExistentMethod', '');
          canSendMessage = true;
        } catch (error) {
          // Se der erro específico de objeto não encontrado, Unity está ok
          const errorStr = error instanceof Error ? error.message : String(error);
          canSendMessage = errorStr.includes('object') || errorStr.includes('method') || errorStr.includes('not found');
        }
      }
      
      return !!(hasValidCanvas && hasValidUnity && canSendMessage);
    } catch (error) {
      // Silently handle errors - avoid console warnings in production
      return false;
    }
  }

  /**
   * Verifica se uma animação está sendo reproduzida
   */
  static isAnimationPlaying(container?: HTMLElement): boolean {
    try {
      const unityInstance = this.getUnityInstance(container);
      
      if (unityInstance?.Module?.isAnimationPlaying) {
        return unityInstance.Module.isAnimationPlaying();
      }
      
      // Fallback: verificar se há canvas ativo
      const canvas = container?.querySelector('canvas') || document.querySelector('canvas');
      return canvas ? canvas.style.display !== 'none' : false;
    } catch (error) {
      // Silently handle errors
      return false;
    }
  }

  /**
   * Verifica se uma animação foi completada
   */
  static isAnimationComplete(container?: HTMLElement): boolean {
    try {
      const unityInstance = this.getUnityInstance(container);
      
      if (unityInstance?.Module?.isAnimationComplete) {
        return unityInstance.Module.isAnimationComplete();
      }
      
      // Se não tem método específico, assume que não está tocando = completo
      return !this.isAnimationPlaying(container);
    } catch (error) {
      // In case of error, assume complete to avoid blocking
      return true;
    }
  }

  /**
   * Aguarda o Unity estar completamente carregado
   */
  static waitForUnity(container: HTMLElement, timeout: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (this.isUnityReady(container)) {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Unity não carregou em ${timeout}ms`));
          return;
        }
        
        setTimeout(check, 100);
      };
      
      // Delay inicial para permitir que Unity comece a carregar
      setTimeout(check, 500);
    });
  }

  /**
   * Aguarda uma animação terminar completamente
   */
  static waitForAnimationEnd(container?: HTMLElement, timeout: number = 10000): Promise<void> {
    return new Promise((resolve, _reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (this.isAnimationComplete(container)) {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          // Resolve even with timeout to avoid blocking the application
          resolve();
          return;
        }
        
        setTimeout(check, 100);
      };
      
      // Delay inicial para permitir que animação comece
      setTimeout(check, 200);
    });
  }

  /**
   * Obtém a instância do Unity para um container específico
   */
  private static getUnityInstance(container?: HTMLElement): UnityInstance | undefined {
    if (container) {
      // Tentar encontrar por ID do container
      const containerId = container.id;
      if (containerId && window.unityInstances?.has(containerId)) {
        return window.unityInstances.get(containerId);
      }
    }
    
    // Fallback para instância global
    return window.unityInstance;
  }

  /**
   * Registra uma instância do Unity para um container específico
   */
  static registerUnityInstance(containerId: string, instance: UnityInstance): void {
    if (!window.unityInstances) {
      window.unityInstances = new Map();
    }
    window.unityInstances.set(containerId, instance);
    
    // Também manter referência global para compatibilidade
    window.unityInstance = instance;
  }

  /**
   * Remove registro de uma instância do Unity
   */
  static unregisterUnityInstance(containerId: string): void {
    if (window.unityInstances) {
      window.unityInstances.delete(containerId);
    }
  }

  /**
   * Limpa todas as instâncias registradas
   */
  static clearAllInstances(): void {
    if (window.unityInstances) {
      window.unityInstances.clear();
    }
    window.unityInstance = undefined;
  }

  /**
   * Obtém informações de debug do estado atual
   */
  static getDebugInfo(container?: HTMLElement): UnityDebugInfo {
    const unityInstance = this.getUnityInstance(container);
    const canvas = container?.querySelector('canvas');
    
    return {
      hasUnityInstance: !!unityInstance,
      hasModule: !!unityInstance?.Module,
      moduleReady: !!unityInstance?.Module?.ready,
      hasSendMessage: !!unityInstance?.SendMessage,
      hasCanvas: !!canvas,
      canvasSize: canvas ? `${canvas.clientWidth}x${canvas.clientHeight}` : 'N/A',
      isReady: container ? this.isUnityReady(container) : false,
      isAnimationPlaying: this.isAnimationPlaying(container),
      isAnimationComplete: this.isAnimationComplete(container),
      registeredInstances: window.unityInstances?.size || 0,
    };
  }
}
