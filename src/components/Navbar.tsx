import React from 'react';
import {
  GraduationCap,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Bell,
  Sparkles,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onRoleSwitch: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onOpenLogin
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] dark:bg-slate-800 flex items-center justify-center text-white border-b-2 border-[#C8102E] shadow-sm">
            <GraduationCap className="w-6 h-6 text-[#C8102E] dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-[#002B49] dark:text-white">
                HiiT<span className="text-[#C8102E]">.CBT</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-[#C8102E] dark:bg-red-950/60 dark:text-red-300">
                Abuja Training Centre
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
              Academic Assessment & CBT Management System
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Bar for Reviewers & Users */}
        {/* <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">
            Demo Persona:
          </span>
          <button
            onClick={() => onRoleSwitch('coordinator')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              currentUser?.role === 'coordinator'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Coordinator
          </button>
          <button
            onClick={() => onRoleSwitch('instructor')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              currentUser?.role === 'instructor'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Instructor
          </button>
          <button
            onClick={() => onRoleSwitch('registrar')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              currentUser?.role === 'registrar'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Registrar
          </button>
          <button
            onClick={() => onRoleSwitch('student')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              currentUser?.role === 'student'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Student
          </button>
        </div> */}

        {/* Right Action Icons & Profile Info */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Current User Badge & Logout */}
          {currentUser ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {currentUser.name}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[#C8102E] dark:text-red-400">
                  {currentUser.role === 'student' ? `REG: ${currentUser.regNumber}` : currentUser.role}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm border border-slate-300 dark:border-slate-600">
                {currentUser.name.charAt(0)}
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-bold text-white bg-[#002B49] hover:bg-[#001d32] dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1"
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
