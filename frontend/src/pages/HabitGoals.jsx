import { useState } from 'react';
import useHabits from '../hooks/useHabits';
import { Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const HabitGoals = ({ token }) => {
    const {
        habits,
        isLoading,
        error,
        createHabit,
        deleteHabit
    } = useHabits(token);

    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [creationError, setCreationError] = useState('');

    const handleCreateHabit = async (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        setIsCreating(true);
        setCreationError('');
        try {
            await createHabit(newHabitTitle.trim(), '', 'Diário');
            setNewHabitTitle('');
        } catch (err) {
            setCreationError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteHabit = async (id) => {
        if (window.confirm("Tem certeza que deseja deletar este hábito?")) {
            try {
                await deleteHabit(id);
            } catch (err) {
                alert("Erro ao deletar hábito: " + err.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Habit Goals</h1>
                        <p className="text-gray-600 mt-1">Gerencie seus hábitos diários e metas</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

                {/* Card de Criação */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <Plus className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Adicionar Novo Hábito</h2>
                    </div>

                    <form onSubmit={handleCreateHabit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome do Hábito
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Beber 3L Água, Ler 20 min, Meditar"
                                value={newHabitTitle}
                                onChange={(e) => setNewHabitTitle(e.target.value)}
                                disabled={isCreating}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating || !newHabitTitle.trim()}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adicionando...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Adicionar Hábito
                                </>
                            )}
                        </button>

                        {creationError && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                <p className="text-red-600 text-sm font-medium">{creationError}</p>
                            </div>
                        )}
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Dica:</strong> Comece com 3-5 hábitos simples e aumente gradualmente
                        </p>
                    </div>
                </div>

                {/* Card de Lista */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Meus Hábitos Ativos</h2>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-4">
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Carregando hábitos...</p>
                        </div>
                    ) : habits.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg">Nenhum hábito cadastrado ainda</p>
                            <p className="text-gray-400 text-sm mt-2">Adicione seu primeiro hábito ao lado!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {habits.map((habit, index) => (
                                <div
                                    key={habit.id}
                                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{habit.name}</p>
                                            <p className="text-sm text-gray-500">
                                                🔄 {habit.target_frequency || 'Diário'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteHabit(habit.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Deletar hábito"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {habits.length > 0 && (
                        <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-100">
                            <p className="text-sm text-green-800 text-center">
                                🎯 <strong>{habits.length}</strong> hábito{habits.length > 1 ? 's' : ''} ativo{habits.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HabitGoals;
