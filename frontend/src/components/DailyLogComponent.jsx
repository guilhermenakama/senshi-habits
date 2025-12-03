// frontend/src/components/DailyLogComponent.jsx

import useDailyHabits from '../hooks/useDailyHabits';

const DailyLogComponent = () => {
    const { habits, isLoading, error, toggleHabit } = useDailyHabits();

    if (isLoading) {
        return <div className="text-center py-8">Carregando hábitos diários...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-8">{error}</div>;
    }

    if (habits.length === 0) {
        return <div className="text-center py-8 text-gray-500">Você ainda não tem hábitos cadastrados.</div>;
    }

    return (
        <div className="daily-log-container p-4">
            <h1 className="text-2xl font-bold mb-6">Registro Diário de Hábitos</h1>
            <ul className="space-y-3">
                {habits.map((habit) => (
                    <li 
                        key={habit.id} 
                        className={`p-3 rounded-lg shadow-sm flex justify-between items-center transition-all ${habit.completed ? 'bg-green-100 border-l-4 border-green-500' : 'bg-white border-l-4 border-gray-300 hover:bg-gray-50'}`}
                    >
                        <span className={`text-lg font-medium ${habit.completed ? 'line-through text-gray-600' : 'text-gray-800'}`}>
                            {habit.name}
                        </span>
                        
                        <button
                            onClick={() => toggleHabit(habit.id, habit.log_id, habit.completed)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${habit.completed 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {habit.completed ? 'Desmarcar' : 'Marcar'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DailyLogComponent;