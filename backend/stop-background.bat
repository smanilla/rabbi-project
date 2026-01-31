@echo off
echo Stopping Rabbi Backend Server...
cd /d %~dp0
pm2 stop rabbi-backend
echo Server stopped!
pause
