import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:3000${endpoint}`, { username, password });
      
      if (res.data.success) {
        if (isLoginMode) {
          onLogin(res.data.username, res.data.token);
          onClose();
        } else {
          // Auto login after register or just switch to login mode
          setIsLoginMode(true);
          setError('Registration successful! Please login.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-panel)] border border-greenshield-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-greenshield-neon transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6 text-center">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[var(--bg-dark)] border border-greenshield-border rounded-md px-4 py-2 text-[var(--text-main)] outline-none focus:border-greenshield-neon transition-colors"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-dark)] border border-greenshield-border rounded-md px-4 py-2 text-[var(--text-main)] outline-none focus:border-greenshield-neon transition-colors"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className={`text-sm p-3 rounded ${error.includes('successful') ? 'bg-green-500/10 text-greenshield-neon border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-md font-medium mt-4 transition-all ${
                loading ? 'bg-green-500/50 cursor-not-allowed text-[var(--text-inverse)]' : 'bg-greenshield-neon text-[var(--text-inverse)] hover:bg-greenshield-neon-hover shadow-[0_0_15px_rgba(0,255,102,0.3)]'
              }`}
            >
              {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Register')}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
              className="text-greenshield-neon hover:underline font-medium outline-none"
            >
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
