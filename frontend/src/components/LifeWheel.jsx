import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const LifeWheel = ({ token }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tracker/life-assessments/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.length > 0) {
        const latest = result[0];
        
        // Mapeando para as cores da sua imagem de referência
        setChartData({
          labels: [
            'Saúde (Físico)',       // Laranja Claro
            'Intelectual',          // Laranja
            'Emocional',            // Laranja Escuro
            'Realização (Carreira)',// Azul
            'Financeiro',           // Azul
            'Contribuição Social',  // Azul Claro
            'Família',              // Rosa
            'Amoroso',              // Rosa
            'Vida Social',          // Rosa
            'Espiritualidade',      // Verde
            'Plenitude',            // Verde
            'Lazer/Hobbies'         // Verde
          ],
          datasets: [
            {
              label: 'Nível de Satisfação (1-10)',
              data: [
                latest.health_score,
                latest.intellectual_score,
                latest.mood_rating || 5, // Usando mood como emocional por enquanto
                latest.career_score,
                latest.financial_score,
                5, // Contribuição (Placeholder - podemos criar campo depois)
                latest.family_score,
                latest.love_score,
                latest.social_score,
                latest.spiritual_score,
                5, // Plenitude (Placeholder)
                5  // Lazer (Placeholder)
              ],
              backgroundColor: [
                'rgba(255, 159, 64, 0.7)', // Laranja
                'rgba(255, 159, 64, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(54, 162, 235, 0.7)', // Azul
                'rgba(54, 162, 235, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)', // Rosa
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)', // Verde
                'rgba(75, 192, 192, 0.7)',
                'rgba(75, 192, 192, 0.7)',
              ],
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  if (!chartData) return <p style={{textAlign:'center', color: '#666'}}>Preencha sua primeira avaliação para ver a roda.</p>;

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <PolarArea 
        data={chartData} 
        options={{
          scales: {
            r: {
              max: 10,
              min: 0,
              ticks: { display: false }, // Remove números poluídos
              grid: { color: '#e5e5e5' }
            }
          },
          plugins: {
            legend: { display: false } // Remove legenda pra ficar limpo igual a imagem
          }
        }} 
      />
    </div>
  );
};

export default LifeWheel;