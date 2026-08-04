import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { StudentProfile, ExamAttempt, Course, Batch, SystemStats } from '../types';

export const exportToExcel = (data: any[], filename: string, sheetName = 'Data') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportStudentsPDF = (students: StudentProfile[]) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(0, 43, 73); // HiiT Navy #002B49
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HiiT PLC - ABUJA TRAINING CENTRE', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL STUDENT ROSTER REPORT', 14, 20);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()} | Total Students: ${students.length}`, 14, 35);

  const tableData = students.map((s, idx) => [
    idx + 1,
    s.fullName,
    s.regNumber,
    s.email,
    s.phone,
    s.courseTitle,
    s.batchName,
    s.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Full Name', 'Reg Number', 'Email', 'Phone', 'Course', 'Batch', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [200, 16, 46], textColor: [255, 255, 255], fontStyle: 'bold' }, // HiiT Red
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  doc.save(`HiiT_Abuja_Student_Roster_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportExamResultsPDF = (attempts: ExamAttempt[], examTitle = 'Exam Results') => {
  const doc = new jsPDF();

  doc.setFillColor(0, 43, 73); // HiiT Navy
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('HiiT PLC - ABUJA TRAINING CENTRE', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`CBT ASSESSMENT RESULTS REPORT: ${examTitle.toUpperCase()}`, 14, 20);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()} | Submissions: ${attempts.length}`, 14, 35);

  const tableData = attempts.map((att, idx) => [
    idx + 1,
    att.studentName,
    att.studentRegNumber,
    att.scoreObtained !== undefined ? `${att.scoreObtained}/${att.totalMarksPossible}` : 'N/A',
    att.percentage !== undefined ? `${att.percentage.toFixed(1)}%` : 'N/A',
    att.grade || 'N/A',
    att.isPassed ? 'PASS' : 'FAIL',
    att.timeSpentSeconds ? `${Math.floor(att.timeSpentSeconds / 60)}m ${att.timeSpentSeconds % 60}s` : 'N/A'
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Student Name', 'Reg No', 'Score', 'Percentage', 'Grade', 'Result', 'Time Used']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 43, 73], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'PASS') {
          data.cell.styles.textColor = [16, 185, 129]; // green
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'FAIL') {
          data.cell.styles.textColor = [239, 68, 68]; // red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  doc.save(`HiiT_CBT_Results_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportSingleStudentResultPDF = (attempt: ExamAttempt, courseTitle: string, batchName: string) => {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(0, 43, 73);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HiiT PLC', 14, 14);
  doc.setFontSize(11);
  doc.text('Abuja Training Centre - CBT Official Statement of Result', 14, 23);

  // Student details box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 48, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student Name: ${attempt.studentName}`, 20, 48);
  doc.text(`Reg Number: ${attempt.studentRegNumber}`, 20, 56);
  doc.text(`Course: ${courseTitle}`, 20, 64);
  doc.text(`Batch: ${batchName}`, 20, 72);
  doc.text(`Exam Title: ${attempt.examTitle}`, 20, 80);

  // Score summary card
  const isPass = attempt.isPassed;
  doc.setFillColor(isPass ? 236 : 254, isPass ? 253 : 242, isPass ? 245 : 242);
  doc.setDrawColor(isPass ? 16 : 239, isPass ? 185 : 68, isPass ? 129 : 68);
  doc.roundedRect(14, 92, 182, 40, 3, 3, 'FD');

  doc.setTextColor(isPass ? 6 : 153, isPass ? 95 : 27, isPass ? 70 : 27);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`FINAL RESULT: ${isPass ? 'PASSED' : 'FAILED'}`, 20, 106);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Score Obtained: ${attempt.scoreObtained} / ${attempt.totalMarksPossible}`, 20, 116);
  doc.text(`Percentage: ${attempt.percentage?.toFixed(1)}% | Grade: ${attempt.grade}`, 20, 124);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Attempt ID: ${attempt.id} | Date Submitted: ${new Date(attempt.gradedAt || attempt.startTime).toLocaleString()}`, 14, 145);
  doc.text(`Center Location: Plot 1083 Ahmadu Bello Way, Garki II, Abuja`, 14, 152);
  doc.text(`This is a computer-generated official result statement from HiiT Assessment Engine.`, 14, 159);

  doc.save(`Result_${attempt.studentRegNumber.replace(/\//g, '_')}_${attempt.examId}.pdf`);
};

export const exportAttendancePDF = (sessions: any[], title = 'Class Attendance Report') => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(0, 43, 73); // HiiT Navy #002B49
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HiiT PLC - ABUJA TRAINING CENTRE', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`OFFICIAL CLASS ATTENDANCE REPORT: ${title.toUpperCase()}`, 14, 20);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()} | Total Sessions Recorded: ${sessions.length}`, 14, 35);

  const tableData = sessions.map((s, idx) => {
    const presentCount = s.records ? s.records.filter((r: any) => r.status === 'present' || r.status === 'late').length : 0;
    const totalCount = s.records ? s.records.length : 0;
    const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return [
      idx + 1,
      s.date,
      s.courseCode || s.courseTitle,
      s.batchName,
      s.topic,
      s.instructorName,
      `${presentCount}/${totalCount} (${pct}%)`
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Date', 'Course', 'Batch', 'Session Topic', 'Instructor', 'Attendance Rate']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 43, 73], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  doc.save(`HiiT_Class_Attendance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

