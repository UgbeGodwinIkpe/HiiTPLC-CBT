import React from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { SystemStats, ExamAttempt, Course, Batch, StudentProfile } from '../types';
import { exportToExcel, exportExamResultsPDF } from '../utils/exportUtils';

interface ReportsAnalyticsProps {
  stats: SystemStats;
  attempts: ExamAttempt[];
  courses: Course[];
  batches: Batch[];
  students: StudentProfile[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  stats,
  attempts,
  courses,
  batches,
  students
}) => {
  // Chart Data Preparation
  const passFailData = [
    { name: 'Passed', value: stats.passRatePercent, color: '#10B981' },
    { name: 'Failed', value: stats.failRatePercent, color: '#EF4444' }
  ];

  const studentsPerCourseData = courses.map((c) => ({
    name: c.code,
    fullName: c.title,
    students: students.filter((s) => s.courseId === c.id).length
  }));

  const studentsPerBatchData = batches.map((b) => ({
    name: b.name.split(' ')[0],
    students: students.filter((s) => s.batchId === b.id).length
  }));

  const monthlyExamsTrend = [
    { month: 'Jan 2026', exams: 2, avgScore: 78 },
    { month: 'Feb 2026', exams: 5, avgScore: 82 },
    { month: 'Mar 2026', exams: 8, avgScore: 85 }
  ];

  const handleExportOverallExcel = () => {
    const summaryData = attempts.map((att) => ({
      'Student Name': att.studentName,
      'Reg Number': att.studentRegNumber,
      'Exam Title': att.examTitle,
      'Score Obtained': att.scoreObtained,
      'Total Marks': att.totalMarksPossible,
      'Percentage (%)': att.percentage,
      'Grade': att.grade,
      'Pass/Fail': att.isPassed ? 'PASS' : 'FAIL',
      'Time Spent (Seconds)': att.timeSpentSeconds,
      'Submission Date': new Date(att.gradedAt || att.startTime).toLocaleString()
    }));

    exportToExcel(summaryData, 'HiiT_Abuja_CBT_Analytics_Report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#002B49] dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-[#C8102E]" />
            <span>Academic Performance & CBT Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual statistics, pass/fail trends, and downloadable assessment reports
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportExamResultsPDF(attempts, 'Overall HiiT CBT Assessment Summary')}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={handleExportOverallExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400">Total CBT Submissions</p>
          <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{attempts.length}</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400">Average Pass Rate</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.passRatePercent}%</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled Students</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalStudents}</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400">Active Courses</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.totalCourses}</p>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass vs Fail Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#002B49] dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <PieChartIcon className="w-4 h-4 text-emerald-600" />
            <span>Pass vs Fail Ratio (%)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students per Course Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#002B49] dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Student Distribution Per Course</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsPerCourseData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="students" fill="#002B49" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students per Batch Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#002B49] dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Students Enrolled Per Batch</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsPerBatchData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="students" fill="#C8102E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly CBT Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#002B49] dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Monthly Exam Volume & Average Score (%)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyExamsTrend}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="avgScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
