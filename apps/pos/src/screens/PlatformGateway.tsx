import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Rocket, ShieldCheck } from 'lucide-react';
import { redirectToTenant } from '../lib/tenantResolver';

const PlatformGateway: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password required'); return; }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Redirect to the tenant's subdomain
      redirectToTenant(data.tenant.subdomain);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">DK</span>
          </div>
          <span className="text-white font-semibold text-lg">Desktop Kitchen</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-neutral-400 mt-2">Sign in to manage your restaurant</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="owner@restaurant.com"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-teal-600"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Your owner password"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-teal-600"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-neutral-950 text-neutral-500">or</span>
            </div>
          </div>

          {/* Get Started */}
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-teal-600 text-teal-400 font-semibold rounded-lg hover:bg-teal-600/10 transition-colors"
          >
            <Rocket className="w-4 h-4" />
            Get Started — Create Your Restaurant
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-neutral-800 flex items-center justify-center">
        <button
          onClick={() => navigate('/super-admin')}
          className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-400 text-xs transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </button>
      </footer>
    </div>
  );
};

export default PlatformGateway;
