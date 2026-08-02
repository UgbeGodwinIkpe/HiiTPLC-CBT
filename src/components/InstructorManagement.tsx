import React, { useState } from 'react';
import { Users, Plus, KeyRound, Edit2, Trash2, CheckCircle, Power, BookOpen, FolderGit2 } from 'lucide-react';
import { User, Course, Batch } from '../types';

interface InstructorManagementProps {
  instructors: User[];
  courses: Course[];
  batches: Batch[];
  onAddInstructor: (data: any) => void;
  onEditInstructor: (id: string, data: any) => void;
  onResetPassword: (id: string) => void;
  onDeleteInstructor: (id: string) => void;
  readOnly?: boolean;
}

export const InstructorManagement: React.FC<InstructorManagementProps> = ({
  instructors,
  courses,
  batches,
  onAddInstructor,
  onEditInstructor,
  onResetPassword,
  onDeleteInstructor,
  readOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password:'',
    assignedCourseIds: [] as string[],
    assignedBatchIds: [] as string[]
  });

  const handleOpenAdd = () => {
    setEditingInstructor(null);
    setFormData({ name: '', email: '', phone: '', assignedCourseIds: [], assignedBatchIds: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: User) => {
    setEditingInstructor(inst);
    setFormData({
      name: inst.name,
      email: inst.email,
      phone: inst.phone || '',
      password:inst.password || '',
      assignedCourseIds: inst.assignedCourseIds || [],
      assignedBatchIds: inst.assignedBatchIds || []
    });
    setIsModalOpen(true);
  };

  const handleToggleCourseSelect = (courseId: string) => {
    const exists = formData.assignedCourseIds.includes(courseId);
    if (exists) {
      setFormData({
        ...formData,
        assignedCourseIds: formData.assignedCourseIds.filter((id) => id !== courseId)
      });
    } else {
      setFormData({
        ...formData,
        assignedCourseIds: [...formData.assignedCourseIds, courseId]
      });
    }
  };

  const handleToggleBatchSelect = (batchId: string) => {
    const exists = formData.assignedBatchIds.includes(batchId);
    if (exists) {
      setFormData({
        ...formData,
        assignedBatchIds: formData.assignedBatchIds.filter((id) => id !== batchId)
      });
    } else {
      setFormData({
        ...formData,
        assignedBatchIds: [...formData.assignedBatchIds, batchId]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    if (editingInstructor) {
      onEditInstructor(editingInstructor.id, formData);
    } else {
      onAddInstructor(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#002B49] dark:text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Instructor Directory & Assignment</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage academic instructors, course assignments, and batch responsibilities
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#002B49] hover:bg-[#001f35] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C8102E]" />
            <span>Register Instructor</span>
          </button>
        )}
      </div>

      {/* Instructors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Instructor Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Assigned Courses</th>
                <th className="p-4">Assigned Batches</th>
                <th className="p-4">Status</th>
                {!readOnly && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {instructors.map((inst) => {
                const assignedCoursesList = courses.filter((c) => inst.assignedCourseIds?.includes(c.id));
                const assignedBatchesList = batches.filter((b) => inst.assignedBatchIds?.includes(b.id));

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-black">
                          {inst.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{inst.name}</div>
                          <div className="text-[10px] text-slate-400">ID: {inst.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>{inst.email}</div>
                      <div className="text-[11px] text-slate-400">{inst.phone || 'No Phone'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedCoursesList.length > 0 ? (
                          assignedCoursesList.map((c) => (
                            <span key={c.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {c.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedBatchesList.length > 0 ? (
                          assignedBatchesList.map((b) => (
                            <span key={b.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              {b.name.split(' ')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inst.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>

                    {!readOnly && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onResetPassword(inst.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(inst)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                            title="Edit / Assign"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteInstructor(inst.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                            title="Delete Instructor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register / Edit Instructor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#002B49] dark:text-white">
              {editingInstructor ? 'Edit Instructor & Course Assignments' : 'Register New Instructor'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="password" placeholder="Set instructor login password"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Assign Courses */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Courses
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {courses.map((c) => {
                    const isSelected = formData.assignedCourseIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleCourseSelect(c.id)}
                        className={`p-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{c.code} — {c.title}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assign Batches */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Batches
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {batches.map((b) => {
                    const isSelected = formData.assignedBatchIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => handleToggleBatchSelect(b.id)}
                        className={`p-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{b.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      </div>
                    );
                  })}
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
                  {editingInstructor ? 'Save Changes' : 'Register Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
