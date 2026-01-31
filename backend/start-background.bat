@echo off
echo Starting Rabbi Backend Server with PM2...
cd /d %~dp0
pm2 start ecosystem.config.js
pm2 save
echo.
echo Server started! Use 'pm2 list' to check status
echo Use 'pm2 logs rabbi-backend' to view logs
echo Use 'pm2 stop rabbi-backend' to stop server
pause
