# Rabbi Project

A full-stack application with React frontend and Express.js backend.

## Project Structure

```
rabbi/
├── frontend/     # React application
└── backend/      # Express.js API server
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Compass (local MongoDB) - Make sure MongoDB is running locally

### Installation

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Environment variables are configured:
   
   **Backend (.env in `backend/` folder):**
   - MongoDB connection: `mongodb://localhost:27017` (for MongoDB Compass)
   - Database name: `drone`
   - Server port: `5000`
   
   **Frontend (.env in `frontend/` folder):**
   - API URL: `http://localhost:5000` (points to local backend)
   
   **Important:** 
   - Make sure MongoDB is running locally before starting the backend server
   - **Firebase has been removed** - Authentication now uses the backend API
   - See `AUTHENTICATION.md` for authentication details
   - If you want to use MongoDB Atlas instead, edit `backend/.env` and update the connection string

### Running the Application

You can run the backend and frontend **separately** or **together**. Both methods work independently.

#### Option 1: Run Separately (Recommended for Development)

**Terminal 1 - Start the backend server:**
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Start the frontend (open a new terminal):**
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000` and automatically open in your browser.

**Note:** Make sure MongoDB is running before starting the backend.

#### Option 2: Run Both Together from Root

From the root directory:
```bash
npm run dev
```

This will start both the backend and frontend concurrently in the same terminal.

#### Option 3: Run from Root (Separate Commands)

You can also run them separately from the root directory:

**Backend only:**
```bash
npm run backend
```

**Frontend only:**
```bash
npm run frontend
```

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend concurrently
- `npm run frontend` - Start only the frontend
- `npm run backend` - Start only the backend

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Backend
- `npm start` - Start production server
- `npm run start-dev` - Start development server with nodemon

## Technologies Used

### Frontend
- React
- React Router
- Firebase (Authentication)
- Bootstrap
- Axios

### Backend
- Express.js
- MongoDB
- CORS
- dotenv
