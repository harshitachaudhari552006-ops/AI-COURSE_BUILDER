# AI Course Builder – Project Documentation

## 1. Problem Statement

**AI-Based Course Builder System for Saraswati College of Engineering**

- **Goal:** An AI-powered learning platform that combines **official teacher notes** with **AI-generated** extra explanations, numericals, previous year papers, and predicted questions for exam-oriented learning.
- **Users:** Engineering students (login with Student ID + OTP).
- **Flow:** Login → Choose Semester → Choose Subject → Choose Module → View official materials + search by topic → Get AI extra notes, numericals, exam points, YouTube links, and predicted questions; access previous year question papers.

**Functional requirements:**

- OTP-based secure student authentication (email/mobile).
- Semester-wise subject and module navigation.
- Faculty-uploaded official study materials (PDF/PPT/Text).
- AI-powered extra explanations and numericals.
- Previous year question paper management.
- AI-based exam question prediction; topic-wise questions when a topic is entered.

**Tech stack:** Node.js (backend), React (frontend), MongoDB (database), optional OpenAI/Gemini for AI, Nodemailer/Email for OTP.

---

## 2. Why the “Request failed” Error Happened (and how it’s fixed)

- **Cause:** The frontend calls the backend at `http://localhost:5000`. If the backend is not running (or wrong port), the request fails with a **network error**. The app was only showing a generic **“Request failed”** message.
- **Fix applied:** In `frontend/src/api.js`, when the error is a network error (`ERR_NETWORK` or `Network Error`), the app now shows:  
  **“Cannot connect to server. Start the backend: cd backend && npm run dev”**  
  so you know to start the backend.

**What you must do:** Always run the **backend** in one terminal and the **frontend** in another before using the app. See [HOW_TO_RUN.md](HOW_TO_RUN.md) for exact steps.

---

## 3. How to Run the Whole Application in the Terminal

Summary; full steps are in **HOW_TO_RUN.md**.

1. **MongoDB** must be running (e.g. `net start MongoDB` on Windows).
2. **Terminal 1 – Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Wait until you see: `AI Course Builder API listening on http://localhost:5000` and `MongoDB Connected`.
3. **Terminal 2 – Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Wait until you see: `Local: http://localhost:5173/`.
4. **Browser:** Open **http://localhost:5173**.
5. **First time only – seed data:** If the home page has no semesters, run once:
   ```bash
   cd backend
   npm run seed
   ```
   Then refresh the browser.
6. **Login:** Student ID e.g. `STU001`, any email, click “Request OTP”, then enter OTP **123456** and “Verify & Login”.

---

## 4. Project Structure and What Each Part Does

High-level:

- **backend/** – Node.js API server (auth, semesters, subjects, modules, materials, question papers, AI). Reads/writes **MongoDB**.
- **frontend/** – React app (login, home, semester/subject/module views, materials, AI content). Talks to the backend via **axios** to `http://localhost:5000/api`.

---

### 4.1 Backend (`backend/`)

| File / Folder | Purpose |
|---------------|--------|
| **package.json** | Backend dependencies (express, mongoose, jwt, nodemailer, multer, openai, etc.) and scripts: `npm run dev`, `npm run seed`. |
| **.env** | Environment variables (not in git): `MONGODB_URI`, `JWT_SECRET`, `PORT`, `USE_FIXED_OTP`, `FIXED_OTP`, optional email/AI keys. **Why:** So the app can connect to DB and run in dev with fixed OTP without email. |
| **src/index.js** | Main server file. Loads `.env`, connects to MongoDB, mounts Express middleware (cors, json, helmet, rate-limit), mounts all API routes under `/api/*`, and starts listening on `PORT`. **Why:** Single entry point for the API. |
| **src/config/database.js** | Connects to MongoDB using `MONGODB_URI`. If URI is missing or connection fails, it logs a warning/error but (in current setup) allows the server to keep running so you see clear DB errors. **Why:** Centralized DB connection. |
| **src/models/** | Mongoose schemas (collections in MongoDB): |
| **Student.js** | Students: studentId, name, email, mobile, semester, department, otp (code + expiry). **Why:** Login and OTP verification. |
| **Teacher.js** | Teachers: teacherId, name, email, department. **Why:** To link subjects to faculty. |
| **Semester.js** | Semesters: number (1–8), name, list of subject IDs. **Why:** To show semester-wise subjects on the home page. |
| **Subject.js** | Subjects: code, name, semester, department, teacher, modules. **Why:** To show subjects under a semester and modules under a subject. |
| **Module.js** | Modules: number, title, description, subject, materials, topics. **Why:** Chapters under a subject; hold official materials. |
| **Material.js** | Materials: title, type (PDF/PPT/TEXT), file path, module, uploadedBy. **Why:** Teacher-uploaded notes/files. |
| **QuestionPaper.js** | Question papers: title, year, semester, subject, file path, exam type. **Why:** Previous year papers. |
| **AIContent.js** | Cached AI content per module/topic: extra notes, numericals, exam points, YouTube links. **Why:** So we don’t call AI again for the same topic every time. |
| **AIQuestion.js** | AI-predicted questions per subject/module/topic. **Why:** To show “predicted questions” in the UI. |
| **src/routes/auth.js** | **POST /api/auth/request-otp** – accepts studentId, email (or mobile); finds/creates student, sets OTP (fixed `123456` if `USE_FIXED_OTP=true`), saves; in fixed-OTP mode returns success without sending email. **POST /api/auth/verify-otp** – accepts studentId + otp; checks OTP and expiry; clears OTP, issues JWT and returns token + student. **Why:** Secure login without needing email config in dev. |
| **src/routes/semesters.js** | **GET /api/semesters** – list semesters (with subjects). **GET /api/semesters/:id** – one semester. **Why:** Home page needs the list of semesters. |
| **src/routes/subjects.js** | **GET /api/subjects/semester/:semesterId** – subjects for a semester. **GET /api/subjects/:id** – one subject with modules. **Why:** Semester view and subject detail. |
| **src/routes/modules.js** | **GET /api/modules/subject/:subjectId** – modules for a subject. **GET /api/modules/:id** – one module. **Why:** Subject view and module detail. |
| **src/routes/materials.js** | **GET /api/materials/module/:moduleId** – materials for a module. **GET /api/materials/:id/download** – download file. **POST /api/materials/upload** – upload (auth required). **Why:** Show and download official resources. |
| **src/routes/questionPapers.js** | **GET /api/question-papers/subject/:subjectId** (and by semester), **GET /api/question-papers/:id/download**, **POST /api/question-papers/upload**. **Why:** List and download previous year papers. |
| **src/routes/ai.js** | **GET /api/ai/content/:moduleId?topic=...** – get or generate AI content for a topic. **POST /api/ai/notes|numericals|exam-points|youtube/:moduleId**, **GET/POST** for predicted questions. **Why:** Implements “topic search” and AI features. |
| **src/services/otpService.js** | `generateOTP()`, `sendOTPEmail()`, `sendOTPSMS()`. **Why:** OTP generation and optional email/SMS (used only when not using fixed OTP). |
| **src/services/aiService.js** | Calls OpenAI or Gemini to generate notes, numericals, exam points, YouTube suggestions, predicted questions; reads/writes AIContent and AIQuestion. **Why:** Implements the “AI” in the problem statement. |
| **src/middleware/auth.js** | Verifies JWT on protected routes; attaches `req.student`. **Why:** Only logged-in students can access semesters, subjects, modules, etc. |
| **src/middleware/upload.js** | Multer config for file uploads (materials, question papers). **Why:** To store PDFs/PPTs. |
| **src/scripts/seedData.js** | Creates sample teachers, 8 semesters, 3 subjects, 5 modules. **Why:** So the app has data to show (semester selection, subjects, modules) without manual DB editing. |

---

### 4.2 Frontend (`frontend/`)

| File / Folder | Purpose |
|---------------|--------|
| **package.json** | Frontend dependencies (react, react-dom, react-router-dom, axios, react-icons) and scripts: `npm run dev`, `npm run build`. |
| **index.html** | Single HTML page; root div for React. **Why:** Entry HTML for the SPA. |
| **vite.config.js** | Vite config; React plugin, dev server port (e.g. 5173). **Why:** Fast dev server and build. |
| **src/main.jsx** | Renders `<App />` into the root div. **Why:** React entry point. |
| **src/App.jsx** | Wraps app in `AuthProvider` and `Router`. Defines routes: `/login`, `/`, `/semester/:id`, `/subject/:id`, `/module/:id`. Uses `PrivateRoute` so only logged-in users see home/semester/subject/module. **Why:** Central routing and auth. |
| **src/context/AuthContext.jsx** | Holds `user`, `login`, `logout`, `loading`; reads/writes `localStorage` for token and user. **Why:** So any component can know if the user is logged in and who they are. |
| **src/api.js** | Axios instance with `baseURL: 'http://localhost:5000/api'` and token in header. Exports: `requestOTP`, `verifyOTP`, `fetchSemesters`, `fetchSemester`, `fetchSubjects`, `fetchSubject`, `fetchModules`, `fetchModule`, `fetchMaterials`, `downloadMaterial`, `fetchQuestionPapers`, `downloadQuestionPaper`, and AI-related functions. **Error handling:** If backend is unreachable, throws a clear message: “Cannot connect to server. Start the backend: cd backend && npm run dev”. **Why:** Single place for all API calls and user-friendly error when backend is not running. |
| **src/index.css** | Global styles (layout, login card, buttons, semesters grid, tabs, materials, AI sections, etc.). **Why:** Consistent look and responsiveness. |
| **src/components/Login.jsx** | Login screen: Student ID, email, mobile; “Request OTP”; then OTP input and “Verify & Login”. Uses `requestOTP` and `verifyOTP` from api.js; shows `error` from catch (e.g. “Request failed” or the new “Cannot connect to server…”). **Why:** Implements the login flow from the problem statement. |
| **src/components/Home.jsx** | After login: “Welcome, {user}”, then list of semesters from `fetchSemesters()`. If list is empty, shows “No semesters found” and suggests running `npm run seed`. Clicking a semester navigates to `/semester/:id`. **Why:** Implements “select semester” step. |
| **src/components/SemesterView.jsx** | Loads subjects for the semester; shows subject cards; clicking one goes to `/subject/:id`. **Why:** “Select subject” step. |
| **src/components/SubjectView.jsx** | Tabs: Modules (list; click → `/module/:id`) and Question Papers (list + download). **Why:** “Select module” and “previous year papers”. |
| **src/components/ModuleView.jsx** | Topic search bar; tabs: Official Materials (list + download) and AI Content (extra notes, numericals, exam points, YouTube links, generate predicted questions). Calls `fetchAIContent`, `generatePredictedQuestions`, etc. **Why:** Implements “topic search” and all AI features from the problem statement. |
| **src/components/CourseForm.jsx, CourseList.jsx, CoursePreview.jsx** | Leftover from an older “course builder” demo; not used in the current login → semester → subject → module flow. Can be ignored or removed. |

---

## 5. Flow Summary (Problem Statement vs Code)

| Step | Problem statement | Where it’s implemented |
|------|-------------------|------------------------|
| 1 | Student login (Student ID + OTP) | `Login.jsx` + `api.requestOTP` / `verifyOTP` → `backend/routes/auth.js` (fixed OTP via `.env`). |
| 2 | Home page, select semester | `Home.jsx` + `fetchSemesters` → `backend/routes/semesters.js` + DB `semesters`. |
| 3 | Show subjects for semester | `SemesterView.jsx` + `fetchSubjects(semesterId)` → `backend/routes/subjects.js`. |
| 4 | Select subject and modules | `SubjectView.jsx` + `fetchSubject`, `fetchModules` → `backend/routes/subjects.js`, `modules.js`. |
| 5 | Official chapter notes (PDF/PPT/Text) | `ModuleView.jsx` (Materials tab) + `fetchMaterials` → `backend/routes/materials.js` + `Material` model. |
| 6 | Topic search bar | `ModuleView.jsx` – input + “Search” calling AI content API. |
| 7 | AI: extra notes, numericals, exam points, YouTube | `ModuleView.jsx` (AI Content tab) + `backend/routes/ai.js` + `services/aiService.js` (OpenAI/Gemini). |
| 8 | Previous year papers + AI-predicted questions | `SubjectView.jsx` (papers) + `ModuleView.jsx` (predict questions) → `questionPapers.js`, `ai.js`. |

---

## 6. Summary

- **“Request failed”** was due to the backend not running; the frontend now shows a clear message telling you to start the backend.
- **How to run the whole application:** Two terminals (backend + frontend), then open http://localhost:5173; first time run `npm run seed` in backend; login with STU001 and OTP **123456**. Full steps: **HOW_TO_RUN.md**.
- **What the project is:** Problem statement, structure, and why each main file exists are in this document; backend = Node + MongoDB + routes/services; frontend = React + Vite + api.js; all features from the problem statement are implemented in the listed files and routes.
