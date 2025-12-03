import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';

// Páginas
import Dashboard from './pages/Dashboard';
import NutritionAI from './pages/NutritionAI';
import Training from './pages/Training';
import Journal from './pages/Journal';
import DailyLog from './pages/DailyLog';
import HabitGoals from './pages/HabitGoals';
import AICoach from './pages/AICoach';
import BehavioralProfile from './pages/BehavioralProfile';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE LOGIN (Mantida igual) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        setToken(data.access);
      } else {
        setError("Login falhou.");
      }
    } catch (err) { setError("Erro de conexão."); } 
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  // --- TELA DE LOGIN (Se não tiver token) ---
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Senshi Login</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }} required />
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (Com Rotas) ---
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SidebarLayout onLogout={handleLogout} />}>
          <Route index element={<DailyLog token={token} />} />
          <Route path="dashboard" element={<Dashboard token={token} />} />
          <Route path="nutrition" element={<NutritionAI token={token} />} />
          <Route path="training" element={<Training token={token} />} />
          <Route path="journal" element={<Journal token={token} />} />
          <Route path="/habits" element={<HabitGoals token={token} />} />
          <Route path="ai-coach" element={<AICoach token={token} />} />
          <Route path="profile/behavioral" element={<BehavioralProfile token={token} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;