# Install MongoDB - Quick Guide

## ✅ EASIEST OPTION: MongoDB Atlas (Cloud - No Installation Required)

**Recommended for quick setup!**

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** for free account
3. **Create a free cluster** (M0 - Free tier)
4. **Create database user:**
   - Username: `admin` (or your choice)
   - Password: Create a strong password
5. **Whitelist IP:** Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)
7. **Update your `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai_course_builder?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your actual credentials!

**That's it! No installation needed. Your backend will connect to the cloud database.**

---

## Option 2: Install MongoDB Locally (Requires Admin Rights)

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version:** 7.0 (or latest)
   - **Platform:** Windows
   - **Package:** MSI
3. Click **Download**

### Step 2: Install MongoDB
1. **Right-click** the downloaded `.msi` file
2. Select **"Run as Administrator"**
3. Follow the installer:
   - Click **Next**
   - Accept license
   - Choose **"Complete"** installation
   - ✅ Check **"Install MongoDB as a Service"**
   - ✅ Check **"Run service as Network Service user"**
   - ✅ Check **"Install MongoDB Compass"** (optional GUI tool)
   - Click **Install**
   - Click **Finish**

### Step 3: Verify Installation
Open **PowerShell as Administrator** and run:
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it:
net start MongoDB
```

### Step 4: Test Connection
```powershell
# Test MongoDB connection
mongosh
# Or
mongosh "mongodb://localhost:27017"
```

### Step 5: Update .env
Your `.env` file should already have:
```env
MONGODB_URI=mongodb://localhost:27017/ai_course_builder
```

---

## 🚀 After MongoDB is Ready

Start your backend:
```powershell
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: localhost
🚀 AI Course Builder API listening on http://localhost:5000
```

---

## ❓ Which Option Should I Choose?

- **MongoDB Atlas (Cloud):** ✅ Fastest, no installation, works immediately
- **Local MongoDB:** Better for offline development, requires installation

**I recommend MongoDB Atlas for quick setup!**

