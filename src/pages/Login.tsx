import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthProvider';
import { Scale, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

type Tab = 'login' | 'register' | 'forgot';

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else if (tab === 'register') {
        const { error } = await signUp(email, password, fullName);
        if (error) setError(error.message);
        else setMessage('Check your email to confirm your account.');
      } else if (tab === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) setError(error.message);
        else setMessage('Password reset link sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Scale className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">CaseBuddy AI</h1>
          <p className="text-slate-400 mt-1">Your Autonomous AI Law Firm</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1 mb-6">
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setMessage(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Matthew Reardon" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="you@email.com" />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="••••••••" minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {tab === 'login' && (
              <button type="button" onClick={() => { setTab('forgot'); setError(''); setMessage(''); }}
                className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </button>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2">{error}</div>}
            {message && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-2">{message}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Send Reset Link'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {tab === 'forgot' && (
            <button onClick={() => setTab('login')} className="w-full text-center text-sm text-slate-400 hover:text-white mt-4">
              ← Back to Sign In
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 CaseBuddy AI · casebuddy.live
        </p>
      </div>
    </div>
  );
}
