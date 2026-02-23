import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '../api';

const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
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

          {/* ==================== Success State ==================== */}
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Password reset</h1>
                <p className="text-neutral-400 mt-2">Your password has been updated successfully.</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {/* ==================== Form State ==================== */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-teal-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Set new password</h1>
                <p className="text-neutral-400 mt-2">Choose a strong password for your account</p>
              </div>

              {!token && (
                <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Invalid reset link. Please request a new one from the login page.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-teal-600"
                    autoFocus
                    disabled={!token}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-teal-600"
                    disabled={!token}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default ResetPasswordScreen;
