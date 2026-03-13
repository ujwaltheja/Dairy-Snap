import { useState } from 'react';
import { X, LogIn, UserPlus, Gem } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Mock auth — in production POST to /api/auth/login or /api/auth/register
      await new Promise((r) => setTimeout(r, 800));
      localStorage.setItem('ai3design_token', 'mock-jwt-' + Date.now());
      localStorage.setItem('ai3design_user', JSON.stringify({ email, name: name || email.split('@')[0] }));
      onClose();
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-96 p-6 select-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Gem size={20} className="text-yellow-400" />
            <span className="text-base font-semibold text-white">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500 placeholder-gray-500"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500 placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500 placeholder-gray-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <><LogIn size={15} /> Sign In</>
            ) : (
              <><UserPlus size={15} /> Create Account</>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50 text-center">
          <button
            onClick={() => {
              localStorage.setItem('ai3design_token', 'mock-jwt-guest');
              onClose();
            }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Continue as guest (mock mode)
          </button>
        </div>
      </div>
    </div>
  );
}
