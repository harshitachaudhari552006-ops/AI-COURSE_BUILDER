# Local MongoDB Installation - Step by Step

## 📥 Step 1: Download MongoDB

1. **Open your browser** and go to:
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Select the following options:**
   - **Version:** 7.0 (or latest available)
   - **Platform:** Windows
   - **Package:** MSI
   - Click **"Download"** button

3. **Wait for download to complete** (file size ~200-300 MB)

---

## 🔧 Step 2: Install MongoDB

1. **Locate the downloaded file** (usually in your Downloads folder)
   - File name: `mongodb-windows-x86_64-7.0.x-signed.msi` (version may vary)

2. **Right-click** on the `.msi` file

3. **Select "Run as Administrator"** ⚠️ **IMPORTANT: Must run as Admin!**

4. **Follow the Installation Wizard:**
   - Click **"Next"** on the welcome screen
   - Accept the **License Agreement** → Click **"Next"**
   - Choose **"Complete"** installation → Click **"Next"**
   - ✅ **IMPORTANT:** Check **"Install MongoDB as a Service"**
   - ✅ Check **"Run service as Network Service user"**
   - ✅ (Optional) Check **"Install MongoDB Compass"** (GUI tool)
   - Click **"Next"**
   - Click **"Install"**
   - Wait for installation to complete (2-5 minutes)
   - Click **"Finish"**

---

## ✅ Step 3: Verify Installation

After installation, **open PowerShell as Administrator** and run:

```powershell
# Check if MongoDB service exists
Get-Service MongoDB

# Check MongoDB installation path
Test-Path "C:\Program Files\MongoDB\Server"
```

**Expected output:**
- Service status should show (may be Stopped initially)
- Installation path should exist

---

## 🚀 Step 4: Start MongoDB Service

**Open PowerShell as Administrator** and run:

```powershell
# Start MongoDB service
net start MongoDB

# Verify it's running
Get-Service MongoDB
```

**Expected output:**
```
Status   Name               DisplayName
------   ----               -----------
Running  MongoDB            MongoDB Server
```

---

## 🧪 Step 5: Test MongoDB Connection

```powershell
# Test MongoDB connection
mongosh

# Or test with connection string
mongosh "mongodb://localhost:27017"
```

**If successful, you'll see:**
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000
Using MongoDB: 7.0.x
Using Mongosh: x.x.x
```

Type `exit` to leave MongoDB shell.

---

## ⚙️ Step 6: Configure Your Project

Your `.env` file should already have the correct connection string:

```env
MONGODB_URI=mongodb://localhost:27017/ai_course_builder
```

**No changes needed!** ✅

---

## 🎯 Step 7: Start Your Backend

Now start your backend server:

```powershell
cd backend
npm run dev
```

**You should see:**
```
MongoDB Connected: localhost
🚀 AI Course Builder API listening on http://localhost:5000
```

---

## ❗ Troubleshooting

### MongoDB Service Won't Start

```powershell
# Check service status
Get-Service MongoDB

# Try starting manually
net start MongoDB

# If permission error, make sure PowerShell is running as Administrator
```

### Port 27017 Already in Use

```powershell
# Check what's using the port
netstat -ano | findstr :27017

# If needed, stop the process (replace PID with actual process ID)
taskkill /PID <process_id> /F
```

### MongoDB Not Found in PATH

If `mongosh` command doesn't work:

1. MongoDB is usually installed at:
   ```
   C:\Program Files\MongoDB\Server\7.0\bin
   ```

2. Add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\Program Files\MongoDB\Server\7.0\bin`
   - Restart PowerShell

### Service Not Found

If `Get-Service MongoDB` shows error:
- Reinstall MongoDB
- Make sure you checked "Install MongoDB as a Service" during installation

---

## 📝 Quick Commands Reference

```powershell
# Start MongoDB
net start MongoDB

# Stop MongoDB
net stop MongoDB

# Check status
Get-Service MongoDB

# Test connection
mongosh

# View MongoDB logs (if needed)
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 50
```

---

## ✅ Success Checklist

- [ ] MongoDB downloaded
- [ ] MongoDB installed (as Administrator)
- [ ] MongoDB service is running
- [ ] `mongosh` command works
- [ ] Backend connects successfully
- [ ] No errors in backend console

---

**Once MongoDB is running, your backend will work perfectly!** 🎉

