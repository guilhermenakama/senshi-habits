import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Save, Settings, Dumbbell, Copy, X, Check, Search } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const Training = ({ token }) => {
  const [templates, setTemplates] = useState([]);
  const [exercisesList, setExercisesList] = useState([]);

  const [activeTemplate, setActiveTemplate] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    exercises: []
  });

  // States para autocomplete de exercícios
  const [searchTerms, setSearchTerms] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const searchRefs = useRef({});

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const resTemp = await fetch(`${API_URL}/api/tracker/templates/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataTemp = await resTemp.json();
      setTemplates(dataTemp);

      fetchExercises();
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      const resEx = await fetch(`${API_URL}/api/tracker/exercises/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEx = await resEx.json();
      setExercisesList(dataEx);
    } catch (err) {
      console.error("Erro ao carregar exercícios:", err);
    }
  };

  const getExerciseType = (exerciseName) => {
    const ex = exercisesList.find(e => e.name === exerciseName);
    return ex ? ex.exercise_type : 'strength';
  };

  const getExerciseMuscle = (exerciseName) => {
    const ex = exercisesList.find(e => e.name === exerciseName);
    return ex ? ex.muscle_group : '';
  };

  const handleCreateNew = () => {
    setActiveTemplate('new');
    setFormData({
      name: '',
      exercises: []
    });
  };

  const handleEdit = (template) => {
    setActiveTemplate(template.id);
    let exercises = JSON.parse(template.exercises_data);
    setFormData({ name: template.name, exercises });
  };

  const handleDuplicate = async (template) => {
    const exercises = JSON.parse(template.exercises_data);
    setActiveTemplate('new');
    setFormData({
      name: `${template.name} (Cópia)`,
      exercises
    });
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm("Deletar esta ficha?")) return;

    try {
      await fetch(`${API_URL}/api/tracker/templates/${templateId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
      if (activeTemplate === templateId) setActiveTemplate(null);
    } catch (err) {
      alert("Erro ao deletar ficha");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return alert("Dê um nome para a ficha!");

    const cleanExercises = formData.exercises.filter(e => e.exercise_name !== '');
    if (cleanExercises.length === 0) return alert("Adicione pelo menos um exercício!");

    const payload = {
      name: formData.name,
      exercises_data: JSON.stringify(cleanExercises)
    };

    const url = activeTemplate === 'new'
      ? `${API_URL}/api/tracker/templates/`
      : `${API_URL}/api/tracker/templates/${activeTemplate}/`;

    const method = activeTemplate === 'new' ? 'POST' : 'PUT';

    setSaving(true);
    try {
      await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      fetchData();
      setActiveTemplate(null);
      setFormData({ name: '', exercises: [] });
    } catch (err) {
      alert("Erro ao salvar ficha!");
    } finally {
      setSaving(false);
    }
  };

  const ExerciseModal = () => {
    const [newEx, setNewEx] = useState({ name: '', type: 'strength', muscle: '' });
    const [creating, setCreating] = useState(false);

    const saveExercise = async () => {
      if (!newEx.name.trim()) return alert("Nome obrigatório");

      setCreating(true);
      try {
        await fetch(`${API_URL}/api/tracker/exercises/`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newEx.name.trim(),
            exercise_type: newEx.type,
            muscle_group: newEx.muscle.trim()
          })
        });

        fetchExercises();
        setShowExerciseModal(false);
      } catch (err) {
        alert("Erro ao criar exercício!");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExerciseModal(false)}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Novo Exercício</h3>
            <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Exercício</label>
              <input
                placeholder="Ex: Supino Reto, Agachamento, Corrida"
                value={newEx.name}
                onChange={e => setNewEx({...newEx, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Exercício</label>
              <select
                value={newEx.type}
                onChange={e => setNewEx({...newEx, type: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="strength">💪 Musculação (Sets/Reps/Peso)</option>
                <option value="cardio">🏃 Cardio (Tempo/Distância)</option>
                <option value="calisthenics">🤸 Calistenia (Sets/Reps)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo Muscular (Opcional)</label>
              <input
                placeholder="Ex: Peito, Pernas, Costas"
                value={newEx.muscle}
                onChange={e => setNewEx({...newEx, muscle: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveExercise}
                disabled={creating || !newEx.name.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Salvar
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExerciseModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const updateRow = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, {
        exercise_name: '',
        sets: '',
        reps: '',
        weight: '',
        time: '',
        distance: ''
      }]
    });
  };

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  // Autocomplete functions
  const getFilteredExercises = (idx) => {
    const searchTerm = searchTerms[idx] || '';
    if (!searchTerm) return exercisesList;

    return exercisesList.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleExerciseSearchChange = (idx, value) => {
    setSearchTerms({ ...searchTerms, [idx]: value });
    setShowDropdown({ ...showDropdown, [idx]: true });
  };

  const handleExerciseSelect = (idx, exerciseName) => {
    updateRow(idx, 'exercise_name', exerciseName);
    setSearchTerms({ ...searchTerms, [idx]: '' });
    setShowDropdown({ ...showDropdown, [idx]: false });
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showDropdown).forEach(idx => {
        if (showDropdown[idx] && searchRefs.current[idx] && !searchRefs.current[idx].contains(event.target)) {
          setShowDropdown({ ...showDropdown, [idx]: false });
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {showExerciseModal && <ExerciseModal />}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Workout Templates</h1>
              <p className="text-gray-600 mt-1">Gerencie suas fichas de treino</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowExerciseModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:shadow-lg transition-all border-2 border-gray-200"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Novo Exercício</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Nova Ficha
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[300px_1fr] gap-6">

        {/* Sidebar - Lista de Fichas */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-600" />
            Minhas Fichas
          </h3>

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Nenhuma ficha criada ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  className={`group p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    activeTemplate === t.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div onClick={() => handleEdit(t)} className="flex-1">
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {JSON.parse(t.exercises_data).length} exercícios
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(t); }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor de Ficha */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {!activeTemplate ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Dumbbell className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma ficha selecionada</h3>
              <p className="text-gray-500 mb-6">Selecione uma ficha existente ou crie uma nova</p>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Ficha
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Nome da Ficha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Ficha</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  className="w-full px-4 py-4 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Lista de Exercícios */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Exercícios</h4>
                  <span className="text-sm text-gray-500">{formData.exercises.length} exercícios</span>
                </div>

                <div className="space-y-3">
                  {formData.exercises.map((row, idx) => {
                    const type = getExerciseType(row.exercise_name);
                    const muscle = getExerciseMuscle(row.exercise_name);
                    const isCardio = type === 'cardio';

                    return (
                      <div key={idx} className="group p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            {/* Autocomplete de Exercício */}
                            <div className="relative" ref={el => searchRefs.current[idx] = el}>
                              {row.exercise_name ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-white font-semibold text-gray-900">
                                    {row.exercise_name}
                                    {muscle && <span className="text-xs text-gray-500 ml-2">🎯 {muscle}</span>}
                                  </div>
                                  <button
                                    onClick={() => updateRow(idx, 'exercise_name', '')}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Trocar exercício"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="relative">
                                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="Digite para buscar exercício..."
                                      value={searchTerms[idx] || ''}
                                      onChange={(e) => handleExerciseSearchChange(idx, e.target.value)}
                                      onFocus={() => setShowDropdown({ ...showDropdown, [idx]: true })}
                                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none font-semibold"
                                    />
                                  </div>

                                  {showDropdown[idx] && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                      {getFilteredExercises(idx).length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                          Nenhum exercício encontrado
                                        </div>
                                      ) : (
                                        getFilteredExercises(idx).map(ex => (
                                          <button
                                            key={ex.id}
                                            onClick={() => handleExerciseSelect(idx, ex.name)}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                          >
                                            <div className="font-semibold text-gray-900">{ex.name}</div>
                                            {ex.muscle_group && (
                                              <div className="text-xs text-gray-500 mt-1">🎯 {ex.muscle_group}</div>
                                            )}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Campos de Input Dinâmicos */}
                            <div className="grid grid-cols-3 gap-2">
                              {!isCardio ? (
                                <>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sets</label>
                                    <input
                                      type="number"
                                      value={row.sets}
                                      onChange={e => updateRow(idx, 'sets', e.target.value)}
                                      placeholder="3"
                                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Reps</label>
                                    <input
                                      type="number"
                                      value={row.reps}
                                      onChange={e => updateRow(idx, 'reps', e.target.value)}
                                      placeholder="12"
                                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Peso (kg)</label>
                                    <input
                                      type="number"
                                      value={row.weight}
                                      onChange={e => updateRow(idx, 'weight', e.target.value)}
                                      placeholder="60"
                                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo</label>
                                    <input
                                      type="text"
                                      value={row.time}
                                      onChange={e => updateRow(idx, 'time', e.target.value)}
                                      placeholder="00:30:00"
                                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Dist (km)</label>
                                    <input
                                      type="number"
                                      value={row.distance}
                                      onChange={e => updateRow(idx, 'distance', e.target.value)}
                                      placeholder="5"
                                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Botão Deletar */}
                          <button
                            onClick={() => removeExercise(idx)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botão Adicionar Exercício */}
                <button
                  onClick={addExercise}
                  className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Exercício
                </button>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setActiveTemplate(null);
                    setFormData({ name: '', exercises: [] });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Ficha
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;
