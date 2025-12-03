import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Dumbbell, LogOut, ListChecks, Brain, User } from 'lucide-react';

const SidebarLayout = ({ onLogout }) => {
  const location = useLocation();

  // Função simples para deixar o botão azul quando estiver selecionado
  const getLinkStyle = (path) => {
    // Se o endereço atual for igual ao do botão, fica ativo
    const isActive = location.pathname === path;
    
    return {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 15px',
      color: isActive ? '#fff' : '#aaa',       // Texto Branco se ativo, Cinza se não
      background: isActive ? '#007bff' : 'transparent', // Fundo Azul se ativo
      textDecoration: 'none',
      borderRadius: '8px',
      marginBottom: '8px',
      fontWeight: isActive ? 'bold' : 'normal',
      cursor: 'pointer'
    };
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* --- MENU LATERAL ESCURO --- */}
      <aside style={{ width: '250px', background: '#1e1e2d', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'white', marginBottom: '40px' }}>⚔️ Senshi</h2>
        
        <nav style={{ flex: 1 }}>
          
            {/* 1. DAILY LOG */}
            <Link to="/" style={getLinkStyle('/')}>
                <CalendarCheck size={20} style={{ marginRight: '10px' }} /> 
                Daily Journal
            </Link>

            {/* 2. DASHBOARD */}
            <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
                <LayoutDashboard size={20} style={{ marginRight: '10px' }} /> 
                Dashboard
            </Link>

            {/* NOVO LINK: GERENCIAR HÁBITOS */}
            <Link to="/habits" style={getLinkStyle('/habits')}>
                <ListChecks size={20} style={{ marginRight: '10px' }} /> 
                Habit Goals
            </Link>

            {/* 3. GERENCIADOR DE TREINOS */}
            <Link to="/training" style={getLinkStyle('/training')}>
                <Dumbbell size={20} style={{ marginRight: '10px' }} />
                Workout Log
            </Link>

            {/* 4. AI SENSEI */}
            <Link to="/ai-coach" style={getLinkStyle('/ai-coach')}>
                <Brain size={20} style={{ marginRight: '10px' }} />
                AI Sensei
            </Link>

            {/* 5. MY PERSONALITY */}
            <Link to="/profile/behavioral" style={getLinkStyle('/profile/behavioral')}>
                <User size={20} style={{ marginRight: '10px' }} />
                My Personality
            </Link>

        </nav>

        {/* BOTÃO SAIR */}
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '10px', fontSize: '1em' }}>
          <LogOut size={20} style={{ marginRight: '10px' }} /> Sair
        </button>
      </aside>

      {/* --- ONDE A PÁGINA CARREGA (Direita) --- */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#f4f6f9' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;