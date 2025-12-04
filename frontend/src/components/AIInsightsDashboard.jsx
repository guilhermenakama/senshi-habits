import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, Trophy, X, Check, RefreshCw } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const AIInsightsDashboard = ({ token }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, by-type

  useEffect(() => {
    fetchInsights();
  }, [filter]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/auth/insights/`;

      if (filter === 'unread') {
        url += '?is_read=false&is_dismissed=false';
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/profile/generate_insights/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchInsights();
      }
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/auth/insights/${id}/mark_read/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInsights();
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const dismissInsight = async (id) => {
    try {
      await fetch(`${API_URL}/api/auth/insights/${id}/dismiss/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInsights();
    } catch (error) {
      console.error('Erro ao dispensar insight:', error);
    }
  };

  const getInsightIcon = (type) => {
    const icons = {
      motivation: <Sparkles className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      advice: <Lightbulb className="w-5 h-5" />,
      celebration: <Trophy className="w-5 h-5" />,
      nutrition: <span className="text-lg">🥗</span>,
      training: <span className="text-lg">💪</span>,
      habit: <span className="text-lg">✅</span>,
      mental: <span className="text-lg">🧠</span>,
    };
    return icons[type] || <Lightbulb className="w-5 h-5" />;
  };

  const getInsightColor = (type) => {
    const colors = {
      motivation: 'bg-blue-100 text-blue-800 border-blue-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      advice: 'bg-purple-100 text-purple-800 border-purple-300',
      celebration: 'bg-green-100 text-green-800 border-green-300',
      nutrition: 'bg-orange-100 text-orange-800 border-orange-300',
      training: 'bg-red-100 text-red-800 border-red-300',
      habit: 'bg-teal-100 text-teal-800 border-teal-300',
      mental: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      1: { label: 'Baixa', color: 'bg-gray-200 text-gray-700' },
      2: { label: 'Média', color: 'bg-blue-200 text-blue-700' },
      3: { label: 'Alta', color: 'bg-red-200 text-red-700' },
    };
    const badge = badges[priority] || badges[2];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading && insights.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Carregando insights...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Coach Insights
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Conselhos personalizados baseados no seu perfil comportamental
          </p>
        </div>

        <button
          onClick={generateInsights}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Gerando...' : 'Gerar Novos'}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({insights.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Não Lidos
        </button>
      </div>

      {/* Lista de Insights */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Nenhum insight ainda</p>
            <p className="text-sm mt-2">Clique em "Gerar Novos" para receber conselhos personalizados</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`relative border-2 rounded-lg p-5 transition ${
                getInsightColor(insight.insight_type)
              } ${insight.is_read ? 'opacity-70' : 'shadow-md'}`}
            >
              {/* Badge não lido */}
              {!insight.is_read && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NOVO
                </div>
              )}

              {/* Header do Insight */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{insight.title}</h3>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(insight.created_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 flex-shrink-0">
                  {!insight.is_read && (
                    <button
                      onClick={() => markAsRead(insight.id)}
                      className="p-2 hover:bg-white/50 rounded-lg transition"
                      title="Marcar como lido"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    className="p-2 hover:bg-white/50 rounded-lg transition"
                    title="Dispensar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {insight.content}
              </div>

              {/* Tag do tipo */}
              <div className="mt-3 text-xs opacity-75">
                📌 {insight.insight_type_display}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
