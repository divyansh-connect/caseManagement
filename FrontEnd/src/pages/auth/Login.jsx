import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 space-y-6 border border-slate-700/80 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-white text-2xl">
            N
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Immigration Case OS</h2>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">EB-2 NIW Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@immigrationlaw.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-900 border-slate-700" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-cyan-400 hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Login to Portal
          </button>
        </form>
      </div>
    </div>
  );
};
