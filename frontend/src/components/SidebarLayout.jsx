import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Dumbbell, LogOut, ListChecks, Brain, User, Menu, X, Scale } from 'lucide-react';

const SidebarLayout = ({ onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-all ${
        isActive(to)
          ? 'bg-blue-600 text-white font-semibold'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} className="mr-3" />
      {children}
    </Link>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-white text-xl font-bold">⚔️ Senshi</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <NavLink to="/" icon={CalendarCheck}>
            Daily Journal
          </NavLink>
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink to="/habits" icon={ListChecks}>
            Habit Goals
          </NavLink>
          <NavLink to="/training" icon={Dumbbell}>
            Workout Log
          </NavLink>
          <NavLink to="/body-metrics" icon={Scale}>
            Body Metrics
          </NavLink>
          <NavLink to="/ai-coach" icon={Brain}>
            AI Sensei
          </NavLink>
          <NavLink to="/profile/behavioral" icon={User}>
            My Personality
          </NavLink>
        </nav>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center px-4 py-3 m-4 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-all"
        >
          <LogOut size={20} className="mr-3" />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">⚔️ Senshi</h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;