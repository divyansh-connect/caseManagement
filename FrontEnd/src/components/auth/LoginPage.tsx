import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Users, User, ArrowRight, Shield, Briefcase, UserCog, ShieldAlert } from 'lucide-react';
import { UserRole } from '../../types';
import loginBg from '../../assets/login-bg.png';
import { api } from '../../services/api';

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

// ── Team sub-roles ────────────────────────────────────────────────────────────
const TEAM_SUB_ROLES: {
  label: string;
  description: string;
  email: string;
  role: UserRole;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderHoverClass: string;
}[] = [
  {
    label: 'Drafter / Researcher',
    description: 'Draft petitions, research evidence & prepare recommendation letters',
    email: 'writer@babelglobal.com',
    role: 'writer',
    icon: Briefcase,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-100/70 border-purple-200/50',
    borderHoverClass: 'hover:border-purple-500 hover:bg-purple-50/40',
  },
  {
    label: 'Super Administrator',
    description: 'Full system control, staff permissions & workflow management',
    email: 'superadmin@babelglobal.com',
    role: 'superadmin',
    icon: Shield,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-100/70 border-amber-200/50',
    borderHoverClass: 'hover:border-amber-500 hover:bg-amber-50/40',
  },
];

type Step = 'accountType' | 'teamSubRole' | 'loginForm' | 'forgotPassword' | 'resetPasswordForm';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<Step>('accountType');
  const [accountType, setAccountType] = useState<'team' | 'client' | 'admin' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubRole, setSelectedSubRole] = useState<typeof TEAM_SUB_ROLES[0] | null>(null);

  // Forgot password and reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAccountType = (type: 'team' | 'client' | 'admin') => {
    setAccountType(type);
    setError('');
    setEmail('');
    setPassword('');
    if (type === 'team') {
      setStep('teamSubRole');
    } else {
      setStep('loginForm');
    }
  };

  const performLogin = async (emailVal: string, passwordVal: string) => {
    setError('');
    setIsLoading(true);
    try {
      const endpoint = accountType === 'admin' ? '/auth/admin/login' : '/auth/login';
      const data = await api.post(endpoint, { email: emailVal, password: passwordVal });
      if (data.success) {
        localStorage.setItem('jwt_token', data.token);
        const role = data.user.role as UserRole;
        onLogin(role, data.user.email);
      } else {
        setError('Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to authentication server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamSubRole = (sub: typeof TEAM_SUB_ROLES[0]) => {
    setSelectedSubRole(sub);
    setEmail('');
    setPassword('');
    setStep('loginForm');
  };

  const handleBack = () => {
    setError('');
    if (step === 'loginForm' && accountType === 'team') {
      setStep('teamSubRole');
    } else if (step === 'forgotPassword' || step === 'resetPasswordForm') {
      setStep('loginForm');
    } else {
      setStep('accountType');
      setAccountType(null);
      setSelectedSubRole(null);
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      {/* Outer Login Card matching reference layout */}
      <div className="w-full max-w-[1024px] min-h-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/80">
        
        {/* ═══════════════════ LEFT PANEL (Photo & Branding) ═══════════════════ */}
        <div className="md:w-1/2 relative min-h-[360px] md:min-h-[580px] bg-slate-900 overflow-hidden flex flex-col justify-between p-6 sm:p-8">
          <img
            src={loginBg}
            alt="Immigration Case Management"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'left top' }}
          />

          {/* Bottom Title & Tagline Overlay */}
          <div className="relative z-10 mt-auto flex items-start gap-3 pt-6">
            <div className="w-1 h-10 bg-amber-500 rounded-full flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-md">
                Immigration<br />Case Management
              </h2>
              <p className="text-slate-300 text-xs mt-1 drop-shadow font-medium">
                Trusted by immigration attorneys across the USA.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════ RIGHT PANEL (Interactive Selection / Form) ═══════════════════ */}
        <div className="md:w-1/2 p-8 sm:p-10 md:p-12 flex flex-col justify-between bg-white">
          
          {/* Top content area */}
          <div>
            {/* Back Button if not on home step */}
            {step !== 'accountType' && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* Header */}
            {step === 'accountType' && (
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Welcome Back!
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  Please select your account type to continue.
                </p>
              </div>
            )}

            {step === 'teamSubRole' && (
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                  Select Team Workspace
                </h1>
                <p className="text-slate-500 text-xs font-medium">
                  Choose your sub-role to enter your designated workspace.
                </p>
              </div>
            )}

            {step === 'loginForm' && (
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                  {accountType === 'client' 
                    ? 'Client Portal Sign In' 
                    : accountType === 'admin'
                    ? 'Administrator Sign In'
                    : `Sign In — ${selectedSubRole?.label ?? 'Team'}`}
                </h1>
                <p className="text-slate-500 text-xs font-medium">
                  Enter your credentials to access your account.
                </p>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            {/* ════════════ STEP 1: Account Type Selection ════════════ */}
            {step === 'accountType' && (
              <div className="space-y-3.5">
                {/* Babel Global Team Option */}
                <button
                  type="button"
                  onClick={() => handleAccountType('team')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/40 transition-all duration-200 group text-left shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100/70 border border-blue-200/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        Babel Global Team
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">
                        Super Admin · Case Writer / Researcher
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>

                {/* Administrator Login Option */}
                <button
                  type="button"
                  onClick={() => handleAccountType('admin')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/40 transition-all duration-200 group text-left shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100/70 border border-amber-200/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldAlert className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                        Administrator Login
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">
                        Verify credentials to access admin features
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>

                {/* Client Option */}
                <button
                  type="button"
                  onClick={() => handleAccountType('client')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-purple-500 bg-slate-50/60 hover:bg-purple-50/40 transition-all duration-200 group text-left shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100/70 border border-purple-200/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                        Client
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">
                        Track case progress & upload documents
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              </div>
            )}

            {/* ════════════ STEP 1b: Team Sub-Role Selection ════════════ */}
            {step === 'teamSubRole' && (
              <div className="space-y-3">
                {TEAM_SUB_ROLES.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.label}
                      type="button"
                      onClick={() => handleTeamSubRole(sub)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/60 ${sub.borderHoverClass} transition-all duration-200 group text-left cursor-pointer`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl ${sub.bgClass} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                          <Icon className={`w-5.5 h-5.5 ${sub.colorClass}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {sub.label}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 font-normal">
                            {sub.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* ════════════ STEP 2: Credentials Form ════════════ */}
            {step === 'loginForm' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setStep('forgotPassword');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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
                      className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Forgot Password Form */}
            {step === 'forgotPassword' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail) return;
                  setIsLoading(true);
                  setError('');
                  try {
                    const endpoint = accountType === 'admin' ? '/auth/admin/forgot-password' : '/auth/forgot-password';
                    const data = await api.post(endpoint, { email: forgotEmail });
                    if (data.success) {
                      setStep('resetPasswordForm');
                    } else {
                      setError(data.error || 'Failed to request password reset');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Error requesting password reset');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Forgot Password</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter your registered email address to receive a verification OTP code.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 disabled:opacity-75"
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* STEP 4: Reset Password Form */}
            {step === 'resetPasswordForm' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!otpVal || !newResetPassword) return;
                  if (newResetPassword !== confirmResetPassword) {
                    setError('Passwords do not match');
                    return;
                  }
                  setIsLoading(true);
                  setError('');
                  try {
                    const endpoint = accountType === 'admin' ? '/auth/admin/reset-password' : '/auth/reset-password';
                    const data = await api.post(endpoint, {
                      email: forgotEmail,
                      password: newResetPassword,
                      otp: otpVal
                    });
                    if (data.success) {
                      setResetSuccessMsg('Password reset successfully. You can now log in!');
                      setTimeout(() => {
                        setResetSuccessMsg('');
                        setStep('loginForm');
                      }, 3000);
                    } else {
                      setError(data.error || 'Failed to reset password');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Error resetting password');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
                  <p className="text-xs text-slate-500 mt-1">Check your email for the simulated OTP code (use 123456 to test).</p>
                </div>

                {resetSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-xl font-semibold">
                    {resetSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    OTP Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={otpVal}
                    onChange={(e) => setOtpVal(e.target.value)}
                    placeholder="Enter OTP (e.g. 123456)"
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-75"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>

          {/* ════════════ FOOTER ════════════ */}
          <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="text-amber-500">🔒</span>
              <span>256-bit SSL encrypted · GDPR compliant</span>
            </div>
            <p className="text-center text-[11px] text-slate-400 font-normal">
              © 2026 Babel Global Inc. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
