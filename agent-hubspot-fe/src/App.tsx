import { useState } from 'react';
import { Mail, MessageSquare, Sparkles, BookOpen, History as HistoryIcon, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

// Main App Component
function App() {
  const [authEmail, setAuthEmail] = useState<string | null>(() => localStorage.getItem('auth.email'));
  const navigate = useNavigate();

  const tabs = [
    { id: 'chat', path: '/chat', label: 'Chat', icon: MessageSquare },
    { id: 'email', path: '/email', label: 'Email', icon: Mail },
    { id: 'history', path: '/activity', label: 'Activity', icon: HistoryIcon },
    { id: 'settings', path: '/settings', label: 'Settings', icon: SettingsIcon },
    { id: 'guide', path: '/guide', label: 'User Guide', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 relative">
          {/* Auth control */}
          <div className="absolute right-0 top-0">
            {authEmail ? (
              <button
                onClick={() => {
                  localStorage.removeItem('auth.token');
                  localStorage.removeItem('auth.email');
                  setAuthEmail(null);
                  navigate('/login');
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                title={`Signed in as ${authEmail}`}
              >
                <LogOut className="w-4 h-4" />
                {/* Logout */}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="w-4 h-4" />
                Sign in
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-600">AI Chat and Email: faster replies, polished content, results worth every penny</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm mb-6">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    `flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 first:rounded-l-xl last:rounded-r-xl ${
                      isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default App;