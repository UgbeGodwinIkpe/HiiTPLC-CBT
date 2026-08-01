import React from 'react';
import {
  BookOpen,
  Users,
  UserCheck,
  FolderGit2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ToggleLeft,
  ToggleRight,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileQuestion
} from 'lucide-react';
import { SystemStats, ActivityLog, SystemSettings, Question } from '../types';

interface CoordinatorDashboardProps {
  stats: SystemStats;
  logs: ActivityLog[];
  settings: SystemSettings;
  pendingQuestions: Question[];
  onToggleShowResults: (val: boolean) => void;
  onNavigate: (tab: string) => void;
  onResetSeedData: () => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  stats,
  logs,
  settings,
  pendingQuestions,
  onToggleShowResults,
  onNavigate,
  onResetSeedData
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] to-[#001828] text-white p-6 rounded-2xl shadow-md border-b-4 border-[#C8102E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-red-600/30 text-red-200 border border-red-500/30 text-xs font-bold rounded-full uppercase tracking-wider inline-block mb-2">
            System Administrator
          </span>
          <h1 className="text-2xl font-black tracking-tight">Faculty Coordinator Overview</h1>
          <p className="text-xs text-slate-300 mt-1">
            HiiT PLC Abuja Training Centre — Complete Academic Assessment & CBT Management Control
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Result Release Toggle */}
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex items-center space-x-3">
            <span className="text-xs font-medium text-slate-200">
              Student Results: <strong className="text-white">{settings.showResultsImmediately ? 'Immediate' : 'Hidden'}</strong>
            </span>
            <button
              onClick={() => onToggleShowResults(!settings.showResultsImmediately)}
              className="text-[#C8102E] hover:text-red-400 transition-colors"
              title="Toggle Immediate Result Release vs Hidden Mode"
            >
              {settings.showResultsImmediately ? (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-400" />
              )}
            </button>
          </div>

          <button
            onClick={onResetSeedData}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all text-slate-100"
            title="Reset Database to Default Demo State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Courses</p>
            <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{stats.totalCourses}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
            <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{stats.totalStudents}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructors</p>
            <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{stats.totalInstructors}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Batches</p>
            <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{stats.totalBatches}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Question Bank</p>
            <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{stats.totalQuestions}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileQuestion className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Exam & Performance Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exam Status Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exam Workflow Status
            </h3>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
              <span className="block text-xl font-black text-amber-700 dark:text-amber-300">{stats.pendingExams}</span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Pending</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
              <span className="block text-xl font-black text-blue-700 dark:text-blue-300">{stats.approvedExams}</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Approved</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
              <span className="block text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.completedExams}</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Published</span>
            </div>
          </div>
        </div>

        {/* Pass Rate Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Overall Pass Rate</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.passRatePercent}%</p>
            <p className="text-[11px] text-slate-500 mt-1">Based on official graded submissions</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 text-lg">
            {stats.passRatePercent}%
          </div>
        </div>

        {/* Fail Rate Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase text-red-600 dark:text-red-400">
              <TrendingDown className="w-4 h-4" />
              <span>Overall Fail Rate</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.failRatePercent}%</p>
            <p className="text-[11px] text-slate-500 mt-1">Remedial support required</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center font-bold text-red-600 text-lg">
            {stats.failRatePercent}%
          </div>
        </div>
      </div>

      {/* Question Approval Queue Alert Banner */}
      {pendingQuestions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                {pendingQuestions.length} Question{pendingQuestions.length > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Instructors have submitted new CBT question bank items for review.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('question-approval')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            Review Questions Now
          </button>
        </div>
      )}

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#002B49] dark:text-white uppercase tracking-wider mb-2">
            Administrator Quick Actions
          </h3>
          
          <button
            onClick={() => onNavigate('courses')}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4 text-[#C8102E]" />
              <span>Add / Manage Courses</span>
            </div>
            <Plus className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('instructors')}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Register New Instructor</span>
            </div>
            <Plus className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Generate PDF / Excel Reports</span>
            </div>
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Audit / Recent Activity Log */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#002B49] dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#C8102E]" />
              <span>System Activity Audit Logs</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Live feed</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{log.userName}</span>
                    <span className="px-1.5 py-0.2 uppercase text-[9px] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded">
                      {log.userRole}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
