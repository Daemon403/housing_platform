# Student Housing Platform

A full-stack platform connecting university students with local homeowners for off-campus housing.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Role-Based Access Control**: Students, Homeowners, and Admins
- **Property Listings**: Browse and search available properties
- **Booking System**: Reserve properties with date selection
- **Reviews & Ratings**: Leave feedback on properties and users
- **Messaging**: Direct communication between users
- **Payments**: Secure payment processing
- **Admin Dashboard**: Manage users, listings, and content

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL with Sequelize ORM
- JWT Authentication
- Redis for caching
- AWS S3 for file storage
- Nodemailer for emails
- Jest for testing

### Frontend (Coming Soon)
- React.js with Next.js
- Redux for state management
- Material-UI for components
- Mapbox for maps
- Stripe for payments

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- Redis
- AWS S3 bucket (for file uploads)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/student-housing-platform.git
   cd student-housing-platform
   ```

2. Install dependencies
   ```bash
   cd server
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. Set up database
   ```bash
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## API Documentation

API documentation is available at `/api-docs` when running the development server.

## Project Structure

```
student-housing-platform/
├── server/                    # Backend server
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   ├── server.js             # Main server file
│   └── .env.example          # Environment variables example
├── client/                   # Frontend (coming soon)
└── README.md                 # This file
```

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_housing
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@studenthousing.com

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Payment Gateway
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/yourusername/student-housing-platform](https://github.com/yourusername/student-housing-platform)
