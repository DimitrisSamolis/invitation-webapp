# Invitation Web App

A full-stack Angular 20 application for creating custom invitation web apps with an admin dashboard.

## Tech Stack

- **Frontend**: Angular 20 with standalone components, Angular Material
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication

## Project Structure

```bash
invitation-webapp/
├── frontend/              # Angular 20 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Shared components
│   │   │   ├── guards/        # Route guards
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   ├── pages/         # Page components
│   │   │   └── services/      # API services
│   │   ├── environments/      # Environment configs
│   │   └── styles.scss        # Global styles
│   └── package.json
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Entry point
│   ├── .env               # Environment variables
│   └── package.json
└── README.md
```

## Features

- ✅ Create and customize invitations
- ✅ Multiple event types (wedding, birthday, corporate, party)
- ✅ Guest management
- ✅ RSVP tracking with status updates
- ✅ Admin dashboard with statistics
- ✅ Custom themes with color picker
- ✅ JWT authentication
- ✅ Responsive Material Design

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:

   ```bash
   MONGODB_URI=mongodb://localhost:27017/invitation-webapp
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open <http://localhost:4200> in your browser

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Invitations

- `GET /api/invitations` - Get all invitations
- `GET /api/invitations/:id` - Get invitation by ID
- `POST /api/invitations` - Create invitation (auth required)
- `PUT /api/invitations/:id` - Update invitation (auth required)
- `DELETE /api/invitations/:id` - Delete invitation (auth required)
- `GET /api/invitations/stats` - Get dashboard statistics (auth required)

### Guests

- `GET /api/guests` - Get all guests (auth required)
- `GET /api/guests/invitation/:id` - Get guests by invitation (auth required)
- `POST /api/guests/rsvp/:invitationId` - Submit RSVP (public)
- `PATCH /api/guests/:id/status` - Update guest status (auth required)

### Themes

- `GET /api/themes` - Get all themes
- `POST /api/themes` - Create theme (auth required)
- `PUT /api/themes/:id` - Update theme (auth required)
- `DELETE /api/themes/:id` - Delete theme (auth required)

## Default Admin Credentials

After first launch, register a new admin account through the web interface.

## License

MIT
