import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Course,
  Batch,
  StudentProfile,
  Question,
  Exam,
  ExamAttempt,
  ActivityLog,
  SystemSettings,
  SystemStats
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { CourseManagement } from './components/CourseManagement';
import { InstructorManagement } from './components/InstructorManagement';
import { QuestionApprovalModal } from './components/QuestionApprovalModal';
import { BatchManagement } from './components/BatchManagement';
import { StudentManagement } from './components/StudentManagement';
import { QuestionBank } from './components/QuestionBank';
import { ExamCreator } from './components/ExamCreator';
import { StudentDashboard } from './components/StudentDashboard';
import { CBTExamInterface } from './components/CBTExamInterface';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { LoginForm } from './components/LoginForm';
import { exportSingleStudentResultPDF } from './utils/exportUtils';
import { Clock, ShieldCheck, Download, Award, CheckCircle2, XCircle } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hiit_theme') === 'dark';
  });

  // Current logged in user state (default seeded to Coordinator)
  const [currentUser, setCurrentUser] = useState<User | null>();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data Stores
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    showResultsImmediately: true,
    instituteName: 'HiiT PLC',
    centerLocation: 'Abuja Training Centre',
    allowStudentReviewAnswers: true
  });

  const [stats, setStats] = useState<SystemStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalBatches: 0,
    pendingExams: 0,
    approvedExams: 0,
    completedExams: 0,
    passRatePercent: 0,
    failRatePercent: 0,
    totalQuestions: 0
  });

  // Active CBT Exam Attempt state
  const [activeExamSession, setActiveExamSession] = useState<{
    exam: Exam;
    questions: Question[];
    attempt: ExamAttempt;
  } | null>(null);

  // Result Detail Modal
  const [viewingResult, setViewingResult] = useState<ExamAttempt | null>(null);

  // Dark Mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hiit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hiit_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
      if (!currentUser) {
          setIsLoginModalOpen(true);
      }
  }, [currentUser]);

  // Load Data from Backend API
  const refreshAllData = async () => {
    try {
      const [
        resCourses,
        resInstructors,
        resBatches,
        resStudents,
        resQuestions,
        resExams,
        resAttempts,
        resLogs,
        resSettings,
        resStats
      ] = await Promise.all([
        fetch('/api/courses').then((r) => r.json()),
        fetch('/api/instructors').then((r) => r.json()),
        fetch('/api/batches').then((r) => r.json()),
        fetch('/api/students').then((r) => r.json()),
        fetch('/api/questions').then((r) => r.json()),
        fetch('/api/exams').then((r) => r.json()),
        fetch('/api/attempts').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json())
      ]);

      if (Array.isArray(resCourses)) setCourses(resCourses);
      if (Array.isArray(resInstructors)) setInstructors(resInstructors);
      if (Array.isArray(resBatches)) setBatches(resBatches);
      if (Array.isArray(resStudents)) setStudents(resStudents);
      if (Array.isArray(resQuestions)) setQuestions(resQuestions);
      if (Array.isArray(resExams)) setExams(resExams);
      if (Array.isArray(resAttempts)) setAttempts(resAttempts);
      if (Array.isArray(resLogs)) setLogs(resLogs);
      if (resSettings) setSettings(resSettings);
      if (resStats) setStats(resStats);
    } catch (err) {
      console.error('Failed to load API data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handle Demo Persona Switch
  const handleRoleSwitch = (role: UserRole) => {
    if (role === 'coordinator') {
      setCurrentUser({
        id: 'usr_coord_1',
        name: 'FCHATC',
        email: '',
        role: 'coordinator',
        status: 'active',
        createdAt: '2026-01-10T08:00:00Z'
      });
      setActiveTab('overview');
    } else if (role === 'instructor') {
      setCurrentUser({
        id: 'usr_inst_1',
        name: 'Instructor',
        email: '',
        role: 'instructor',
        assignedCourseIds: ['crs_1'],
        assignedBatchIds: ['batch_1'],
        status: 'active',
        createdAt: '2026-01-15T09:30:00Z'
      });
      setActiveTab('overview');
    } else if (role === 'registrar') {
      setCurrentUser({
        id: 'usr_reg_1',
        name: 'Mr. Jonathan',
        email: '',
        role: 'registrar',
        status: 'active',
        createdAt: '2026-01-05T08:00:00Z'
      });
      setActiveTab('overview');
    } else if (role === 'student') {
      const studentProfile = students[0] || {
        id: 'usr_std_1',
        fullName: 'Aisha Abubakar',
        regNumber: 'HIIT/2026/001',
        email: '',
        phone: '+234 812 345 6789',
        courseId: 'crs_1',
        batchId: 'batch_1'
      };

      setCurrentUser({
        id: studentProfile.id,
        name: studentProfile.fullName,
        email: studentProfile.email,
        role: 'student',
        regNumber: studentProfile.regNumber,
        assignedCourseIds: [studentProfile.courseId],
        assignedBatchIds: [studentProfile.batchId],
        status: 'active',
        createdAt: new Date().toISOString()
      });
      setActiveTab('overview');
    }
  };

  // Course Handlers
  const handleAddCourse = async (data: any) => {
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleEditCourse = async (id: string, data: any) => {
    await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleDeleteCourse = async (id: string) => {
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    refreshAllData();
  };

  const handleToggleCourseStatus = async (id: string) => {
    await fetch(`/api/courses/${id}/status`, { method: 'PATCH' });
    refreshAllData();
  };

  // Instructor Handlers
  const handleAddInstructor = async (data: any) => {
    await fetch('/api/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleEditInstructor = async (id: string, data: any) => {
    await fetch(`/api/instructors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleResetPassword = async (id: string) => {
    const res = await fetch(`/api/instructors/${id}/reset-password`, { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    refreshAllData();
  };

  const handleDeleteInstructor = async (id: string) => {
    await fetch(`/api/instructors/${id}`, { method: 'DELETE' });
    refreshAllData();
  };

  // Batch Handlers
  const handleCreateBatch = async (data: any) => {
    await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleEditBatch = async (id: string, data: any) => {
    await fetch(`/api/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleCloseBatch = async (id: string) => {
    await fetch(`/api/batches/${id}/close`, { method: 'PATCH' });
    refreshAllData();
  };

  const handleDeleteBatch = async (id: string) => {
    await fetch(`/api/batches/${id}`, { method: 'DELETE' });
    refreshAllData();
  };

  // Student Handlers
  const handleAddStudent = async (data: any) => {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleImportStudents = async (studentsList: any[]) => {
    await fetch('/api/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: studentsList })
    });
    refreshAllData();
  };

  const handleRemoveStudent = async (id: string) => {
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    refreshAllData();
  };

  // Question Bank Handlers
  const handleCreateQuestion = async (data: any) => {
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        instructorId: currentUser?.id,
        instructorName: currentUser?.name
      })
    });
    refreshAllData();
  };

  const handleEditQuestion = async (id: string, data: any) => {
    await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    refreshAllData();
  };

  const handleDeleteQuestion = async (id: string) => {
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    refreshAllData();
  };

  const handleSubmitQuestionForApproval = async (id: string) => {
    await fetch(`/api/questions/${id}/submit`, { method: 'POST' });
    refreshAllData();
  };

  const handleReviewQuestion = async (id: string, action: 'approve' | 'reject' | 'modification', reason?: string) => {
    await fetch(`/api/questions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason })
    });
    refreshAllData();
  };

  const handleImportQuestions = async (questionsList: any[]) => {
    await fetch('/api/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: questionsList })
    });
    refreshAllData();
  };

  // Exam Handlers
  const handleCreateExam = async (data: any) => {
    await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        instructorId: currentUser?.id,
        instructorName: currentUser?.name
      })
    });
    refreshAllData();
  };

  const handleUpdateExamStatus = async (id: string, status: string) => {
    await fetch(`/api/exams/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    refreshAllData();
  };

  const handleDeleteExam = async (id: string) => {
    await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    refreshAllData();
  };

  // Toggle Results Visibility
  const handleToggleShowResults = async (show: boolean) => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showResultsImmediately: show })
    });
    refreshAllData();
  };

  // Reset Seed Data
  const handleResetSeedData = async () => {
    if (confirm('Are you sure you want to reset all data back to default demo state?')) {
      await fetch('/api/seed/reset', { method: 'POST' });
      refreshAllData();
    }
  };

  // CBT Exam Engine Execution Flow
  const handleStartExam = async (examId: string) => {
    if (!currentUser) return;

    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    // Fetch start attempt
    const res = await fetch('/api/attempts/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId,
        studentId: currentUser.id
      })
    });

    const attemptData: ExamAttempt = await res.json();
    if (!res.ok) {
      alert((attemptData as any).error || 'Could not start exam.');
      return;
    }

    const examQuestions = questions.filter((q) => exam.questionIds.includes(q.id));

    setActiveExamSession({
      exam,
      questions: examQuestions,
      attempt: attemptData
    });
  };

  const handleAutoSaveAnswers = async (
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    timeSpentSeconds: number,
    flaggedQuestions: string[]
  ) => {
    if (!activeExamSession) return;
    await fetch(`/api/attempts/${activeExamSession.attempt.id}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        timeSpentSeconds,
        flaggedQuestions
      })
    });
  };

  const handleSubmitExam = async (
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    timeSpentSeconds: number
  ) => {
    if (!activeExamSession) return;
    const res = await fetch(`/api/attempts/${activeExamSession.attempt.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        timeSpentSeconds
      })
    });

    const finalAttempt: ExamAttempt = await res.json();
    setActiveExamSession(null);
    refreshAllData();

    // Show completed result modal
    setViewingResult(finalAttempt);
  };

  // If in active CBT Exam Mode, render full screen CBT interface!
  if (activeExamSession) {
    return (
      <CBTExamInterface
        exam={activeExamSession.exam}
        questions={activeExamSession.questions}
        attempt={activeExamSession.attempt}
        onAutoSaveAnswer={handleAutoSaveAnswers}
        onSubmitExam={handleSubmitExam}
        onExitExam={() => setActiveExamSession(null)}
      />
    );
  }

  const pendingQuestionsCount = questions.filter((q) => q.status === 'pending').length;

  // Derive Instructor specific course and batch scope
  const instructorCourseIds = new Set<string>([
    ...(currentUser?.assignedCourseIds || []),
    ...batches
      .filter((b) => b.instructorId === currentUser?.id || currentUser?.assignedBatchIds?.includes(b.id))
      .map((b) => b.courseId)
  ]);

  const instructorBatchIds = new Set<string>([
    ...(currentUser?.assignedBatchIds || []),
    ...batches.filter((b) => b.instructorId === currentUser?.id).map((b) => b.id)
  ]);

  // Filtered scope lists for instructor role
  const instructorStudents = currentUser?.role === 'instructor'
    ? students.filter(
        (s) => instructorCourseIds.has(s.courseId) || instructorBatchIds.has(s.batchId)
      )
    : students;

  const instructorCourses = currentUser?.role === 'instructor'
    ? courses.filter((c) => instructorCourseIds.has(c.id))
    : courses;

  const instructorBatches = currentUser?.role === 'instructor'
    ? batches.filter((b) => instructorBatchIds.has(b.id) || instructorCourseIds.has(b.courseId))
    : batches;

  const instructorQuestions = currentUser?.role === 'instructor'
    ? questions.filter((q) => q.instructorId === currentUser.id || instructorCourseIds.has(q.courseId))
    : questions;

  const instructorExams = currentUser?.role === 'instructor'
    ? exams.filter((e) => e.instructorId === currentUser.id || instructorCourseIds.has(e.courseId))
    : exams;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLogout={() => setCurrentUser(null)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Role-Aware Sidebar */}
        {currentUser && (
          <Sidebar
            currentRole={currentUser.role}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingQuestionsCount={pendingQuestionsCount}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {!currentUser ? (
            <div className="p-12 text-center max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 my-12">
              <h2 className="text-2xl font-black text-[#002B49] dark:text-white">HiiT CBT Management System</h2>
              <p className="text-xs text-slate-500">
                Please sign in with your role credentials or use the top demo persona switcher to explore the portal.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 bg-[#002B49] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Sign In To Portal
              </button>
            </div>
          ) : (
            <>
              {/* FACULTY COORDINATOR VIEWS */}
              {currentUser.role === 'coordinator' && (
                <>
                  {activeTab === 'overview' && (
                    <CoordinatorDashboard
                      stats={stats}
                      logs={logs}
                      settings={settings}
                      pendingQuestions={questions.filter((q) => q.status === 'pending')}
                      onToggleShowResults={handleToggleShowResults}
                      onNavigate={setActiveTab}
                      onResetSeedData={handleResetSeedData}
                    />
                  )}
                  {activeTab === 'courses' && (
                    <CourseManagement
                      courses={courses}
                      onAddCourse={handleAddCourse}
                      onEditCourse={handleEditCourse}
                      onDeleteCourse={handleDeleteCourse}
                      onToggleCourseStatus={handleToggleCourseStatus}
                    />
                  )}
                  {activeTab === 'instructors' && (
                    <InstructorManagement
                      instructors={instructors}
                      courses={courses}
                      batches={batches}
                      onAddInstructor={handleAddInstructor}
                      onEditInstructor={handleEditInstructor}
                      onResetPassword={handleResetPassword}
                      onDeleteInstructor={handleDeleteInstructor}
                    />
                  )}
                  {activeTab === 'question-approval' && (
                    <QuestionApprovalModal
                      questions={questions}
                      onReviewQuestion={handleReviewQuestion}
                    />
                  )}
                  {activeTab === 'batches' && (
                    <BatchManagement
                      batches={batches}
                      courses={courses}
                      instructors={instructors}
                      onCreateBatch={handleCreateBatch}
                      onEditBatch={handleEditBatch}
                      onCloseBatch={handleCloseBatch}
                      onDeleteBatch={handleDeleteBatch}
                    />
                  )}
                  {activeTab === 'students' && (
                    <StudentManagement
                      students={students}
                      courses={courses}
                      batches={batches}
                      onAddStudent={handleAddStudent}
                      onImportStudents={handleImportStudents}
                      onRemoveStudent={handleRemoveStudent}
                    />
                  )}
                  {activeTab === 'questions' && (
                    <QuestionBank
                      questions={questions}
                      courses={courses}
                      onCreateQuestion={handleCreateQuestion}
                      onEditQuestion={handleEditQuestion}
                      onDeleteQuestion={handleDeleteQuestion}
                      onSubmitForApproval={handleSubmitQuestionForApproval}
                      onImportQuestions={handleImportQuestions}
                    />
                  )}
                  {activeTab === 'exams' && (
                    <ExamCreator
                      exams={exams}
                      courses={courses}
                      batches={batches}
                      questions={questions}
                      onCreateExam={handleCreateExam}
                      onUpdateExamStatus={handleUpdateExamStatus}
                      onDeleteExam={handleDeleteExam}
                      userRole="coordinator"
                    />
                  )}
                  {activeTab === 'reports' && (
                    <ReportsAnalytics
                      stats={stats}
                      attempts={attempts}
                      courses={courses}
                      batches={batches}
                      students={students}
                    />
                  )}
                  {activeTab === 'logs' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                      <h2 className="text-lg font-bold text-[#002B49] dark:text-white flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-[#C8102E]" />
                        <span>System Activity Audit Logs</span>
                      </h2>
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex justify-between">
                            <div>
                              <strong className="text-slate-900 dark:text-white">{log.userName}</strong> ({log.userRole}): {log.details}
                            </div>
                            <span className="text-slate-400 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === 'settings' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 max-w-xl">
                      <h2 className="text-lg font-bold text-[#002B49] dark:text-white">System Settings</h2>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Immediate Result Release</span>
                            <span className="text-[11px] text-slate-400">If disabled, student scores are hidden until coordinator releases them.</span>
                          </div>
                          <button
                            onClick={() => handleToggleShowResults(!settings.showResultsImmediately)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${settings.showResultsImmediately ? 'bg-emerald-600' : 'bg-slate-600'}`}
                          >
                            {settings.showResultsImmediately ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* INSTRUCTOR VIEWS */}
              {currentUser.role === 'instructor' && (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="bg-[#002B49] text-white p-6 rounded-2xl border-b-4 border-[#C8102E]">
                        <h1 className="text-xl font-bold">Instructor Portal — {currentUser.name}</h1>
                        <p className="text-xs text-slate-300 mt-1">Manage batches, build question banks, and create CBT tests.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase">Assigned Batches</p>
                          <p className="text-2xl font-black text-[#002B49] dark:text-white mt-1">{instructorBatches.length}</p>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase">Students in Taught Courses</p>
                          <p className="text-2xl font-black text-emerald-600 mt-1">{instructorStudents.length}</p>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase">Questions Authored</p>
                          <p className="text-2xl font-black text-indigo-600 mt-1">{instructorQuestions.length}</p>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-400 uppercase">Exams Created</p>
                          <p className="text-2xl font-black text-[#C8102E] mt-1">{instructorExams.length}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'batches' && (
                    <BatchManagement
                      batches={instructorBatches}
                      courses={instructorCourses.length > 0 ? instructorCourses : courses}
                      instructors={instructors}
                      onCreateBatch={handleCreateBatch}
                      onEditBatch={handleEditBatch}
                      onCloseBatch={handleCloseBatch}
                      onDeleteBatch={handleDeleteBatch}
                    />
                  )}
                  {activeTab === 'students' && (
                    <StudentManagement
                      students={instructorStudents}
                      courses={instructorCourses.length > 0 ? instructorCourses : courses}
                      batches={instructorBatches.length > 0 ? instructorBatches : batches}
                      onAddStudent={handleAddStudent}
                      onImportStudents={handleImportStudents}
                      onRemoveStudent={handleRemoveStudent}
                      isInstructorView={true}
                    />
                  )}
                  {activeTab === 'questions' && (
                    <QuestionBank
                      questions={instructorQuestions}
                      courses={instructorCourses.length > 0 ? instructorCourses : courses}
                      onCreateQuestion={handleCreateQuestion}
                      onEditQuestion={handleEditQuestion}
                      onDeleteQuestion={handleDeleteQuestion}
                      onSubmitForApproval={handleSubmitQuestionForApproval}
                      onImportQuestions={handleImportQuestions}
                    />
                  )}
                  {activeTab === 'exams' && (
                    <ExamCreator
                      exams={instructorExams}
                      courses={instructorCourses.length > 0 ? instructorCourses : courses}
                      batches={instructorBatches.length > 0 ? instructorBatches : batches}
                      questions={instructorQuestions}
                      onCreateExam={handleCreateExam}
                      onUpdateExamStatus={handleUpdateExamStatus}
                      onDeleteExam={handleDeleteExam}
                      userRole="instructor"
                    />
                  )}
                  {activeTab === 'reports' && (
                    <ReportsAnalytics
                      stats={{
                        ...stats,
                        totalStudents: instructorStudents.length,
                        totalCourses: instructorCourses.length,
                        totalBatches: instructorBatches.length
                      }}
                      attempts={attempts.filter((a) =>
                        instructorStudents.some((s) => s.id === a.studentId || s.regNumber === a.studentRegNumber)
                      )}
                      courses={instructorCourses}
                      batches={instructorBatches}
                      students={instructorStudents}
                    />
                  )}
                </>
              )}

              {/* REGISTRAR READ ONLY VIEWS */}
              {currentUser.role === 'registrar' && (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="bg-[#002B49] text-white p-6 rounded-2xl border-b-4 border-amber-500 flex justify-between items-center">
                        <div>
                          <h1 className="text-xl font-bold">Registrar Official Portal</h1>
                          <p className="text-xs text-slate-300 mt-1">Read-Only access to academic records, student lists, and exam results.</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-full uppercase">
                          READ ONLY
                        </span>
                      </div>
                    </div>
                  )}
                  {activeTab === 'courses' && <CourseManagement courses={courses} onAddCourse={() => {}} onEditCourse={() => {}} onDeleteCourse={() => {}} onToggleCourseStatus={() => {}} readOnly />}
                  {activeTab === 'batches' && <BatchManagement batches={batches} courses={courses} instructors={instructors} onCreateBatch={() => {}} onEditBatch={() => {}} onCloseBatch={() => {}} onDeleteBatch={() => {}} readOnly />}
                  {activeTab === 'students' && <StudentManagement students={students} courses={courses} batches={batches} onAddStudent={() => {}} onImportStudents={() => {}} onRemoveStudent={() => {}} readOnly />}
                  {activeTab === 'questions' && <QuestionBank questions={questions} courses={courses} onCreateQuestion={() => {}} onEditQuestion={() => {}} onDeleteQuestion={() => {}} onSubmitForApproval={() => {}} onImportQuestions={() => {}} readOnly />}
                  {activeTab === 'exams' && <ExamCreator exams={exams} courses={courses} batches={batches} questions={questions} onCreateExam={() => {}} onUpdateExamStatus={() => {}} onDeleteExam={() => {}} userRole="registrar" readOnly />}
                  {activeTab === 'reports' && <ReportsAnalytics stats={stats} attempts={attempts} courses={courses} batches={batches} students={students} />}
                </>
              )}

              {/* STUDENT VIEWS */}
              {currentUser.role === 'student' && (
                <>
                  {(activeTab === 'overview' || activeTab === 'cbt-exams' || activeTab === 'my-results') && (
                    <StudentDashboard
                      currentUser={currentUser}
                      availableExams={exams.filter((e) => e.status === 'published')}
                      studentAttempts={attempts.filter((a) => a.studentId === currentUser.id)}
                      settings={settings}
                      onStartExam={handleStartExam}
                      onViewResultDetails={(att) => setViewingResult(att)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginForm
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoginModalOpen(false);
            setActiveTab('overview');
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Result Breakdown Statement Modal */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#002B49] dark:text-white">Official Statement of Result</h3>
                <p className="text-xs text-slate-400">HiiT PLC Abuja Training Centre</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${viewingResult.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {viewingResult.isPassed ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-2 text-xs">
              <div>Student: <strong className="text-slate-900 dark:text-white">{viewingResult.studentName}</strong></div>
              <div>Reg Number: <strong className="font-mono text-[#002B49] dark:text-red-400">{viewingResult.studentRegNumber}</strong></div>
              <div>Exam: <strong className="text-slate-900 dark:text-white">{viewingResult.examTitle}</strong></div>
              <div>Score Obtained: <strong>{viewingResult.scoreObtained} / {viewingResult.totalMarksPossible}</strong></div>
              <div>Percentage: <strong className="text-emerald-600 text-sm">{viewingResult.percentage}%</strong></div>
              <div>Grade Assigned: <strong className="text-[#C8102E] text-sm">{viewingResult.grade}</strong></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => exportSingleStudentResultPDF(viewingResult, 'HiiT Academic Assessment', 'Batch 2026')}
                className="px-4 py-2 bg-[#002B49] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-4 h-4 text-[#C8102E]" />
                <span>Download Official PDF</span>
              </button>

              <button
                onClick={() => setViewingResult(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
