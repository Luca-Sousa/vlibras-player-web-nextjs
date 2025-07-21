<div align="center">
  <a href="https://www.vlibras.gov.br/">
    <img
      alt="VLibras"
      src="https://www.vlibras.gov.br/assets/imgs/IcaroGrande.png"
      width="120"
    />
  </a>
</div>

# @vlibras/player-nextjs

> Biblioteca moderna do VLibras Player para Next.js e React com TypeScript

![Version](https://img.shields.io/badge/version-v2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-LGPLv3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)

## 🎯 Sobre

O **@vlibras/player-nextjs** é uma biblioteca moderna e otimizada do VLibras Player, especialmente desenvolvida para aplicações Next.js e React. Esta biblioteca permite integrar facilmente a tradução automática de texto para Libras (Língua Brasileira de Sinais) em suas aplicações web.

### ✨ Principais Características

- 🚀 **Compatível com Next.js 13+** (App Router e Pages Router)
- 🔷 **TypeScript nativo** com tipagem completa
- ⚛️ **Hooks React modernos** para fácil integração
- 🎨 **Componentes estilizados** prontos para uso
- 📱 **Design responsivo** e acessível
- 🌙 **Suporte a tema escuro**
- 🔧 **API moderna** e fácil de usar
- 📦 **Tree-shaking** otimizado
- 🧪 **Totalmente testado**

## 📦 Instalação

```bash
npm install @vlibras/player-nextjs
# ou
yarn add @vlibras/player-nextjs
# ou
pnpm add @vlibras/player-nextjs
```

## 🚀 Uso Básico

### Hook React (Recomendado)

```tsx
'use client';

import { useVLibrasPlayer } from '@vlibras/player-nextjs';
import { useRef, useEffect } from 'react';

export default function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    translate, 
    play, 
    pause, 
    stop, 
    player, 
    isLoading, 
    error 
  } = useVLibrasPlayer({
    autoInit: true
  });

  // Inicializar o player
  useEffect(() => {
    if (containerRef.current) {
      player.load(containerRef.current);
    }
  }, [player]);

  const handleTranslate = async () => {
    await translate('Olá mundo!');
  };

  return (
    <div>
      <div 
        ref={containerRef} 
        className="vlibras-container w-full h-64 border rounded"
      />
      
      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      
      <button onClick={handleTranslate}>Traduzir</button>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pausar</button>
      <button onClick={stop}>Parar</button>
    </div>
  );
}
```

### Uso Direto com Classe

```tsx
'use client';

import { VLibrasPlayer } from '@vlibras/player-nextjs';
import { useRef, useEffect } from 'react';

export default function DirectUsage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VLibrasPlayer | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      playerRef.current = new VLibrasPlayer({
        targetPath: '/vlibras-web',
        translatorUrl: 'https://api.vlibras.gov.br'
      });
      
      playerRef.current.load(containerRef.current);
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  const handleTranslate = async () => {
    if (playerRef.current) {
      await playerRef.current.translate('Olá mundo!');
    }
  };

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      <button onClick={handleTranslate}>Traduzir</button>
    </div>
  );
}
        </button>
        <button onClick={() => play()}>Play</button>
        <button onClick={() => pause()}>Pause</button>
      </div>
      
      <div className="status">
        Status: {player.status} | Carregado: {player.loaded ? 'Sim' : 'Não'}
      </div>
    </div>
  );
}
```

## 🔧 API Completa

### Props do VLibrasPlayer

```tsx
interface VLibrasPlayerProps {
  // Configuração básica
  translatorUrl?: string;
  targetPath?: string;
  region?: 'BR' | 'PT';
  enableStats?: boolean;

  // Estilização
  className?: string;
  style?: CSSProperties;
  id?: string;

  // Comportamento
  autoInit?: boolean;
  initialText?: string;

  // Callbacks
  onLoad?: () => void;
  onTranslateStart?: () => void;
  onTranslateEnd?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
```

### Hook useVLibrasPlayer

```tsx
const {
  // Estado do player
  player,        // Estado atual do player
  isLoading,     // Se está carregando/traduzindo
  error,         // Erro atual (se houver)

  // Métodos de controle
  translate,     // Traduzir texto
  play,          // Reproduzir
  pause,         // Pausar
  stop,          // Parar
  repeat,        // Repetir

  // Configurações
  setSpeed,      // Velocidade (0.5 - 2.0)
  toggleSubtitle,// Alternar legendas
  changeAvatar,  // Trocar avatar
  setRegion,     // Definir região (BR/PT)
} = useVLibrasPlayer(options);
```

## 🎨 Estilos e Temas

A biblioteca inclui estilos CSS básicos que podem ser customizados:

```css
/* Importar estilos base */
@import '@vlibras/player-nextjs/styles';

/* Customização */
.vlibras-player-container {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vlibras-player-container[data-status="playing"] {
  border: 2px solid #00d4aa;
}
```

## 🔧 Configuração Avançada

### Next.js (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para WebGL/Unity
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  
  // Headers para WebGL
  async headers() {
    return [
      {
        source: '/vlibras/target/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Arquivos Unity (public/vlibras/target/)

Coloque os arquivos Unity WebGL no diretório público:

```
public/
└── vlibras/
    └── target/
        ├── UnityLoader.js
        ├── playerweb.json
        ├── playerweb.data.unityweb
        ├── playerweb.wasm.code.unityweb
        └── playerweb.wasm.framework.unityweb
```

## 📱 Exemplo Completo

```tsx
'use client';

import React, { useRef, useState } from 'react';
import { VLibrasPlayer, type VLibrasPlayerRef } from '@vlibras/player-nextjs';

export default function VLibrasDemo() {
  const playerRef = useRef<VLibrasPlayerRef>(null);
  const [text, setText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim() || !playerRef.current) return;
    
    setIsTranslating(true);
    try {
      await playerRef.current.translate(text);
    } catch (error) {
      console.error('Erro na tradução:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Demo VLibras Player</h1>
      
      {/* Player */}
      <div className="mb-6">
        <VLibrasPlayer
          ref={playerRef}
          className="w-full h-80 rounded-lg shadow-lg"
          onLoad={() => console.log('Player carregado!')}
          onError={(error) => console.error('Erro:', error)}
        />
      </div>

      {/* Controles */}
      <div className="space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite o texto para traduzir para Libras..."
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !text.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isTranslating ? 'Traduzindo...' : 'Traduzir'}
          </button>
          
          <button
            onClick={() => playerRef.current?.play()}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Play
          </button>
          
          <button
            onClick={() => playerRef.current?.pause()}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Pause
          </button>
          
          <button
            onClick={() => playerRef.current?.stop()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso [guia de contribuição](CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto está licenciado sob a [LGPL-3.0](LICENSE) - veja o arquivo LICENSE para detalhes.

## 👥 Créditos

- **Equipe VLibras Original:** Criadores da tecnologia base
- **Comunidade Next.js:** Inspiração e melhores práticas
- **Contribuidores:** Todos que ajudaram a modernizar esta biblioteca

---

<div align="center">
  <p>Feito com ❤️ para democratizar o acesso à Libras na web</p>
</div>
