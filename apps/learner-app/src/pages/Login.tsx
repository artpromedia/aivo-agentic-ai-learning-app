import { useState, FormEvent } from 'react';
import { useAuth } from '@aivo/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/aivo-icon.svg" 
              alt="Aivo Learning" 
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Aivo Learning</h1>
          <p className="text-gray-600">Welcome back, learner!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demo Credentials Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Demo Credentials:</p>
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> student@demo.com<br />
              <strong>Password:</strong> demo123
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="student@demo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
