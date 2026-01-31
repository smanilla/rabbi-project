# PM2 Background Running Guide

## What is PM2?

PM2 is a process manager for Node.js applications that keeps your server running in the background, even after closing the terminal.

## Installation

PM2 is already installed globally. If you need to reinstall:
```bash
npm install -g pm2
```

## Quick Start

### Start Server in Background
```bash
cd backend
npm run pm2:start
```

### Check Status
```bash
npm run pm2:status
```

### View Logs
```bash
npm run pm2:logs
```

### Stop Server
```bash
npm run pm2:stop
```

### Restart Server
```bash
npm run pm2:restart
```

### Delete from PM2
```bash
npm run pm2:delete
```

## PM2 Commands (Direct)

### Start
```bash
pm2 start ecosystem.config.js
```

### Stop
```bash
pm2 stop rabbi-backend
```

### Restart
```bash
pm2 restart rabbi-backend
```

### View Logs
```bash
pm2 logs rabbi-backend
```

### View All Processes
```bash
pm2 list
```

### Monitor (Real-time)
```bash
pm2 monit
```

### Stop All
```bash
pm2 stop all
```

### Delete All
```bash
pm2 delete all
```

## Auto-Start on System Boot

### Windows (Using PM2 Startup)
```bash
pm2 startup
pm2 save
```

This will create a startup script that runs PM2 when Windows starts.

### Manual Windows Startup (Alternative)

1. Press `Win + R`
2. Type `shell:startup`
3. Create a file `start-backend.bat` with:
```batch
@echo off
cd /d D:\work\codes\rabbi\backend
pm2 start ecosystem.config.js
```

## Useful PM2 Features

### View Real-time Monitoring
```bash
pm2 monit
```

### Save Current Process List
```bash
pm2 save
```

### Reload (Zero Downtime)
```bash
pm2 reload rabbi-backend
```

### View Detailed Info
```bash
pm2 show rabbi-backend
```

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" error:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

### PM2 Not Found
If PM2 command not found:
```bash
npm install -g pm2
```

### Check if Server is Running
```bash
pm2 list
```

You should see `rabbi-backend` in the list with status `online`.

## Logs Location

Logs are saved in:
- `backend/logs/out.log` - Standard output
- `backend/logs/err.log` - Errors

## Notes

- PM2 keeps the server running even after closing terminal
- Server automatically restarts if it crashes
- Use `pm2 logs` to see real-time logs
- Use `pm2 monit` for real-time monitoring
