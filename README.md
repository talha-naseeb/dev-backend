# Authentication System Backend

A robust authentication system built with Node.js, Express, and MongoDB, featuring role-based access control, OAuth integration, and secure password management.

## Features

- 🔐 Authentication Methods:

  - Local authentication (email/password)
  - Google OAuth integration
  - Microsoft OAuth integration
  - JWT-based authentication

- 👥 User Management:

  - Role-based access control (Admin, Manager, Employee)
  - User profile management
  - Secure password reset functionality

- 🛡️ Security Features:
  - Password hashing with bcrypt
  - JWT token authentication
  - Input validation
  - Rate limiting
  - Secure password reset flow

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file in the root directory and add your configuration:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auth-system
   JWT_SECRET=your_jwt_secret_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Microsoft OAuth
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

   # Email Configuration
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@example.com

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Authentication

- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password with token

### OAuth

- GET `/api/auth/google` - Google OAuth login
- GET `/api/auth/microsoft` - Microsoft OAuth login

### User Management

- GET `/api/users/profile` - Get user profile (authenticated)
- PUT `/api/users/profile` - Update user profile (authenticated)
- GET `/api/users/all` - Get all users (admin only)

## Project Structure

```
src/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middleware/         # Custom middleware
├── models/            # Database models
├── routes/            # API routes
│   ├── auth/          # Authentication routes
│   └── user/          # User management routes
└── utils/             # Utility functions
    └── responses/     # API response handlers
```

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "timestamp": "2025-11-10T10:00:00.000Z"
}
```

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation on all routes
- Protected routes using authentication middleware
- Role-based access control
- CORS enabled
- Rate limiting on authentication routes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
