'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVLibrasPlayer, UnityStateManager } from 'vlibras-player-nextjs';

/**
 * 📊 EXEMPLO DASHBOARD - Integração em Sistema de Gerenciamento
 * 
 * Este exemplo mostra como integrar o VLibras em um dashboard:
 * ✅ Layout responsivo
 * ✅ Múltiplas seções
 * ✅ Acessibilidade avançada
 * ✅ Analytics e monitoramento
 */

interface AccessibilityMetrics {
  totalTranslations: number;
  totalPlaytime: number;
  averageSessionDuration: number;
  popularTexts: { text: string; count: number }[];
  errorRate: number;
}

interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

export default function VLibrasDashboardDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'translator' | 'settings' | 'analytics'>('overview');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [metrics, setMetrics] = useState<AccessibilityMetrics>({
    totalTranslations: 156,
    totalPlaytime: 3420, // segundos
    averageSessionDuration: 22,
    popularTexts: [
      { text: 'Bem-vindo ao sistema', count: 34 },
      { text: 'Como posso ajudar?', count: 28 },
      { text: 'Obrigado pela visita', count: 23 },
      { text: 'Acessibilidade é importante', count: 19 }
    ],
    errorRate: 2.1
  });

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
    onLoad: () => addNotification('success', 'VLibras Carregado', 'Player pronto para uso'),
    onTranslationStart: () => addNotification('info', 'Tradução Iniciada', 'Processando texto...'),
    onTranslationEnd: () => addNotification('success', 'Tradução Concluída', 'Pronto para reprodução'),
    onPlay: () => addNotification('info', 'Reprodução Iniciada', 'Executando tradução em Libras'),
    onError: (err) => addNotification('error', 'Erro Detectado', err)
  });

  const addNotification = (type: NotificationItem['type'], title: string, message: string) => {
    const notification: NotificationItem = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Auto-remove após 5 segundos para notificações de info e success
    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  };

  const clearNotifications = () => setNotifications([]);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📝';
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'info': return 'border-l-blue-500 bg-blue-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const quickTranslations = [
    'Bem-vindo ao nosso sistema!',
    'Como posso ajudá-lo hoje?',
    'Sua solicitação foi processada com sucesso.',
    'Obrigado por utilizar nossos serviços.',
    'Para mais informações, entre em contato conosco.'
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <p className="text-gray-500 text-sm">Total de Traduções</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalTranslations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⏱️</div>
            <div>
              <p className="text-gray-500 text-sm">Tempo Total</p>
              <p className="text-2xl font-bold text-gray-800">{formatDuration(metrics.totalPlaytime)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚡</div>
            <div>
              <p className="text-gray-500 text-sm">Duração Média</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.averageSessionDuration}s</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📈</div>
            <div>
              <p className="text-gray-500 text-sm">Taxa de Erro</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.errorRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Textos Populares */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🔥 Textos Mais Traduzidos
        </h3>
        <div className="space-y-3">
          {metrics.popularTexts.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{item.text}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                {item.count}x
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTranslator = () => (
    <div className="space-y-6">
      {/* Player Container */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">🎬 Player VLibras</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isLoaded ? '✅ Online' : '⏳ Carregando'}
          </span>
        </div>

        <div 
          ref={containerRef}
          className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4"
        >
          {!isLoaded && (
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Inicializando...</p>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={play}
            disabled={!isLoaded || !currentText}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ▶️ Reproduzir
          </button>
          <button
            onClick={pause}
            disabled={!isLoaded}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ⏸️ Pausar
          </button>
          <button
            onClick={stop}
            disabled={!isLoaded}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ⏹️ Parar
          </button>
        </div>
      </div>

      {/* Traduções Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ⚡ Traduções Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickTranslations.map((text, index) => (
            <button
              key={index}
              onClick={() => translate(text)}
              disabled={!isLoaded}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-lg text-left transition-colors"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ⚙️ Configurações do Player
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Região do Player
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="BR">Brasil (BR)</option>
              <option value="PT">Portugal (PT)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              <span className="text-sm font-medium text-gray-700">
                Habilitar estatísticas detalhadas
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Reprodução automática após tradução
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              <span className="text-sm font-medium text-gray-700">
                Mostrar notificações do sistema
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 Analytics Detalhadas
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Uso por Hora</h4>
            <div className="text-gray-600 text-sm">
              Gráfico de uso seria renderizado aqui com dados reais...
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Performance do Sistema</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tempo médio de carregamento:</span>
                <span className="text-sm font-medium">2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa de sucesso:</span>
                <span className="text-sm font-medium text-green-600">97.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tempo médio de tradução:</span>
                <span className="text-sm font-medium">1.8s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard VLibras
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema de Gerenciamento de Acessibilidade
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isLoaded ? '🟢 Sistema Online' : '🟡 Inicializando'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('translator')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'translator' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🎬 Tradutor
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Configurações
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'analytics' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📈 Analytics
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'translator' && renderTranslator()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>

          {/* Notifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">🔔 Notificações</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-red-600 hover:text-red-800 text-sm transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Nenhuma notificação
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start space-x-2">
                        <span>{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
