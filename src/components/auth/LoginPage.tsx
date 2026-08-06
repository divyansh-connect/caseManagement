import React, { useState } from 'react';
import { Eye, EyeOff, Globe, ArrowLeft, Users, UserCheck, Shield, Briefcase, UserCog } from 'lucide-react';
import { UserRole } from '../../types';
import loginBg from '../../assets/login-bg.png';

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

// ── All quick-login roles (bottom pills) ──────────────────────────────────────
const QUICK_ROLES: { label: string; email: string; role: UserRole }[] = [
  { label: 'Super Admin',      email: 'superadmin@babelglobal.com', role: 'admin'    },
  { label: 'Admin / Manager',  email: 'admin@babelglobal.com',      role: 'admin'    },
  { label: 'Drafter',          email: 'writer@babelglobal.com',     role: 'writer'   },
  { label: 'Reviewer',         email: 'reviewer@babelglobal.com',   role: 'reviewer' },
  { label: 'Client',           email: 'client@babelglobal.com',     role: 'client'   },
];

// ── Team sub-roles shown after clicking "Babel Global Team" ────────────────────────
const TEAM_SUB_ROLES: {
  label: string;
  description: string;
  email: string;
  role: UserRole;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  border: string;
  hoverBg: string;
  hoverBorder: string;
  hoverText: string;
}[] = [
  {
    label: 'Administrator / Case Manager',
    description: 'Manage day-to-day cases, clients, tasks & staff assignments',
    email: 'admin@babelglobal.com',
    role: 'admin',
    icon: UserCog,
    color: '#2563eb',
    border: 'rgba(37,99,235,0.25)',
    hoverBg: 'rgba(37,99,235,0.1)',
    hoverBorder: 'rgba(37,99,235,0.55)',
    hoverText: '#2563eb',
  },
  {
    label: 'Drafter / Researcher',
    description: 'Draft petitions, research evidence & prepare recommendation letters',
    email: 'writer@babelglobal.com',
    role: 'writer',
    icon: Briefcase,
    color: '#7c3aed',
    border: 'rgba(124,58,237,0.25)',
    hoverBg: 'rgba(124,58,237,0.1)',
    hoverBorder: 'rgba(124,58,237,0.55)',
    hoverText: '#7c3aed',
  },
  {
    label: 'Super Administrator',
    description: 'Full system control, staff permissions & workflow management',
    email: 'superadmin@babelglobal.com',
    role: 'superadmin',
    icon: Shield,
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.25)',
    hoverBg: 'rgba(245,158,11,0.1)',
    hoverBorder: 'rgba(245,158,11,0.55)',
    hoverText: '#d97706',
  },
];

// Step type: 'accountType' | 'teamSubRole' | 'loginForm'
type Step = 'accountType' | 'teamSubRole' | 'loginForm';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep]                     = useState<Step>('accountType');
  const [accountType, setAccountType]       = useState<'team' | 'client' | null>(null);
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState('');
  const [selectedSubRole, setSelectedSubRole] = useState<typeof TEAM_SUB_ROLES[0] | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Step 1: Account Type selected
  const handleAccountType = (type: 'team' | 'client') => {
    setAccountType(type);
    setError('');
    if (type === 'client') {
      setEmail('client@babelglobal.com');
      setPassword('password123');
      setStep('loginForm');
    } else {
      setStep('teamSubRole');
    }
  };

  // Step 1b: Team sub-role selected
  const handleTeamSubRole = (sub: typeof TEAM_SUB_ROLES[0]) => {
    setSelectedSubRole(sub);
    setEmail(sub.email);
    setPassword('password123');
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(sub.role, sub.email);
    }, 400);
  };

  // Quick pill autofill
  const handleQuickRole = (r: typeof QUICK_ROLES[0]) => {
    setEmail(r.email);
    setPassword('password123');
    setError('');
    // Also jump straight to form
    setAccountType(r.role === 'client' ? 'client' : 'team');
    setStep('loginForm');
  };

  // Back button
  const handleBack = () => {
    setError('');
    if (step === 'loginForm' && accountType === 'team') {
      setStep('teamSubRole');
    } else {
      setStep('accountType');
      setAccountType(null);
      setSelectedSubRole(null);
      setEmail('');
      setPassword('');
    }
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      let role: UserRole = 'admin';
      const matched = QUICK_ROLES.find(r => r.email === email);
      if (matched)                          role = matched.role;
      else if (email.includes('superadmin')) role = 'superadmin';
      else if (email.includes('client'))     role = 'client';
      else if (email.includes('writer'))     role = 'writer';
      else if (email.includes('reviewer'))   role = 'reviewer';
      onLogin(role, email);
    }, 700);
  };

  // ── Heading / subtitle per step ───────────────────────────────────────────
  const heading = step === 'accountType'
    ? 'Welcome Back!'
    : step === 'teamSubRole'
    ? 'Select Your Role'
    : accountType === 'client'
    ? 'Client Sign In'
    : `Sign In — ${selectedSubRole?.label ?? 'Babel Global Team'}`;

  const subtitle = step === 'accountType'
    ? 'Please select your account type to continue.'
    : step === 'teamSubRole'
    ? 'Choose your team role to access the correct workspace.'
    : `Enter your credentials to access your ${accountType === 'client' ? 'client portal' : 'workspace'}.`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: '#f0f2f5' }}>
      <div
        className="flex w-full overflow-hidden"
        style={{
          maxWidth: '960px',
          minHeight: '560px',
          borderRadius: '20px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          background: '#ffffff',
        }}
      >
        {/* ═══════════════════ LEFT — Photo ═══════════════════ */}
        <div className="hidden md:block relative flex-shrink-0" style={{ width: '46%' }}>
          <img
            src={loginBg}
            alt="Immigration Law Office"
            className="w-full h-full object-cover"
            style={{ display: 'block', minHeight: '560px' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)' }}
          />
          {/* Brand badge */}
          <div
            className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">Babel Global</span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(37,99,235,0.55)', color: '#93c5fd', letterSpacing: '0.08em' }}>
              Case OS
            </span>
          </div>
          {/* Caption */}
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white font-bold text-xl leading-snug drop-shadow-lg">
              EB-2 NIW Immigration<br />Case Management
            </p>
            <p className="text-slate-300 text-xs mt-1 drop-shadow">Trusted by immigration attorneys across the USA.</p>
          </div>
        </div>

        {/* ═══════════════════ RIGHT — Form panel ═══════════════════ */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10" style={{ background: '#ffffff' }}>

          {/* Mobile brand */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-800 text-lg">Babel Global</span>
          </div>

          {/* Back button (shown on step 1b and form) */}
          {step !== 'accountType' && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer mb-5 w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          {/* Heading */}
          <h1 className="font-black text-slate-800 mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
            {heading}
          </h1>
          <p className="text-slate-500 text-sm mb-6">{subtitle}</p>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 1 — Account Type
          ══════════════════════════════════════════ */}
          {step === 'accountType' && (
            <div className="space-y-3">
              {/* Babel Global Team */}
              <button
                type="button"
                onClick={() => handleAccountType('team')}
                className="group w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#eff6ff';
                  el.style.border = '1.5px solid #2563eb';
                  el.style.transform = 'translateY(-1px)';
                  el.style.boxShadow = '0 8px 24px rgba(37,99,235,0.12)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#f8fafc';
                  el.style.border = '1.5px solid #e2e8f0';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(37,99,235,0.05))', border: '1.5px solid rgba(37,99,235,0.2)' }}>
                  <Users className="w-6 h-6" style={{ color: '#2563eb' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">Babel Global Team</p>
                  <p className="text-xs text-slate-500 mt-0.5">Super Admin · Administrator · Drafter / Researcher</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </button>

              {/* Client */}
              <button
                type="button"
                onClick={() => handleAccountType('client')}
                className="group w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#f5f3ff';
                  el.style.border = '1.5px solid #7c3aed';
                  el.style.transform = 'translateY(-1px)';
                  el.style.boxShadow = '0 8px 24px rgba(124,58,237,0.12)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#f8fafc';
                  el.style.border = '1.5px solid #e2e8f0';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(124,58,237,0.05))', border: '1.5px solid rgba(124,58,237,0.2)' }}>
                  <UserCheck className="w-6 h-6" style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">Client</p>
                  <p className="text-xs text-slate-500 mt-0.5">Track your case progress, upload documents & communicate with your team</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:text-violet-600 transition-colors flex-shrink-0" />
              </button>

              {/* Trust note */}
              <p className="text-center text-[11px] text-slate-400 pt-1">🔒 256-bit SSL encrypted · GDPR compliant</p>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 1b — Team Sub-Role Picker
          ══════════════════════════════════════════ */}
          {step === 'teamSubRole' && (
            <div className="space-y-3">
              {TEAM_SUB_ROLES.map((sub) => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.label}
                    type="button"
                    onClick={() => handleTeamSubRole(sub)}
                    className="group w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = sub.hoverBg;
                      el.style.border = `1.5px solid ${sub.hoverBorder}`;
                      el.style.transform = 'translateY(-1px)';
                      el.style.boxShadow = `0 8px 24px ${sub.hoverBg}`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = '#f8fafc';
                      el.style.border = '1.5px solid #e2e8f0';
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: `${sub.hoverBg}`,
                        border: `1.5px solid ${sub.border}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: sub.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{sub.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.description}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 flex-shrink-0" style={{ color: sub.color }} />
                  </button>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 2 — Login Form
          ══════════════════════════════════════════ */}
          {step === 'loginForm' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                  style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc' }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid #2563eb';
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid #e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }}
                    className="text-xs font-semibold cursor-pointer"
                    style={{ color: '#2563eb' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                    style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc' }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1.5px solid #2563eb';
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1.5px solid #e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-1"
                style={{
                  background: isLoading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: isLoading ? 'none' : '0 6px 20px rgba(37,99,235,0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(37,99,235,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)';
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </form>
          )}



          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 mt-6">
            © 2026 Babel Global Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
