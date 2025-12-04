import React, { useState } from 'react';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const LifeForm = ({ token, onSuccess }) => {
  const [scores, setScores] = useState({
    health_score: 5, career_score: 5, financial_score: 5, social_score: 5,
    family_score: 5, love_score: 5, spiritual_score: 5, intellectual_score: 5
  });

  const handleChange = (e) => {
    setScores({ ...scores, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/tracker/life-assessments/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scores)
    });
    alert("Avaliação salva!");
    if (onSuccess) onSuccess(); // Recarrega a página ou gráfico
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
      {Object.keys(scores).map((key) => (
        <label key={key} style={{ textAlign: 'left', fontSize: '0.9em' }}>
          {key.replace('_score', '').toUpperCase()}: 
          <input 
            type="number" min="1" max="10" 
            name={key} value={scores[key]} onChange={handleChange} 
            style={{ width: '50px', marginLeft: '10px' }}
          />
        </label>
      ))}
      <button type="submit" style={{ gridColumn: 'span 2', marginTop: '10px', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
        Salvar Avaliação Semanal
      </button>
    </form>
  );
};

export default LifeForm;