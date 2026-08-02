import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_ATTEMPTS,
  INITIAL_LOGS,
  INITIAL_SETTINGS
} from './src/data/initialData';
import {
  User,
  Course,
  Batch,
  StudentProfile,
  Question,
  Exam,
  ExamAttempt,
  ActivityLog,
  SystemSettings,
  SystemStats
} from './src/types';

// In-Memory Database Stores (seeded with default data)
let usersStore: User[] = [...INITIAL_USERS];
let coursesStore: Course[] = [...INITIAL_COURSES];
let batchesStore: Batch[] = [...INITIAL_BATCHES];
let studentsStore: StudentProfile[] = [...INITIAL_STUDENTS];
let questionsStore: Question[] = [...INITIAL_QUESTIONS];
let examsStore: Exam[] = [...INITIAL_EXAMS];
let attemptsStore: ExamAttempt[] = [...INITIAL_ATTEMPTS];
let logsStore: ActivityLog[] = [...INITIAL_LOGS];
let settingsStore: SystemSettings = { ...INITIAL_SETTINGS };

const addLog = (userId: string, userName: string, userRole: any, action: string, details: string) => {
  const newLog: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    userName,
    userRole,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  logsStore.unshift(newLog);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API ROUTE: Auth Login
  app.post('/api/auth/login', (req, res) => {
    const { loginType, identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide credentials.' });
    }

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide credentials.' });
    }

    if (loginType === 'student') {
      // Find student by Reg Number or Email
      const student = studentsStore.find(
        (s) => (s.regNumber.trim().toLowerCase() === identifier.trim().toLowerCase() ||
               s.email.trim().toLowerCase() === identifier.trim().toLowerCase()) && s.password==password
      );

      if (!student) {
        return res.status(401).json({ error: 'Invalid Student Registration Number or Password.' });
      }

      const userObj: User = {
        id: student.id,
        name: student.fullName,
        email: student.email,
        role: 'student',
        regNumber: student.regNumber,
        phone: student.phone,
        assignedCourseIds: [student.courseId],
        assignedBatchIds: [student.batchId],
        status: student.status,
        password:"123456",
        createdAt: student.registeredAt
      };

      addLog(userObj.id, userObj.name, 'student', 'USER_LOGIN', `Student logged in with Reg Number ${userObj.regNumber}`);
      return res.json({ user: userObj, token: `jwt_student_${student.id}` });
    } else {
      // Coordinator, Instructor, Registrar login by Email
      const user = usersStore.find(
        (u) => u.email.trim().toLowerCase() === identifier.trim().toLowerCase() && u.password === password
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid Email address or Password.' });
      }
      if(user.role != loginType){
         return res.status(403).json({ error: `Login access denieled to ${loginType} portal. Check your login credentials` });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'Your account has been deactivated. Contact Faculty Coordinator.' });
      }

      addLog(user.id, user.name, user.role, 'USER_LOGIN', `${user.role.toUpperCase()} logged in: ${user.email}`);
      return res.json({ user, token: `jwt_${user.role}_${user.id}` });
    }
  });

  // API ROUTE: Courses
  app.get('/api/courses', (req, res) => {
    res.json(coursesStore);
  });

  app.post('/api/courses', (req, res) => {
    const { code, title, description, durationWeeks } = req.body;
    if (!code || !title) {
      return res.status(400).json({ error: 'Course code and title are required.' });
    }

    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      code,
      title,
      description: description || '',
      durationWeeks: Number(durationWeeks) || 12,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    coursesStore.unshift(newCourse);
    addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'COURSE_CREATED', `Added course ${code}: ${title}`);
    res.status(201).json(newCourse);
  });

  app.put('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const { code, title, description, durationWeeks } = req.body;

    const courseIndex = coursesStore.findIndex((c) => c.id === id);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    coursesStore[courseIndex] = {
      ...coursesStore[courseIndex],
      code: code || coursesStore[courseIndex].code,
      title: title || coursesStore[courseIndex].title,
      description: description !== undefined ? description : coursesStore[courseIndex].description,
      durationWeeks: durationWeeks ? Number(durationWeeks) : coursesStore[courseIndex].durationWeeks
    };

    res.json(coursesStore[courseIndex]);
  });

  app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    coursesStore = coursesStore.filter((c) => c.id !== id);
    res.json({ success: true });
  });

  app.patch('/api/courses/:id/status', (req, res) => {
    const { id } = req.params;
    const course = coursesStore.find((c) => c.id === id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.status = course.status === 'active' ? 'inactive' : 'active';
    res.json(course);
  });

  // API ROUTE: Instructors
  app.get('/api/instructors', (req, res) => {
    const instructors = usersStore.filter((u) => u.role === 'instructor');
    res.json(instructors);
  });

  app.post('/api/instructors', (req, res) => {
    const { name, email, phone, assignedCourseIds, assignedBatchIds } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const newInst: User = {
      id: `usr_inst_${Date.now()}`,
      name,
      email,
      role: 'instructor',
      phone: phone || '',
      assignedCourseIds: assignedCourseIds || [],
      assignedBatchIds: assignedBatchIds || [],
      status: 'active',
      password:"123456",
      createdAt: new Date().toISOString()
    };

    usersStore.unshift(newInst);
    addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'INSTRUCTOR_ADDED', `Added instructor: ${name} (${email})`);
    res.status(201).json(newInst);
  });

  app.put('/api/instructors/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, assignedCourseIds, assignedBatchIds, status } = req.body;

    const idx = usersStore.findIndex((u) => u.id === id && u.role === 'instructor');
    if (idx === -1) return res.status(404).json({ error: 'Instructor not found.' });

    usersStore[idx] = {
      ...usersStore[idx],
      name: name || usersStore[idx].name,
      email: email || usersStore[idx].email,
      phone: phone !== undefined ? phone : usersStore[idx].phone,
      assignedCourseIds: assignedCourseIds || usersStore[idx].assignedCourseIds,
      assignedBatchIds: assignedBatchIds || usersStore[idx].assignedBatchIds,
      status: status || usersStore[idx].status
    };

    res.json(usersStore[idx]);
  });

  app.post('/api/instructors/:id/reset-password', (req, res) => {
    const { id } = req.params;
    const inst = usersStore.find((u) => u.id === id);
    if (!inst) return res.status(404).json({ error: 'Instructor not found.' });
    addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'PASSWORD_RESET', `Reset password for instructor ${inst.name}`);
    res.json({ message: `Password reset successfully for ${inst.name}. Temporary password: hiit${Math.floor(1000 + Math.random() * 9000)}` });
  });

  app.delete('/api/instructors/:id', (req, res) => {
    const { id } = req.params;
    usersStore = usersStore.filter((u) => u.id !== id);
    res.json({ success: true });
  });

  // API ROUTE: Batches
  app.get('/api/batches', (req, res) => {
    // Populate studentCount
    const batchesWithCount = batchesStore.map((b) => ({
      ...b,
      studentCount: studentsStore.filter((s) => s.batchId === b.id).length
    }));
    res.json(batchesWithCount);
  });

  app.post('/api/batches', (req, res) => {
    const { name, courseId, instructorId, startDate, endDate } = req.body;
    if (!name || !courseId || !instructorId) {
      return res.status(400).json({ error: 'Batch Name, Course, and Instructor are required.' });
    }

    const course = coursesStore.find((c) => c.id === courseId);
    const instructor = usersStore.find((u) => u.id === instructorId);

    const newBatch: Batch = {
      id: `batch_${Date.now()}`,
      name,
      courseId,
      courseTitle: course ? course.title : 'General Course',
      instructorId,
      instructorName: instructor ? instructor.name : 'Unassigned',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || '',
      status: 'active',
      studentCount: 0
    };

    batchesStore.unshift(newBatch);
    addLog(instructorId, instructor?.name || 'System', 'instructor', 'BATCH_CREATED', `Created batch ${name}`);
    res.status(201).json(newBatch);
  });

  app.put('/api/batches/:id', (req, res) => {
    const { id } = req.params;
    const { name, courseId, instructorId, startDate, endDate, status } = req.body;

    const idx = batchesStore.findIndex((b) => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Batch not found.' });

    const course = courseId ? coursesStore.find((c) => c.id === courseId) : null;
    const instructor = instructorId ? usersStore.find((u) => u.id === instructorId) : null;

    batchesStore[idx] = {
      ...batchesStore[idx],
      name: name || batchesStore[idx].name,
      courseId: courseId || batchesStore[idx].courseId,
      courseTitle: course ? course.title : batchesStore[idx].courseTitle,
      instructorId: instructorId || batchesStore[idx].instructorId,
      instructorName: instructor ? instructor.name : batchesStore[idx].instructorName,
      startDate: startDate || batchesStore[idx].startDate,
      endDate: endDate || batchesStore[idx].endDate,
      status: status || batchesStore[idx].status
    };

    res.json(batchesStore[idx]);
  });

  app.patch('/api/batches/:id/close', (req, res) => {
    const { id } = req.params;
    const batch = batchesStore.find((b) => b.id === id);
    if (!batch) return res.status(404).json({ error: 'Batch not found.' });
    batch.status = batch.status === 'active' ? 'closed' : 'active';
    res.json(batch);
  });

  app.delete('/api/batches/:id', (req, res) => {
    const { id } = req.params;
    batchesStore = batchesStore.filter((b) => b.id !== id);
    res.json({ success: true });
  });

  // API ROUTE: Students
  app.get('/api/students', (req, res) => {
    const { batchId, courseId, query, instructorId } = req.query;
    let list = [...studentsStore];

    if (instructorId) {
      const inst = usersStore.find((u) => u.id === instructorId);
      const instCourseIds = new Set([
        ...(inst?.assignedCourseIds || []),
        ...batchesStore.filter((b) => b.instructorId === instructorId).map((b) => b.courseId)
      ]);
      const instBatchIds = new Set([
        ...(inst?.assignedBatchIds || []),
        ...batchesStore.filter((b) => b.instructorId === instructorId).map((b) => b.id)
      ]);

      list = list.filter((s) => instCourseIds.has(s.courseId) || instBatchIds.has(s.batchId));
    }

    if (batchId) list = list.filter((s) => s.batchId === batchId);
    if (courseId) list = list.filter((s) => s.courseId === courseId);
    if (query) {
      const q = String(query).toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.regNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }

    res.json(list);
  });

  app.post('/api/students', (req, res) => {
    const { fullName, regNumber, email, phone, courseId, batchId, password } = req.body;
    if (!fullName || !regNumber || !courseId || !batchId) {
      return res.status(400).json({ error: 'Full Name, Registration Number, Course, and Batch are required.' });
    }

    // Check Reg Number uniqueness
    if (studentsStore.some((s) => s.regNumber.trim().toLowerCase() === regNumber.trim().toLowerCase())) {
      return res.status(400).json({ error: `Registration number ${regNumber} already exists!` });
    }

    const course = coursesStore.find((c) => c.id === courseId);
    const batch = batchesStore.find((b) => b.id === batchId);

    const newStudent: StudentProfile = {
      id: `usr_std_${Date.now()}`,
      fullName,
      regNumber,
      email: email || `${regNumber.replace(/[^a-zA-Z0-0]/g, '').toLowerCase()}@student.hiit.ng`,
      phone: phone || '',
      courseId,
      courseTitle: course ? course.title : '',
      batchId,
      batchName: batch ? batch.name : '',
      status: 'active',
      password:password,
      registeredAt: new Date().toISOString()
    };

    studentsStore.unshift(newStudent);
    addLog('usr_inst_1', 'Instructor', 'instructor', 'STUDENT_ADDED', `Enrolled student ${fullName} (${regNumber})`);
    res.status(201).json(newStudent);
  });

  app.post('/api/students/import', (req, res) => {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Students array required.' });
    }

    let addedCount = 0;
    students.forEach((s) => {
      if (s.fullName && s.regNumber) {
        if (!studentsStore.some((ex) => ex.regNumber.trim().toLowerCase() === s.regNumber.trim().toLowerCase())) {
          const course = coursesStore.find((c) => c.id === s.courseId) || coursesStore[0];
          const batch = batchesStore.find((b) => b.id === s.batchId) || batchesStore[0];

          studentsStore.unshift({
            id: `usr_std_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            fullName: s.fullName,
            regNumber: s.regNumber,
            email: s.email || `${s.regNumber.toLowerCase()}@student.hiit.ng`,
            phone: s.phone || '',
            courseId: course.id,
            courseTitle: course.title,
            batchId: batch.id,
            batchName: batch.name,
            status: 'active',
            password:s.password,
            registeredAt: new Date().toISOString()
          });
          addedCount++;
        }
      }
    });

    addLog('usr_inst_1', 'Instructor', 'instructor', 'BULK_STUDENTS_IMPORTED', `Imported ${addedCount} student records`);
    res.json({ message: `Successfully imported ${addedCount} students.`, count: addedCount });
  });

  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    studentsStore = studentsStore.filter((s) => s.id !== id);
    res.json({ success: true });
  });

  // API ROUTE: Question Bank
  app.get('/api/questions', (req, res) => {
    const { courseId, status, instructorId } = req.query;
    let list = [...questionsStore];

    if (courseId) list = list.filter((q) => q.courseId === courseId);
    if (status) list = list.filter((q) => q.status === status);
    if (instructorId) list = list.filter((q) => q.instructorId === instructorId);

    res.json(list);
  });

  app.post('/api/questions', (req, res) => {
    const {
      courseId,
      instructorId,
      instructorName,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      marks,
      difficulty,
      topic
    } = req.body;

    if (!courseId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({ error: 'Question text, all 4 options, and correct answer are required.' });
    }

    const course = coursesStore.find((c) => c.id === courseId);

    const newQ: Question = {
      id: `q_${Date.now()}`,
      courseId,
      courseTitle: course ? course.title : 'General Course',
      instructorId: instructorId || 'usr_inst_1',
      instructorName: instructorName || 'Instructor',
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      marks: Number(marks) || 5,
      difficulty: difficulty || 'medium',
      topic: topic || 'General',
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    questionsStore.unshift(newQ);
    res.status(201).json(newQ);
  });

  app.post('/api/questions/import', (req, res) => {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'Questions array required.' });

    let addedCount = 0;
    questions.forEach((q) => {
      if (q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && q.correctAnswer) {
        const course = coursesStore.find((c) => c.id === q.courseId) || coursesStore[0];
        questionsStore.unshift({
          id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          courseId: course.id,
          courseTitle: course.title,
          instructorId: q.instructorId || 'usr_inst_1',
          instructorName: q.instructorName || 'Instructor',
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer.toUpperCase() as any,
          marks: Number(q.marks) || 5,
          difficulty: q.difficulty || 'medium',
          topic: q.topic || 'Imported Topic',
          status: 'draft',
          createdAt: new Date().toISOString()
        });
        addedCount++;
      }
    });

    res.json({ message: `Successfully imported ${addedCount} questions into Question Bank.`, count: addedCount });
  });

  app.put('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const idx = questionsStore.findIndex((q) => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Question not found.' });

    questionsStore[idx] = {
      ...questionsStore[idx],
      ...req.body,
      // Reset status to draft if edited by instructor after rejection or draft
      status: req.body.status || 'draft'
    };

    res.json(questionsStore[idx]);
  });

  app.post('/api/questions/:id/submit', (req, res) => {
    const { id } = req.params;
    const q = questionsStore.find((item) => item.id === id);
    if (!q) return res.status(404).json({ error: 'Question not found.' });
    q.status = 'pending';
    addLog(q.instructorId, q.instructorName, 'instructor', 'QUESTION_SUBMITTED', `Submitted question "${q.questionText.slice(0, 30)}..." for approval.`);
    res.json(q);
  });

  app.post('/api/questions/:id/review', (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject' | 'modification'
    const q = questionsStore.find((item) => item.id === id);
    if (!q) return res.status(404).json({ error: 'Question not found.' });

    if (action === 'approve') {
      q.status = 'approved';
      addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'QUESTION_APPROVED', `Approved question "${q.questionText.slice(0, 30)}..."`);
    } else if (action === 'reject') {
      q.status = 'rejected';
      q.rejectionReason = reason || 'Does not meet standards.';
      addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'QUESTION_REJECTED', `Rejected question: ${reason}`);
    } else if (action === 'modification') {
      q.status = 'modification_requested';
      q.rejectionReason = reason || 'Please revise question wording or options.';
    }

    res.json(q);
  });

  app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    questionsStore = questionsStore.filter((q) => q.id !== id);
    res.json({ success: true });
  });

  // API ROUTE: Exams
  app.get('/api/exams', (req, res) => {
    const { batchId, courseId, status } = req.query;
    let list = [...examsStore];

    if (batchId) list = list.filter((e) => e.batchId === batchId);
    if (courseId) list = list.filter((e) => e.courseId === courseId);
    if (status) list = list.filter((e) => e.status === status);

    res.json(list);
  });

  app.post('/api/exams', (req, res) => {
    const {
      title,
      courseId,
      batchId,
      instructorId,
      instructorName,
      durationMinutes,
      passingScorePercent,
      instructions,
      questionIds,
      shuffleQuestions,
      shuffleOptions
    } = req.body;

    if (!title || !courseId || !batchId || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: 'Title, Course, Batch, and at least 1 Question are required.' });
    }

    const course = coursesStore.find((c) => c.id === courseId);
    const batch = batchesStore.find((b) => b.id === batchId);

    // Calculate total marks from selected questions
    const selectedQuestions = questionsStore.filter((q) => questionIds.includes(q.id));
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 5), 0);

    const newExam: Exam = {
      id: `ex_${Date.now()}`,
      title,
      courseId,
      courseTitle: course ? course.title : '',
      batchId,
      batchName: batch ? batch.name : '',
      instructorId: instructorId || 'usr_inst_1',
      instructorName: instructorName || 'Dr. Emmanuel Okafor',
      durationMinutes: Number(durationMinutes) || 15,
      passingScorePercent: Number(passingScorePercent) || 60,
      instructions: instructions || 'Read all questions carefully before submitting.',
      questionIds,
      totalMarks,
      shuffleQuestions: Boolean(shuffleQuestions),
      shuffleOptions: Boolean(shuffleOptions),
      status: 'pending', // Requires approval or review
      createdAt: new Date().toISOString()
    };

    examsStore.unshift(newExam);
    addLog(newExam.instructorId, newExam.instructorName, 'instructor', 'EXAM_CREATED', `Created CBT Exam: "${title}" (Pending Approval)`);
    res.status(201).json(newExam);
  });

  app.put('/api/exams/:id', (req, res) => {
    const { id } = req.params;
    const idx = examsStore.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Exam not found.' });

    const questionIds = req.body.questionIds || examsStore[idx].questionIds;
    const selectedQuestions = questionsStore.filter((q) => questionIds.includes(q.id));
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 5), 0);

    examsStore[idx] = {
      ...examsStore[idx],
      ...req.body,
      totalMarks
    };

    res.json(examsStore[idx]);
  });

  app.post('/api/exams/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const exam = examsStore.find((e) => e.id === id);
    if (!exam) return res.status(404).json({ error: 'Exam not found.' });

    exam.status = status;
    addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'EXAM_STATUS_UPDATED', `Exam "${exam.title}" status changed to ${status.toUpperCase()}`);
    res.json(exam);
  });

  app.delete('/api/exams/:id', (req, res) => {
    const { id } = req.params;
    examsStore = examsStore.filter((e) => e.id !== id);
    res.json({ success: true });
  });

  // API ROUTE: Exam Attempts & CBT Auto-Save & Auto-Grading Engine
  app.get('/api/attempts', (req, res) => {
    const { studentId, examId } = req.query;
    let list = [...attemptsStore];

    if (studentId) list = list.filter((a) => a.studentId === studentId);
    if (examId) list = list.filter((a) => a.examId === examId);

    res.json(list);
  });

  app.post('/api/attempts/start', (req, res) => {
    const { examId, studentId } = req.body;
    if (!examId || !studentId) return res.status(400).json({ error: 'examId and studentId required.' });

    const exam = examsStore.find((e) => e.id === examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found.' });

    const student = studentsStore.find((s) => s.id === studentId);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    // Check if attempt already exists in progress
    let existingAttempt = attemptsStore.find(
      (a) => a.examId === examId && a.studentId === studentId && a.status === 'in_progress'
    );

    if (existingAttempt) {
      return res.json(existingAttempt);
    }

    // Create new in_progress attempt
    const newAttempt: ExamAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      examId,
      examTitle: exam.title,
      studentId: student.id,
      studentRegNumber: student.regNumber,
      studentName: student.fullName,
      batchId: student.batchId,
      startTime: new Date().toISOString(),
      timeSpentSeconds: 0,
      status: 'in_progress',
      answers: {},
      flaggedQuestions: []
    };

    attemptsStore.unshift(newAttempt);
    addLog(student.id, student.fullName, 'student', 'EXAM_STARTED', `Started CBT exam "${exam.title}"`);
    res.status(201).json(newAttempt);
  });

  app.post('/api/attempts/:id/save', (req, res) => {
    const { id } = req.params;
    const { answers, timeSpentSeconds, flaggedQuestions } = req.body;

    const attempt = attemptsStore.find((a) => a.id === id);
    if (!attempt) return res.status(404).json({ error: 'Attempt session not found.' });

    if (attempt.status === 'submitted') {
      return res.status(400).json({ error: 'Exam attempt has already been submitted.' });
    }

    if (answers) attempt.answers = answers;
    if (timeSpentSeconds !== undefined) attempt.timeSpentSeconds = Number(timeSpentSeconds);
    if (flaggedQuestions) attempt.flaggedQuestions = flaggedQuestions;

    res.json({ success: true, savedAt: new Date().toISOString() });
  });

  app.post('/api/attempts/:id/submit', (req, res) => {
    const { id } = req.params;
    const { answers, timeSpentSeconds } = req.body;

    const attempt = attemptsStore.find((a) => a.id === id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

    const exam = examsStore.find((e) => e.id === attempt.examId);
    if (!exam) return res.status(404).json({ error: 'Associated exam not found.' });

    const finalAnswers = answers || attempt.answers;
    const finalTimeSpent = timeSpentSeconds !== undefined ? Number(timeSpentSeconds) : attempt.timeSpentSeconds;

    // AUTO MARKING ENGINE logic
    const examQuestions = questionsStore.filter((q) => exam.questionIds.includes(q.id));
    let scoreObtained = 0;
    let totalPossible = 0;

    examQuestions.forEach((q) => {
      const qMarks = q.marks || 5;
      totalPossible += qMarks;

      const studentAns = finalAnswers[q.id];
      if (studentAns && studentAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
        scoreObtained += qMarks;
      }
    });

    const percentage = totalPossible > 0 ? (scoreObtained / totalPossible) * 100 : 0;
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';

    const isPassed = percentage >= exam.passingScorePercent;

    attempt.answers = finalAnswers;
    attempt.timeSpentSeconds = finalTimeSpent;
    attempt.endTime = new Date().toISOString();
    attempt.status = 'submitted';
    attempt.scoreObtained = scoreObtained;
    attempt.totalMarksPossible = totalPossible;
    attempt.percentage = Math.round(percentage * 10) / 10;
    attempt.grade = grade;
    attempt.isPassed = isPassed;
    attempt.gradedAt = new Date().toISOString();

    addLog(attempt.studentId, attempt.studentName, 'student', 'EXAM_SUBMITTED', `Completed CBT exam "${exam.title}". Score: ${attempt.percentage}% (${isPassed ? 'Passed' : 'Failed'}).`);

    res.json(attempt);
  });

  // API ROUTE: Analytics Stats
  app.get('/api/stats', (req, res) => {
    const submitted = attemptsStore.filter((a) => a.status === 'submitted');
    const passedCount = submitted.filter((a) => a.isPassed).length;
    const failedCount = submitted.filter((a) => !a.isPassed).length;
    const totalSubmitted = submitted.length;

    const passRatePercent = totalSubmitted > 0 ? Math.round((passedCount / totalSubmitted) * 100) : 0;
    const failRatePercent = totalSubmitted > 0 ? Math.round((failedCount / totalSubmitted) * 100) : 0;

    const stats: SystemStats = {
      totalCourses: coursesStore.filter((c) => c.status === 'active').length,
      totalStudents: studentsStore.length,
      totalInstructors: usersStore.filter((u) => u.role === 'instructor' && u.status === 'active').length,
      totalBatches: batchesStore.length,
      pendingExams: examsStore.filter((e) => e.status === 'pending').length,
      approvedExams: examsStore.filter((e) => e.status === 'approved').length,
      completedExams: examsStore.filter((e) => e.status === 'published' || e.status === 'completed').length,
      passRatePercent,
      failRatePercent,
      totalQuestions: questionsStore.length
    };

    res.json(stats);
  });

  // API ROUTE: Activity Logs
  app.get('/api/logs', (req, res) => {
    res.json(logsStore.slice(0, 50));
  });

  // API ROUTE: Settings
  app.get('/api/settings', (req, res) => {
    res.json(settingsStore);
  });

  app.put('/api/settings', (req, res) => {
    settingsStore = { ...settingsStore, ...req.body };
    addLog('usr_coord_1', 'Faculty Coordinator', 'coordinator', 'SETTINGS_UPDATED', `Updated system result visibility settings.`);
    res.json(settingsStore);
  });

  // API ROUTE: Reset Seed Data
  app.post('/api/seed/reset', (req, res) => {
    usersStore = [...INITIAL_USERS];
    coursesStore = [...INITIAL_COURSES];
    batchesStore = [...INITIAL_BATCHES];
    studentsStore = [...INITIAL_STUDENTS];
    questionsStore = [...INITIAL_QUESTIONS];
    examsStore = [...INITIAL_EXAMS];
    attemptsStore = [...INITIAL_ATTEMPTS];
    logsStore = [...INITIAL_LOGS];
    settingsStore = { ...INITIAL_SETTINGS };

    res.json({ message: 'System database successfully reset to factory demo state!' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HiiT CBT Management System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
