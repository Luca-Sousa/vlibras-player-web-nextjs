import type { UnityPlayerInstance } from '@/types';

export interface UnityLoaderConfig {
  targetPath: string;
  gameContainer: HTMLElement;
  onSuccess: (_player: UnityPlayerInstance) => void;
  onError: (_error: string) => void;
  onProgress?: (_progress: number) => void;
}

/**
 * Gerencia o carregamento do Unity WebGL Player
 */
export class UnityLoader {
  private static loadedScripts = new Set<string>();

  /**
   * Carrega e inicializa o Unity WebGL Player
   */
  static async loadPlayer(config: UnityLoaderConfig): Promise<void> {
    const { targetPath, gameContainer, onSuccess, onError, onProgress } = config;

    try {
      // Carrega o script do Unity Loader se ainda não foi carregado
      await this.loadUnityScript(targetPath);

      // Aguarda o UnityLoader estar disponível
      await this.waitForUnityLoader();

      // Configura o container
      this.setupGameContainer(gameContainer);

      // Carrega a configuração do jogo
      const configUrl = this.joinUrl(targetPath, 'playerweb.json');

      // Inicializa o Unity
      const UnityLoaderGlobal = (window as any).UnityLoader;
      
      const player = UnityLoaderGlobal.instantiate(gameContainer.id, configUrl, {
        compatibilityCheck: (_: any, accept: () => void, deny: () => void) => {
          if (UnityLoaderGlobal.SystemInfo.hasWebGL) {
            accept();
          } else {
            const errorMsg = 'Seu navegador não suporta WebGL';
            onError(errorMsg);
            deny();
          }
        },
        onProgress: onProgress ? (unityInstance: any, progress: number) => {
          onProgress(progress);
        } : undefined,
      });

      onSuccess(player);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao carregar Unity Player';
      onError(errorMsg);
    }
  }

  /**
   * Carrega o script do Unity Loader
   */
  private static async loadUnityScript(targetPath: string): Promise<void> {
    const scriptUrl = this.joinUrl(targetPath, 'UnityLoader.js');

    // Verifica se já foi carregado
    if (this.loadedScripts.has(scriptUrl)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;

      script.onload = () => {
        this.loadedScripts.add(scriptUrl);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Falha ao carregar Unity script: ${scriptUrl}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Aguarda o UnityLoader estar disponível no window
   */
  private static async waitForUnityLoader(timeout = 10000): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const check = () => {
        if ((window as any).UnityLoader) {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout aguardando UnityLoader'));
          return;
        }

        setTimeout(check, 100);
      };

      check();
    });
  }

  /**
   * ✅ MELHORADO: Configura o container do jogo com ID estável
   */
  private static setupGameContainer(container: HTMLElement): void {
    // ✅ CORREÇÃO: ID mais estável baseado em região ou ID padrão
    if (!container.id) {
      container.id = 'vlibras-game-container-main';
    }

    // ✅ Verificar se já tem as classes necessárias para evitar duplicação
    if (!container.classList.contains('emscripten')) {
      container.classList.add('emscripten', 'vlibras-unity-container');
    }

    // Define estilos básicos se necessário
    if (!container.style.position) {
      container.style.position = 'relative';
    }
  }

  /**
   * Junta URLs de forma segura
   */
  private static joinUrl(base: string, path: string): string {
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${normalizedBase}/${normalizedPath}`;
  }

  /**
   * Verifica se o navegador suporta WebGL
   */
  static checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!context;
    } catch {
      return false;
    }
  }

  /**
   * Remove todos os scripts Unity carregados
   */
  static cleanup(): void {
    this.loadedScripts.forEach(scriptUrl => {
      const scripts = document.querySelectorAll(`script[src="${scriptUrl}"]`);
      scripts.forEach(script => script.remove());
    });
    
    this.loadedScripts.clear();
    
    // Remove variáveis globais do Unity
    if (typeof window !== 'undefined') {
      delete (window as any).UnityLoader;
      delete (window as any).Module;
    }
  }
}
