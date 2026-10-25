import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Leaf, Eye, EyeOff, Zap, ArrowRight, ShieldCheck,
  Users, Check, ArrowRightLeft, Sparkles, LogOut, Trash2, UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService, type SavedAccount } from '../services/auth.service';
import GreenTechCanvas from '../components/greentech/GreenTechCanvas';
import TiltCard from '../components/greentech/TiltCard';
import { getInitials } from '../utils';
import { triggerConfetti } from '../utils/confetti';
import { NeonAvatar, CarbonFootprintIcon } from '../components/ui/CarbonElements';

const NEON_PALETTE: Array<'pink' | 'cyan' | 'yellow' | 'lime' | 'red' | 'purple'> = [
  'pink', 'cyan', 'yellow', 'lime', 'purple', 'red'
];

export default function LoginPage() {
  const { user, savedAccounts, switchAccount, removeAccount, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '' });
  const [switchingId, setSwitchingId] = useState<number | null>(null);
  const [demoProfiles, setDemoProfiles] = useState<any[]>([]);

  useEffect(() => {
    authService.getDemoAccounts().then(setDemoProfiles);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const rawEmail = form.email.trim();
    const rawPassword = form.password;

    if (!rawEmail || !rawPassword) {
      setError('Please provide your campus email/username and password.');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (mode === 'login') {
        result = await authService.login(rawEmail, rawPassword);
      } else {
        const derivedUsername = (
          form.username.trim() ||
          rawEmail.split('@')[0].replace(/\W+/g, '_') ||
          'student'
        ).toLowerCase();
        
        const derivedFullName =
          form.full_name.trim() ||
          derivedUsername.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        result = await authService.register(
          rawEmail,
          rawPassword,
          derivedUsername,
          derivedFullName
        );
      }

      login(result.access_token, result.user);
      triggerConfetti();
      setSuccessMsg(mode === 'register' ? 'Account created successfully! Redirecting…' : 'Authenticated! Redirecting…');
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 350);
    } catch (err: any) {
      let errorText = 'Authentication failed. Please check credentials or try demo login.';
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        errorText = detail;
      } else if (Array.isArray(detail)) {
        errorText = detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorText = detail.msg || detail.message || JSON.stringify(detail);
      }
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError('');
    try {
      const result = await authService.demoLogin();
      login(result.access_token, result.user);
      triggerConfetti();
      navigate('/app/dashboard');
    } catch {
      setError('Backend not running. Start the API server and try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleFastSwitch = async (userId: number) => {
    setSwitchingId(userId);
    setError('');
    try {
      const ok = await switchAccount(userId);
      if (ok) {
        triggerConfetti();
        navigate('/app/dashboard');
      } else {
        setError('Failed to switch to that account.');
      }
    } catch {
      setError('Account switch error.');
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#040816] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      <GreenTechCanvas />

      {/* Cybernetic Ambient Midnight & Cyan Glow Meshes */}
      <div className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-cyan-500/10 blur-[150px] rounded-full -z-10" />
      <div className="pointer-events-none fixed bottom-10 right-10 w-[500px] h-[350px] bg-[#BD00FF]/10 blur-[130px] rounded-full -z-10" />

      {/* Decorative Floating Carbon Footprints */}
      <div className="pointer-events-none fixed top-12 left-12 opacity-30 -z-10">
        <CarbonFootprintIcon size={44} color="#00F0FF" rotate={-20} glow />
      </div>
      <div className="pointer-events-none fixed bottom-16 right-16 opacity-30 -z-10">
        <CarbonFootprintIcon size={54} color="#FF1493" rotate={30} glow />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-[#0084FF] to-[#BD00FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-6 h-6 text-[#040816]" />
            </div>
          </Link>
          <h1 className="font-display font-black text-3xl text-white mt-3 tracking-tight">
            {mode === 'login' ? 'ACCESS ECOPULSE' : 'CREATE CAMPUS ACCOUNT'}
          </h1>
          <p className="text-cyan-400 font-mono text-xs mt-1 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <CarbonFootprintIcon size={12} color="#00F0FF" />
            <span>{mode === 'login' ? 'MIDNIGHT GRID • VERIFIED FOOTPRINT' : 'JOIN THE VERIFIED CAMPUS GREEN GRID'}</span>
          </p>
        </div>

        {/* If already signed in, show status banner */}
        {user && (
          <div className="p-4 rounded-2xl bg-[#07112B]/90 border border-cyan-500/40 backdrop-blur-md flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <NeonAvatar
                name={user.full_name}
                neonColor="cyan"
                size="md"
                showGlow
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{user.full_name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                    Active
                  </span>
                </div>
                <div className="text-[10px] text-cyan-300/70 font-mono">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black font-mono font-bold text-xs flex items-center gap-1 hover:brightness-110 shadow-sm"
            >
              <span>Dashboard</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Multi-Account Switcher Section (with Neon profile icons) */}
        {savedAccounts.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#07112B]/85 border border-cyan-500/30 backdrop-blur-md space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Users size={14} />
                <span>Switch Accounts on this Device</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300/60">{savedAccounts.length} saved</span>
            </div>

            <div className="space-y-1.5">
              {savedAccounts.map((acc, idx) => {
                const isCurrent = user?.id === acc.user_id;
                const neonColor = NEON_PALETTE[idx % NEON_PALETTE.length];
                return (
                  <div
                    key={acc.user_id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'bg-[#040816]/70 border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <NeonAvatar
                        name={acc.full_name}
                        neonColor={neonColor}
                        size="sm"
                        showGlow={isCurrent}
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{acc.full_name}</span>
                          {isCurrent && <Check size={12} className="text-[#00F0FF]" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isCurrent && (
                        <button
                          disabled={switchingId === acc.user_id}
                          onClick={() => handleFastSwitch(acc.user_id)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold"
                        >
                          {switchingId === acc.user_id ? 'Switching…' : 'Switch'}
                        </button>
                      )}
                      <button
                        onClick={() => removeAccount(acc.user_id)}
                        title="Remove from device"
                        className="p-1 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <TiltCard className="p-7 sm:p-8 border-cyan-500/30 bg-[#07112B]/90 shadow-2xl">
          {/* Demo Login Button */}
          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full py-3.5 mb-5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
          >
            {demoLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap size={16} className="fill-black" />
            )}
            <span>CONTINUE AS DEMO USER (INSTANT)</span>
          </button>

          {/* Quick Demo Peer Selector with Neon Profiles */}
          {demoProfiles.length > 0 && (
            <div className="mb-5 p-3 rounded-xl bg-black/40 border border-cyan-500/20">
              <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-[#FFE600]" />
                <span>Quick Switch Demo Profiles</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {demoProfiles.slice(0, 4).map((p, idx) => {
                  const neonColor = NEON_PALETTE[idx % NEON_PALETTE.length];
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleFastSwitch(p.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/30 text-left text-[11px] transition-all flex items-center gap-2 group"
                    >
                      <NeonAvatar
                        name={p.full_name}
                        neonColor={neonColor}
                        size="xs"
                      />
                      <span className="truncate text-white/90 font-medium group-hover:text-cyan-300">{p.full_name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-500/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#07112B] px-3 text-[11px] font-mono text-cyan-300/70 uppercase">
                {mode === 'login' ? 'OR SIGN IN WITH CREDENTIALS' : 'ENTER REGISTRATION DETAILS'}
              </span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-black/40 border border-cyan-500/20 rounded-xl p-1 mb-5">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
                  mode === m
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2">
              <Check size={14} className="text-[#00F0FF]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-cyan-300 mb-1">
                    FULL NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 bg-black/50 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-cyan-300 mb-1">
                    USERNAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. alexrivera (or auto-generated)"
                    className="w-full px-4 py-2.5 bg-black/50 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1">
                {mode === 'login' ? 'CAMPUS EMAIL OR USERNAME *' : 'CAMPUS EMAIL *'}
              </label>
              <input
                type={mode === 'login' ? 'text' : 'email'}
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder={mode === 'login' ? 'demo@ecopulse.app or eco_demo' : 'student@pw.ioi.edu.in'}
                className="w-full px-4 py-2.5 bg-black/50 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1">PASSWORD *</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder={mode === 'register' ? 'choose any password (min 3 chars)' : '••••••••'}
                  className="w-full px-4 py-2.5 bg-black/50 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0084FF] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : mode === 'register' ? (
                <>
                  <UserPlus size={15} className="text-black" />
                  <span className="text-black">CREATE ACCOUNT & AUTHENTICATE</span>
                  <ArrowRight size={14} className="text-black" />
                </>
              ) : (
                <>
                  <span className="text-black">SIGN IN & AUTHENTICATE</span>
                  <ArrowRight size={14} className="text-black" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#00F0FF]" />
              <span>256-BIT ENCRYPTED AUTH</span>
            </span>
            <Link to="/" className="text-white/60 hover:text-[#00F0FF]">
              Back to Home
            </Link>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
