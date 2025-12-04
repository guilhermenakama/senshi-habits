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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
            {isRegistering ? '📝 Criar Conta' : '🔐 Senshi Login'}
          </h2>

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Email ou Usuário"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <p className="text-center text-gray-600 text-sm sm:text-base">
                Não tem uma conta?
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(''); }}
                  className="ml-1 text-blue-600 hover:underline font-semibold"
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Nome Completo"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                required
              />
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                required
              />
              <input
                type="password"
                placeholder="Senha (mínimo 8 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                required
                minLength={8}
              />
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cadastrando..." : "Criar Conta"}
              </button>
              <p className="text-center text-gray-600 text-sm sm:text-base">
                Já tem uma conta?
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(''); }}
                  className="ml-1 text-blue-600 hover:underline font-semibold"
                >
                  Fazer Login
                </button>
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