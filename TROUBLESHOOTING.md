# Troubleshooting Guide

## Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error means the server is returning HTML instead of JSON. Here's how to fix it:

### Causes:
1. **Backend not running** - The server isn't started
2. **Database not connected** - MongoDB isn't running or connection failed
3. **Wrong API URL** - Frontend is pointing to wrong backend URL
4. **Route doesn't exist** - 404 page is being returned

### Solutions:

#### 1. Check Backend is Running
```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running at port 5000
```

#### 2. Check MongoDB is Running
- Open MongoDB Compass
- Make sure it's connected to `mongodb://localhost:27017`
- The database should be named `drone`

#### 3. Check API URL
- Open `frontend/.env`
- Make sure `REACT_APP_API_URL=http://localhost:5000`
- Restart frontend after changing `.env`

#### 4. Test Backend Health
Open browser and go to: `http://localhost:5000/health`

You should see:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

#### 5. Check Browser Console
- Open browser DevTools (F12)
- Check Network tab
- Look for failed requests
- Check if requests are going to correct URL

### Quick Fix Steps:

1. **Stop both servers** (Ctrl+C)

2. **Start MongoDB** (if using local MongoDB Compass)

3. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```
   Wait for "✅ Connected to MongoDB"

4. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

5. **Test Login:**
   - Go to `http://localhost:3000/login`
   - Try logging in
   - Check browser console for errors

### Common Issues:

**Issue:** "Database not connected" error
- **Fix:** Make sure MongoDB Compass is running and connected

**Issue:** "Cannot connect to server"
- **Fix:** Make sure backend is running on port 5000

**Issue:** CORS errors
- **Fix:** Backend already has CORS enabled, but check if backend is actually running

### Still Having Issues?

1. Check backend terminal for error messages
2. Check frontend terminal for error messages
3. Check browser console (F12) for detailed errors
4. Verify MongoDB connection string in `backend/.env`
