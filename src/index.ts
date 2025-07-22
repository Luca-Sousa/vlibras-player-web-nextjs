// Hooks React para controle avançado
export { useVLibrasPlayer } from './hooks/use-vlibras-player';

// Core classes (para uso direto)
export { VLibrasPlayer } from './core/vlibras-player';
export { VLibrasTranslator } from './core/translator';
export { UnityPlayerManager } from './core/unity-player-manager';
export { UnityLoader } from './core/unity-loader';

// Utilitários
export { UnityStateManager } from './utils/unity-state-manager';

// Configurações
export { defaultConfig, PLAYER_STATUSES, DEFAULT_PLAYER_OPTIONS } from './core/config';

// Tipos TypeScript
export type {
  VLibrasPlayerOptions,
  VLibrasPlayerState,
  VLibrasPlayerCallbacks,
  UseVLibrasPlayer,
  TranslationOptions,
  PersonalizationConfig,
  PlayerStatus,
  UnityPlayerInstance,
  VLibrasConfig,
  UnityDebugInfo,
} from './types';

// Versão da biblioteca
export const VERSION = '2.4.1';
