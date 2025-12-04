import { useState } from 'react';
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

// API URL baseada no ambiente
const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // --- LÓGICA DE LOGIN (Mantida igual) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login/`, {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Gerar username a partir do nome completo (remover espaços e colocar em minúsculo)
    const generatedUsername = fullName.toLowerCase().replace(/\s+/g, '');

    try {
      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: generatedUsername,
          email,
          password,
          password_confirm: passwordConfirm,
          first_name: fullName
        })
      });
      const data = await response.json();
      if (response.ok) {
        setError("");
        alert(`Cadastro realizado com sucesso!\n\nSeu usuário é: ${data.user.username}\nVocê também pode fazer login com seu email: ${data.user.email}\n\nFaça login para continuar.`);
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setPasswordConfirm('');
        setEmail('');
        setFullName('');
      } else {
        const errorMsg = Object.values(data).flat().join(' ');
        setError(errorMsg || "Erro ao cadastrar.");
      }
    } catch (err) {
      setError("Erro de conexão.");
    }
    finally { setLoading(false); }
  };

  // --- TELA DE LOGIN/REGISTRO (Se não tiver token) ---
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {isRegistering ? '📝 Criar Conta' : '🔐 Senshi Login'}
          </h2>

          {!isRegistering ? (
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Email ou Usuário" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required />
              <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd' }} required />
              {error && <p style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                Não tem uma conta? <button type="button" onClick={() => { setIsRegistering(true); setError(''); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Cadastre-se</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input type="text" placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required />
              <input type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required />
              <input type="password" placeholder="Senha (mínimo 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required minLength={8} />
              <input type="password" placeholder="Confirmar Senha" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd' }} required />
              {error && <p style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                {loading ? "Cadastrando..." : "Criar Conta"}
              </button>
              <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                Já tem uma conta? <button type="button" onClick={() => { setIsRegistering(false); setError(''); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Fazer Login</button>
              </p>
            </form>
          )}
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