# 🎉 Hook useVLibrasPlayer Corrigido! v2.1.0

## ✅ Problema Resolvido

O hook `useVLibrasPlayer` agora **conecta automaticamente** ao container DOM quando você fornece um `containerRef`. Todos os problemas identificados no relatório de bugs foram corrigidos!

## 🚀 Nova API Simplificada

### ✅ Uso Recomendado (Conexão Automática)

```typescript
import { useRef } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { translate, isReady, isLoading, error } = useVLibrasPlayer({
    autoInit: true,
    containerRef,  // 🔥 CONEXÃO AUTOMÁTICA!
    targetPath: '/vlibras/target',
    region: 'BR',
    onLoad: () => console.log('Player carregado!'),
    onError: (error) => console.error('Erro:', error)
  });

  const handleTranslate = async () => {
    if (!isReady) return;
    
    try {
      await translate("Olá mundo!");
    } catch (error) {
      console.error('Erro na tradução:', error);
    }
  };

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      
      <button 
        onClick={handleTranslate}
        disabled={!isReady || isLoading}
      >
        {isLoading ? 'Traduzindo...' : 'Traduzir'}
      </button>
      
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
    </div>
  );
}
```

### ✅ Uso Alternativo (Conexão Manual)

```typescript
import { useRef, useEffect } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { connect, translate, isReady } = useVLibrasPlayer({
    autoInit: true,
    // Sem containerRef para conexão manual
  });

  useEffect(() => {
    if (containerRef.current) {
      connect(containerRef.current);
    }
  }, [connect]);

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      <button onClick={() => translate("Olá!")} disabled={!isReady}>
        Traduzir
      </button>
    </div>
  );
}
```

## 🆕 Novas Funcionalidades v2.1.0

### 1. **Conexão Automática com `containerRef`**
```typescript
const containerRef = useRef<HTMLDivElement>(null);
const { translate, isReady } = useVLibrasPlayer({
  autoInit: true,
  containerRef  // 🔥 Conecta automaticamente!
});
```

### 2. **Callbacks de Eventos**
```typescript
const { translate } = useVLibrasPlayer({
  autoInit: true,
  containerRef,
  onLoad: () => console.log('Player carregado'),
  onTranslateStart: (text) => console.log('Traduzindo:', text),
  onTranslateEnd: (gloss) => console.log('Glosa:', gloss),
  onError: (error) => console.error('Erro:', error)
});
```

### 3. **Estado `isReady`**
```typescript
const { isReady, translate } = useVLibrasPlayer({
  autoInit: true,
  containerRef
});

// ✅ Só traduz quando o player estiver pronto
if (isReady) {
  await translate("Texto para traduzir");
}
```

### 4. **Método `connect()` Manual**
```typescript
const { connect, isReady } = useVLibrasPlayer({ autoInit: true });

// Conecta manualmente a qualquer elemento
useEffect(() => {
  const container = document.getElementById('meu-container');
  if (container) {
    connect(container);
  }
}, [connect]);
```

### 5. **Tratamento de Erros Melhorado**
```typescript
const { translate, error } = useVLibrasPlayer({
  autoInit: true,
  containerRef,
  onError: (errorMessage) => {
    // Log personalizado de erro
    console.error('VLibras Error:', errorMessage);
  }
});

// Erro também disponível no estado
if (error) {
  console.log('Último erro:', error);
}
```

## 📋 API Completa do Hook

```typescript
interface UseVLibrasPlayerOptions {
  // Configurações do Player
  autoInit?: boolean;                    // Inicializa automaticamente
  containerRef?: RefObject<HTMLElement>; // Ref para conexão automática
  targetPath?: string;                   // Caminho dos arquivos Unity
  translatorUrl?: string;                // URL do serviço de tradução
  region?: 'BR' | 'PT';                 // Região do dicionário
  enableStats?: boolean;                 // Habilitar estatísticas
  
  // Callbacks
  onLoad?: () => void;                   // Player carregado
  onTranslateStart?: (text: string) => void;    // Tradução iniciada
  onTranslateEnd?: (gloss: string) => void;     // Tradução finalizada
  onError?: (error: string) => void;     // Erro ocorrido
}

// Retorno do Hook
interface UseVLibrasPlayerReturn {
  // Estado
  player: VLibrasPlayerState;            // Estado do player
  isLoading: boolean;                    // Se está carregando
  error: string | null;                  // Último erro
  isReady: boolean;                      // Se está pronto para uso
  
  // Métodos de Controle
  translate: (text: string, options?: TranslationOptions) => Promise<void>;
  play: (gloss?: string, options?: TranslationOptions) => void;
  pause: () => void;
  stop: () => void;
  repeat: () => void;
  setSpeed: (speed: number) => void;
  toggleSubtitle: () => void;
  changeAvatar: (avatarName: string) => void;
  setRegion: (region: 'BR' | 'PT') => void;
  
  // Conexão Manual
  connect: (container: HTMLElement) => void;
  containerRef?: RefObject<HTMLElement>;
}
```

## 🔄 Migração da v2.0.0 para v2.1.0

### ❌ Código Antigo (v2.0.0 - Quebrado)
```typescript
const { player, translate } = useVLibrasPlayer({ autoInit: true });

// ❌ Necessário fazer conexão manual
useEffect(() => {
  if (containerRef.current && player) {
    player.load(containerRef.current); // ❌ Não funcionava
  }
}, [player]);
```

### ✅ Código Novo (v2.1.0 - Funciona)
```typescript
const { translate, isReady } = useVLibrasPlayer({
  autoInit: true,
  containerRef  // ✅ Conexão automática!
});

// ✅ Pronto para usar, sem configuração adicional!
```

## 🧪 Exemplos de Uso

### Exemplo 1: Básico
```typescript
function BasicExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { translate, isReady } = useVLibrasPlayer({
    autoInit: true,
    containerRef
  });

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      <button onClick={() => translate("Olá mundo!")} disabled={!isReady}>
        Traduzir
      </button>
    </div>
  );
}
```

### Exemplo 2: Com Callbacks
```typescript
function CallbackExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Aguardando...');
  
  const { translate, isReady } = useVLibrasPlayer({
    autoInit: true,
    containerRef,
    onLoad: () => setStatus('Player carregado!'),
    onTranslateStart: (text) => setStatus(`Traduzindo: ${text}`),
    onTranslateEnd: () => setStatus('Tradução concluída!'),
    onError: (error) => setStatus(`Erro: ${error}`)
  });

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      <p>Status: {status}</p>
      <button onClick={() => translate("Teste")} disabled={!isReady}>
        Traduzir
      </button>
    </div>
  );
}
```

### Exemplo 3: Controles Avançados
```typescript
function AdvancedExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    translate, 
    play, 
    pause, 
    stop, 
    setSpeed,
    isReady, 
    isLoading,
    player 
  } = useVLibrasPlayer({
    autoInit: true,
    containerRef,
    region: 'BR'
  });

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      
      <div className="controls">
        <button onClick={() => translate("Olá!")} disabled={!isReady}>
          Traduzir
        </button>
        <button onClick={() => play()} disabled={!isReady}>
          Play
        </button>
        <button onClick={pause} disabled={!isReady}>
          Pause
        </button>
        <button onClick={stop} disabled={!isReady}>
          Stop
        </button>
        <button onClick={() => setSpeed(1.5)} disabled={!isReady}>
          Velocidade 1.5x
        </button>
      </div>
      
      <div className="status">
        <p>Status: {player.status}</p>
        <p>Carregado: {player.loaded ? 'Sim' : 'Não'}</p>
        <p>Carregando: {isLoading ? 'Sim' : 'Não'}</p>
        <p>Pronto: {isReady ? 'Sim' : 'Não'}</p>
      </div>
    </div>
  );
}
```

## 📦 Instalação/Atualização

```bash
# Instalar/Atualizar para v2.1.0
npm install vlibras-player-nextjs@latest

# Ou usando yarn
yarn add vlibras-player-nextjs@latest
```

## 🎯 Compatibilidade

- ✅ **Retrocompatível** com código da v2.0.0
- ✅ **Next.js 13+** com App Router
- ✅ **React 18+**
- ✅ **TypeScript 5+**
- ✅ **Servidor e Cliente** (SSR/SSG)

## 🐛 Problemas Resolvidos

1. ✅ **Conexão automática ao container**
2. ✅ **Experiência de desenvolvedor melhorada**
3. ✅ **Tratamento de erros mais robusto**
4. ✅ **API consistente entre classe e hook**
5. ✅ **Documentação clara e exemplos práticos**

---

**vlibras-player-nextjs v2.1.0** - *Hook useVLibrasPlayer totalmente funcional!* 🎉
