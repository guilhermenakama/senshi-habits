import AIInsightsDashboard from '../components/AIInsightsDashboard';
import { Sparkles, ArrowRight, Target, Brain, TrendingUp, Heart, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AICoach = ({ token }) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-3xl p-10 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight">AI Sensei</h1>
              <p className="text-xl text-purple-100 mt-2">
                Seu mentor pessoal baseado em IA 🥋
              </p>
            </div>
          </div>

          <p className="text-lg text-white/90 max-w-2xl mb-8 leading-relaxed">
            Um coach inteligente que entende sua personalidade, seus desafios e seus objetivos.
            Receba insights personalizados, motivação adaptada ao seu perfil e antecipe recaídas antes que aconteçam.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <div className="font-semibold text-lg">Insights Personalizados</div>
              <div className="text-sm text-purple-100 mt-2">
                Baseados em MBTI, DISC e Eneagrama
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3">🛡️</div>
              <div className="font-semibold text-lg">Prevenção de Recaídas</div>
              <div className="text-sm text-purple-100 mt-2">
                Antecipa problemas antes de ocorrerem
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3">⚡</div>
              <div className="font-semibold text-lg">Motivação Adaptativa</div>
              <div className="text-sm text-purple-100 mt-2">
                Linguagem calibrada para seu perfil
              </div>
            </div>
          </div>

          <Link
            to="/profile/behavioral"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:scale-105 hover:shadow-xl transition-all"
          >
            <Brain className="w-5 h-5" />
            Configurar My Personality
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Dashboard de Insights */}
      <AIInsightsDashboard token={token} />

      {/* Como Funciona - Redesigned */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-7 h-7 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-800">Como o AI Sensei Funciona?</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Análise Contínua</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A IA analisa constantemente seus hábitos, treinos, alimentação e progresso
              na Roda da Vida para identificar padrões e tendências invisíveis.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500 text-white rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Personalização Profunda</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Com base no seu perfil comportamental (MBTI, DISC, Eneagrama), a IA adapta
              a linguagem e as estratégias para o que funciona melhor com você.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 text-white rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Insights Acionáveis</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Não são apenas observações genéricas. Cada insight vem com ações concretas
              e específicas para sua situação atual.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500 text-white rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Previsão de Desafios</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Baseado nos seus gatilhos e padrões históricos, a IA antecipa possíveis
              recaídas e oferece estratégias preventivas personalizadas.
            </p>
          </div>
        </div>
      </div>

      {/* Tipos de Insights - Redesigned */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-7 h-7 text-pink-500" />
          <h2 className="text-3xl font-bold text-gray-800">Tipos de Insights que Você Recebe</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group p-6 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-xl transition-all hover:scale-105 hover:shadow-lg">
            <div className="text-4xl mb-3">💪</div>
            <div className="font-bold text-lg text-gray-800 mb-2">Motivação</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Encorajamento personalizado nos momentos certos, adaptado ao seu perfil
            </div>
          </div>

          <div className="group p-6 bg-white hover:bg-yellow-50 border-2 border-yellow-200 rounded-xl transition-all hover:scale-105 hover:shadow-lg">
            <div className="text-4xl mb-3">⚠️</div>
            <div className="font-bold text-lg text-gray-800 mb-2">Alertas</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Avisos sobre padrões de risco, estagnação ou comportamentos negativos
            </div>
          </div>

          <div className="group p-6 bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-xl transition-all hover:scale-105 hover:shadow-lg">
            <div className="text-4xl mb-3">💡</div>
            <div className="font-bold text-lg text-gray-800 mb-2">Conselhos</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Estratégias práticas e acionáveis para seus desafios específicos
            </div>
          </div>

          <div className="group p-6 bg-white hover:bg-green-50 border-2 border-green-200 rounded-xl transition-all hover:scale-105 hover:shadow-lg">
            <div className="text-4xl mb-3">🏆</div>
            <div className="font-bold text-lg text-gray-800 mb-2">Celebrações</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Reconhecimento autêntico das suas conquistas e progresso
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
