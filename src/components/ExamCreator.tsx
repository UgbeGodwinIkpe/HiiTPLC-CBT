import React, { useState } from 'react';
import { FileSpreadsheet, Plus, CheckCircle, Clock, Award, Shuffle, AlertCircle, Edit2, Trash2, Send } from 'lucide-react';
import { Exam, Course, Batch, Question } from '../types';

interface ExamCreatorProps {
  exams: Exam[];
  courses: Course[];
  batches: Batch[];
  questions: Question[];
  onCreateExam: (data: any) => void;
  onUpdateExamStatus: (id: string, status: string) => void;
  onDeleteExam: (id: string) => void;
  userRole: string;
  readOnly?: boolean;
}

export const ExamCreator: React.FC<ExamCreatorProps> = ({
  exams,
  courses,
  batches,
  questions,
  onCreateExam,
  onUpdateExamStatus,
  onDeleteExam,
  userRole,
  readOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const approvedQuestions = questions.filter((q) => q.status === 'approved');

  const [formData, setFormData] = useState({
    title: '',
    courseId: courses[0]?.id || '',
    batchId: batches[0]?.id || '',
    durationMinutes: 15,
    passingScorePercent: 60,
    instructions: '1. Ensure stable internet connection.\n2. Read all options carefully before selecting.\n3. Every answer saves automatically.',
    selectedQuestionIds: [] as string[],
    shuffleQuestions: true,
    shuffleOptions: true
  });

  const handleOpenAdd = () => {
    // pre-select first 5 approved questions for convenience
    const preselected = approvedQuestions.slice(0, 5).map((q) => q.id);
    setFormData({
      title: '',
      courseId: courses[0]?.id || '',
      batchId: batches[0]?.id || '',
      durationMinutes: 15,
      passingScorePercent: 60,
      instructions: '1. Read all questions carefully.\n2. Answers save automatically.',
      selectedQuestionIds: preselected,
      shuffleQuestions: true,
      shuffleOptions: true
    });
    setIsModalOpen(true);
  };

  const handleToggleQuestionSelect = (qId: string) => {
    if (formData.selectedQuestionIds.includes(qId)) {
      setFormData({
        ...formData,
        selectedQuestionIds: formData.selectedQuestionIds.filter((id) => id !== qId)
      });
    } else {
      setFormData({
        ...formData,
        selectedQuestionIds: [...formData.selectedQuestionIds, qId]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.selectedQuestionIds.length === 0) return;

    onCreateExam({
      ...formData,
      questionIds: formData.selectedQuestionIds
    });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Published / Live</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Approved</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pending Approval</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#002B49] dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-[#C8102E]" />
            <span>CBT Exam Builder & Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure examination rules, durations, shuffle options, and publish live CBT tests
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#002B49] hover:bg-[#001f35] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C8102E]" />
            <span>Build New Exam</span>
          </button>
        )}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {exam.courseTitle}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Batch: {exam.batchName}</p>
              </div>

              {getStatusBadge(exam.status)}
            </div>

            {/* Config Specs */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{exam.durationMinutes} Mins</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Passing Score</span>
                <span className="font-extrabold text-emerald-600">{exam.passingScorePercent}%</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Questions</span>
                <span className="font-extrabold text-[#C8102E]">{exam.questionIds.length} Qs ({exam.totalMarks} Marks)</span>
              </div>
            </div>

            {/* Shuffle options indicators */}
            <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center space-x-1">
                <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Shuffle Questions: <strong>{exam.shuffleQuestions ? 'Yes' : 'No'}</strong></span>
              </span>
              <span>•</span>
              <span>Shuffle Options: <strong>{exam.shuffleOptions ? 'Yes' : 'No'}</strong></span>
            </div>

            {/* Workflow Action Buttons */}
            {!readOnly && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">By {exam.instructorName}</div>

                <div className="flex items-center space-x-2">
                  {userRole === 'coordinator' && exam.status === 'pending' && (
                    <button
                      onClick={() => onUpdateExamStatus(exam.id, 'approved')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Approve Exam
                    </button>
                  )}

                  {(userRole === 'coordinator' || userRole === 'instructor') && (exam.status === 'approved' || exam.status === 'pending') && (
                    <button
                      onClick={() => onUpdateExamStatus(exam.id, 'published')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Publish Exam
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteExam(exam.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Build Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#002B49] dark:text-white">
              Configure New Computer Based Test
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Django & React Mid-Term CBT Exam"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Course
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Batch
                  </label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Score Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.passingScorePercent}
                    onChange={(e) => setFormData({ ...formData, passingScorePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Shuffling Options */}
              <div className="flex items-center space-x-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                    className="rounded text-[#002B49]"
                  />
                  <span>Shuffle Questions Order</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shuffleOptions}
                    onChange={(e) => setFormData({ ...formData, shuffleOptions: e.target.checked })}
                    className="rounded text-[#002B49]"
                  />
                  <span>Shuffle Options (A/B/C/D)</span>
                </label>
              </div>

              {/* Select Approved Questions from Question Bank */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Approved Questions for Exam ({formData.selectedQuestionIds.length} Selected)
                </label>

                <div className="space-y-2 max-h-56 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {approvedQuestions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No approved questions in question bank. Please approve questions first.</p>
                  ) : (
                    approvedQuestions.map((q) => {
                      const isSelected = formData.selectedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => handleToggleQuestionSelect(q.id)}
                          className={`p-3 rounded-lg text-xs cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-950 dark:text-blue-100 border border-blue-400 dark:border-blue-700 font-semibold'
                              : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-[10px] uppercase text-[#002B49] dark:text-slate-300 block mb-0.5">
                              {q.topic} • {q.marks} Marks
                            </span>
                            <p className="line-clamp-2">{q.questionText}</p>
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#001d32] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Create & Submit Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
