"use client";

import React, { useRef, useState } from "react";
import { useVLibrasPlayer } from "vlibras-player-nextjs";

/**
 * 🪝 DEMONSTRAÇÃO OFICIAL DO HOOK VLIBRAS PLAYER
 * 
 * Demonstração completa do Hook useVLibrasPlayer para Next.js
 * 
 * ✅ FUNCIONALIDADES:
 * - Tradução automática de texto para Libras via Hook
 * - Controles completos de reprodução (play, pause, resume, restart, stop)
 * - Sistema avançado de eventos e callbacks via Hook
 * - Interface visual com logs em tempo real
 * - Cores semânticas para melhor experiência
 * - Controles inteligentes com ativação contextual
 */

export default function VLibrasPlayerHookDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('Não iniciado');

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' | 'separator' | 'start' | 'stop' | 'pause' | 'resume' | 'restart' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      separator: '📋',
      start: '🟢',
      stop: '🔴',
      pause: '🟠',
      resume: '🟡',
      restart: '🔵'
    }[type];
    
    setEventLog(prev => [...prev, `${timestamp} ${emoji} ${message}`].slice(-50));
  };

  const {
    player,
    isLoading,
    error,
    isReady,
    isTranslating,
    isPlaying,
    // Métodos principais
    translate,
    pause,
    resume,
    stop,
    restart,
    initializePlayer,
  } = useVLibrasPlayer({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    autoInit: false, // Inicialização manual
    // Configurações necessárias (como na demo da classe)
    targetPath: '/vlibras/target',
    region: 'BR',
    enableStats: true,
    // 📋 CALLBACKS PRINCIPAIS via Hook (seguindo padrão da demo da classe)
    onLoad: () => {
      addLog('HOOK: onLoad() - Player completamente pronto via Hook', 'success');
      setCurrentStatus('Pronto');
    },
    onPlayerError: (err) => {
      addLog(`HOOK: onPlayerError() - ${err} via Hook (não fatal)`, 'warning');
      // NÃO alterar status - erro pode não ser fatal
    },
    onTranslationStart: () => {
      addLog('HOOK: onTranslationStart() - Tradução iniciada via Hook', 'start');
      setCurrentStatus('Traduzindo...');
    },
    onTranslationEnd: () => {
      addLog('HOOK: onTranslationEnd() - Tradução concluída via Hook', 'success');
      setCurrentStatus('Concluído');
    },
    onTranslationError: (err) => {
      addLog(`HOOK: onTranslationError() - ${err} via Hook (não fatal)`, 'warning');
      // NÃO alterar status - erro pode não ser fatal (como visto na demo da classe)
    },
    onPlay: () => {
      addLog('HOOK: onPlay() - Reprodução iniciada via Hook', 'start');
      setCurrentStatus('Reproduzindo...');
    },
    onPause: () => {
      addLog('HOOK: onPause() - Reprodução pausada via Hook', 'pause');
      setCurrentStatus('Pausado');
    },
    onResume: () => {
      addLog('HOOK: onResume() - Reprodução retomada via Hook', 'resume');
      setCurrentStatus('Reproduzindo...');
    },
    onRestart: () => {
      addLog('HOOK: onRestart() - Animação reiniciada via Hook', 'restart');
      setCurrentStatus('Reiniciando...');
    },
    onStop: () => {
      addLog('HOOK: onStop() - Reprodução parada via Hook', 'stop');
      setCurrentStatus('Parado');
    },
  });

  const handleInitializePlayer = () => {
    addLog('═══════════════════════════════════════', 'separator');
    addLog('🪝 INICIALIZANDO VLIBRAS PLAYER VIA HOOK', 'separator');
    addLog('═══════════════════════════════════════', 'separator');
    setCurrentStatus('Inicializando...');
    initializePlayer();
  };

  const testTranslation = async (text: string) => {
    if (!isReady) {
      addLog('Hook: Player não está pronto para traduzir', 'warning');
      return;
    }

    addLog('═══════════════════════════════════════', 'separator');
    addLog(`🪝 TRADUZINDO VIA HOOK: "${text}"`, 'separator');
    addLog('═══════════════════════════════════════', 'separator');
    addLog('📋 Sequência de eventos esperada via Hook:', 'info');
    addLog('1️⃣ onTranslationStart (via Hook)', 'info');
    addLog('2️⃣ onPlay (quando Unity inicia via Hook)', 'info');
    addLog('3️⃣ Reprodução da animação', 'info');
    addLog('4️⃣ onStop (quando Unity termina via Hook)', 'info');
    addLog('5️⃣ onTranslationEnd (quando tradução finaliza via Hook)', 'info');
    addLog('───────────────────────────────────────', 'separator');
    addLog('🔥 INICIANDO TRADUÇÃO VIA HOOK...', 'info');

    try {
      await translate(text);
      addLog(`Hook: Tradução de "${text}" concluída!`, 'success');
      addLog('───────────────────────────────────────', 'separator');
      addLog('✅ TRADUÇÃO VIA HOOK FINALIZADA!', 'separator');
      addLog('═══════════════════════════════════════', 'separator');
    } catch (error) {
      addLog(`Hook: Erro na tradução: ${error}`, 'error');
      addLog('───────────────────────────────────────', 'separator');
      addLog('❌ TRADUÇÃO VIA HOOK FINALIZADA COM ERRO!', 'separator');
      addLog('═══════════════════════════════════════', 'separator');
    }
  };

  const testRestart = () => {
    if (!isReady) {
      addLog('Hook: Player não está pronto para reiniciar', 'warning');
      return;
    }

    addLog('═══════════════════════════════════════', 'separator');
    addLog('🪝 TESTANDO RESTART VIA HOOK', 'separator');
    addLog('═══════════════════════════════════════', 'separator');
    addLog('📋 Sequência esperada do restart via Hook:', 'info');
    addLog('1️⃣ Chamada restart() via Hook', 'info');
    addLog('2️⃣ onRestart() CALLBACK via Hook', 'info');
    addLog('3️⃣ Stop interno (via Hook)', 'info');
    addLog('4️⃣ Play da glosa atual (via Hook)', 'info');
    addLog('───────────────────────────────────────', 'separator');
    addLog('🔥 EXECUTANDO RESTART VIA HOOK...', 'restart');

    restart();
  };

  const testTexts = [
    'Olá, mundo!',
    'Como você está?',
    'VLibras Hook é incrível!',
    'Acessibilidade com Hook!'
  ];

  // Estados derivados para controles inteligentes via Hook
  const isPaused = player?.status === 'paused';
  const canPause = isReady && isPlaying && !isPaused;
  const canResume = isReady && isPaused;
  const canStop = isReady && (isPlaying || isPaused);
  const canRestart = isReady && (isPlaying || isPaused);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🪝 VLibras Player Hook para Next.js
          </h1>
          <p className="text-gray-600">
            Biblioteca moderna para tradução de texto em Libras usando React Hook
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
              ✅ Controles Inteligentes via Hook
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              🪝 Sistema de Hooks React
            </div>
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm">
              🎨 Interface Visual
            </div>
            <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm">
              � Logs em Tempo Real
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🪝 VLibras Player (Hook)
              </h2>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isReady ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isReady ? '✅ Pronto' : '⏳ Carregando'}
                </span>
                <div className="text-xs text-gray-600 mt-1">
                  Status: {currentStatus}
                </div>
                <div className="text-xs mt-1 flex gap-2">
                  {isLoading && <span className="text-blue-600">🔄 Carregando</span>}
                  {isTranslating && <span className="text-green-600">🔄 Traduzindo</span>}
                  {isPlaying && <span className="text-blue-600">▶️ Reproduzindo</span>}
                  {isPaused && <span className="text-orange-600">⏸️ Pausado</span>}
                  {error && <span className="text-red-600">❌ Erro</span>}
                </div>
              </div>
            </div>

            <div 
              ref={containerRef}
              className="w-full h-80 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
              style={{ minHeight: '320px' }}
            >
              {!isReady && !isLoading && !error && (
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-3">Player Hook não iniciado</p>
                  <button
                    onClick={handleInitializePlayer}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🪝 Inicializar Player VLibras via Hook
                  </button>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Carregando Unity WebGL via Hook...</p>
                </div>
              )}

              {isReady && (
                <div className="text-center">
                  <p className="text-gray-600 text-sm">✅ Player Hook pronto para tradução!</p>
                </div>
              )}

              {error && (
                <div className="text-center">
                  <p className="text-red-600 text-sm mb-3">❌ Erro: {error}</p>
                  <button
                    onClick={handleInitializePlayer}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    � Tentar Novamente
                  </button>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {testTexts.map((text, index) => (
                  <button
                    key={index}
                    onClick={() => testTranslation(text)}
                    disabled={!isReady}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              {/* Controles com habilitação inteligente */}
              <div className="grid grid-cols-5 gap-1">
                <button
                  onClick={pause}
                  disabled={!canPause}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canPause 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canPause ? 'Pausar reprodução via Hook' : 'Não há reprodução para pausar'}
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={resume}
                  disabled={!canResume}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canResume 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canResume ? 'Retomar reprodução pausada via Hook' : 'Não há reprodução pausada'}
                >
                  ▶️ Resume
                </button>
                <button
                  onClick={testRestart}
                  disabled={!canRestart}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canRestart 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canRestart ? 'Reiniciar animação atual via Hook' : 'Não há animação para reiniciar'}
                >
                  🔄 Restart
                </button>
                <button
                  onClick={stop}
                  disabled={!canStop}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canStop 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canStop ? 'Parar reprodução via Hook' : 'Não há reprodução para parar'}
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={() => {
                    setEventLog([]);
                    addLog('═══════════════════════════════════════', 'separator');
                    addLog('�️ LOG LIMPO - PRONTO PARA NOVOS TESTES', 'separator');
                    addLog('═══════════════════════════════════════', 'separator');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-2 rounded text-xs transition-colors"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Log de Eventos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                📋 Log de Eventos em Tempo Real (Hook)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const logContainer = document.querySelector('.log-container');
                    if (logContainer) {
                      logContainer.scrollTop = logContainer.scrollHeight;
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  ⬇️ Final
                </button>
                <button
                  onClick={() => {
                    setEventLog([]);
                    addLog('═══════════════════════════════════════', 'separator');
                    addLog('🗑️ LOG LIMPO - PRONTO PARA NOVOS TESTES', 'separator');
                    addLog('═══════════════════════════════════════', 'separator');
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto log-container">
              {eventLog.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Aguardando eventos via Hook...
                </p>
              ) : (
                <div className="space-y-1">
                  {eventLog.map((log, index) => {
                    // 🎨 Cores semânticas baseadas no tipo de log
                    const isHookEvent = log.includes('HOOK:');
                    const isSeparator = log.includes('═══') || log.includes('───') || log.includes('INICIANDO') || log.includes('FINALIZADO') || log.includes('CONCLUÍDA') || log.includes('TESTANDO');
                    const isError = log.includes('❌') || log.includes('💥');
                    const isSuccess = log.includes('✅') || log.includes('🎉');
                    const isWarning = log.includes('⚠️');
                    
                    // Cores semânticas por ação
                    const isStart = log.includes('🟢') || log.includes('iniciada') || log.includes('iniciou');
                    const isStop = log.includes('🔴') || log.includes('parada') || log.includes('terminou');
                    const isPause = log.includes('🟠') || log.includes('pausada');
                    const isResume = log.includes('🟡') || log.includes('retomada');
                    const isRestart = log.includes('🔵') || log.includes('reiniciada') || log.includes('RESTART');
                    
                    let bgColor = 'bg-white';
                    let textColor = 'text-gray-700';
                    let borderColor = 'border-gray-200';
                    
                    if (isSeparator) {
                      bgColor = 'bg-slate-50';
                      textColor = 'text-slate-800 font-semibold';
                      borderColor = 'border-slate-300';
                    } else if (isRestart) {
                      bgColor = 'bg-blue-50';
                      textColor = 'text-blue-800 font-semibold';
                      borderColor = 'border-blue-300';
                    } else if (isStart) {
                      bgColor = 'bg-green-50';
                      textColor = 'text-green-800';
                      borderColor = 'border-green-300';
                    } else if (isStop) {
                      bgColor = 'bg-red-50';
                      textColor = 'text-red-800';
                      borderColor = 'border-red-300';
                    } else if (isPause) {
                      bgColor = 'bg-orange-50';
                      textColor = 'text-orange-800';
                      borderColor = 'border-orange-300';
                    } else if (isResume) {
                      bgColor = 'bg-yellow-50';
                      textColor = 'text-yellow-800';
                      borderColor = 'border-yellow-300';
                    } else if (isHookEvent) {
                      bgColor = 'bg-purple-50';
                      textColor = 'text-purple-700';
                      borderColor = 'border-purple-200';
                    } else if (isError) {
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-900';
                      borderColor = 'border-red-400';
                    } else if (isSuccess) {
                      bgColor = 'bg-emerald-50';
                      textColor = 'text-emerald-700';
                      borderColor = 'border-emerald-200';
                    } else if (isWarning) {
                      bgColor = 'bg-amber-50';
                      textColor = 'text-amber-800';
                      borderColor = 'border-amber-300';
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={`text-xs font-mono ${textColor} ${bgColor} p-2 rounded border ${borderColor} break-words`}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Legenda Melhorada */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-base font-bold text-gray-800 mb-3">🎨 Legenda dos Logs (Hook):</h4>
              
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">🔄 Cores por Ação:</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-50 border-2 border-green-300 rounded"></div>
                    <span className="font-medium text-green-800">🟢 Start/Início</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-red-50 border-2 border-red-300 rounded"></div>
                    <span className="font-medium text-red-800">🔴 Stop/Fim</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded"></div>
                    <span className="font-medium text-orange-800">🟠 Pause</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-yellow-50 border-2 border-yellow-300 rounded"></div>
                    <span className="font-medium text-yellow-800">🟡 Resume</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-50 border-2 border-blue-300 rounded"></div>
                    <span className="font-medium text-blue-800">🔵 Restart</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-50 border-2 border-purple-300 rounded"></div>
                    <span className="font-medium text-purple-800">🪝 Hook Events</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema de Eventos do VLibras Player Hook */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            🪝 Sistema de Hooks VLibras Player
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🪝 Hooks Disponíveis:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• useVLibrasPlayer() - Hook principal</li>
                <li>• Estados: isReady, isLoading, isPlaying</li>
                <li>• Métodos: translate(), pause(), resume()</li>
                <li>• Callbacks: onPlay, onPause, onStop</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 mb-2">✅ Funcionalidades Hook:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Gerenciamento automático de estado</li>
                <li>• Controles inteligentes via React</li>
                <li>• Sistema de callbacks integrado</li>
                <li>• Interface moderna com TypeScript</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🪝 Fluxo do Hook useVLibrasPlayer:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Hook inicializado com useVLibrasPlayer()</li>
              <li>2. Estado isReady gerenciado automaticamente</li>
              <li>3. Métodos translate(), pause(), etc. expostos</li>
              <li>4. Callbacks executados via props do Hook</li>
              <li>5. Estados derivados: canPause, canResume, etc.</li>
              <li>6. Interface totalmente reativa com React</li>
              <li>7. TypeScript para type safety completo</li>
              <li>8. Integração nativa com Next.js</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🪝 VLibras Player Hook Next.js - Sistema de hooks React organizado e intuitivo!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Interface visual com cores semânticas via Hook: Start=Verde, Stop=Vermelho, Pause=Laranja, Resume=Amarelo, Restart=Azul, Hook=Roxo
          </p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              useVLibrasPlayer Hook v2.4.3 ✅
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
              React State Management ✅
            </span>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
              TypeScript Integration ✅
            </span>
            <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
              Controles Inteligentes ✅
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
