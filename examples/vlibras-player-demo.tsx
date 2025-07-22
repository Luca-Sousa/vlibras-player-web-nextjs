'use client';

import React, { useRef, useState } from 'react';
import { VLibrasPlayer } from 'vlibras-player-nextjs';

/**
 * 🎯 DEMONSTRAÇÃO OFICIAL DO VLIBRAS PLAYER
 * 
 * Demonstração completa do VLibras Player para Next.js
 * 
 * ✅ FUNCIONALIDADES:
 * - Tradução automática de texto para Libras
 * - Controles completos de reprodução (play, pause, resume, restart, stop)
 * - Sistema avançado de eventos e callbacks
 * - Interface visual com logs em tempo real
 * - Cores semânticas para melhor experiência
 * - Controles inteligentes com ativação contextual
 */

export default function VLibrasPlayerDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<VLibrasPlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('Não iniciado');
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const initializePlayer = async () => {
    if (player || !containerRef.current) return;
    
    addLog('═══════════════════════════════════════', 'separator');
    addLog('🚀 INICIALIZANDO VLIBRAS PLAYER', 'separator');
    addLog('═══════════════════════════════════════', 'separator');
    setCurrentStatus('Inicializando...');

    try {
      const newPlayer = new VLibrasPlayer({
        targetPath: '/vlibras/target',
        region: 'BR',
        enableStats: true,
        
        // 📋 CALLBACKS PRINCIPAIS
        onLoad: () => {
          addLog('CALLBACK: onLoad() - Player carregado', 'success');
          setIsPlayerReady(true);
          setCurrentStatus('Pronto');
        },
        onTranslationStart: () => {
          addLog('CALLBACK: onTranslationStart() - Tradução iniciada', 'start');
          setCurrentStatus('Traduzindo...');
          setIsTranslating(true);
        },
        onTranslationEnd: () => {
          addLog('CALLBACK: onTranslationEnd() - Tradução concluída', 'success');
          setCurrentStatus('Concluído');
          setIsTranslating(false);
        },
        onTranslationError: (error: string) => {
          addLog(`CALLBACK: onTranslationError() - ${error}`, 'warning');
          setCurrentStatus('Erro na tradução');
          setIsTranslating(false);
        },
        onPlay: () => {
          addLog('CALLBACK: onPlay() - Reprodução iniciada', 'start');
          setCurrentStatus('Reproduzindo...');
          setIsPaused(false);
          setIsPlaying(true);
        },
        onPause: () => {
          addLog('CALLBACK: onPause() - Reprodução pausada', 'pause');
          setCurrentStatus('Pausado');
          setIsPaused(true);
          setIsPlaying(false);
        },
        onResume: () => {
          addLog('CALLBACK: onResume() - Reprodução retomada', 'resume');
          setCurrentStatus('Reproduzindo...');
          setIsPaused(false);
          setIsPlaying(true);
        },
        onRestart: () => {
          addLog('CALLBACK: onRestart() - Animação reiniciada', 'restart');
          setCurrentStatus('Reiniciando...');
          setIsPaused(false);
          setIsPlaying(true);
        },
        onStop: () => {
          addLog('CALLBACK: onStop() - Reprodução parada', 'stop');
          setCurrentStatus('Parado');
          setIsPaused(false);
          setIsPlaying(false);
        },
        onPlayerReady: () => {
          addLog('CALLBACK: onPlayerReady() - Player completamente pronto', 'success');
        },
        onPlayerError: (error: string) => {
          addLog(`CALLBACK: onPlayerError() - ${error}`, 'error');
          setCurrentStatus('Erro no player');
        },
      });

      // 📋 EVENT LISTENERS DETALHADOS
      
      // Eventos de sistema
      newPlayer.addEventListener('load', () => {
        addLog('EVENT: load - Player Unity carregado', 'success');
      });

      newPlayer.addEventListener('error', (error: string) => {
        addLog(`EVENT: error - ${error}`, 'error');
      });

      // Eventos de tradução
      newPlayer.addEventListener('translate:start', () => {
        addLog('EVENT: translate:start - Processo de tradução iniciado', 'start');
      });

      newPlayer.addEventListener('translate:end', () => {
        addLog('EVENT: translate:end - Processo de tradução finalizado', 'success');
      });

      // Eventos de animação
      newPlayer.addEventListener('animation:play', () => {
        addLog('EVENT: animation:play - Animação Unity iniciada', 'start');
      });

      newPlayer.addEventListener('animation:pause', () => {
        addLog('EVENT: animation:pause - Animação Unity pausada', 'pause');
      });

      newPlayer.addEventListener('animation:resume', () => {
        addLog('EVENT: animation:resume - Animação Unity retomada', 'resume');
      });

      newPlayer.addEventListener('animation:restart', () => {
        addLog('EVENT: animation:restart - Animação Unity reiniciada', 'restart');
      });

      newPlayer.addEventListener('animation:end', () => {
        addLog('EVENT: animation:end - Animação Unity finalizada', 'stop');
      });

      newPlayer.addEventListener('animation:progress', (progress: number) => {
        if (progress % 25 === 0) {
          addLog(`EVENT: animation:progress - ${progress}%`, 'info');
        }
      });

      // Eventos de glosa
      newPlayer.addEventListener('gloss:start', () => {
        addLog('EVENT: gloss:start - Reprodução da glosa iniciada', 'start');
      });

      newPlayer.addEventListener('gloss:end', (length: number) => {
        addLog(`EVENT: gloss:end - Glosa finalizada (length: ${length})`, 'stop');
      });

      newPlayer.addEventListener('gloss:info', (counter: number, length: number) => {
        addLog(`EVENT: gloss:info - Counter: ${counter}, Length: ${length}`, 'info');
      });

      // Eventos de avatar e interface
      newPlayer.addEventListener('avatar:change', (avatar: string) => {
        addLog(`EVENT: avatar:change - Avatar alterado: ${avatar}`, 'info');
      });

      newPlayer.addEventListener('welcome:start', () => {
        addLog('EVENT: welcome:start - Apresentação de boas-vindas iniciada', 'start');
      });

      newPlayer.addEventListener('welcome:end', (finished: boolean) => {
        addLog(`EVENT: welcome:end - Boas-vindas finalizada: ${finished}`, 'stop');
      });

      setPlayer(newPlayer);

      // Carregar o player
      addLog('Carregando Unity WebGL...', 'info');
      await newPlayer.load(containerRef.current);
      addLog('Unity carregado com sucesso!', 'success');
      addLog('═══════════════════════════════════════', 'separator');
      addLog('✅ PLAYER PRONTO PARA USO!', 'separator');
      addLog('═══════════════════════════════════════', 'separator');

    } catch (error) {
      addLog(`Erro fatal: ${error}`, 'error');
      setCurrentStatus('Erro fatal');
    }
  };

  const testTranslation = async (text: string) => {
    if (!player || !isPlayerReady) {
      addLog('Player não está pronto para traduzir', 'warning');
      return;
    }

    addLog('═══════════════════════════════════════', 'separator');
    addLog(`🎯 TRADUZINDO: "${text}"`, 'separator');
    addLog('═══════════════════════════════════════', 'separator');
    addLog('📋 Sequência de eventos esperada:', 'info');
    addLog('1️⃣ translate:start (imediato)', 'info');
    addLog('2️⃣ animation:play (quando Unity inicia)', 'info');
    addLog('3️⃣ animation:progress (durante reprodução)', 'info');
    addLog('4️⃣ animation:end (quando Unity termina)', 'info');
    addLog('5️⃣ translate:end (quando tradução finaliza)', 'info');
    addLog('───────────────────────────────────────', 'separator');
    addLog('🔥 INICIANDO TRADUÇÃO...', 'info');

    try {
      await player.translate(text);
      addLog(`Tradução de "${text}" concluída!`, 'success');
      addLog('───────────────────────────────────────', 'separator');
      addLog('✅ TRADUÇÃO FINALIZADA!', 'separator');
      addLog('═══════════════════════════════════════', 'separator');
    } catch (error) {
      addLog(`Erro na tradução: ${error}`, 'error');
      addLog('───────────────────────────────────────', 'separator');
      addLog('❌ TRADUÇÃO FINALIZADA COM ERRO!', 'separator');
      addLog('═══════════════════════════════════════', 'separator');
    }
  };

  const testRestart = () => {
    if (!player || !isPlayerReady) {
      addLog('Player não está pronto para reiniciar', 'warning');
      return;
    }

    addLog('═══════════════════════════════════════', 'separator');
    addLog('🔄 TESTANDO RESTART', 'separator');
    addLog('═══════════════════════════════════════', 'separator');
    addLog('📋 Sequência esperada do restart:', 'info');
    addLog('1️⃣ animation:restart EVENT (imediato)', 'info');
    addLog('2️⃣ onRestart() CALLBACK', 'info');
    addLog('3️⃣ Stop interno (sem event)', 'info');
    addLog('4️⃣ Play da glosa atual (após 100ms)', 'info');
    addLog('───────────────────────────────────────', 'separator');
    addLog('🔥 EXECUTANDO RESTART...', 'restart');

    player.restart();
  };

  const testTexts = [
    'Olá, mundo!',
    'Como você está?',
    'VLibras é incrível!',
    'Acessibilidade é fundamental!'
  ];

  // Lógica para habilitar/desabilitar botões inteligentemente
  const canPause = isPlayerReady && isPlaying && !isPaused;
  const canResume = isPlayerReady && isPaused;
  const canStop = isPlayerReady && (isPlaying || isPaused);
  const canRestart = isPlayerReady && (isPlaying || isPaused);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 VLibras Player para Next.js
          </h1>
          <p className="text-gray-600">
            Biblioteca moderna para tradução de texto em Libras
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
              ✅ Controles Inteligentes
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              🎮 Sistema de Eventos
            </div>
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm">
              🎨 Interface Visual
            </div>
            <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm">
              📋 Logs em Tempo Real
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🎬 VLibras Player
              </h2>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isPlayerReady ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isPlayerReady ? '✅ Pronto' : '⏳ Carregando'}
                </span>
                <div className="text-xs text-gray-600 mt-1">
                  Status: {currentStatus}
                </div>
                <div className="text-xs mt-1 flex gap-2">
                  {isTranslating && <span className="text-green-600">🔄 Traduzindo</span>}
                  {isPlaying && <span className="text-blue-600">▶️ Reproduzindo</span>}
                  {isPaused && <span className="text-orange-600">⏸️ Pausado</span>}
                </div>
              </div>
            </div>

            <div 
              ref={containerRef}
              className="w-full h-80 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
              style={{ minHeight: '320px' }}
            >
              {!player && (
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-3">Player não iniciado</p>
                  <button
                    onClick={initializePlayer}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🚀 Inicializar Player VLibras
                  </button>
                </div>
              )}
              
              {player && !isPlayerReady && (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Carregando Unity WebGL...</p>
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
                    disabled={!isPlayerReady}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              {/* Controles com habilitação inteligente */}
              <div className="grid grid-cols-5 gap-1">
                <button
                  onClick={() => player?.pause()}
                  disabled={!canPause}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canPause 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canPause ? 'Pausar reprodução' : 'Não há reprodução para pausar'}
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={() => player?.resume()}
                  disabled={!canResume}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canResume 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canResume ? 'Retomar reprodução pausada' : 'Não há reprodução pausada'}
                >
                  ▶️ Resume
                </button>
                <button
                  onClick={() => player?.restart()}
                  disabled={!canRestart}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canRestart 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canRestart ? 'Reiniciar animação atual' : 'Não há animação para reiniciar'}
                >
                  🔄 Restart
                </button>
                <button
                  onClick={() => player?.stop()}
                  disabled={!canStop}
                  className={`px-2 py-2 rounded text-xs transition-colors ${
                    canStop 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canStop ? 'Parar reprodução' : 'Não há reprodução para parar'}
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={() => {
                    setEventLog([]);
                    addLog('═══════════════════════════════════════', 'separator');
                    addLog('🗑️ LOG LIMPO - PRONTO PARA NOVOS TESTES', 'separator');
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
                📋 Log de Eventos em Tempo Real
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
                  Aguardando eventos...
                </p>
              ) : (
                <div className="space-y-1">
                  {eventLog.map((log, index) => {
                    // 🎨 Cores semânticas baseadas no tipo de log
                    const isCallbackEvent = log.includes('CALLBACK:');
                    const isEventLog = log.includes('EVENT:');
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
                    } else if (isCallbackEvent) {
                      bgColor = 'bg-purple-50';
                      textColor = 'text-purple-700';
                      borderColor = 'border-purple-200';
                    } else if (isEventLog) {
                      bgColor = 'bg-cyan-50';
                      textColor = 'text-cyan-700';
                      borderColor = 'border-cyan-200';
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
              <h4 className="text-base font-bold text-gray-800 mb-3">🎨 Legenda dos Logs:</h4>
              
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema de Eventos do VLibras Player */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            🎯 Sistema de Eventos VLibras Player
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎮 Controles Disponíveis:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Traduzir texto para Libras</li>
                <li>• Pausar/Retomar reprodução</li>
                <li>• Parar tradução atual</li>
                <li>• Reiniciar tradução</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 mb-2">✅ Funcionalidades:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Eventos únicos e consistentes</li>
                <li>• Controles inteligentes e responsivos</li>
                <li>• Sistema de logs visual organizado</li>
                <li>• Interface moderna e acessível</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔄 Fluxo do Restart:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Usuário clica em Restart</li>
              <li>2. Sistema verifica se há tradução ativa</li>
              <li>3. Marca estado de reinicialização</li>
              <li>4. Emite evento de restart</li>
              <li>5. Callback é executado uma única vez</li>
              <li>6. Para reprodução atual</li>
              <li>7. Aguarda processamento interno</li>
              <li>8. Reproduz a tradução novamente</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🎯 VLibras Player Next.js - Sistema de eventos organizado e intuitivo!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Interface visual com cores semânticas: Start=Verde, Stop=Vermelho, Pause=Laranja, Resume=Amarelo, Restart=Azul
          </p>
        </div>
      </div>
    </div>
  );
}
