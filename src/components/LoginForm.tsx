import React, { useState } from 'react';
import { UserRole } from '../types';
import { GraduationCap, Lock, Mail, UserCheck, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onClose }) => {
  const [roleTab, setRoleTab] = useState<UserRole>('coordinator');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (role: UserRole) => {
    setRoleTab(role);
    setErrorMessage('');
    if (role === 'coordinator') {
      setIdentifier('');
      // setPassword('hiit123');
    } else if (role === 'instructor') {
      setIdentifier('');
      // setPassword('hiit123');
    } else if (role === 'registrar') {
      setIdentifier('');
      // setPassword('hiit123');
    } else if (role === 'student') {
      setIdentifier('');
      // setPassword('student123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginType: roleTab,
          identifier,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-[#002B49] text-white p-6 border-b-4 border-[#C8102E] text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-[#C8102E]">
            <GraduationCap className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-xl font-black tracking-tight">HiiT CBT Assessment Portal</h2>
          <p className="text-xs text-slate-300">Abuja Training Centre — Secure Login</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('coordinator')}
              className={`py-1.5 rounded-lg transition-all ${
                roleTab === 'coordinator' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('instructor')}
              className={`py-1.5 rounded-lg transition-all ${
                roleTab === 'instructor' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Instructor
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('registrar')}
              className={`py-1.5 rounded-lg transition-all ${
                roleTab === 'registrar' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`py-1.5 rounded-lg transition-all ${
                roleTab === 'student' ? 'bg-[#C8102E] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Student
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {roleTab === 'student' ? 'Registration Number' : 'Email Address'}
              </label>
              <div className="relative">
                {roleTab === 'student' ? (
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={roleTab === 'student' ? 'e.g. HIIT/2026/001' : 'e.g. user@gmail.com'}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#002B49] hover:bg-[#001d32] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In To Portal'}</span>
              <ArrowRight className="w-4 h-4 text-[#C8102E]" />
            </button>
          </form>

          {onClose && (
            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close Login Modal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
