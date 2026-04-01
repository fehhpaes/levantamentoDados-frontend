import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Menu,
  X,
  FlaskConical,
  Wallet,
  Download,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/matches', label: 'Partidas', icon: Calendar },
  { path: '/teams', label: 'Times', icon: Users },
  { path: '/odds', label: 'Odds', icon: TrendingUp },
  { path: '/value-bets', label: 'Value Bets', icon: Zap },
  { path: '/predictions', label: 'Previsoes', icon: Target },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/backtesting', label: 'Backtesting', icon: FlaskConical },
  { path: '/bankroll', label: 'Banca', icon: Wallet },
  { path: '/export', label: 'Exportar', icon: Download },
  { path: '/alerts', label: 'Alertas', icon: Bell },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Escuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  const currentThemeIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  // Get current page title
  const getCurrentPageTitle = () => {
    const navItem = navItems.find((item) => item.path === location.pathname);
    if (navItem) return navItem.label;
    if (location.pathname === '/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-950 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-white">Sports Analytics</h1>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 flex flex-col h-[calc(100%-4rem)]">
          <div className="flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors
                    ${isActive ? 'bg-gray-800 text-white border-l-4 border-primary-500' : ''}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Settings Link at Bottom */}
          <div className="border-t border-gray-700 mt-auto">
            <Link
              to="/settings"
              className={`
                flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors
                ${location.pathname === '/settings' ? 'bg-gray-800 text-white border-l-4 border-primary-500' : ''}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings size={20} className="mr-3" />
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {getCurrentPageTitle()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                title="Alterar tema"
              >
                {React.createElement(currentThemeIcon, { size: 20 })}
              </button>

              {themeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setThemeMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg dark:shadow-gray-900/30 z-20 py-1 border border-gray-200 dark:border-gray-700">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value);
                          setThemeMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                          theme === option.value
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <option.icon size={16} className="mr-2" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.username}</span>
                  <ChevronDown size={16} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg dark:shadow-gray-900/30 z-20 py-1 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
