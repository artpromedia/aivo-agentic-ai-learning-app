import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@aivo/auth';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-neutral-50 rounded-lg px-3 py-2 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
          alt="Admin"
          className="w-9 h-9 rounded-full"
        />
        <div className="text-sm hidden md:block text-left">
          <p className="font-semibold text-neutral-900">{user?.name || 'Dr. Sarah Johnson'}</p>
          <p className="text-xs text-neutral-500">District Admin</p>
        </div>
        <svg
          className={`hidden md:block w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
          {/* User Info (Mobile) */}
          <div className="md:hidden px-4 py-3 border-b border-neutral-200">
            <p className="text-sm font-medium text-neutral-900">{user?.name || 'Dr. Sarah Johnson'}</p>
            <p className="text-xs text-neutral-500">{user?.email || 'sjohnson@district.edu'}</p>
          </div>

          {/* Menu Items */}
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span className="mr-3 text-lg">👤</span>
            <span>My Profile</span>
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span className="mr-3 text-lg">⚙️</span>
            <span>Settings</span>
          </Link>

          <div className="border-t border-neutral-200 my-2"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="mr-3 text-lg">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
