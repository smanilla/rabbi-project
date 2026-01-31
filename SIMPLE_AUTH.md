# Simple Email/Password Authentication

## Overview

The authentication system has been simplified to use basic email/password signup and signin. No complex OAuth or email verification required.

## How It Works

### Signup (Register)
1. User enters: **Name**, **Email**, **Password**
2. Backend validates email format
3. Backend checks if email already exists
4. Password is hashed with bcrypt
5. User is created in database
6. User is automatically logged in after registration

### Signin (Login)
1. User enters: **Email**, **Password**
2. Backend finds user by email
3. Backend verifies password
4. User session is stored in localStorage
5. User is redirected to dashboard/home

## API Endpoints

### POST `/register`
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "..."
}
```

### POST `/login`
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "john@example.com",
    "name": "John Doe",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

## Features

- ✅ Simple email/password authentication
- ✅ Password hashing with bcrypt
- ✅ Email format validation
- ✅ Duplicate email checking
- ✅ Auto-login after registration
- ✅ Session persistence (localStorage)
- ✅ Role-based access (user/admin)

## Security

- Passwords are hashed (never stored in plain text)
- Email validation prevents invalid emails
- Duplicate email prevention
- Password minimum length: 6 characters

## Usage

1. **Register**: Go to `/register` and fill the form
2. **Login**: Go to `/login` and enter credentials
3. **Logout**: Click logout button (clears session)

No email verification required - users can start using the app immediately after registration!
