@echo off
echo.
echo ========================================
echo MH TOWING - Update Production URLs
echo ========================================
echo.
set /p APP_URL="Enter your Render.com URL (e.g., https://mh-towing-job-cards.onrender.com): "

echo.
echo Updating app.js...
powershell -Command "(Get-Content app.js) -replace 'http://localhost:3000', '%APP_URL%' | Set-Content app.js"

echo Updating admin.js...
powershell -Command "(Get-Content admin.js) -replace 'http://localhost:3000', '%APP_URL%' | Set-Content admin.js"

echo.
echo ========================================
echo URLs updated successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run: git add .
echo 2. Run: git commit -m "Update production URLs"
echo 3. Run: git push
echo.
echo Render will automatically redeploy your app!
echo.
pause
