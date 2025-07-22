'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VLibrasPlayer, UnityStateManager } from 'vlibras-player-nextjs';

/**
 * 🔧 EXEMPLO AVANÇADO - Uso Direto da Classe VLibrasPlayer
 * 
 * Este exemplo mostra como usar a classe VLibrasPlayer diretamente:
 * ✅ Controle manual completo
 * ✅ Múltiplas instâncias
 * ✅ Configuração avançada
 * ✅ Event listeners customizados
 */

export default function VLibrasAdvancedDemo() {
  const container1Ref = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const [player1, setPlayer1] = useState<VLibrasPlayer | null>(null);
  const [player2, setPlayer2] = useState<VLibrasPlayer | null>(null);
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  // Inicializar Player 1 (Brasil)
  useEffect(() => {
    if (container1Ref.current && !player1) {
      const newPlayer = new VLibrasPlayer({
        targetPath: '/vlibras/target',
        region: 'BR',
        enableStats: true,
        onLoad: () => {
          setPlayer1Ready(true);
          addToLog('🇧🇷 Player Brasil pronto');
        },
        onTranslationStart: () => addToLog('🇧🇷 Brasil: Tradução iniciada'),
        onTranslationEnd: () => addToLog('🇧🇷 Brasil: Tradução concluída'),
        onPlay: () => addToLog('🇧🇷 Brasil: Reprodução iniciada'),
        onError: (error) => addToLog(`🇧🇷 Brasil: Erro - ${error}`),
      });

      setPlayer1(newPlayer);

      // Carregar no container
      newPlayer.load(container1Ref.current).catch(error => {
        addToLog(`❌ Erro ao carregar Player 1: ${error}`);
      });
    }

    return () => {
      if (player1) {
        player1.dispose();
      }
    };
  }, []);

  // Inicializar Player 2 (Portugal)
  useEffect(() => {
    if (container2Ref.current && !player2) {
      const newPlayer = new VLibrasPlayer({
        targetPath: '/vlibras/target',
        region: 'PT',
        enableStats: true,
        onLoad: () => {
          setPlayer2Ready(true);
          addToLog('🇵🇹 Player Portugal pronto');
        },
        onTranslationStart: () => addToLog('🇵🇹 Portugal: Tradução iniciada'),
        onTranslationEnd: () => addToLog('🇵🇹 Portugal: Tradução concluída'),
        onPlay: () => addToLog('🇵🇹 Portugal: Reprodução iniciada'),
        onError: (error) => addToLog(`🇵🇹 Portugal: Erro - ${error}`),
      });

      setPlayer2(newPlayer);

      // Carregar no container com delay para não sobrecarregar
      setTimeout(() => {
        if (container2Ref.current) {
          newPlayer.load(container2Ref.current).catch(error => {
            addToLog(`❌ Erro ao carregar Player 2: ${error}`);
          });
        }
      }, 2000);
    }

    return () => {
      if (player2) {
        player2.dispose();
      }
    };
  }, []);

  const translatePlayer1 = async (text: string) => {
    if (player1 && player1Ready) {
      try {
        await player1.translate(text);
      } catch (error) {
        addToLog(`❌ Player 1 erro: ${error}`);
      }
    }
  };

  const translatePlayer2 = async (text: string) => {
    if (player2 && player2Ready) {
      try {
        await player2.translate(text);
      } catch (error) {
        addToLog(`❌ Player 2 erro: ${error}`);
      }
    }
  };

  const getDebugInfo = (playerNum: number) => {
    const container = playerNum === 1 ? container1Ref.current : container2Ref.current;
    if (container) {
      const info = UnityStateManager.getDebugInfo(container);
      addToLog(`🔍 Debug Player ${playerNum}: ${JSON.stringify(info, null, 2)}`);
    }
  };

  const exampleTexts = [
    'Olá! Como está?',
    'Este é um teste.',
    'Acessibilidade é fundamental.',
    'Bem-vindo!',
    'Muito obrigado.'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔧 VLibras Advanced Demo
          </h1>
          <p className="text-gray-600">
            Uso Direto da Classe VLibrasPlayer - Múltiplas Instâncias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player 1 - Brasil */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🇧🇷 Player Brasil
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                player1Ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {player1Ready ? '✅ Pronto' : '⏳ Carregando'}
              </span>
            </div>

            <div 
              ref={container1Ref}
              className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
            >
              {!player1Ready && (
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando Player BR...</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {exampleTexts.slice(0, 4).map((text, index) => (
                  <button
                    key={index}
                    onClick={() => translatePlayer1(text)}
                    disabled={!player1Ready}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => player1?.pause()}
                  disabled={!player1Ready}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={() => player1?.stop()}
                  disabled={!player1Ready}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={() => getDebugInfo(1)}
                  disabled={!player1Ready}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  🔍 Debug
                </button>
              </div>
            </div>
          </div>

          {/* Player 2 - Portugal */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🇵🇹 Player Portugal
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                player2Ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {player2Ready ? '✅ Pronto' : '⏳ Carregando'}
              </span>
            </div>

            <div 
              ref={container2Ref}
              className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
            >
              {!player2Ready && (
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando Player PT...</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {exampleTexts.slice(0, 4).map((text, index) => (
                  <button
                    key={index}
                    onClick={() => translatePlayer2(text)}
                    disabled={!player2Ready}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => player2?.pause()}
                  disabled={!player2Ready}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={() => player2?.stop()}
                  disabled={!player2Ready}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={() => getDebugInfo(2)}
                  disabled={!player2Ready}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  🔍 Debug
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Log de Eventos */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">📋 Log de Eventos</h3>
            <button
              onClick={() => setEventLog([])}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              🗑️ Limpar
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum evento registrado...</p>
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

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🔧 Demonstração avançada com múltiplas instâncias VLibrasPlayer
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Controle manual completo e configurações personalizadas
          </p>
        </div>
      </div>
    </div>
  );
}
