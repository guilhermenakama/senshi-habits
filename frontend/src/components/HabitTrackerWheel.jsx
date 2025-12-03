import { useEffect, useState } from 'react';

const HabitTrackerWheel = ({ token }) => {
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  useEffect(() => {
    fetchHabitsAndLogs();
  }, [currentMonth, currentYear]);

  const fetchHabitsAndLogs = async () => {
    setLoading(true);
    try {
      // Busca os hábitos do usuário
      const habitsResponse = await fetch('http://127.0.0.1:8000/api/tracker/habits/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const habitsData = await habitsResponse.json();
      setHabits(habitsData.slice(0, 8)); // Limita a 8 hábitos para não poluir

      // Busca todos os logs do mês atual
      const logsResponse = await fetch('http://127.0.0.1:8000/api/tracker/habit-logs/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const logsData = await logsResponse.json();

      // Filtra logs do mês atual
      const monthLogs = logsData.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
      });

      setHabitLogs(monthLogs);
    } catch (error) {
      console.error('Erro ao buscar hábitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const isHabitCompletedOnDay = (habitId, day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return habitLogs.some(log =>
      log.habit === habitId &&
      log.date === dateStr &&
      log.completed
    );
  };

  const getHabitColor = (index) => {
    const colors = [
      '#FF6B6B', // Vermelho
      '#4ECDC4', // Turquesa
      '#45B7D1', // Azul claro
      '#FFA07A', // Laranja claro
      '#98D8C8', // Verde menta
      '#F7DC6F', // Amarelo
      '#BB8FCE', // Roxo claro
      '#85C1E2', // Azul céu
    ];
    return colors[index % colors.length];
  };

  const renderCircularTracker = () => {
    const centerX = 200;
    const centerY = 200;
    const outerRadius = 180;
    const innerRadius = 80;
    const totalDays = daysInMonth;
    const anglePerDay = (2 * Math.PI) / totalDays;

    return (
      <svg width="400" height="400" viewBox="0 0 400 400">
        {/* Círculo central com título */}
        <circle cx={centerX} cy={centerY} r={innerRadius} fill="#f8f9fa" stroke="#dee2e6" strokeWidth="2" />
        <text x={centerX} y={centerY - 20} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#333">
          HABIT
        </text>
        <text x={centerX} y={centerY} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#333">
          TRACKER
        </text>
        <text x={centerX} y={centerY + 20} textAnchor="middle" fontSize="14" fill="#666">
          {monthNames[currentMonth]}
        </text>

        {/* Marcadores de dias */}
        {Array.from({ length: totalDays }, (_, day) => {
          const dayNum = day + 1;
          const angle = -Math.PI / 2 + day * anglePerDay; // Começa no topo
          const x = centerX + (outerRadius + 15) * Math.cos(angle);
          const y = centerY + (outerRadius + 15) * Math.sin(angle);

          // Mostra número apenas a cada 5 dias
          if (dayNum % 5 === 0 || dayNum === 1) {
            return (
              <text
                key={`day-${dayNum}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#666"
                fontWeight={dayNum === new Date().getDate() &&
                           currentMonth === new Date().getMonth() &&
                           currentYear === new Date().getFullYear() ? 'bold' : 'normal'}
              >
                {dayNum}
              </text>
            );
          }
          return null;
        })}

        {/* Anéis de hábitos */}
        {habits.map((habit, habitIndex) => {
          const radiusStep = (outerRadius - innerRadius) / habits.length;
          const habitInnerRadius = innerRadius + habitIndex * radiusStep;
          const habitOuterRadius = habitInnerRadius + radiusStep - 2;
          const habitRadius = (habitInnerRadius + habitOuterRadius) / 2;

          return (
            <g key={habit.id}>
              {/* Células individuais para cada dia */}
              {Array.from({ length: totalDays }, (_, day) => {
                const dayNum = day + 1;
                const startAngle = -Math.PI / 2 + day * anglePerDay;
                const endAngle = startAngle + anglePerDay;
                const isCompleted = isHabitCompletedOnDay(habit.id, dayNum);

                // Criar o path do arco
                const x1 = centerX + habitInnerRadius * Math.cos(startAngle);
                const y1 = centerY + habitInnerRadius * Math.sin(startAngle);
                const x2 = centerX + habitOuterRadius * Math.cos(startAngle);
                const y2 = centerY + habitOuterRadius * Math.sin(startAngle);
                const x3 = centerX + habitOuterRadius * Math.cos(endAngle);
                const y3 = centerY + habitOuterRadius * Math.sin(endAngle);
                const x4 = centerX + habitInnerRadius * Math.cos(endAngle);
                const y4 = centerY + habitInnerRadius * Math.sin(endAngle);

                const pathData = `
                  M ${x1} ${y1}
                  L ${x2} ${y2}
                  A ${habitOuterRadius} ${habitOuterRadius} 0 0 1 ${x3} ${y3}
                  L ${x4} ${y4}
                  A ${habitInnerRadius} ${habitInnerRadius} 0 0 0 ${x1} ${y1}
                `;

                return (
                  <path
                    key={`${habit.id}-${dayNum}`}
                    d={pathData}
                    fill={isCompleted ? getHabitColor(habitIndex) : '#f0f0f0'}
                    stroke="#fff"
                    strokeWidth="1"
                    opacity={isCompleted ? 0.9 : 0.3}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Linha indicadora do dia atual */}
        {currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() && (
          <>
            {(() => {
              const today = new Date().getDate() - 1;
              const angle = -Math.PI / 2 + today * anglePerDay + anglePerDay / 2;
              const x1 = centerX + innerRadius * Math.cos(angle);
              const y1 = centerY + innerRadius * Math.sin(angle);
              const x2 = centerX + (outerRadius + 10) * Math.cos(angle);
              const y2 = centerY + (outerRadius + 10) * Math.sin(angle);

              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#ff4444"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              );
            })()}
          </>
        )}
      </svg>
    );
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">Carregando habit tracker...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Habit Tracker</h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            ←
          </button>
          <span className="px-4 py-1 font-semibold text-gray-700">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Roda de hábitos */}
        <div className="flex-shrink-0">
          {renderCircularTracker()}
        </div>

        {/* Legenda dos hábitos */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Hábitos Rastreados</h3>
          <div className="space-y-2">
            {habits.length === 0 ? (
              <p className="text-gray-500">Nenhum hábito cadastrado ainda.</p>
            ) : (
              habits.map((habit, index) => {
                const completedDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                  .filter(day => isHabitCompletedOnDay(habit.id, day)).length;
                const completionRate = ((completedDays / daysInMonth) * 100).toFixed(0);

                return (
                  <div key={habit.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getHabitColor(index) }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{habit.name}</div>
                      <div className="text-sm text-gray-500">
                        {completedDays}/{daysInMonth} dias ({completionRate}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {habits.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="font-semibold mb-2">📊 Estatísticas do Mês</div>
                <div>Total de hábitos: {habits.length}</div>
                <div>
                  Dias completados: {' '}
                  {Math.round(
                    habits.reduce((acc, habit) => {
                      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                        .filter(day => isHabitCompletedOnDay(habit.id, day)).length;
                      return acc + days;
                    }, 0) / habits.length
                  )} de {daysInMonth}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerWheel;
