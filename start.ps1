# CivicMitra Startup Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting CivicMitra Application..." -ForegroundColor Cyan
Write-Host "📊 Backend will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "🌐 Frontend will run on: http://localhost:5173" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow

# Start backend in a new PowerShell window
$backendScript = "cd '$PSScriptRoot\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window  
$frontendScript = "cd '$PSScriptRoot\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host "🔧 Check the terminal windows for any errors" -ForegroundColor Yellow
Write-Host "🌟 Open http://localhost:5173 in your browser" -ForegroundColor Magenta