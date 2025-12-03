import React, { useState, useEffect } from 'react';

const WeeklyHabits = ({ token }) => {
  const [habits, setHabits] = useState([]);
  
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayIndex = new Date().getDay();

  useEffect(() => {
    // Simulação de dados
    setHabits([
      { id: 1, name: "Beber 3L Água", history: [true, true, false, true, false, false, false] },
      { id: 2, name: "Ler 20 min", history: [true, false, true, true, true, false, false] },
      { id: 3, name: "Treino", history: [false, true, true, false, true, true, false] },
      { id: 4, name: "Meditação", history: [false, false, false, true, false, false, false] },
    ]);
  }, []);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      {/* Título com cor explícita para não sumir */}
      <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px', color: '#333' }}>WEEKLY HABITS</h3>
      
      {/* Cabeçalho dos Dias */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {days.map((d, i) => (
          <div key={d} style={{ width: '30px', textAlign: 'center', fontSize: '0.8em', fontWeight: 'bold', color: i === todayIndex ? '#007bff' : '#aaa' }}>
            {d[0]}
          </div>
        ))}
      </div>

      {/* Lista de Hábitos */}
      {habits.map(habit => (
        <div key={habit.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
          
          {/* --- CORREÇÃO AQUI: Adicionei color: '#333' --- */}
          <div style={{ flex: 1, fontFamily: 'sans-serif', fontSize: '1em', color: '#333', fontWeight: '500' }}>
            {habit.name}
          </div>

          {/* As Bolinhas */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {habit.history.map((done, idx) => (
              <div 
                key={idx}
                style={{
                  width: '25px', 
                  height: '25px', 
                  borderRadius: '50%', 
                  border: '1px solid #ccc',
                  background: done ? getHabitColor(idx) : 'white',
                  cursor: 'pointer'
                }}
                title={days[idx]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const getHabitColor = (idx) => {
  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf'];
  return colors[idx % colors.length];
};

export default WeeklyHabits;