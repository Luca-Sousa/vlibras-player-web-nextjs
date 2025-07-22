'use client';

import React, { useRef, useState } from 'react';
import { useVLibrasPlayer, UnityStateManager } from 'vlibras-player-nextjs';

/**
 * 🎬 DEMONSTRAÇÃO COMPLETA - VLibras Player NextJS v2.3.0
 * 
 * Esta página demonstra TODAS as funcionalidades da biblioteca:
 * ✅ Hook useVLibrasPlayer com callbacks
 * ✅ Estados em tempo real (isReady, isTranslating, isPlaying)
 * ✅ Tradução de texto para Libras
 * ✅ Controles de reprodução (play, pause, stop, repeat)
 * ✅ Configurações (velocidade, avatar, região)
 * ✅ Debug e monitoramento de estado Unity
 * ✅ Tratamento de erros robusto
 * ✅ Callbacks funcionais
 */

export default function VLibrasCompleteDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textToTranslate, setTextToTranslate] = useState('Olá! Bem-vindo ao VLibras Player NextJS v2.3.0');
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [selectedAvatar, setSelectedAvatar] = useState('Ícaro');
  const [selectedRegion, setSelectedRegion] = useState<'BR' | 'PT'>('BR');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Função para adicionar eventos ao log
  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 19)]); // Manter apenas 20 eventos
  };

  // ✅ Hook principal com TODOS os callbacks
  const {
    player: _player, // Estado do player (não usado diretamente na demo)
    isLoading: _isLoading, // Estado de loading (usado via isReady)
    error,
    isReady,
    isTranslating,
    isPlaying,
    translate,
    play,
    pause,
    stop,
    repeat,
    setSpeed,
    toggleSubtitle,
    changeAvatar,
    setRegion,
    connect: _connect, // Método de conexão manual (não usado com autoInit)
  } = useVLibrasPlayer({
    autoInit: true,
    containerRef,
    targetPath: '/vlibras/target',
    region: selectedRegion,
    enableStats: true,

    // 🎯 CALLBACKS FUNCIONAIS - v2.3.0
    onLoad: () => {
      addToLog('✅ Player carregado e pronto!');
    },
    onTranslationStart: () => {
      addToLog('🔄 Tradução iniciada');
    },
    onTranslationEnd: () => {
      addToLog('✅ Tradução concluída');
    },
    onTranslationError: (error) => {
      addToLog(`❌ Erro na tradução: ${error}`);
    },
    onPlay: () => {
      addToLog('▶️ Reprodução iniciada');
    },
    onPause: () => {
      addToLog('⏸️ Reprodução pausada');
    },
    onStop: () => {
      addToLog('⏹️ Reprodução parada');
    },
    onPlayerReady: () => {
      addToLog('🚀 Player Unity pronto');
    },
    onPlayerError: (error) => {
      addToLog(`💥 Erro no player: ${error}`);
    },
  });

  // Função para traduzir texto
  const handleTranslate = async () => {
    if (!textToTranslate.trim()) {
      addToLog('⚠️ Texto vazio');
      return;
    }

    try {
      await translate(textToTranslate);
      addToLog(`📝 Texto traduzido: "${textToTranslate}"`);
    } catch (err) {
      addToLog(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  // Função para alterar velocidade
  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    try {
      setSpeed(speed);
      addToLog(`⚡ Velocidade alterada para ${speed}x`);
    } catch (err) {
      addToLog(`❌ Erro ao alterar velocidade: ${err}`);
    }
  };

  // Função para alterar avatar
  const handleAvatarChange = (avatar: string) => {
    setSelectedAvatar(avatar);
    try {
      changeAvatar(avatar);
      addToLog(`👤 Avatar alterado para ${avatar}`);
    } catch (err) {
      addToLog(`❌ Erro ao alterar avatar: ${err}`);
    }
  };

  // Função para alterar região
  const handleRegionChange = (region: 'BR' | 'PT') => {
    setSelectedRegion(region);
    try {
      setRegion(region);
      addToLog(`🌍 Região alterada para ${region}`);
    } catch (err) {
      addToLog(`❌ Erro ao alterar região: ${err}`);
    }
  };

  // Função para obter informações de debug
  const updateDebugInfo = () => {
    if (containerRef.current) {
      const info = UnityStateManager.getDebugInfo(containerRef.current);
      setDebugInfo(info);
      addToLog('🔍 Debug info atualizada');
    }
  };

  // Textos de exemplo
  const exampleTexts = [
    'Olá! Como você está hoje?',
    'O VLibras é uma ferramenta de acessibilidade.',
    'Esta é uma demonstração das funcionalidades.',
    'Bem-vindo ao mundo da inclusão digital!',
    'A tecnologia pode transformar vidas.',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎬 VLibras Player NextJS v2.3.0
          </h1>
          <p className="text-lg text-gray-600">
            Demonstração Completa - Todas as Funcionalidades
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isReady ? '✅ Pronto' : '⏳ Carregando...'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isTranslating ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isTranslating ? '🔄 Traduzindo' : '💤 Inativo'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPlaying ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isPlaying ? '▶️ Reproduzindo' : '⏸️ Parado'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel Principal */}
          <div className="space-y-6">
            {/* Player Container */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                🎮 Player VLibras
              </h2>
              <div 
                ref={containerRef}
                className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              >
                {!isReady && (
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">Carregando Unity WebGL...</p>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">❌ {error}</p>
                </div>
              )}
            </div>

            {/* Tradução */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                📝 Tradução de Texto
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto para traduzir:
                  </label>
                  <textarea
                    value={textToTranslate}
                    onChange={(e) => setTextToTranslate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Digite o texto que deseja traduzir para Libras..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleTranslate}
                    disabled={!isReady || isTranslating || !textToTranslate.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isTranslating ? '🔄 Traduzindo...' : '🔤 Traduzir'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textos de exemplo:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {exampleTexts.map((text, index) => (
                      <button
                        key={index}
                        onClick={() => setTextToTranslate(text)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                      >
                        {text.length > 30 ? text.substring(0, 30) + '...' : text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de Reprodução */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🎵 Controles de Reprodução
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => play()}
                  disabled={!isReady}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ▶️ Play
                </button>
                <button
                  onClick={pause}
                  disabled={!isReady || !isPlaying}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={stop}
                  disabled={!isReady}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={repeat}
                  disabled={!isReady}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🔄 Repeat
                </button>
              </div>
            </div>
          </div>

          {/* Painel de Configurações */}
          <div className="space-y-6">
            {/* Configurações */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                ⚙️ Configurações
              </h3>
              
              <div className="space-y-4">
                {/* Velocidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Velocidade: {selectedSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={selectedSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    disabled={!isReady}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar:
                  </label>
                  <select
                    value={selectedAvatar}
                    onChange={(e) => handleAvatarChange(e.target.value)}
                    disabled={!isReady}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ícaro">Ícaro</option>
                    <option value="Hosana">Hosana</option>
                    <option value="Guga">Guga</option>
                  </select>
                </div>

                {/* Região */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Região:
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegionChange('BR')}
                      disabled={!isReady}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedRegion === 'BR'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🇧🇷 Brasil
                    </button>
                    <button
                      onClick={() => handleRegionChange('PT')}
                      disabled={!isReady}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedRegion === 'PT'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🇵🇹 Portugal
                    </button>
                  </div>
                </div>

                {/* Legenda */}
                <div>
                  <button
                    onClick={toggleSubtitle}
                    disabled={!isReady}
                    className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    📄 Alternar Legenda
                  </button>
                </div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  🔍 Debug & Monitoramento
                </h3>
                <button
                  onClick={updateDebugInfo}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🔄 Atualizar
                </button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>

            {/* Log de Eventos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  📋 Log de Eventos
                </h3>
                <button
                  onClick={() => setEventLog([])}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🗑️ Limpar
                </button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                {eventLog.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum evento registrado ainda...</p>
                ) : (
                  <div className="space-y-1">
                    {eventLog.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-gray-700 border-b border-gray-200 pb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🚀 VLibras Player NextJS v2.3.0 - Demonstração Completa
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Todas as funcionalidades da biblioteca em uma só página
          </p>
        </div>
      </div>
    </div>
  );
}
