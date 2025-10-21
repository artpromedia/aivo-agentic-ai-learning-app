import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { UserMenu } from './UserMenu';

export function TeacherLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'My Students', href: '/students', icon: '👥' },
    { name: 'IEP Management', href: '/iep', icon: '📋' },
    { name: 'Progress Monitoring', href: '/progress', icon: '📈' },
    { name: 'Messages', href: '/messages', icon: '✉️' },
    { name: 'Activities', href: '/activities', icon: '🎯' },
    { name: 'Reports', href: '/reports', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-neutral-200 fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="/aivo-icon.svg" 
                  alt="Aivo Learning" 
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold text-neutral-900 hidden md:block">
                  Aivo Learning
                </span>
                <span className="text-sm text-neutral-500 hidden md:block">• Teacher Portal</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    isActive(item.href)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu Dropdown */}
              <UserMenu />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
              >
                <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
