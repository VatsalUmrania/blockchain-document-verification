# Authentication System

This directory contains all the authentication-related components for the blockchain document verification system.

## Components

- **LoginPage.jsx** - Institute login page with email/password authentication
- **RegisterPage.jsx** - Institute registration page with wallet address verification
- **ProfilePage.jsx** - User profile management page for updating institution information

## Services

- **authService.js** - Handles API calls for authentication and user management
- **AuthContext.jsx** - React context for managing authentication state across the application

## Features

1. **Token-based Authentication** - Secure JWT tokens for user sessions
2. **Institute Registration** - Register institutions with wallet address verification
3. **Profile Management** - Update institution information and contact details
4. **Protected Routes** - Secure document management routes with authentication middleware
5. **Wallet Integration** - Connect institution identity with blockchain wallet address

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new institute
- `POST /login` - Login with email and password
- `GET /profile` - Get user profile (authenticated)
- `PUT /profile` - Update user profile (authenticated)

### Protected Document Routes (`/api/documents`)

All document routes now require authentication and verify that users can only access their own documents.

## Security

- Passwords are hashed using bcrypt
- JWT tokens are signed with a secret key
- Authentication middleware protects all document routes
- Users can only access documents associated with their wallet address
