# AI-Powered Learning Platform for Saraswati College of Engineering

A comprehensive, production-ready AI-powered learning platform that combines official teacher-provided notes with AI-generated extra explanations, numericals, previous year question papers, and AI-predicted questions to support exam-oriented learning.

## 🎯 Features

- **Secure OTP-based Authentication** - Email/Mobile OTP verification for students
- **Semester-wise Navigation** - Easy navigation through semesters, subjects, and modules
- **Official Study Materials** - Teacher-uploaded PDFs, PPTs, and text documents
- **AI-Powered Content Generation**:
  - Extra notes and explanations
  - Numerical problems with solutions
  - Exam points and key concepts
  - YouTube video recommendations
  - AI-predicted exam questions
- **Previous Year Question Papers** - Organized by subject, year, and semester
- **Topic-wise Search** - Search for AI content by specific topics
- **Modern UI/UX** - Beautiful, responsive interface

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email OTP
- **Multer** for file uploads
- **OpenAI/Gemini AI** for content generation

### Frontend
- **React.js** with React Router
- **Axios** for API calls
- **Modern CSS** with responsive design
- **React Icons** for icons

## 📋 Prerequisites

- Node.js (LTS version) - [Download](https://nodejs.org/)
- MongoDB Community Server or MongoDB Atlas - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- Google Chrome (for testing)
- Visual Studio Code (recommended)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_course_builder
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai_course_builder
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_course_builder

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@saraswati-college.edu

# SMS Configuration (Optional - for Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AI API Keys (at least one required)
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-google-gemini-api-key

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Important Notes:**
- For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833)
- Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
- Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- At least one AI API key (OpenAI or Gemini) is required

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud-hosted, no local installation needed)

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

## 📚 API Documentation

### Authentication

#### Request OTP
```
POST /api/auth/request-otp
Body: {
  "studentId": "STU001",
  "email": "student@example.com",
  "mobile": "+1234567890" (optional)
}
```

#### Verify OTP
```
POST /api/auth/verify-otp
Body: {
  "studentId": "STU001",
  "otp": "123456"
}
```

### Semesters
```
GET /api/semesters - Get all semesters
GET /api/semesters/:id - Get single semester
```

### Subjects
```
GET /api/subjects/semester/:semesterId - Get subjects by semester
GET /api/subjects/:id - Get single subject
```

### Modules
```
GET /api/modules/subject/:subjectId - Get modules by subject
GET /api/modules/:id - Get single module
```

### Materials
```
GET /api/materials/module/:moduleId - Get materials by module
GET /api/materials/:id/download - Download material
POST /api/materials/upload - Upload material (requires auth)
```

### Question Papers
```
GET /api/question-papers/subject/:subjectId - Get papers by subject
GET /api/question-papers/semester/:semesterNumber - Get papers by semester
GET /api/question-papers/:id/download - Download paper
```

### AI Features
```
GET /api/ai/content/:moduleId?topic=TOPIC - Get AI content
POST /api/ai/notes/:moduleId - Generate extra notes
POST /api/ai/numericals/:moduleId - Generate numericals
POST /api/ai/exam-points/:moduleId - Generate exam points
POST /api/ai/youtube/:moduleId - Generate YouTube links
GET /api/ai/questions/:subjectId - Get predicted questions
POST /api/ai/questions/generate - Generate predicted questions
```

## 🗄️ Database Schema

### Collections
- **students** - Student information and authentication
- **teachers** - Teacher information
- **semesters** - Semester data
- **subjects** - Subject information
- **modules** - Module/chapter data
- **materials** - Study materials (PDFs, PPTs, etc.)
- **questionpapers** - Previous year question papers
- **aicontents** - AI-generated content
- **aiquestions** - AI-predicted questions

## 🎓 Usage Guide

### For Students

1. **Login**
   - Enter your Student ID
   - Enter your Email (and optionally Mobile)
   - Click "Request OTP"
   - Check your email for the OTP
   - Enter the OTP to login

2. **Navigate**
   - Select your semester from the home page
   - Choose a subject
   - Select a module to view materials

3. **Access Materials**
   - View official teacher-provided materials
   - Download PDFs, PPTs, and documents

4. **Use AI Features**
   - Enter a topic in the search bar
   - Get AI-generated:
     - Extra notes and explanations
     - Numerical problems
     - Exam points
     - YouTube video links
     - Predicted questions

5. **Question Papers**
   - View previous year question papers
   - Download papers by year and semester

### For Teachers (Admin Features)

Teachers can upload materials and question papers through the API endpoints (admin authentication to be implemented in production).

## 🔒 Security Features

- JWT-based authentication
- OTP expiration (10 minutes default)
- Rate limiting on API endpoints
- Helmet.js for security headers
- File upload validation
- Input validation with Zod

## 📁 Project Structure

```
AI_course_builder/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── Student.js
│   │   │   ├── Teacher.js
│   │   │   ├── Semester.js
│   │   │   ├── Subject.js
│   │   │   ├── Module.js
│   │   │   ├── Material.js
│   │   │   ├── QuestionPaper.js
│   │   │   ├── AIContent.js
│   │   │   └── AIQuestion.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── semesters.js
│   │   │   ├── subjects.js
│   │   │   ├── modules.js
│   │   │   ├── materials.js
│   │   │   ├── questionPapers.js
│   │   │   └── ai.js
│   │   ├── services/
│   │   │   ├── otpService.js
│   │   │   └── aiService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   └── index.js
│   ├── uploads/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── SemesterView.jsx
│   │   │   ├── SubjectView.jsx
│   │   │   └── ModuleView.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🧪 Testing

### Test Student Login
1. Use any Student ID (e.g., "STU001")
2. Use a valid email address
3. Request OTP
4. Check email for OTP
5. Verify and login

### Test Data
You can seed the database with sample data using MongoDB Compass or a script (to be added).

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Update `MONGODB_URI` to production database
3. Deploy using Git

### Frontend Deployment (Vercel/Netlify)

1. Update API base URL in `frontend/src/api.js`
2. Build: `npm run build`
3. Deploy the `dist` folder

## 🐛 Troubleshooting

### OTP Not Received
- Check spam folder
- Verify email configuration in `.env`
- Check email service logs

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Ensure network access (for Atlas)

### AI Features Not Working
- Verify API keys in `.env`
- Check API quota/limits
- Review error logs

### File Upload Issues
- Check `UPLOAD_PATH` directory exists
- Verify file size limits
- Check file permissions

## 📝 License

This project is developed for Saraswati College of Engineering.

## 👥 Contributors

Developed for educational purposes.

## 📞 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ for Saraswati College of Engineering**
