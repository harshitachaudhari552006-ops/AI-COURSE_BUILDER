# MongoDB Installation Guide for Windows

## Quick Installation Methods

### Method 1: Using Winget (Windows 10/11 - Recommended)

```powershell
# Install MongoDB Community Server
winget install MongoDB.Server

# After installation, MongoDB will be available as a Windows service
```

### Method 2: Using Chocolatey

```powershell
# Install MongoDB Community Server
choco install mongodb

# Start MongoDB service
net start MongoDB
```

### Method 3: Manual Installation

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select:
     - Version: Latest (7.0 or 6.0)
     - Platform: Windows
     - Package: MSI
   - Click "Download"

2. **Run the Installer:**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Check "Run service as Network Service user"
   - Check "Install MongoDB Compass" (optional GUI tool)
   - Click "Install"

3. **Verify Installation:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service MongoDB
   
   # Or start it manually if needed
   net start MongoDB
   ```

4. **Test Connection:**
   ```powershell
   # Open MongoDB shell
   mongosh
   
   # Or test connection
   mongosh "mongodb://localhost:27017"
   ```

## After Installation

1. **Update your `.env` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai_course_builder
   ```

2. **Start MongoDB Service (if not running):**
   ```powershell
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```powershell
   Get-Service MongoDB
   ```
   Should show: `Status: Running`

## Alternative: MongoDB Atlas (Cloud - No Installation)

If you prefer not to install locally:

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster (M0 - Free tier)
4. Get connection string
5. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_course_builder
   ```

## Troubleshooting

### MongoDB Service Won't Start
```powershell
# Check service status
Get-Service MongoDB

# Start manually
net start MongoDB

# If permission error, run PowerShell as Administrator
```

### Port 27017 Already in Use
```powershell
# Check what's using the port
netstat -ano | findstr :27017

# Kill the process if needed (replace PID)
taskkill /PID <process_id> /F
```

### MongoDB Not in PATH
- Add to PATH: `C:\Program Files\MongoDB\Server\<version>\bin`
- Or use full path: `"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"`

## Next Steps

After MongoDB is installed and running:

1. Start your backend:
   ```powershell
   cd backend
   npm run dev
   ```

2. You should see:
   ```
   MongoDB Connected: localhost
   🚀 AI Course Builder API listening on http://localhost:5000
   ```

---

**Need help?** Check the MongoDB documentation: https://docs.mongodb.com/manual/installation/

