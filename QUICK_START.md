# Quick Start Guide

## Running Backend and Frontend Separately

### Method 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
✅ Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
✅ Frontend runs on: `http://localhost:3000`

### Method 2: From Root Directory

**Backend only:**
```bash
npm run backend
```

**Frontend only:**
```bash
npm run frontend
```

### Method 3: Both Together
```bash
npm run dev
```

## Prerequisites

- ✅ MongoDB must be running (MongoDB Compass)
- ✅ Dependencies installed (`npm install` in both folders)

## Configuration

- **Backend API:** `http://localhost:5000` (configured in `backend/.env`)
- **Frontend API URL:** `http://localhost:5000` (configured in `frontend/.env`)

Both can run completely independently!
