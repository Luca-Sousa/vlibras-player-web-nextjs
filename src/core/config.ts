import type { VLibrasConfig } from '@/types';

/**
 * Configuração padrão do VLibras
 */
export const defaultConfig: VLibrasConfig = {
  translatorUrl: 'https://traducao2-dth.vlibras.gov.br/dl/translate',
  dictionaryUrl: 'https://dicionario2-dth.vlibras.gov.br/2018.3.1/WEBGL/',
  dictionaryStaticUrl: 'https://dicionario2-dth.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/',
};

/**
 * Status do player
 */
export const PLAYER_STATUSES = {
  idle: 'idle',
  preparing: 'preparing',
  playing: 'playing',
} as const;

/**
 * Configurações padrão do player
 */
export const DEFAULT_PLAYER_OPTIONS = {
  translatorUrl: defaultConfig.translatorUrl,
  targetPath: '/vlibras/target',
  region: 'BR',
  enableStats: true,
  autoInit: true,
} as const;

/**
 * Nomes dos objetos Unity
 */
export const UNITY_GAME_OBJECTS = {
  playerManager: 'PlayerManager',
  customizationBridge: 'CustomizationBridge',
} as const;

/**
 * Timeouts padrão
 */
export const TIMEOUTS = {
  translation: 10000, // 10 segundos base
  translationPerWord: 400, // 400ms por palavra adicional
  maxTranslationTimeout: 60000, // 60 segundos máximo
} as const;
