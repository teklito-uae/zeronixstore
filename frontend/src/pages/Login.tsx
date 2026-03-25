import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.access_token, data.user);
      navigate(redirect);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Invalid credentials');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg-primary">
      {/* Left Panel — Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050e08] relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm text-center space-y-8">
          <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-8 w-auto mx-auto brightness-200" />
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-4">
              Your Premium<br />
              <span className="text-emerald-400">Tech Hub</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed font-medium">
              Access exclusive deals, track your orders, and manage your account all in one place.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              'Access order history & tracking',
              'Save multiple delivery addresses',
              'Exclusive member-only deals',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-white/60 text-xs font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom logo watermark */}
        <p className="absolute bottom-8 text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">Zeronix UAE © 2025</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-7 w-auto mx-auto mb-1" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight mb-2">Welcome back</h1>
            <p className="text-text-muted text-sm">Sign in to your Zeronix account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-red-400 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                placeholder="you@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Password</label>
                <Link to="#" className="text-[11px] text-accent-primary hover:underline font-semibold">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 pr-12 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="font-bold text-accent-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
