import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Flame,
  Calendar,
  BarChart3,
  Activity,
  Trophy,
  Zap,
  Heart,
  Brain,
  Users,
  Briefcase,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Scale,
  Ruler
} from 'lucide-react';
import useHabits from '../hooks/useHabits';
import useHabitStats from '../hooks/useHabitStats';
import useProgressComparison from '../hooks/useProgressComparison';
import useBodyMetrics from '../hooks/useBodyMetrics';

const Dashboard = ({ token }) => {
  const { habits, isLoading: habitsLoading } = useHabits(token);
  const { stats: habitStats, isLoading: statsLoading } = useHabitStats(token);

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { comparison, isLoading: comparisonLoading } = useProgressComparison(token, selectedPeriod);
  const { metrics: bodyMetrics, isLoading: metricsLoading } = useBodyMetrics(token, 12);

  const [lifeAreas, setLifeAreas] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    // Simular dados semanais para o gráfico (posteriormente vamos buscar dados reais)
    const weekly = Array.from({ length: 7 }, (_, i) => ({
      day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
      value: Math.floor(Math.random() * 10) + 2
    }));

    setWeeklyData(weekly);
  }, []);

  useEffect(() => {
    // Buscar dados da Roda da Vida
    fetchLifeAreas();
  }, [token]);

  const fetchLifeAreas = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/tracker/life-assessments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setLifeAreas([
          { name: 'Saúde', value: latest.health || 0, icon: Heart, color: 'from-red-500 to-pink-500' },
          { name: 'Carreira', value: latest.career || 0, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
          { name: 'Relacionamentos', value: latest.relationships || 0, icon: Users, color: 'from-purple-500 to-pink-500' },
          { name: 'Mental', value: latest.mental_health || 0, icon: Brain, color: 'from-indigo-500 to-purple-500' }
        ]);
      }
    } catch (err) {
      console.error('Erro ao buscar life areas:', err);
    }
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Bom dia' : today.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">

      {/* Header com Saudação */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {greeting} 👋
            </h1>
            <p className="text-gray-600">
              {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sequência Atual</p>
              <p className="text-3xl font-bold text-gray-900">{habitStats.streak}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Insights Rápidos */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Continue Assim!</h3>
                <p className="text-blue-100 text-sm">
                  Você está {habitStats.streak || 0} dias consecutivos mantendo seus hábitos
                </p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                <div className="text-2xl font-bold">{habitStats.total_habits || 0}</div>
                <div className="text-xs text-blue-100">Hábitos Ativos</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                <div className="text-2xl font-bold">{habitStats.completed_week || 0}</div>
                <div className="text-xs text-blue-100">Esta Semana</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {comparison?.comparison?.habits_trend === 'up' ? (
                    <><ArrowUp className="w-5 h-5" /> +{comparison.comparison.habits_change_percent}%</>
                  ) : comparison?.comparison?.habits_trend === 'down' ? (
                    <><ArrowDown className="w-5 h-5" /> {comparison.comparison.habits_change_percent}%</>
                  ) : (
                    <><Minus className="w-5 h-5" /> 0%</>
                  )}
                </div>
                <div className="text-xs text-blue-100">vs. Período Anterior</div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards - Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card: Hábitos Hoje */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-green-100 hover:border-green-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-600">Hoje</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{habitStats.completed_today || 0}</p>
            <p className="text-sm text-gray-600">Hábitos Completados</p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                style={{ width: `${habitStats.completion_rate_today || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Card: Treinos da Semana */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-blue-600">Esta Semana</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{habitStats.workout_count || 0}/5</p>
            <p className="text-sm text-gray-600">Treinos Realizados</p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                style={{ width: `${Math.min(((habitStats.workout_count || 0) / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card: Total da Semana */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-600">7 Dias</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{habitStats.completed_week || 0}</p>
            <p className="text-sm text-gray-600">Ações Totais</p>
            <div className="mt-4 flex items-end justify-between gap-1 h-12">
              {weeklyData.map((day, i) => {
                const maxValue = Math.max(...weeklyData.map(d => d.value));
                const heightPercentage = (day.value / maxValue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-600 rounded transition-all hover:opacity-80"
                      style={{ height: `${heightPercentage}%` }}
                      title={`${day.day}: ${day.value} ações`}
                    ></div>
                    <span className="text-xs text-gray-400">{day.day.substring(0, 1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Pontuação Geral */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-orange-100 hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-orange-600">Score</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{habitStats.score || 0}</p>
            <p className="text-sm text-gray-600">Pontuação Geral</p>
            <div className="mt-4 flex items-center gap-2">
              {comparison?.comparison?.habits_trend === 'up' ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-semibold">
                    +{comparison.comparison.habits_change_percent}% vs período anterior
                  </span>
                </>
              ) : comparison?.comparison?.habits_trend === 'down' ? (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-semibold">
                    {comparison.comparison.habits_change_percent}% vs período anterior
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-semibold">Estável</span>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Seção Principal - 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna Esquerda: Pilares da Vida */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Pilares da Vida</h2>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              {lifeAreas.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    Média: {(lifeAreas.reduce((acc, area) => acc + area.value, 0) / lifeAreas.length).toFixed(1)}/10
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lifeAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-gradient-to-br ${area.color} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                        <area.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">{area.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{area.value}/10</span>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${area.color} rounded-full transition-all duration-500 group-hover:shadow-lg`}
                      style={{ width: `${area.value * 10}%` }}
                    ></div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {area.value >= 7 ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Excelente!
                        </span>
                      ) : area.value >= 5 ? (
                        <span className="text-yellow-600 font-semibold flex items-center gap-1">
                          <Zap className="w-4 h-4" /> Bom
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> Precisa atenção
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            i < area.value ? `bg-gradient-to-r ${area.color}` : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {lifeAreas.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-2 font-semibold">Nenhuma avaliação ainda</p>
                <p className="text-gray-500 text-sm mb-4">Avalie suas áreas de vida para ter insights estratégicos</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
                  Fazer Primeira Avaliação
                </button>
              </div>
            )}
          </div>

          {/* Coluna Direita: Quick Stats */}
          <div className="space-y-6">

            {/* Hábitos de Hoje */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Hábitos Hoje</h3>
                  {habitStats.total_habits > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {habitStats.completed_today}/{habitStats.total_habits}
                    </span>
                  )}
                </div>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>

              {habitsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Nenhum hábito cadastrado</p>
                  <p className="text-gray-400 text-xs mt-1">Crie seu primeiro hábito!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.slice(0, 6).map((habit, idx) => {
                    const isCompleted = idx % 2 === 0; // Simulação
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm font-medium ${
                            isCompleted ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {habit.name}
                          </span>
                        </div>
                        {isCompleted && (
                          <Flame className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    );
                  })}
                  {habits.length > 6 && (
                    <div className="text-center pt-2">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                        Ver todos ({habits.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Próximas Metas */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Próximas Metas</h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Treinar 5x esta semana</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">{habitStats.workout_count || 0}/5</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all shadow-lg"
                      style={{ width: `${Math.min(((habitStats.workout_count || 0) / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {(habitStats.workout_count || 0) >= 5 && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Trophy className="w-3 h-3" />
                      <span>Meta alcançada!</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">30 dias de sequência</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">{habitStats.streak || 0}/30</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full transition-all shadow-lg"
                      style={{ width: `${Math.min(((habitStats.streak || 0) / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs opacity-80">
                    Faltam {Math.max(30 - (habitStats.streak || 0), 0)} dias para alcançar!
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Completar todos os hábitos hoje</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">{habitStats.completed_today || 0}/{habitStats.total_habits || 0}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-300 to-emerald-400 rounded-full transition-all shadow-lg"
                      style={{ width: `${habitStats.total_habits > 0 ? ((habitStats.completed_today || 0) / habitStats.total_habits) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivação do Dia */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Frase do Dia</h3>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "O sucesso é a soma de pequenos esforços repetidos dia após dia."
              </p>
              <p className="text-sm text-gray-500 mt-2">— Robert Collier</p>
            </div>

          </div>

        </div>

        {/* Comparação de Períodos */}
        {comparison && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Comparação de Progresso</h2>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="month">Último Mês</option>
                <option value="3months">Últimos 3 Meses</option>
                <option value="6months">Últimos 6 Meses</option>
                <option value="year">Último Ano</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hábitos Completados */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">Hábitos Completados</h3>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    comparison.comparison.habits_trend === 'up' ? 'bg-green-100 text-green-700' :
                    comparison.comparison.habits_trend === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {comparison.comparison.habits_trend === 'up' ? <ArrowUp className="w-4 h-4" /> :
                     comparison.comparison.habits_trend === 'down' ? <ArrowDown className="w-4 h-4" /> :
                     <Minus className="w-4 h-4" />}
                    <span className="text-sm font-bold">{comparison.comparison.habits_change_percent}%</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Período Atual</p>
                    <p className="text-3xl font-bold text-gray-900">{comparison.current_period.habits_completed}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Período Anterior</p>
                    <p className="text-2xl font-semibold text-gray-500">{comparison.previous_period.habits_completed}</p>
                  </div>
                </div>
              </div>

              {/* Treinos Completados */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Treinos Completados</h3>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    comparison.comparison.workouts_trend === 'up' ? 'bg-green-100 text-green-700' :
                    comparison.comparison.workouts_trend === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {comparison.comparison.workouts_trend === 'up' ? <ArrowUp className="w-4 h-4" /> :
                     comparison.comparison.workouts_trend === 'down' ? <ArrowDown className="w-4 h-4" /> :
                     <Minus className="w-4 h-4" />}
                    <span className="text-sm font-bold">{comparison.comparison.workouts_change_percent}%</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Período Atual</p>
                    <p className="text-3xl font-bold text-gray-900">{comparison.current_period.workouts_completed}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Período Anterior</p>
                    <p className="text-2xl font-semibold text-gray-500">{comparison.previous_period.workouts_completed}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Corporais */}
        {bodyMetrics?.latest && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Evolução Corporal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Peso Atual */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Peso</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{bodyMetrics.latest.weight_kg}</p>
                <p className="text-xs text-gray-600">kg</p>
                {bodyMetrics.trends.weight_change_kg !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${
                    bodyMetrics.trends.weight_change_kg > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {bodyMetrics.trends.weight_change_kg > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{Math.abs(bodyMetrics.trends.weight_change_kg)} kg</span>
                  </div>
                )}
              </div>

              {/* Gordura Corporal */}
              {bodyMetrics.latest.fat_percentage && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-700">Gordura</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{bodyMetrics.latest.fat_percentage}</p>
                  <p className="text-xs text-gray-600">%</p>
                  {bodyMetrics.trends.fat_change_percent && bodyMetrics.trends.fat_change_percent !== 0 && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${
                      bodyMetrics.trends.fat_change_percent > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {bodyMetrics.trends.fat_change_percent > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      <span>{Math.abs(bodyMetrics.trends.fat_change_percent)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Massa Muscular */}
              {bodyMetrics.latest.muscle_mass_kg && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Massa Magra</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{bodyMetrics.latest.muscle_mass_kg}</p>
                  <p className="text-xs text-gray-600">kg ({bodyMetrics.latest.muscle_mass_percentage}%)</p>
                </div>
              )}

              {/* Última Medição */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">Última Medição</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(bodyMetrics.latest.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Gráfico Simplificado de Evolução */}
            {bodyMetrics.measurements.length > 1 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução de Peso (últimas {bodyMetrics.measurements.length} medições)</h3>
                <div className="flex items-end justify-between gap-2 h-32">
                  {bodyMetrics.measurements.map((m, i) => {
                    const maxWeight = Math.max(...bodyMetrics.measurements.map(item => item.weight_kg));
                    const minWeight = Math.min(...bodyMetrics.measurements.map(item => item.weight_kg));
                    const range = maxWeight - minWeight || 1;
                    const heightPercentage = ((m.weight_kg - minWeight) / range) * 100;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-pink-600 rounded transition-all hover:opacity-80"
                          style={{ height: `${heightPercentage}%` }}
                          title={`${new Date(m.date).toLocaleDateString('pt-BR')}: ${m.weight_kg}kg`}
                        ></div>
                        <span className="text-xs text-gray-400 rotate-45 origin-top-left">
                          {new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
