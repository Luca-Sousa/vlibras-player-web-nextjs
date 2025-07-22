'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

/**
 * 🎨 EXEMPLO PERSONALIZADO - Player com Interface Customizada
 * 
 * Este exemplo mostra como criar uma interface totalmente customizada:
 * ✅ Design personalizado
 * ✅ Controles avançados
 * ✅ Feedback visual rico
 * ✅ Gestão de estado complexa
 */

interface TranslationSession {
  id: string;
  text: string;
  timestamp: Date;
  duration?: number;
  status: 'pending' | 'playing' | 'completed' | 'error';
}

export default function VLibrasCustomDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [sessions, setSessions] = useState<TranslationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const {
    isLoaded,
    isPlaying,
    currentText,
    translate,
    play,
    pause,
    stop,
    error,
    lastActionTimestamp
  } = useVLibrasPlayer({
    targetPath: '/vlibras/target',
    region: 'BR',
    enableStats: true,
    container: containerRef.current,
    onTranslationStart: () => {
      if (currentSession) {
        updateSessionStatus(currentSession, 'playing');
      }
    },
    onTranslationEnd: () => {
      if (currentSession) {
        updateSessionStatus(currentSession, 'completed');
        setCurrentSession(null);
      }
    },
    onError: (err) => {
      if (currentSession) {
        updateSessionStatus(currentSession, 'error');
        setCurrentSession(null);
      }
    }
  });

  const createSession = (text: string): TranslationSession => ({
    id: Date.now().toString(),
    text,
    timestamp: new Date(),
    status: 'pending'
  });

  const updateSessionStatus = (sessionId: string, status: TranslationSession['status']) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status }
        : session
    ));
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || !isLoaded) return;

    const session = createSession(inputText.trim());
    setSessions(prev => [session, ...prev.slice(0, 9)]);
    setCurrentSession(session.id);

    try {
      await translate(inputText.trim());
      if (isAutoPlay) {
        await play();
      }
    } catch (error) {
      updateSessionStatus(session.id, 'error');
      setCurrentSession(null);
    }

    setInputText('');
  };

  const replaySession = async (session: TranslationSession) => {
    setCurrentSession(session.id);
    updateSessionStatus(session.id, 'pending');

    try {
      await translate(session.text);
      if (isAutoPlay) {
        await play();
      }
    } catch (error) {
      updateSessionStatus(session.id, 'error');
      setCurrentSession(null);
    }
  };

  const clearHistory = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  const getStatusIcon = (status: TranslationSession['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'playing': return '▶️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '❔';
    }
  };

  const getStatusColor = (status: TranslationSession['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'playing': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Elegante */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            VLibras Custom Player
          </h1>
          <p className="text-lg text-gray-600">
            Interface Personalizada com Controles Avançados
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Painel Principal */}
          <div className="xl:col-span-2 space-y-6">
            {/* Player Container */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  🎬 Player VLibras
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isLoaded ? '✅ Carregado' : '⏳ Carregando'}
                  </span>
                  {isPlaying && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 animate-pulse">
                      ▶️ Reproduzindo
                    </span>
                  )}
                </div>
              </div>

              <div 
                ref={containerRef}
                className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-6"
              >
                {!isLoaded && (
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-600">Inicializando Player...</p>
                  </div>
                )}
              </div>

              {/* Controles de Reprodução */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={play}
                  disabled={!isLoaded || !currentText}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-all transform hover:scale-105 disabled:scale-100"
                >
                  ▶️
                </button>
                <button
                  onClick={pause}
                  disabled={!isLoaded}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-all transform hover:scale-105 disabled:scale-100"
                >
                  ⏸️
                </button>
                <button
                  onClick={stop}
                  disabled={!isLoaded}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-all transform hover:scale-105 disabled:scale-100"
                >
                  ⏹️
                </button>
              </div>

              {/* Controles Avançados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isAutoPlay}
                      onChange={(e) => setIsAutoPlay(e.target.checked)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🚀 Reprodução Automática
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔊 Volume: {volume}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⚡ Velocidade: {playbackSpeed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {lastActionTimestamp && (
                    <div className="text-xs text-gray-500">
                      🕒 Última ação: {lastActionTimestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interface de Tradução */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ✍️ Nova Tradução
              </h3>

              <div className="space-y-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite o texto para traduzir em Libras..."
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  maxLength={500}
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {inputText.length}/500 caracteres
                  </span>
                  
                  <button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || !isLoaded}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 disabled:scale-100"
                  >
                    🎯 Traduzir
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm">❌ Erro: {error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Painel Lateral - Histórico */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  📚 Histórico de Traduções
                </h3>
                {sessions.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    🗑️ Limpar
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-gray-500 text-sm">
                      Nenhuma tradução ainda...
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                        currentSession === session.id 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => replaySession(session)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)} {session.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {session.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {session.text}
                      </p>
                      
                      {session.status === 'completed' && (
                        <div className="mt-2 text-xs text-green-600">
                          ✨ Clique para reproduzir novamente
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📊 Estatísticas
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de traduções:</span>
                  <span className="font-medium">{sessions.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Concluídas:</span>
                  <span className="font-medium text-green-600">
                    {sessions.filter(s => s.status === 'completed').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Com erro:</span>
                  <span className="font-medium text-red-600">
                    {sessions.filter(s => s.status === 'error').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Em andamento:</span>
                  <span className="font-medium text-blue-600">
                    {sessions.filter(s => s.status === 'playing').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🎨 Interface personalizada com controles avançados
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Demonstração de implementação customizada do VLibras Player
          </p>
        </div>
      </div>
    </div>
  );
}
