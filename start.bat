@echo off
echo Installing dependencies...
call npm install

echo.
echo Starting server...
echo.
echo Job Card Form: http://localhost:3000
echo Admin Dashboard: http://localhost:3000/admin.html
echo.
call npm start
