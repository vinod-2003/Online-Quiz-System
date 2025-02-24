# Online-Quiz-System

A modern web application for creating and taking quizzes, built with React and Express.

## Features

### User Features
- User authentication (login/register)
- Take quizzes with time limits
- View quiz scores and progress
- Resume interrupted quizzes
- Real-time score calculation

### Admin Features
- Create and manage quizzes
- Add questions with multiple-choice answers
- Set quiz duration and scoring
- View participant results
- Monitor quiz attempts

## Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- Wouter for routing
- Shadcn UI components
- Tailwind CSS for styling

### Backend
- Express.js server
- Passport.js for authentication
- In-memory storage (can be extended to PostgreSQL)
- Rate limiting for API protection

## Getting Started

### Prerequisites
- Node.js 20 or later

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Regular Users
1. Register a new account or login
2. Browse available quizzes on the homepage
3. Start a quiz to begin the assessment
4. Answer questions within the time limit
5. Submit the quiz to see your score
6. View your quiz history and scores

### Admin Users
1. Login with admin credentials (default: username: "admin", password: "admin")
2. Access the admin panel via "Manage Quizzes"
3. Create new quizzes:
   - Set title, duration, and total score
   - Add questions with multiple-choice options
   - Mark correct answers
4. View participant results and quiz statistics

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
├── server/               # Backend Express application
│   ├── auth.ts          # Authentication setup
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data storage implementation
└── shared/              # Shared types and schemas
    └── schema.ts        # Database schema and types
```

## API Endpoints

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - User login
- POST `/api/logout` - User logout
- GET `/api/user` - Get current user

### Quiz Management
- GET `/api/quizzes` - List all quizzes (admin only)
- POST `/api/quizzes` - Create new quiz (admin only)
- POST `/api/quizzes/:id/questions` - Add question to quiz (admin only)
- GET `/api/quizzes/:id/participants` - View quiz participants (admin only)

### Quiz Taking
- GET `/api/my-quizzes` - List available quizzes for user
- POST `/api/quizzes/:id/start` - Start a quiz
- POST `/api/quizzes/:id/submit` - Submit quiz answers
- GET `/api/quizzes/:id/response` - Get quiz attempt details

## Security Features
- Password hashing using scrypt
- Session-based authentication
- Rate limiting to prevent abuse
- Input validation using Zod schemas
- Protected routes for admin access

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.
