# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
- ✅ Node.js installed (`node --version`)
- ✅ MongoDB running or Atlas account ready
- ✅ Email account for OTP (Gmail recommended)
- ✅ AI API key (Gemini or OpenAI)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment

1. **Backend `.env` file** (copy from `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/ai_course_builder
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GEMINI_API_KEY=your-gemini-key
```

2. **Create uploads directory**:
```bash
cd backend
mkdir -p uploads/materials uploads/questionPapers
```

### Step 3: Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

### Step 4: Start Application

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

### Step 5: Test Login

1. Open: http://localhost:5173
2. Student ID: `STU001`
3. Email: Your email
4. Request OTP → Check email → Enter OTP → Login

## ✅ You're Ready!

- Browse semesters and subjects
- View study materials
- Search topics for AI content
- Access question papers

## 📚 Next Steps

- Add more subjects and modules
- Upload study materials
- Upload question papers
- Customize as needed

For detailed setup, see `SETUP_GUIDE.md`

