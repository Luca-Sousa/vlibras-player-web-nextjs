import type { CSSProperties } from 'react';

// Callbacks de estado para monitorar eventos do player
export interface VLibrasPlayerCallbacks {
  /** Callback executado quando uma tradução é iniciada */
  onTranslationStart?: () => void;
  /** Callback executado quando uma tradução é finalizada */
  onTranslationEnd?: () => void;
  /** Callback executado quando há erro na tradução */
  onTranslationError?: (error: string) => void;
  /** Callback executado quando a reprodução é iniciada */
  onPlay?: () => void;
  /** Callback executado quando a reprodução é pausada */
  onPause?: () => void;
  /** Callback executado quando a reprodução é interrompida */
  onStop?: () => void;
  /** Callback executado quando o player está pronto para uso */
  onPlayerReady?: () => void;
  /** Callback executado quando há erro no player */
  onPlayerError?: (error: string) => void;
}

// Tipos principais para o VLibras Player
export interface VLibrasPlayerOptions extends VLibrasPlayerCallbacks {
  /** URL do serviço de tradução */
  translatorUrl?: string;
  /** Caminho para os arquivos Unity WebGL */
  targetPath?: string;
  /** Callback executado quando o player é carregado */
  onLoad?: () => void;
  /** Função de progresso customizada */
  progress?: (wrapper: HTMLElement) => any;
  /** Configurações de personalização do avatar */
  personalization?: PersonalizationConfig;
  /** Região para dicionário de sinais */
  region?: 'BR' | 'PT';
  /** Habilitar/desabilitar estatísticas */
  enableStats?: boolean;
}

export interface PersonalizationConfig {
  /** Nome do avatar */
  avatar?: string;
  /** Configurações de aparência */
  appearance?: {
    skinColor?: string;
    hairColor?: string;
    clothingColor?: string;
  };
}

export interface TranslationOptions {
  /** Habilitar estatísticas na tradução */
  isEnabledStats?: boolean;
  /** Indica se a tradução vem do processo de tradução automática */
  fromTranslation?: boolean;
}

export interface VLibrasPlayerState {
  /** Status atual do player */
  status: PlayerStatus;
  /** Se o player está carregado */
  loaded: boolean;
  /** Texto original */
  text?: string;
  /** Glosa traduzida */
  gloss?: string;
  /** Se foi traduzido */
  translated: boolean;
  /** Progresso da animação (0-1) */
  progress: number | null;
  /** Região atual */
  region: string;
  /** Se está traduzindo no momento */
  isTranslating: boolean;
  /** Se está reproduzindo no momento */
  isPlaying: boolean;
}

export type PlayerStatus = 'idle' | 'preparing' | 'playing' | 'translating';

export interface VLibrasPlayerEvents {
  /** Disparado quando o player é carregado */
  'load': () => void;
  /** Disparado quando a tradução inicia */
  'translate:start': () => void;
  /** Disparado quando a tradução termina */
  'translate:end': () => void;
  /** Disparado quando a animação inicia */
  'animation:play': () => void;
  /** Disparado quando a animação é pausada */
  'animation:pause': () => void;
  /** Disparado quando a animação termina */
  'animation:end': () => void;
  /** Disparado durante o progresso da animação */
  'animation:progress': (progress: number) => void;
  /** Disparado quando a glosa inicia */
  'gloss:start': () => void;
  /** Disparado quando a glosa termina */
  'gloss:end': (length: number) => void;
  /** Disparado quando há erro */
  'error': (error: string) => void;
  /** Disparado quando o avatar é alterado */
  'avatar:change': (avatar: string) => void;
  /** Disparado quando a apresentação de boas-vindas inicia */
  'welcome:start': () => void;
  /** Disparado quando a apresentação de boas-vindas termina */
  'welcome:end': (finished: boolean) => void;
  /** Disparado com informações da glosa */
  'gloss:info': (counter: number, length: number) => void;
}

export interface UnityPlayerInstance {
  SendMessage: (gameObject: string, method: string, params?: any) => void;
}

export interface VLibrasConfig {
  translatorUrl: string;
  dictionaryUrl: string;
  dictionaryStaticUrl: string;
}

// Props para componentes React
export interface VLibrasPlayerProps extends VLibrasPlayerOptions {
  /** Classe CSS para o container */
  className?: string;
  /** Estilo inline para o container */
  style?: CSSProperties;
  /** ID do elemento container */
  id?: string;
  /** Se deve inicializar automaticamente */
  autoInit?: boolean;
  /** Texto inicial para traduzir */
  initialText?: string;
  /** Callbacks para eventos */
  onLoad?: () => void;
  onTranslateStart?: () => void;
  onTranslateEnd?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface VLibrasWidgetProps extends VLibrasPlayerProps {
  /** Posição do widget na tela */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Se o widget deve ser draggable */
  draggable?: boolean;
  /** Se deve mostrar controles */
  showControls?: boolean;
  /** Tema do widget */
  theme?: 'light' | 'dark' | 'auto';
}

// Hook return types
export interface UseVLibrasPlayer {
  /** Instância do player */
  player: VLibrasPlayerState;
  /** Função para traduzir texto */
  translate: (text: string, options?: TranslationOptions) => Promise<void>;
  /** Função para reproduzir */
  play: (gloss?: string, options?: TranslationOptions) => void;
  /** Função para pausar */
  pause: () => void;
  /** Função para parar */
  stop: () => void;
  /** Função para repetir */
  repeat: () => void;
  /** Função para definir velocidade */
  setSpeed: (speed: number) => void;
  /** Função para alternar legendas */
  toggleSubtitle: () => void;
  /** Função para trocar avatar */
  changeAvatar: (avatarName: string) => void;
  /** Função para definir região */
  setRegion: (region: 'BR' | 'PT') => void;
  /** Função para conectar manualmente a um container */
  connect: (container: HTMLElement) => void;
  /** Se está carregando */
  isLoading: boolean;
  /** Se há erro */
  error: string | null;
  /** Se está traduzindo no momento (baseado em eventos reais) */
  isTranslating: boolean;
  /** Se está reproduzindo no momento (baseado em eventos reais) */
  isPlaying: boolean;
}

export interface VLibrasContextValue extends UseVLibrasPlayer {
  /** Se o provider está inicializado */
  isInitialized: boolean;
}

// Ref type para o componente VLibrasPlayer
export interface VLibrasPlayerRef {
  /** Traduzir texto para Libras */
  translate: (text: string, options?: TranslationOptions) => Promise<void>;
  /** Tocar animação com glosa */
  play: (gloss?: string, options?: TranslationOptions) => void;
  /** Pausar animação */
  pause: () => void;
  /** Parar animação */
  stop: () => void;
  /** Repetir animação */
  repeat: () => void;
  /** Definir velocidade de reprodução */
  setSpeed: (speed: number) => void;
  /** Alternar legendas */
  toggleSubtitle: () => void;
  /** Trocar avatar */
  changeAvatar: (avatarName: string) => void;
  /** Definir região */
  setRegion: (region: 'BR' | 'PT') => void;
  /** Obter estado atual */
  getState: () => VLibrasPlayerState;
}
