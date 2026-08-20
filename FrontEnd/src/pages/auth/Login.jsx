import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Users, User, ArrowRight, Shield, Briefcase, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import loginBg from '../../assets/login-bg.png';

const TEAM_SUB_ROLES = [
  {
    label: 'Administrator / Case Manager',
    description: 'Manage day-to-day cases, clients, tasks & staff assignments',
    email: 'admin@babelglobal.com',
    role: 'admin',
    icon: UserCog,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100/70 border-blue-200/50',
    borderHoverClass: 'hover:border-blue-500 hover:bg-blue-50/40',
  },
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

export const Login = () => {
  const { login } = useAuth();
  const [step, setStep] = useState('accountType'); // 'accountType' | 'teamSubRole' | 'loginForm'
  const [accountType, setAccountType] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubRole, setSelectedSubRole] = useState(null);

  const handleAccountType = (type) => {
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

  const handleTeamSubRole = (sub) => {
    setSelectedSubRole(sub);
    setEmail(sub.email);
    setPassword('password123');
    login(sub.email, 'password123');
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-[1024px] min-h-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/80">
        
        {/* LEFT PANEL */}
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

        {/* RIGHT PANEL */}
        <div className="md:w-1/2 p-8 sm:p-10 md:p-12 flex flex-col justify-between bg-white">
          <div>
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
                  {accountType === 'client' ? 'Client Portal Sign In' : `Sign In — ${selectedSubRole?.label ?? 'Team'}`}
                </h1>
                <p className="text-slate-500 text-xs font-medium">
                  Enter your credentials to access your account.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            {/* STEP 1: Account Type */}
            {step === 'accountType' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleAccountType('team')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200/90 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/40 transition-all duration-200 group text-left shadow-sm hover:shadow-md cursor-pointer"
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
                        Super Admin · Administrator · Drafter / Researcher
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAccountType('client')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200/90 hover:border-purple-500 bg-slate-50/60 hover:bg-purple-50/40 transition-all duration-200 group text-left shadow-sm hover:shadow-md cursor-pointer"
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
                        Track your case progress, upload documents & communicate with your team
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              </div>
            )}

            {/* STEP 1b: Team Sub-Role */}
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

            {/* STEP 2: Login Form */}
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
                      onClick={() => alert('Password reset link sent to your email.')}
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
                  className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Login
                </button>
              </form>
            )}
          </div>

          {/* FOOTER */}
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
