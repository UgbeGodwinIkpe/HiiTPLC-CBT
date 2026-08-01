<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://drive.google.com/file/d/1mpGRSjMt9b4mP474I8bOe2wcsW4DXYh1/view?usp=sharing" />
</div>

# HiiT CBT Management System

A modern, web-based Computer-Based Testing (CBT) and Academic Assessment Management System developed for HiiT PLC Abuja Training Centre. The platform streamlines the management of courses, instructors, students, examinations, and academic performance through a centralized, role-based application.

The system is designed to provide a secure, scalable, and user-friendly environment for conducting online examinations while giving administrators and instructors complete control over the assessment lifecycle.

## Features

**Faculty Coordinator:** 

1. Secure login
2. Dashboard with analytics
3. Manage courses
4. Add, edit, and remove instructors
5. View all class batches
6. Review and approve examination questions
7. View overall student performance
8. Download results (PDF & Excel)
9. Monitor examination statistics

**Instructor:**
1. Secure login
2. Create and manage class batches
3. Register students into batches
4. Create examination questions
5. Build examinations
6. Submit examinations for approval
7. View students' performance
8. Download results
9. Manage assigned courses
10. Registrar
11. Secure login
12. View registered students
13. View class batches
14. View examination questions
15. View examination results
16. Download student performance reports
### Note: The Registrar has read-only access and cannot modify academic records.

**Student:**
1. Login using Registration Number
2. View assigned examinations
3. Take online CBT examinations
4. Timer-enabled examinations
5. Automatic grading
6. View examination results
7. Track completed examinations

## User Roles
Role	| Responsibilities
Faculty Coordinator |	Course management, instructor management, exam approval, reporting
Instructor | Batch management, student management, examination creation
Registrar |	Student records and examination monitoring
Student	| Take examinations and view results

## Core Features
- Role-Based Access Control (RBAC)
- Interactive Dashboard
- CBT Examination Engine
- Question Bank Management
- Batch Management
- Course Management
- Student Management
- Instructor Management
- Automatic Grading
- Performance Analytics
- PDF Report Generation
- Excel Report Export
- Responsive User Interface
- Dark & Light Theme Support


## Technology Stack
### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Hooks
### Backend
- Node.js
- Express.js
- TypeScript
### Libraries
- React Router
- jsPDF
- XLSX
- Recharts
- Lucide React
- Google GenAI SDK

## Project Structure
hiit-cbt-management-system/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── data/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md

## License

This project is licensed under the MIT License.

## Author

_Godwin Ugbe_
_CSE_