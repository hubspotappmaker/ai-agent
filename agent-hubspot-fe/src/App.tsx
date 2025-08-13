import { useEffect, useState } from 'react';
import { Mail, MessageSquare, Sparkles, BookOpen, History as HistoryIcon, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useHubspotParams } from './context/HubspotParamsContext';
import { pingMe, hasHubspot } from './service/auth.service';
import { message, Modal } from 'antd';
import { getCurrentEngine } from './service/provider.service';

function App() {
  const [authEmail, setAuthEmail] = useState<string | null>(() => localStorage.getItem('auth.email'));
  const { params, appendParamsToPath, navigateWithParams } = useHubspotParams();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const verifySession = async () => {
      try
      {
        const res = await pingMe();
        const user =
          res?.data?.email
            ? res.data
            : (res?.data?.data?.email ? res.data.data : null);

        if (user)
        {
          try
          {
            localStorage.setItem('auth.user', JSON.stringify(user));
            if (user.email) localStorage.setItem('auth.email', user.email);
            setAuthEmail(user.email || null);
          } catch { }
          if (params?.portalId)
          {
            try
            {
              const hub = await hasHubspot(params.portalId);
              const has = hub && hub.data === true;
              if (!has) navigateWithParams('/hubspot/install');
            } catch { }
          }
          return;
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token)
        {
          messageApi.info('Please sign in to continue.');
          navigateWithParams('/login');
        }
      } catch
      {
        messageApi.error('Session check failed. Please sign in again.');
        navigateWithParams('/login');
      }
    };
    verifySession();
  }, [navigateWithParams, messageApi, params]);

  useEffect(() => {
    const fetchEngine = async () => {
      try
      {
        const res = await getCurrentEngine(params.portalId!);
        const payload = res?.data?.data ?? res?.data ?? null;
        const typeKey = payload?.typeKey;
        if (typeKey)
        {
          localStorage.setItem('current_engine', typeKey);

        }
      } catch
      {
      }
    };
    fetchEngine();
  }, []);

  const tabs = [
    { id: 'chat', path: '/chat', label: 'Chat', icon: MessageSquare },
    { id: 'email', path: '/email', label: 'Email', icon: Mail },
    { id: 'history', path: '/activity', label: 'Activity', icon: HistoryIcon },
    { id: 'account', path: '/account', label: 'Account', icon: UserIcon },
    { id: 'settings', path: '/settings', label: 'Settings', icon: SettingsIcon },
    { id: 'guide', path: '/guide', label: 'User Guide', icon: BookOpen },
  ];

  return (
    <>
      <div className="min-h-screen bg-white p-4">
        {contextHolder}
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-6 relative hero-aura">
            {/* Auth control */}
            <div className="absolute right-0 top-0 z-10">
              {authEmail ? (
                <button
                  onClick={() => {
                    Modal.confirm({
                      icon: null,
                      title: 'Sign out',
                      content: 'Are you sure you want to sign out?',
                      okText: 'Sign out',
                      cancelText: 'Cancel',
                      okButtonProps: { style: { backgroundColor: '#667eea', color: 'white' } },
                      onOk: () => {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('auth.email');
                        localStorage.removeItem('auth.user');
                        setAuthEmail(null);
                        navigateWithParams('/login');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                  title={`Signed in as ${authEmail}`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigateWithParams('/login')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign in
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2 glitter-container">
              <Sparkles className="w-6 h-6 text-[#667eea] drop-shadow-[0_0_14px_rgba(102,126,234,0.55)] animate-pulse" />
              <h1
                className="text-2xl font-bold gradient-shine text-glow glitter"
                onClick={() => { window.open('https://www.nexce.io', '_blank'); }}
                style={{ cursor: 'pointer' }}
              >
                Nexce.io
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              AI Chat and Email: faster replies, polished content, results worth every penny
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm mb-6">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.id}
                    to={appendParamsToPath(tab.path) as string}
                    className={({ isActive }) =>
                      `flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 first:rounded-l-xl last:rounded-r-xl ${isActive
                        ? 'text-white shadow-md bg-[linear-gradient(135deg,_#5a6de0_0%,_#667eea_60%,_#8ea2ff_100%)]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
      {/* <div className="text-gray-600 text-center py-4 border-t border-gray-200">
        <p className="text-sm">
          &copy; 2025 <span className="font-semibold text-gray-800">Nexce.io</span> — All rights reserved.
        </p>
      </div> */}

    </>
  );
}

export default App;
