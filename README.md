# Student Housing Platform

A comprehensive full-stack platform designed to connect university students with property owners for off-campus housing solutions. This platform streamlines the process of finding, viewing, and securing student accommodations while providing property owners with robust tools to manage their listings.

## ✨ Features

### For Students
- 🏠 Browse and search student-friendly housing options
- 🔍 Advanced filtering by price, location, amenities, and more
- ❤️ Save favorite properties for easy access
- 📅 Schedule property viewings
- 💬 Direct messaging with property owners
- ⭐ Leave reviews and ratings

### For Property Owners
- 🏘️ Create and manage property listings
- 📊 Dashboard for tracking listings and inquiries
- 📱 Mobile-responsive property management
- 📅 Booking and availability calendar
- 💬 Integrated messaging system

### For Administrators
- 👥 User management
- 🏢 Property listing moderation
- 📈 Analytics and reporting
- ⚙️ System configuration

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js with TypeScript
- 🎨 Tailwind CSS for styling
- 🔄 React Query for server state management
- 🏗️ Vite for build tooling
- 📱 Fully responsive design

### Backend
- 🚀 Node.js with Express
- 🔐 JWT Authentication
- 🗄️ PostgreSQL with Sequelize ORM
- 📦 AWS S3 for file storage
- 📧 Nodemailer for email notifications
- 📝 Swagger/OpenAPI documentation

### DevOps
- 🐳 Docker for containerization
- 🔄 GitHub Actions for CI/CD
- 📊 Monitoring and logging
- 🔒 Environment-based configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- AWS S3 bucket (for file uploads)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/student-housing-platform.git
   cd student-housing-platform
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # In one terminal (backend)
   cd backend
   npm run dev

   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - API Documentation: http://localhost:3000/api-docs

## 📚 Documentation

### API Documentation
Interactive API documentation is available at `/api-docs` when running the development server. The API follows RESTful principles and uses JSON for data exchange.

### Project Structure

```
student-housing-platform/
├── backend/                  # Backend server
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── server.ts            # Main server file
│
├── frontend/                # Frontend application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   └── vite.config.ts      # Vite configuration
│
├── .github/                 # GitHub workflows and templates
├── docker/                  # Docker configuration
├── docs/                   # Additional documentation
└── README.md               # This file
```

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_housing
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
# Add other frontend environment variables here
```

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

Project Link: [https://github.com/daemon403/student-housing-platform](https://github.com/daemon403/student-housing-platform)
