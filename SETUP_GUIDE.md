# Complete Setup Guide

## Step-by-Step Installation

### Step 1: Install Prerequisites

1. **Install Node.js (LTS)**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Install MongoDB**
   - Option A: MongoDB Community Server
     - Download from: https://www.mongodb.com/try/download/community
     - Install and start MongoDB service
   - Option B: MongoDB Atlas (Cloud - Recommended)
     - Sign up at: https://www.mongodb.com/cloud/atlas
     - Create a free cluster
     - Get connection string

3. **Install Visual Studio Code** (Optional but recommended)
   - Download from: https://code.visualstudio.com/

### Step 2: Configure Email for OTP

#### Gmail Setup:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "AI Course Builder"
   - Copy the 16-character password
   - Use this in `EMAIL_PASS` in `.env`

#### Alternative Email Services:
- Outlook: Use SMTP settings
- SendGrid: Use API key
- Mailgun: Use SMTP credentials

### Step 3: Get AI API Keys

#### Option 1: Google Gemini (Free Tier Available)
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

#### Option 2: OpenAI (Paid)
1. Go to: https://platform.openai.com/
2. Sign up/Login
3. Go to API Keys section
4. Create new secret key
5. Copy the key (starts with `sk-`)

**Note:** At least one AI API key is required. Gemini is recommended for free tier.

### Step 4: Backend Configuration

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
# Copy from .env.example or create new
```

4. Fill in all required values in `.env`

5. Create uploads directory:
```bash
mkdir uploads
mkdir uploads/materials
mkdir uploads/questionPapers
```

### Step 5: Frontend Configuration

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Verify API URL in `src/api.js`:
```javascript
baseURL: 'http://localhost:5000/api'
```

### Step 6: Seed Initial Data (Optional)

1. Run seed script:
```bash
cd backend
node src/scripts/seedData.js
```

This creates sample:
- Teachers
- Semesters (1-8)
- Sample subjects and modules

### Step 7: Start the Application

**Terminal 1 - Start MongoDB:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod

# Or use MongoDB Atlas (no local start needed)
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 AI Course Builder API listening on http://localhost:5000
MongoDB Connected: ...
```

**Terminal 3 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 8: Test the Application

1. Open browser: `http://localhost:5173`
2. You should see the login page
3. Test login:
   - Student ID: `STU001`
   - Email: Your email address
   - Request OTP
   - Check email for OTP
   - Enter OTP and login

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution:**
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist (add 0.0.0.0/0 for development)

### Issue 2: OTP Email Not Received
**Solution:**
- Check spam folder
- Verify Gmail App Password is correct
- Check email service logs in console
- Try different email service

### Issue 3: AI Features Not Working
**Solution:**
- Verify API keys in `.env`
- Check API quota/limits
- Review backend console for errors
- Try switching between OpenAI and Gemini

### Issue 4: Port Already in Use
**Solution:**
- Change `PORT` in backend `.env`
- Update frontend `api.js` baseURL accordingly

### Issue 5: File Upload Fails
**Solution:**
- Check `UPLOAD_PATH` directory exists
- Verify file permissions
- Check file size limits in `.env`

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Configure proper CORS settings
- [ ] Set up SSL/HTTPS
- [ ] Configure production email service
- [ ] Set up file storage (AWS S3, Cloudinary, etc.)
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Update frontend API baseURL to production URL

## Next Steps

1. Add more subjects and modules
2. Upload study materials
3. Upload question papers
4. Test AI features with real topics
5. Customize UI/UX as needed

## Support

For additional help:
- Check README.md
- Review API documentation
- Check console logs for errors
- Verify all environment variables

---

**Happy Learning! 🎓**

