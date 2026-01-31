# Authentication System

## Overview

Firebase has been **removed** and replaced with a **backend-based authentication system** using JWT and bcrypt for password hashing.

## How It Works

### Backend
- Uses MongoDB to store user credentials
- Passwords are hashed with bcrypt
- Authentication endpoints:
  - `POST /register` - Register new user
  - `POST /login` - Login user
  - `GET /user/:email` - Get user info

### Frontend
- Stores user session in localStorage
- Auto-login after registration
- All authentication handled through backend API

## Usage

### Register
1. User fills out registration form (name, email, password)
2. Frontend sends request to `/register`
3. Backend creates user in `auth` collection (hashed password) and `users` collection (user info)
4. User is automatically logged in

### Login
1. User enters email and password
2. Frontend sends request to `/login`
3. Backend verifies credentials
4. User info is stored in localStorage
5. User is redirected to dashboard/home

### Logout
- Clears localStorage
- Redirects to home page

## Database Collections

- `auth` - Stores email and hashed password
- `users` - Stores user info (name, email, role)

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- No passwords stored in plain text
- User sessions managed via localStorage (can be upgraded to JWT tokens later)
