import { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Camera,
  Dumbbell,
  BookOpen,
  Save,
  Loader2,
  ChevronDown,
  Plus,
  X,
  Smile,
  Meh,
  Frown,
  Heart,
  Sparkles,
  Search
} from 'lucide-react';
import useHabits from '../hooks/useHabits';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const DailyLog = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Hábitos
  const { habits, isLoading: habitsLoading } = useHabits(token);
  const [checkedHabits, setCheckedHabits] = useState(new Set());

  // Nutrição
  const [nutritionFile, setNutritionFile] = useState(null);
  const [nutritionPreview, setNutritionPreview] = useState(null);
  const [nutritionResult, setNutritionResult] = useState("");
  const [analyzingNutrition, setAnalyzingNutrition] = useState(false);

  // Treino
  const [workoutData, setWorkoutData] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [exercisesList, setExercisesList] = useState([]);
  const [showTemplateSelect, setShowTemplateSelect] = useState(false);

  // Autocomplete de exercícios
  const [searchTerms, setSearchTerms] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const searchRefs = useRef({});

  // Journal
  const [journal, setJournal] = useState({ content: '', mood: null });

  useEffect(() => {
    fetchTemplates();
    fetchExercises();
    loadTodayData();
  }, [token, date]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tracker/templates/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tracker/exercises/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setExercisesList(data);
    } catch (err) {
      console.error("Erro ao carregar exercícios:", err);
    }
  };

  const loadTodayData = async () => {
    // Aqui você pode carregar dados já salvos do dia, se necessário
    // Por enquanto, vamos começar limpo
  };

  const handleNutritionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNutritionFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNutritionPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNutritionAnalyze = async () => {
    if (!nutritionFile) return;

    setAnalyzingNutrition(true);
    const formData = new FormData();
    formData.append('image', nutritionFile);

    try {
      const res = await fetch(`${API_URL}/api/vision/analyze/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setNutritionResult(prev => prev + (prev ? '\n\n' : '') + `🍽️ ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n${data.description}`);
      setNutritionFile(null);
      setNutritionPreview(null);
    } catch (err) {
      alert("Erro ao analisar refeição");
    } finally {
      setAnalyzingNutrition(false);
    }
  };

  const handleLoadTemplate = (templateId) => {
    console.log('Loading template:', templateId, templates);
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      console.log('Template found:', template);
      try {
        const data = JSON.parse(template.exercises_data);
        console.log('Parsed exercises:', data);
        // Ensure all exercises have the completed field
        const exercisesWithCompleted = data.map(ex => ({
          ...ex,
          completed: false
        }));
        setWorkoutData(exercisesWithCompleted);
        setShowTemplateSelect(false);
        console.log('Template loaded successfully:', exercisesWithCompleted);
      } catch (error) {
        console.error('Error parsing template exercises:', error);
        alert('Erro ao carregar template. Tente novamente.');
      }
    } else {
      console.error('Template not found with ID:', templateId);
    }
  };

  const addExercise = () => {
    setWorkoutData([...workoutData, {
      exercise_name: '',
      sets: '',
      reps: '',
      weight: '',
      time: '',
      distance: '',
      completed: false
    }]);
  };

  const updateExercise = (index, field, value) => {
    const newData = [...workoutData];
    newData[index] = { ...newData[index], [field]: value };
    setWorkoutData(newData);
  };

  const removeExercise = (index) => {
    setWorkoutData(workoutData.filter((_, i) => i !== index));
  };

  const toggleExerciseComplete = (index) => {
    const newData = [...workoutData];
    newData[index].completed = !newData[index].completed;
    setWorkoutData(newData);
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
    updateExercise(idx, 'exercise_name', exerciseName);
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

  const handleSaveDay = async () => {
    setLoading(true);
    setSaved(false);

    try {
      // 1. Salvar hábitos completados
      const completedHabitsIds = Array.from(checkedHabits);
      if (completedHabitsIds.length > 0) {
        await Promise.all(completedHabitsIds.map(habitId =>
          fetch(`${API_URL}/api/tracker/habit-logs/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              habit: habitId,
              date: date,
              completed: true
            })
          })
        ));
      }

      // 2. Salvar treino
      const completedExercises = workoutData.filter(ex => ex.exercise_name && ex.exercise_name.trim());
      if (completedExercises.length > 0) {
        await fetch(`${API_URL}/api/tracker/workouts/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `Treino - ${new Date(date).toLocaleDateString('pt-BR')}`,
            date_time: new Date(date).toISOString(),
            exercises_data: JSON.stringify(completedExercises),
            feeling: journal.mood || 3
          })
        });
      }

      // 3. Salvar journal
      if (journal.content.trim() || journal.mood) {
        await fetch(`${API_URL}/api/tracker/journal/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: journal.content,
            mood_rating: journal.mood || 3,
            date: date
          })
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (error) {
      console.error("Erro ao salvar dia:", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { value: 1, icon: Frown, label: 'Péssimo', color: 'from-red-500 to-red-600' },
    { value: 2, icon: Meh, label: 'Ruim', color: 'from-orange-500 to-orange-600' },
    { value: 3, icon: Smile, label: 'Ok', color: 'from-yellow-500 to-yellow-600' },
    { value: 4, icon: Smile, label: 'Bom', color: 'from-green-500 to-green-600' },
    { value: 5, icon: Heart, label: 'Ótimo', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Journal</h1>
              <p className="text-gray-600 text-sm">Registre seu dia de forma rápida</p>
            </div>
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-semibold"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hábitos */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Hábitos Diários</h2>
          </div>

          {habitsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum hábito cadastrado</p>
              <p className="text-gray-400 text-sm">Vá em Habit Goals para criar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => {
                    const newSet = new Set(checkedHabits);
                    if (newSet.has(habit.id)) {
                      newSet.delete(habit.id);
                    } else {
                      newSet.add(habit.id);
                    }
                    setCheckedHabits(newSet);
                  }}
                  className={`group p-4 rounded-xl border-2 transition-all text-left ${
                    checkedHabits.has(habit.id)
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-md'
                      : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      checkedHabits.has(habit.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 group-hover:border-green-300'
                    }`}>
                      {checkedHabits.has(habit.id) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`font-semibold ${
                      checkedHabits.has(habit.id) ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {habit.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nutrição */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <Camera className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Nutrição</h2>
          </div>

          <div className="space-y-4">
            {nutritionPreview && (
              <div className="relative">
                <img src={nutritionPreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                <button
                  onClick={() => {
                    setNutritionFile(null);
                    setNutritionPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Escolher Foto</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNutritionFileChange}
                  className="hidden"
                />
              </label>

              {nutritionFile && (
                <button
                  onClick={handleNutritionAnalyze}
                  disabled={analyzingNutrition}
                  className="px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {analyzingNutrition ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analisar
                    </>
                  )}
                </button>
              )}
            </div>

            {nutritionResult && (
              <textarea
                value={nutritionResult}
                onChange={(e) => setNutritionResult(e.target.value)}
                placeholder="Histórico de refeições..."
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none font-mono text-sm"
              />
            )}
          </div>
        </div>

        {/* Treino */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Treino</h2>
            </div>

            <button
              onClick={() => setShowTemplateSelect(!showTemplateSelect)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-semibold"
            >
              <ChevronDown className="w-4 h-4" />
              Templates
            </button>
          </div>

          {showTemplateSelect && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Selecione um template:</p>
              <div className="grid grid-cols-2 gap-2">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleLoadTemplate(t.id)}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {workoutData.map((exercise, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exercise.completed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleExerciseComplete(idx)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                      exercise.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {exercise.completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>

                  <div className="flex-1 space-y-2">
                    {/* Autocomplete de Exercício */}
                    <div className="relative" ref={el => searchRefs.current[idx] = el}>
                      {exercise.exercise_name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={exercise.exercise_name}
                            readOnly
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white font-semibold"
                          />
                          <button
                            onClick={() => updateExercise(idx, 'exercise_name', '')}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Trocar exercício"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Buscar exercício..."
                              value={searchTerms[idx] || ''}
                              onChange={(e) => handleExerciseSearchChange(idx, e.target.value)}
                              onFocus={() => setShowDropdown({ ...showDropdown, [idx]: true })}
                              className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-semibold"
                            />
                          </div>

                          {showDropdown[idx] && (
                            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                              {getFilteredExercises(idx).length === 0 ? (
                                <div className="p-3 text-center text-gray-500 text-sm">
                                  Nenhum exercício encontrado
                                </div>
                              ) : (
                                getFilteredExercises(idx).map(ex => (
                                  <button
                                    key={ex.id}
                                    onClick={() => handleExerciseSelect(idx, ex.name)}
                                    className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-semibold text-gray-900 text-sm">{ex.name}</div>
                                    {ex.muscle_group && (
                                      <div className="text-xs text-gray-500">🎯 {ex.muscle_group}</div>
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                        placeholder="Sets"
                        className="px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-sm"
                      />
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                        placeholder="Reps"
                        className="px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-sm"
                      />
                      <input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                        placeholder="Kg"
                        className="px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-sm"
                      />
                      <input
                        type="text"
                        value={exercise.time}
                        onChange={(e) => updateExercise(idx, 'time', e.target.value)}
                        placeholder="Tempo"
                        className="px-2 py-1 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeExercise(idx)}
                    className="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addExercise}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold text-gray-600"
            >
              <Plus className="w-5 h-5" />
              Adicionar Exercício
            </button>
          </div>
        </div>

        {/* Journal & Mood */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Diário & Humor</h2>
          </div>

          <div className="space-y-4">
            {/* Mood Selector */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Como foi seu dia?</p>
              <div className="grid grid-cols-5 gap-2">
                {moods.map(({ value, icon: Icon, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setJournal({ ...journal, mood: value })}
                    className={`group relative p-4 rounded-xl border-2 transition-all ${
                      journal.mood === value
                        ? `bg-gradient-to-br ${color} border-transparent text-white shadow-lg scale-105`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-1 ${
                      journal.mood === value ? 'text-white' : 'text-gray-600'
                    }`} />
                    <p className={`text-xs font-semibold text-center ${
                      journal.mood === value ? 'text-white' : 'text-gray-600'
                    }`}>
                      {label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Text */}
            <textarea
              value={journal.content}
              onChange={(e) => setJournal({ ...journal, content: e.target.value })}
              placeholder="Como foi seu dia? O que você aprendeu? Como se sentiu? ✨"
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveDay}
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            saved
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
          } disabled:opacity-50`}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Dia Salvo com Sucesso!
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Salvar Meu Dia
            </>
          )}
        </button>

        <div className="text-center text-sm text-gray-500 pb-8">
          <p>💡 Preencha ao menos uma seção para salvar</p>
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
