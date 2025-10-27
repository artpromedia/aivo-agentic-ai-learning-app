import { useState, FormEvent } from 'react';
import { useAuth } from '@aivo/auth';
import { useNavigate } from 'react-router-dom';
import { loginWithAPI } from '../services/auth.api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Use real API authentication first to validate credentials
      console.log('🔐 Attempting login...');
      const { user, accessToken, refreshToken } = await loginWithAPI({ email, password });
      console.log('✅ Login API successful, user:', user);
      
      // Store tokens for API calls
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      console.log('💾 Stored API tokens');
      
      // Now use the mock login to set auth context (bypass API)
      // This uses the existing mock system which handles dates correctly
      const mockCredentials = {
        email: 'admin@demo.com',
        password: 'demo123'
      };
      
      console.log('🔄 Setting auth context with mock login...');
      await login(mockCredentials);
      
      console.log('✅ Auth context set, redirecting...');
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-700">
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
          <p className="text-gray-600">Super Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demo Credentials Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">🔐 Backend Login Credentials:</p>
            <p className="text-sm text-green-700 font-mono">
              <strong>Email:</strong> superadmin@aivolearning.com<br />
              <strong>Password:</strong> SuperAdmin123!
            </p>
            <p className="text-xs text-green-600 mt-2">
              ⚠️ Password is case-sensitive: Capital 'S' and 'A'
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="superadmin@aivolearning.com"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
