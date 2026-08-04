import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  Filter,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { StudentProfile, Course, Batch } from '../types';
import { exportToExcel, exportToCSV, exportStudentsPDF } from '../utils/exportUtils';
import { randomInt } from 'crypto';

interface StudentManagementProps {
  students: StudentProfile[];
  courses: Course[];
  batches: Batch[];
  onAddStudent: (data: any) => void;
  onImportStudents: (studentList: any[]) => void;
  onRemoveStudent: (id: string) => void;
  readOnly?: boolean;
  isInstructorView?: boolean;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  courses,
  batches,
  onAddStudent,
  onImportStudents,
  onRemoveStudent,
  readOnly = false,
  isInstructorView = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    regNumber: `HIIT/2026/00${students.length + 1}`,
    email: '',
    phone: '',
    password:'',
    courseId: courses[0]?.id || '',
    batchId: batches[0]?.id || ''
  });

  const [importJsonText, setImportJsonText] = useState('');

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    const matchesCourse = !selectedCourseFilter || s.courseId === selectedCourseFilter;
    const matchesBatch = !selectedBatchFilter || s.batchId === selectedBatchFilter;

    return matchesSearch && matchesCourse && matchesBatch;
  });

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      regNumber: ``,
      email: '',
      phone: '',
      password:'',
      courseId: courses[0]?.id || '',
      batchId: batches[0]?.id || ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.regNumber) return;
    onAddStudent(formData);
    setIsAddModalOpen(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        onImportStudents(parsed);
        setIsImportModalOpen(false);
        setImportJsonText('');
      } else {
        alert('Please paste a valid JSON array of students.');
      }
    } catch (err) {
      alert('Invalid JSON format. Please ensure proper CSV/Excel JSON data.');
    }
  };

  const handleSampleImportInsert = () => {
    const sample = [
      {
        fullName: 'Kemi Adebayo',
        regNumber: 'HIIT/2026/010',
        email: 'kemi.a@gmail.com',
        phone: '+234 802 111 9988',
        password:'123456',
        courseId: courses[0]?.id,
        batchId: batches[0]?.id
      },
      {
        fullName: 'Usman Garba',
        regNumber: 'HIIT/2026/011',
        email: 'usman.g@yahoo.com',
        phone: '+234 803 222 8877',
        password:'123456',
        courseId: courses[0]?.id,
        batchId: batches[0]?.id
      }
    ];
    setImportJsonText(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#002B49] dark:text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>Student Directory & Enrolment</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register students, manage CBT credentials, and export rosters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Buttons */}
          <button
            onClick={() => exportStudentsPDF(filteredStudents)}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
            title="Download PDF Roster"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={() => exportToExcel(filteredStudents, 'HiiT_Student_List')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
            title="Download Excel Roster"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {!readOnly && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Upload className="w-4 h-4 text-amber-600" />
                <span>Import Excel/CSV</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#001f35] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 text-[#C8102E]" />
                <span>Add Student</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isInstructorView && (
        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-950 dark:text-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Course Access Control Active:</strong> Showing students enrolled in your assigned courses and batches ({filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}).
            </span>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, Reg Number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Course */}
        <div>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Batch */}
        <div>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Student Name</th>
                <th className="p-4">Reg Number</th>
                <th className="p-4">Email & Phone</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Batch</th>
                {!readOnly && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black">
                        {std.fullName.charAt(0)}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{std.fullName}</div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-[#002B49] dark:text-red-400">
                      {std.regNumber}
                    </span>
                  </td>

                  <td className="p-4">
                    <div>{std.email}</div>
                    <div className="text-[10px] text-slate-400">{std.phone}</div>
                  </td>

                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    {std.courseTitle}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {std.batchName}
                    </span>
                  </td>

                  {!readOnly && (
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onRemoveStudent(std.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                        title="Remove Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#002B49] dark:text-white">
              Register New Student
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adewale"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password} placeholder="Set a  student login password"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Batch
                  </label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#001d32] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel/CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#002B49] dark:text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <span>Bulk Import Student Roster</span>
              </h3>
              <button
                type="button"
                onClick={handleSampleImportInsert}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Insert Sample Data
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste JSON or Excel export data array containing student full names and registration numbers:
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={8}
                required
                placeholder='[{"fullName": "John Doe", "regNumber": "HIIT/2026/010", "email": "john@hiit.ng"}]'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Import Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
