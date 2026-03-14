# MongoDB Installation Checker and Starter Script
# Run this after installing MongoDB to verify and start the service

Write-Host "`n=== MongoDB Installation Checker ===" -ForegroundColor Cyan

# Check if MongoDB service exists
Write-Host "`n[1] Checking MongoDB Service..." -ForegroundColor Yellow
$service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "   ✅ MongoDB service found!" -ForegroundColor Green
    Write-Host "   Status: $($service.Status)" -ForegroundColor White
    
    if ($service.Status -eq "Running") {
        Write-Host "   ✅ MongoDB is already running!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB service is stopped" -ForegroundColor Yellow
        Write-Host "`n[2] Attempting to start MongoDB..." -ForegroundColor Yellow
        
        try {
            Start-Service -Name MongoDB -ErrorAction Stop
            Write-Host "   ✅ MongoDB started successfully!" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to start MongoDB" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
            Write-Host "`n   💡 Try running PowerShell as Administrator" -ForegroundColor Yellow
            Write-Host "   Or run: net start MongoDB" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ❌ MongoDB service not found" -ForegroundColor Red
    Write-Host "`n   MongoDB may not be installed yet." -ForegroundColor Yellow
    Write-Host "   Please install MongoDB first:" -ForegroundColor Yellow
    Write-Host "   1. Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "   2. Run installer as Administrator" -ForegroundColor White
    Write-Host "   3. Make sure to check 'Install MongoDB as a Service'" -ForegroundColor White
    exit 1
}

# Check MongoDB installation path
Write-Host "`n[3] Checking MongoDB Installation..." -ForegroundColor Yellow
$mongoPath = "C:\Program Files\MongoDB\Server"
if (Test-Path $mongoPath) {
    $versions = Get-ChildItem $mongoPath -Directory | Select-Object -ExpandProperty Name
    Write-Host "   ✅ MongoDB installed at: $mongoPath" -ForegroundColor Green
    Write-Host "   Installed version(s): $($versions -join ', ')" -ForegroundColor White
} else {
    Write-Host "   ⚠️  MongoDB installation path not found" -ForegroundColor Yellow
}

# Check if mongosh is available
Write-Host "`n[4] Checking MongoDB Shell (mongosh)..." -ForegroundColor Yellow
$mongosh = Get-Command mongosh -ErrorAction SilentlyContinue
if ($mongosh) {
    Write-Host "   ✅ mongosh is available" -ForegroundColor Green
    Write-Host "   Path: $($mongosh.Source)" -ForegroundColor White
} else {
    Write-Host "   ⚠️  mongosh not found in PATH" -ForegroundColor Yellow
    Write-Host "   (This is okay if you just installed MongoDB)" -ForegroundColor Gray
}

# Test connection
Write-Host "`n[5] Testing MongoDB Connection..." -ForegroundColor Yellow
try {
    $result = mongosh --eval "db.version()" --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ MongoDB connection successful!" -ForegroundColor Green
        Write-Host "   Version: $result" -ForegroundColor White
    } else {
        Write-Host "   ⚠️  Could not connect to MongoDB" -ForegroundColor Yellow
        Write-Host "   Make sure MongoDB service is running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not test connection (mongosh may not be in PATH)" -ForegroundColor Yellow
}

# Final status
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✅ MongoDB is ready to use!" -ForegroundColor Green
    Write-Host "`nYou can now start your backend:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host "`nConnection string in .env:" -ForegroundColor Yellow
    Write-Host "   MONGODB_URI=mongodb://localhost:27017/ai_course_builder" -ForegroundColor White
} else {
    Write-Host "❌ MongoDB is not running" -ForegroundColor Red
    Write-Host "`nPlease start MongoDB service:" -ForegroundColor Yellow
    Write-Host "   net start MongoDB" -ForegroundColor White
    Write-Host "   (Run PowerShell as Administrator)" -ForegroundColor Gray
}

Write-Host "`n"

