import { useState, useEffect } from 'react';
import { Scale, TrendingUp, TrendingDown, Calendar, Activity, Ruler, Save, Plus } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const BodyMetrics = ({ token }) => {
  const [measurements, setMeasurements] = useState([]);
  const [trends, setTrends] = useState(null);
  const [latest, setLatest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    weight_kg: '',
    muscle_mass_kg: '',
    fat_mass_percentage: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tracker/body-metrics/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMeasurements(data.measurements || []);
      setTrends(data.trends);
      setLatest(data.latest);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/api/tracker/body-metrics/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('✅ Medição cadastrada com sucesso!');
        setShowForm(false);
        setFormData({
          weight_kg: '',
          muscle_mass_kg: '',
          fat_mass_percentage: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchMetrics(); // Recarregar dados
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.error || 'Erro ao salvar medição');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar medição');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              📊 Medidas Corporais
            </h1>
            <p className="text-gray-600">Acompanhe sua evolução física</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105"
          >
            <Plus size={20} />
            Nova Medição
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-green-800 font-semibold">
            {successMessage}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Adicionar Medição</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Peso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Scale className="inline w-4 h-4 mr-1" />
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: 75.5"
                  />
                </div>

                {/* Massa Magra */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Ruler className="inline w-4 h-4 mr-1" />
                    Massa Magra (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.muscle_mass_kg}
                    onChange={(e) => setFormData({ ...formData, muscle_mass_kg: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: 60.5"
                  />
                </div>

                {/* Percentual de Gordura */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Activity className="inline w-4 h-4 mr-1" />
                    Gordura (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fat_mass_percentage}
                    onChange={(e) => setFormData({ ...formData, fat_mass_percentage: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: 15.5"
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Observações sobre treino, alimentação, etc..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Salvando...' : 'Salvar Medição'}
              </button>
            </form>
          </div>
        )}

        {/* Latest Metrics Cards */}
        {latest && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Peso */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-purple-600">Peso</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{latest.weight_kg}</p>
              <p className="text-sm text-gray-600">kg</p>
              {trends && trends.weight_change_kg !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  trends.weight_change_kg > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {trends.weight_change_kg > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(trends.weight_change_kg)} kg</span>
                </div>
              )}
            </div>

            {/* Massa Magra */}
            {latest.muscle_mass_kg && (
              <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
                    <Ruler className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">Massa Magra</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-1">{latest.muscle_mass_kg}</p>
                <p className="text-sm text-gray-600">kg ({latest.muscle_mass_percentage}%)</p>
              </div>
            )}

            {/* Gordura */}
            {latest.fat_percentage && (
              <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-orange-600">Gordura</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-1">{latest.fat_percentage}</p>
                <p className="text-sm text-gray-600">%</p>
                {trends && trends.fat_change_percent && trends.fat_change_percent !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${
                    trends.fat_change_percent > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {trends.fat_change_percent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(trends.fat_change_percent)}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Última Medição */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-600">Última</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {new Date(latest.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Medições</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma medição cadastrada</p>
              <p className="text-sm text-gray-400">Clique em "Nova Medição" para começar!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Peso (kg)</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Massa Magra (kg)</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Gordura (%)</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.slice().reverse().map((m, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-purple-50 transition">
                      <td className="py-4 px-4">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 px-4 font-semibold">{m.weight_kg}</td>
                      <td className="py-4 px-4">{m.muscle_mass_kg || '-'}</td>
                      <td className="py-4 px-4">{m.fat_percentage || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{m.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyMetrics;
