# 📚 Documentação: Callbacks de Estado VLibras v2.2.0

## 🎯 Visão Geral

A partir da versão **v2.2.0**, a biblioteca `vlibras-player-nextjs` inclui **callbacks de estado** que permitem monitorar eventos reais do VLibras Player. Esta funcionalidade resolve o problema de não saber quando as traduções e animações realmente começam, terminam ou falham.

## 🔧 API dos Callbacks

### Interface VLibrasPlayerCallbacks

```typescript
interface VLibrasPlayerCallbacks {
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
```

### Novos Estados no Hook

```typescript
const {
  // Estados existentes
  translate, play, pause, stop,
  isLoading, error, player,
  
  // ✅ Novos estados baseados em eventos reais
  isTranslating, // boolean - Se está traduzindo no momento
  isPlaying,     // boolean - Se está reproduzindo no momento
} = useVLibrasPlayer({ /* options */ });
```

## 🚀 Uso Básico

### 1. Hook com Callbacks

```typescript
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

function MyComponent() {
  const [status, setStatus] = useState('Pronto');
  
  const { translate, isTranslating, isPlaying } = useVLibrasPlayer({
    autoInit: true,
    containerRef: containerRef,
    
    // Callbacks de tradução
    onTranslationStart: () => {
      setStatus('Traduzindo...');
      console.log('🎬 Tradução iniciada');
    },
    
    onTranslationEnd: () => {
      setStatus('Tradução concluída');
      console.log('✅ Tradução finalizada');
    },
    
    onTranslationError: (error) => {
      setStatus(`Erro: ${error}`);
      console.error('❌ Erro na tradução:', error);
    },
    
    // Callbacks de reprodução
    onPlay: () => {
      console.log('▶️ Reprodução iniciada');
    },
    
    onPause: () => {
      console.log('⏸️ Reprodução pausada');
    },
    
    onStop: () => {
      console.log('⏹️ Reprodução parada');
    },
    
    // Callbacks do player
    onPlayerReady: () => {
      console.log('🚀 Player está pronto');
    },
    
    onPlayerError: (error) => {
      console.error('💥 Erro no player:', error);
    },
  });
  
  return (
    <div>
      <p>Status: {status}</p>
      <p>Traduzindo: {isTranslating ? 'Sim' : 'Não'}</p>
      <p>Reproduzindo: {isPlaying ? 'Sim' : 'Não'}</p>
      
      <button 
        onClick={() => translate('Olá mundo!')}
        disabled={isTranslating}
      >
        {isTranslating ? 'Traduzindo...' : 'Traduzir'}
      </button>
    </div>
  );
}
```

### 2. Interface Responsiva

```typescript
function ResponsiveInterface() {
  const { 
    translate, 
    play, 
    pause, 
    stop,
    isTranslating, 
    isPlaying,
    error 
  } = useVLibrasPlayer({
    onTranslationStart: () => setIsTranslating(true),
    onTranslationEnd: () => setIsTranslating(false),
    onPlay: () => setIsPlaying(true),
    onStop: () => setIsPlaying(false),
  });
  
  return (
    <div>
      {/* Botão que reflete estado real */}
      <button 
        onClick={() => translate(text)}
        disabled={isTranslating}
        style={{ 
          backgroundColor: isTranslating ? '#ffa500' : '#007bff',
          opacity: isTranslating ? 0.7 : 1 
        }}
      >
        {isTranslating ? '⏳ Traduzindo...' : '📝 Traduzir'}
      </button>
      
      {/* Controles de reprodução precisos */}
      <button onClick={play} disabled={isPlaying}>
        ▶️ Reproduzir
      </button>
      
      <button onClick={pause} disabled={!isPlaying}>
        ⏸️ Pausar
      </button>
      
      <button onClick={stop} disabled={!isPlaying}>
        ⏹️ Parar
      </button>
      
      {/* Indicador visual preciso */}
      {isPlaying && <div className="playing-indicator">🎭 Avatar reproduzindo</div>}
      {isTranslating && <div className="translating-indicator">🔄 Traduzindo texto</div>}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## 📊 Casos de Uso Avançados

### 1. Analytics e Logging

```typescript
const { translate } = useVLibrasPlayer({
  onTranslationStart: () => {
    // Analytics
    analytics.track('vlibras_translation_started', {
      timestamp: Date.now(),
      user_id: userId
    });
  },
  
  onTranslationEnd: () => {
    analytics.track('vlibras_translation_completed', {
      timestamp: Date.now(),
      success: true
    });
  },
  
  onTranslationError: (error) => {
    analytics.track('vlibras_translation_failed', {
      error: error,
      timestamp: Date.now()
    });
    
    // Log para debugging
    logger.error('VLibras translation failed', { error, userId });
  },
});
```

### 2. Estado Global (Redux/Zustand)

```typescript
// Com Redux
const { translate } = useVLibrasPlayer({
  onTranslationStart: () => dispatch({ type: 'VLIBRAS_TRANSLATION_START' }),
  onTranslationEnd: () => dispatch({ type: 'VLIBRAS_TRANSLATION_END' }),
  onTranslationError: (error) => dispatch({ 
    type: 'VLIBRAS_TRANSLATION_ERROR', 
    payload: error 
  }),
});

// Com Zustand
const { translate } = useVLibrasPlayer({
  onTranslationStart: () => useVLibrasStore.setState({ isTranslating: true }),
  onTranslationEnd: () => useVLibrasStore.setState({ isTranslating: false }),
  onPlay: () => useVLibrasStore.setState({ isPlaying: true }),
  onStop: () => useVLibrasStore.setState({ isPlaying: false }),
});
```

### 3. Notificações Toast

```typescript
import { toast } from 'react-toastify';

const { translate } = useVLibrasPlayer({
  onTranslationStart: () => {
    toast.info('🎬 Iniciando tradução...', { autoClose: 2000 });
  },
  
  onTranslationEnd: () => {
    toast.success('✅ Tradução concluída!', { autoClose: 3000 });
  },
  
  onTranslationError: (error) => {
    toast.error(`❌ Erro na tradução: ${error}`, { autoClose: 5000 });
  },
  
  onPlayerError: (error) => {
    toast.error(`💥 Erro no player: ${error}`, { autoClose: 5000 });
  },
});
```

### 4. Progressão de Estados

```typescript
function ProgressiveUI() {
  const [currentStep, setCurrentStep] = useState('idle');
  
  const { translate } = useVLibrasPlayer({
    onTranslationStart: () => setCurrentStep('translating'),
    onTranslationEnd: () => setCurrentStep('translated'),
    onPlay: () => setCurrentStep('playing'),
    onStop: () => setCurrentStep('idle'),
    onTranslationError: () => setCurrentStep('error'),
  });
  
  const getStepMessage = () => {
    switch (currentStep) {
      case 'translating': return '🔄 Processando texto...';
      case 'translated': return '✅ Texto processado, pronto para reproduzir';
      case 'playing': return '🎭 Avatar reproduzindo tradução';
      case 'error': return '❌ Erro no processamento';
      default: return '⭐ Pronto para traduzir';
    }
  };
  
  return (
    <div>
      <div className={`status-indicator status-${currentStep}`}>
        {getStepMessage()}
      </div>
      
      <progress 
        value={currentStep === 'idle' ? 0 : currentStep === 'playing' ? 100 : 50} 
        max="100"
      />
    </div>
  );
}
```

## 🔄 Comparação: Antes vs Depois

### ❌ Antes (Situação Anterior)

```typescript
// Tinha que usar timers artificiais
const handleTranslate = async () => {
  setIsTranslating(true); // Estimativa
  await translate(text);
  
  // ❌ Não sabemos quando realmente terminou
  setTimeout(() => {
    setIsTranslating(false); // Chute baseado no tamanho do texto
  }, text.length * 100); // Estimativa imprecisa
};
```

### ✅ Depois (Com Callbacks)

```typescript
// Estado atualizado automaticamente pelos eventos reais
const { translate, isTranslating } = useVLibrasPlayer({
  onTranslationStart: () => setStatus('Traduzindo...'),
  onTranslationEnd: () => setStatus('Concluído'),
});

const handleTranslate = async () => {
  await translate(text);
  // ✅ isTranslating é atualizado automaticamente pelos eventos reais
};
```

## 📝 Notas Importantes

### Retrocompatibilidade
- ✅ **Todos os callbacks são opcionais**
- ✅ **API anterior continua funcionando**
- ✅ **Sem breaking changes**

### Performance
- ✅ **Eventos nativos do Unity WebGL**
- ✅ **Sem polling ou timers**
- ✅ **Estado precisos e instantâneos**

### Compatibilidade
- ✅ **React 18+**
- ✅ **Next.js 13+**
- ✅ **TypeScript com tipagem completa**

## 🐛 Troubleshooting

### Callbacks não são chamados

1. **Verifique se o player foi inicializado:**
   ```typescript
   const { player } = useVLibrasPlayer();
   if (!player.loaded) {
     // Player ainda não está carregado
   }
   ```

2. **Verifique se Unity WebGL carregou:**
   ```typescript
   const { translate } = useVLibrasPlayer({
     onPlayerReady: () => console.log('Unity carregado!'),
     onPlayerError: (error) => console.error('Erro Unity:', error),
   });
   ```

### Estados inconsistentes

1. **Use sempre os estados do hook:**
   ```typescript
   // ✅ Correto
   const { isTranslating, isPlaying } = useVLibrasPlayer();
   
   // ❌ Incorreto
   const [isTranslating, setIsTranslating] = useState(false);
   ```

2. **Callbacks são executados após mudanças de estado:**
   ```typescript
   const { isTranslating } = useVLibrasPlayer({
     onTranslationStart: () => {
       // isTranslating já será true aqui
       console.log('Estado:', isTranslating); // true
     }
   });
   ```

## 🎉 Exemplos Completos

Veja o arquivo `examples/callbacks-example.tsx` para um exemplo completo e interativo de todos os callbacks em ação.

---

**Versão:** v2.2.0  
**Compatibilidade:** React 18+, Next.js 13+  
**TypeScript:** Suporte completo com tipagem  
**Status:** ✅ Estável e pronto para produção
