# Admin User Setup

## Quick Start

To create a dummy admin user, run:

```bash
npm run seed-admin
```

Or directly:

```bash
node seed-admin.js
```

## Admin Credentials

After running the seed script, you can login with:

- **Email:** `admin@drone.com`
- **Password:** `admin123`
- **Role:** `admin`

## Access Admin Panel

1. Start your backend server:
   ```bash
   npm start
   ```

2. Start your frontend:
   ```bash
   cd ../frontend
   npm start
   ```

3. Login at: `http://localhost:3000/login` (or your frontend URL)

4. Navigate to Dashboard: `http://localhost:3000/dashboard`

5. You should see the admin panel with:
   - Overview (stats dashboard)
   - Manage Products
   - Add Product
   - Manage Orders
   - Make Admin

## Notes

- The admin user is created in both `auth` and `users` collections
- Password is hashed using bcrypt
- If admin already exists, the script will just confirm the credentials
- You can change the credentials in `seed-admin.js` if needed

## Troubleshooting

If you can't access admin panel:

1. Check if admin user exists:
   - Check MongoDB for user with email `admin@drone.com`
   - Verify role is set to `admin` in users collection

2. Re-run seed script:
   ```bash
   npm run seed-admin
   ```

3. Check backend logs for any errors

4. Verify MongoDB connection in `.env` file
