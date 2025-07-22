# 📚 VLibras Player NextJS - Exemplos de Demonstração

Esta pasta contém exemplos completos e funcionais de como implementar o **VLibras Player NextJS** em diferentes cenários de uso.

## 🎯 Exemplos Disponíveis

### 1. 🚀 **demo-simple.tsx** - Exemplo Básico
**Ideal para:** Iniciantes e implementações simples

**Funcionalidades:**
- ✅ Implementação básica com `useVLibrasPlayer`
- ✅ Interface simples e limpa
- ✅ Tradução e reprodução básica
- ✅ Tratamento de erros essencial

**Como usar:**
```bash
# Copie o arquivo para sua aplicação Next.js
cp examples/demo-simple.tsx src/pages/vlibras-simple.tsx
```

---

### 2. 🔥 **demo-complete.tsx** - Exemplo Completo
**Ideal para:** Implementações avançadas e produção

**Funcionalidades:**
- ✅ Todas as funcionalidades do VLibras
- ✅ Interface responsiva com Tailwind CSS
- ✅ Controles avançados de reprodução
- ✅ Histórico de traduções
- ✅ Debug e monitoramento
- ✅ Configurações personalizáveis
- ✅ Sistema de notificações

**Recursos inclusos:**
- 🎛️ Controles de volume e velocidade
- 📝 Editor de texto com contador
- 📊 Estatísticas em tempo real
- 🔧 Painel de debug avançado
- 📱 Design responsivo completo

---

### 3. 🔧 **demo-advanced.tsx** - Uso da Classe VLibrasPlayer
**Ideal para:** Controle manual e múltiplas instâncias

**Funcionalidades:**
- ✅ Uso direto da classe `VLibrasPlayer`
- ✅ Múltiplas instâncias simultâneas
- ✅ Configurações específicas por região (BR/PT)
- ✅ Event listeners personalizados
- ✅ Controle manual completo

**Casos de uso:**
- Múltiplos players na mesma página
- Configurações específicas por contexto
- Integração com sistemas complexos

---

### 4. 🎨 **demo-custom.tsx** - Interface Personalizada
**Ideal para:** Designs únicos e experiências customizadas

**Funcionalidades:**
- ✅ Interface totalmente customizada
- ✅ Gestão de estado complexa
- ✅ Sessões de tradução com histórico
- ✅ Configurações avançadas de UX
- ✅ Analytics e estatísticas

**Recursos especiais:**
- 🎨 Design gradiente moderno
- 📊 Dashboard de métricas
- 🔄 Sistema de sessões
- 📈 Análise de uso

---

### 5. 📊 **demo-dashboard.tsx** - Integração em Dashboard
**Ideal para:** Sistemas de gerenciamento e administrativos

**Funcionalidades:**
- ✅ Layout de dashboard profissional
- ✅ Múltiplas abas organizadas
- ✅ Sistema de notificações em tempo real
- ✅ Métricas e analytics avançadas
- ✅ Configurações administrativas

**Componentes:**
- 📊 Painel de métricas
- 🔔 Sistema de notificações
- ⚙️ Configurações avançadas
- 📈 Analytics detalhadas

## 🛠️ Como Usar os Exemplos

### Pré-requisitos

1. **Instalação da biblioteca:**
```bash
npm install vlibras-player-nextjs
```

2. **Configuração dos arquivos Unity WebGL:**
```bash
# Crie a pasta public/vlibras/target/
mkdir -p public/vlibras/target/

# Copie os arquivos Unity WebGL para esta pasta:
# - playerweb.data.unityweb
# - playerweb.json
# - playerweb.wasm.code.unityweb
# - playerweb.wasm.framework.unityweb
# - UnityLoader.js
```

3. **Tailwind CSS (opcional, mas recomendado):**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Implementação

1. **Escolha o exemplo** que melhor se adequa ao seu caso de uso
2. **Copie o arquivo** para sua aplicação Next.js
3. **Ajuste as importações** conforme sua estrutura de projeto
4. **Customize o design** e funcionalidades conforme necessário

### Exemplo de Integração Rápida

```tsx
// pages/acessibilidade.tsx
import VLibrasSimpleDemo from '../examples/demo-simple';

export default function AcessibilidadePage() {
  return <VLibrasSimpleDemo />;
}
```

## 🎨 Personalização

### Estilos CSS
Todos os exemplos usam **Tailwind CSS**, mas você pode facilmente adaptar para:
- CSS Modules
- Styled Components
- Material-UI
- Chakra UI
- Ou qualquer outro sistema de estilos

### Configurações
Cada exemplo possui comentários detalhados explicando:
- 📝 Parâmetros de configuração
- 🔧 Opções customizáveis
- 💡 Dicas de implementação
- ⚠️ Pontos de atenção

## 📱 Responsividade

Todos os exemplos são **totalmente responsivos** e funcionam em:
- 💻 Desktop
- 📱 Mobile
- 📊 Tablet
- 🖥️ Telas grandes

## 🔍 Debug e Desenvolvimento

### Logs de Debug
Para habilitar logs detalhados durante o desenvolvimento:

```tsx
const { /* hooks */ } = useVLibrasPlayer({
  // ... outras configurações
  enableStats: true, // Habilita estatísticas
  onLoad: () => console.log('✅ VLibras carregado'),
  onError: (error) => console.error('❌ Erro:', error),
});
```

### Ferramentas de Debug
Todos os exemplos incluem:
- 🔍 Estado do Unity WebGL
- 📊 Métricas de performance
- 🎯 Log de eventos
- ⚡ Monitor de carregamento

## 🚀 Dicas de Performance

1. **Lazy Loading:** Carregue o VLibras apenas quando necessário
2. **Memoização:** Use `React.memo` para componentes pesados
3. **Cleanup:** Sempre faça dispose do player quando não precisar
4. **Debounce:** Implemente debounce para traduções em tempo real

## 🆘 Solução de Problemas

### Problemas Comuns

**Player não carrega:**
```bash
# Verifique se os arquivos estão na pasta correta
ls public/vlibras/target/
```

**Erro de CORS:**
```bash
# Execute o Next.js em modo de desenvolvimento
npm run dev
```

**Performance lenta:**
```tsx
// Use apenas uma instância por vez
const [activePlayer, setActivePlayer] = useState<VLibrasPlayer | null>(null);
```

## 📞 Suporte

- 📚 **Documentação:** [README principal](../README.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/vlibras/vlibras-player-nextjs/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/vlibras/vlibras-player-nextjs/discussions)

## 📄 Licença

Estes exemplos estão sob a mesma licença do projeto principal: **MIT License**.

---

**🎯 Escolha o exemplo que melhor se adequa ao seu projeto e comece a implementar acessibilidade em Libras hoje mesmo!**
