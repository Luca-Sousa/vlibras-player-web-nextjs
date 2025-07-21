# vlibras-player-nextjs

> Biblioteca moderna do VLibras Player para Next.js e React com TypeScript

![Version](https://img.shields.io/badge/version-v2.1.1-blue.svg)
![License](https://img.shields.io/badge/license-LGPLv3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![NPM Downloads](https://img.shields.io/npm/dm/vlibras-player-nextjs)

## 🎯 Sobre

O **vlibras-player-nextjs** é uma biblioteca moderna e otimizada do VLibras Player, especialmente desenvolvida para aplicações Next.js e React. Esta biblioteca permite integrar facilmente a tradução automática de texto para Libras (Língua Brasileira de Sinais) em suas aplicações web.

### ✨ Principais Características

- 🚀 **Compatível com Next.js 13+** (App Router e Pages Router)
- 🔷 **TypeScript nativo** com tipagem completa
- ⚛️ **Hooks React modernos** com conexão automática ao DOM
- 🎨 **Componentes estilizados** prontos para uso
- 📱 **Design responsivo** e acessível
- 🌙 **Suporte a tema escuro**
- 🔧 **API moderna** e fácil de usar
- 📦 **Tree-shaking** otimizado
- 🧪 **Totalmente testado**
- 🔄 **Conexão automática** ao container DOM (v2.1.0+)
- 🔧 **Sem duplicação** de containers Unity (v2.1.1+)

## 📦 Instalação

```bash
npm install vlibras-player-nextjs
# ou
yarn add vlibras-player-nextjs
# ou
pnpm add vlibras-player-nextjs
```

## 🚀 Uso Básico

### Hook React (Recomendado) - v2.1.1+

```typescript
'use client';

import { useRef } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

export default function MyComponent() {
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

### Classe VLibras Player (Uso Direto)

```typescript
'use client';

import { VLibrasPlayer } from 'vlibras-player-nextjs';
import { useRef, useEffect, useState } from 'react';

export default function DirectUsage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<VLibrasPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const playerInstance = new VLibrasPlayer({
        targetPath: '/vlibras/target',
        region: 'BR'
      });
      
      playerInstance.load(containerRef.current);
      setPlayer(playerInstance);
    }
  }, []);

  const handleTranslate = async () => {
    if (!player) return;
    
    setIsLoading(true);
    try {
      await player.translate("Olá mundo!");
    } catch (error) {
      console.error('Erro na tradução:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div ref={containerRef} className="vlibras-container" />
      <button onClick={handleTranslate} disabled={!player || isLoading}>
        {isLoading ? 'Traduzindo...' : 'Traduzir'}
      </button>
    </div>
  );
}
```
      player.load(containerRef.current);
    }
  }, [player]);

## 🆕 Novidades da v2.1.1

### 🔧 Bug Crítico de Duplicação Resolvido

A v2.1.1 resolve um **bug crítico** que causava duplicação de containers Unity WebGL:

#### ❌ Problema (v2.1.0 e anteriores)
- 🔴 **Múltiplos containers**: Criava containers duplicados a cada re-render
- 🔴 **Vazamentos de memória**: Containers órfãos não eram limpos
- 🔴 **Performance degradada**: Múltiplas instâncias Unity simultâneas
- 🔴 **IDs aleatórios**: Timestamps únicos impediam reutilização

#### ✅ Solução (v2.1.1)
- 🟢 **Container único**: Reutiliza container existente quando possível
- 🟢 **Cleanup automático**: Remove containers órfãos antes de criar novos
- 🟢 **IDs estáveis**: Baseados na região em vez de timestamps
- 🟢 **Verificação de estado**: Só carrega Unity se necessário

### 🚀 Melhorias Implementadas

1. **Verificação de Container Existente**: Player reutiliza containers quando possível
2. **Cleanup Automático**: Remove containers órfãos para evitar duplicação
3. **IDs Estáveis**: Containers têm IDs previsíveis para melhor reutilização
4. **Dispose Melhorado**: Limpeza completa de estado e recursos
5. **Hook Otimizado**: Dependências otimizadas para evitar re-execuções

## 🔄 Novidades da v2.1.0

### ✅ Hook useVLibrasPlayer Corrigido

O principal problema da v2.0.0 foi resolvido! Agora o hook **conecta automaticamente** ao container DOM:

#### ❌ Antes (v2.0.0 - Quebrado)
```typescript
const { player, translate } = useVLibrasPlayer({ autoInit: true });

// ❌ Necessário fazer conexão manual
useEffect(() => {
  if (containerRef.current && player) {
    player.load(containerRef.current); // ❌ Não funcionava
  }
}, [player]);
```

#### ✅ Agora (v2.1.0+ - Funciona!)
```typescript
const { translate, isReady } = useVLibrasPlayer({
  autoInit: true,
  containerRef  // ✅ Conexão automática!
});

// ✅ Pronto para usar, sem configuração adicional!
```

### 🚀 Funcionalidades v2.1.0

1. **Conexão Automática**: Use `containerRef` para conexão automática
2. **Callbacks de Eventos**: `onLoad`, `onTranslateStart`, `onTranslateEnd`, `onError`
3. **Estado `isReady`**: Saiba quando o player está pronto para uso
4. **Método `connect()`**: Conexão manual quando necessário
5. **Tratamento de Erros Melhorado**: Erros mais informativos
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

### Hook useVLibrasPlayer (v2.1.0+)

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

// Uso do Hook
const {
  // Estado
  player,        // Estado atual do player
  isLoading,     // Se está carregando/traduzindo
  error,         // Erro atual (se houver)
  isReady,       // Se está pronto para uso (v2.1.0+)
  
  // Métodos de Controle
  translate,     // Traduzir texto
  play,          // Reproduzir animação
  pause,         // Pausar animação
  stop,          // Parar animação
  repeat,        // Repetir última animação
  setSpeed,      // Definir velocidade
  toggleSubtitle, // Alternar legendas
  changeAvatar,  // Trocar avatar
  setRegion,     // Definir região
  
  // Conexão Manual (v2.1.0+)
  connect,       // Conectar a container específico
} = useVLibrasPlayer(options);
```

### Classe VLibrasPlayer

```typescript
interface VLibrasPlayerOptions {
  translatorUrl?: string;
  targetPath?: string;
  region?: 'BR' | 'PT';
  enableStats?: boolean;
  onLoad?: () => void;
}

// Uso da Classe
const player = new VLibrasPlayer(options);
player.load(containerElement);
await player.translate(text);
```

  // Métodos de controle
  translate,     // Traduzir texto
  play,          // Reproduzir
  pause,         // Pausar
  stop,          // Parar
  repeat,        // Repetir

  // Configurações
## 🎨 Exemplos Avançados

### Exemplo com Callbacks e Estados

```typescript
'use client';

import { useRef, useState } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

export default function AdvancedExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Aguardando...');
  const [translatedText, setTranslatedText] = useState('');
  
  const { 
    translate, 
    play, 
    pause, 
    stop, 
    setSpeed,
    isReady, 
    isLoading,
    error,
    player 
  } = useVLibrasPlayer({
    autoInit: true,
    containerRef,
    region: 'BR',
    targetPath: '/vlibras/target',
    onLoad: () => setStatus('Player carregado!'),
    onTranslateStart: (text) => {
      setStatus(`Traduzindo: ${text}`);
      setTranslatedText(text);
    },
    onTranslateEnd: (gloss) => setStatus(`Glosa: ${gloss}`),
    onError: (error) => setStatus(`Erro: ${error}`)
  });

  const handleTranslate = async () => {
    const text = prompt('Digite o texto para traduzir:');
    if (text && text.trim()) {
      try {
        await translate(text);
      } catch (err) {
        console.error('Erro na tradução:', err);
      }
    }
  };

  return (
    <div className="vlibras-demo">
      <div ref={containerRef} className="vlibras-container" />
      
      <div className="controls">
        <button onClick={handleTranslate} disabled={!isReady}>
          📝 Traduzir Texto
        </button>
        <button onClick={() => play()} disabled={!isReady}>
          ▶️ Play
        </button>
        <button onClick={pause} disabled={!isReady}>
          ⏸️ Pause
        </button>
        <button onClick={stop} disabled={!isReady}>
          ⏹️ Stop
        </button>
        <button onClick={() => setSpeed(1.5)} disabled={!isReady}>
          ⚡ Velocidade 1.5x
        </button>
      </div>
      
      <div className="status">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Player Status:</strong> {player.status}</p>
        <p><strong>Carregado:</strong> {player.loaded ? 'Sim' : 'Não'}</p>
        <p><strong>Pronto:</strong> {isReady ? 'Sim' : 'Não'}</p>
        <p><strong>Carregando:</strong> {isLoading ? 'Sim' : 'Não'}</p>
        {translatedText && <p><strong>Último texto:</strong> {translatedText}</p>}
        {error && <p style={{ color: 'red' }}><strong>Erro:</strong> {error}</p>}
      </div>
    </div>
  );
}
```

### Conexão Manual Avançada

```typescript
'use client';

import { useRef, useEffect, useState } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

export default function ManualConnectionExample() {
  const [selectedContainer, setSelectedContainer] = useState<string>('container1');
  const container1Ref = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  
  const { connect, translate, isReady } = useVLibrasPlayer({
    autoInit: true,
    // Sem containerRef para conexão manual
  });

  const handleContainerChange = (containerId: string) => {
    setSelectedContainer(containerId);
    
    const container = containerId === 'container1' 
      ? container1Ref.current 
      : container2Ref.current;
      
    if (container) {
      connect(container);
    }
  };

  return (
    <div>
      <div className="container-selection">
        <button onClick={() => handleContainerChange('container1')}>
          Conectar ao Container 1
        </button>
        <button onClick={() => handleContainerChange('container2')}>
          Conectar ao Container 2
        </button>
      </div>
      
      <div className="containers">
        <div 
          ref={container1Ref} 
          className={`vlibras-container ${selectedContainer === 'container1' ? 'active' : ''}`}
          style={{ border: selectedContainer === 'container1' ? '2px solid blue' : '1px solid gray' }}
        />
        <div 
          ref={container2Ref} 
          className={`vlibras-container ${selectedContainer === 'container2' ? 'active' : ''}`}
          style={{ border: selectedContainer === 'container2' ? '2px solid blue' : '1px solid gray' }}
        />
      </div>
      
      <button onClick={() => translate("Olá!")} disabled={!isReady}>
        Traduzir no Container Ativo
      </button>
    </div>
  );
}
```
## ⚙️ Configuração

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

### Estrutura de Arquivos

```
public/
  vlibras/
    target/
      playerweb.data.unityweb
      playerweb.json
      playerweb.wasm.code.unityweb
      playerweb.wasm.framework.unityweb
      UnityLoader.js
```

Os arquivos Unity são incluídos automaticamente na biblioteca, mas você pode substituí-los colocando os arquivos na pasta `public/vlibras/target/`.

## 🔄 Migração

### De v2.1.0 para v2.1.1

A v2.1.1 é **100% retrocompatível** e resolve automaticamente o problema de duplicação:

#### ✅ Sem Mudanças Necessárias
```typescript
// Seu código existente continua funcionando perfeitamente
const { translate, isReady } = useVLibrasPlayer({
  autoInit: true,
  containerRef
});

// ✅ Agora SEM duplicação de containers automático!
```

#### 🚀 Benefícios Automáticos da v2.1.1:
- **Performance melhorada**: Sem containers duplicados
- **Menos uso de memória**: Cleanup automático de recursos
- **Estabilidade**: Comportamento consistente em re-renders
- **React StrictMode**: Funciona perfeitamente com modo estrito

### De v2.0.0 para v2.1.1

Migração recomendada em duas etapas:

#### ✅ Código Recomendado (v2.1.1)
```typescript
const { translate, isReady } = useVLibrasPlayer({
  autoInit: true,
  containerRef  // Conexão automática + sem duplicação
});

// ✅ API moderna sem problemas de performance
```

#### ❌ Código Antigo (ainda funciona, mas não recomendado)
```typescript
const { player, translate } = useVLibrasPlayer({ autoInit: true });

useEffect(() => {
  if (containerRef.current && player) {
    // Conexão manual ainda funciona, mas é desnecessária
    player.load?.(containerRef.current);
  }
}, [player]);
```

### Do VLibras Original

Se você está migrando do VLibras original, a integração é simples:

#### Antes (VLibras Original)
```html
<div vw class="enabled">
  <div vw-access-button class="active"></div>
  <div vw-plugin-wrapper>
    <div class="vw-plugin-top-wrapper"></div>
  </div>
</div>
<script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
<script>
  new window.VLibras.Widget('https://vlibras.gov.br/app');
</script>
```

#### Depois (vlibras-player-nextjs)
```typescript
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

const { translate } = useVLibrasPlayer({
  autoInit: true,
  containerRef
});
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

## ❓ FAQ

### **Hook vs Classe: Qual usar?**

**Hook (Recomendado)**: Use para integração simples em componentes React
```typescript
const { translate, isReady } = useVLibrasPlayer({ autoInit: true, containerRef });
```

**Classe**: Use para controle avançado ou integração com frameworks não-React
```typescript
const player = new VLibrasPlayer(options);
player.load(container);
```

### **Como corrigir "Player não inicializado"?**

**v2.1.0+**: Use `containerRef` para conexão automática
```typescript
const containerRef = useRef<HTMLDivElement>(null);
const { translate } = useVLibrasPlayer({ autoInit: true, containerRef });
```

### **Arquivos Unity não carregam?**

1. Verifique se os arquivos estão em `public/vlibras/target/`
2. Configure os headers CORS no `next.config.js`
3. Use `targetPath: '/vlibras/target'` nas opções

### **Como personalizar o avatar?**

```typescript
const { changeAvatar } = useVLibrasPlayer({ autoInit: true, containerRef });

// Trocar para avatar feminino
changeAvatar('anya');

// Trocar para avatar masculino  
changeAvatar('icaro');
```

### **Funciona com SSR/SSG?**

Sim! Use `'use client'` no componente que usa o VLibras:

```typescript
'use client';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';
```

## 🎯 Compatibilidade

- ✅ **Next.js 13+** (App Router e Pages Router)
- ✅ **React 18+**
- ✅ **TypeScript 5+**
- ✅ **Node.js 16+**
- ✅ **Navegadores modernos** (Chrome 80+, Firefox 74+, Safari 13+)
- ✅ **SSR/SSG** com Next.js
- ✅ **Webpack 5+**
- ✅ **Vite 4+**

## 📊 Performance

- 📦 **Tamanho do bundle**: ~14MB (inclui arquivos Unity WebGL)
- ⚡ **Carregamento inicial**: ~2-3s (dependendo da conexão)
- 🔄 **Tradução**: ~500ms-1s por frase
- 💾 **Uso de memória**: ~50-100MB durante reprodução

## 🛠️ Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/Luca-Sousa/vlibras-player-web-nextjs.git

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test

# Verificação de tipos
npm run type-check
```

## 📄 Licença

Este projeto está licenciado sob a [LGPL v3.0](LICENSE) - veja o arquivo LICENSE para detalhes.

O VLibras é uma tecnologia desenvolvida pelo [Governo Federal do Brasil](https://www.vlibras.gov.br/).

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia nosso [guia de contribuição](CONTRIBUTING.md) antes de submeter um PR.

### Como contribuir:

1. 🍴 Fork o projeto
2. 🌟 Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔀 Abra um Pull Request

## 📞 Suporte

- 📋 **Issues**: [GitHub Issues](https://github.com/Luca-Sousa/vlibras-player-web-nextjs/issues)
- 📧 **Email**: [contato](mailto:lucas.sousa.ldev@gmail.com)
- 📱 **NPM**: [vlibras-player-nextjs](https://www.npmjs.com/package/vlibras-player-nextjs)

## 🙏 Agradecimentos

- [VLibras](https://www.vlibras.gov.br/) - Tecnologia original
- [Unity Technologies](https://unity.com/) - WebGL Runtime
- [Next.js Team](https://nextjs.org/) - Framework
- [React Team](https://reactjs.org/) - Biblioteca

---

<div align="center">
  
**vlibras-player-nextjs v2.1.1** - *Acessibilidade em Libras para React e Next.js* 🤟

[![NPM](https://img.shields.io/npm/v/vlibras-player-nextjs)](https://www.npmjs.com/package/vlibras-player-nextjs)
[![Downloads](https://img.shields.io/npm/dm/vlibras-player-nextjs)](https://www.npmjs.com/package/vlibras-player-nextjs)
[![License](https://img.shields.io/badge/license-LGPLv3-blue.svg)](LICENSE)

</div>
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
