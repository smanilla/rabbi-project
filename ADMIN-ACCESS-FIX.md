# Fix Admin Access Issue

## Problem
You're logged in as admin but can't see admin panel options.

## Solution

### Option 1: Logout and Login Again (Recommended)
1. **Logout** from your current session
2. **Login again** with:
   - Email: `admin@drone.com`
   - Password: `admin123`
3. Navigate to `/dashboard`
4. You should now see the admin panel!

### Option 2: Clear Browser Storage
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → your site URL
4. Delete the `user` key
5. Refresh the page and login again

### Option 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Navigate to `/dashboard`
4. Look for debug messages showing:
   - Your email
   - Your role
   - Admin status

## Verify Admin Status

Run this to verify admin exists:
```bash
cd backend
node test-admin.js
```

You should see:
```
✅ Admin check result:
   Email: admin@drone.com
   Role: admin
   Is Admin: ✅ YES
```

## Still Not Working?

1. Check browser console for errors
2. Verify backend is running: `http://localhost:5000/health`
3. Test admin check API: `http://localhost:5000/checkAdmin/admin@drone.com`
4. Should return: `{"isAdmin":true,"user":{"email":"admin@drone.com","name":"Admin User","role":"admin"}}`
