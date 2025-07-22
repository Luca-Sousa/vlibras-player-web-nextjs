'use client';

import React, { useRef, useState } from 'react';
import { useVLibrasPlayer } from 'vlibras-player-nextjs';

/**
 * 🎯 EXEMPLO SIMPLES - VLibras Player NextJS v2.3.0
 * 
 * Este é um exemplo básico e limpo para iniciantes:
 * ✅ Uso básico do hook useVLibrasPlayer
 * ✅ Tradução simples de texto
 * ✅ Interface minimalista
 * ✅ Callbacks essenciais
 */

export default function VLibrasSimpleDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('Olá! Este é um exemplo simples do VLibras.');

  const {
    isReady,
    isTranslating,
    error,
    translate,
  } = useVLibrasPlayer({
    autoInit: true,
    containerRef,
    targetPath: '/vlibras/target',
    
    onLoad: () => {
      console.log('✅ VLibras carregado!');
    },
    onTranslationStart: () => {
      console.log('🔄 Iniciando tradução...');
    },
    onTranslationEnd: () => {
      console.log('✅ Tradução concluída!');
    },
    onError: (error) => {
      console.error('❌ Erro:', error);
    },
  });

  const handleTranslate = async () => {
    if (!text.trim()) return;
    
    try {
      await translate(text);
    } catch (err) {
      console.error('Erro na tradução:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎬 VLibras Player
            </h1>
            <p className="text-gray-600">
              Exemplo Simples - Next.js v2.3.0
            </p>
            <div className="mt-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isReady ? '✅ Pronto' : '⏳ Carregando...'}
              </span>
            </div>
          </div>

          {/* Player Container */}
          <div className="mb-8">
            <div 
              ref={containerRef}
              className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
            >
              {!isReady ? (
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando Unity...</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Player Unity carregado ✅</p>
              )}
            </div>
          </div>

          {/* Input de Texto */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto para traduzir:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Digite aqui o texto que deseja traduzir para Libras..."
            />
          </div>

          {/* Botão de Tradução */}
          <div className="flex justify-center">
            <button
              onClick={handleTranslate}
              disabled={!isReady || isTranslating || !text.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors min-w-48"
            >
              {isTranslating ? (
                <>
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Traduzindo...
                </>
              ) : (
                '🔤 Traduzir para Libras'
              )}
            </button>
          </div>

          {/* Erro */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Textos de Exemplo */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Textos de exemplo:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Olá! Como você está?',
                'Bem-vindo ao VLibras!',
                'Esta é uma demonstração.',
                'Acessibilidade é importante.',
                'Inclusão digital para todos.'
              ].map((exampleText, index) => (
                <button
                  key={index}
                  onClick={() => setText(exampleText)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                >
                  {exampleText}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              💡 Para ver todas as funcionalidades, confira a demonstração completa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
