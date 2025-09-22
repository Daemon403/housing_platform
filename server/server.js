const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config({ path: '.env' });

// Debug: print essential env
console.log('[BOOT] NODE_ENV=', process.env.NODE_ENV, ' PORT=', process.env.PORT);

// Attach basic process listeners
process.on('exit', (code) => console.log('[BOOT] Process exit with code', code));
process.on('uncaughtException', (err) => console.error('[BOOT] UncaughtException', err));
process.on('unhandledRejection', (reason) => console.error('[BOOT] UnhandledRejection', reason));

// Import database connection
console.log('[BOOT] Requiring models...');
const db = require('./models');
console.log('[BOOT] Models required.');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const bookingRoutes = require('./routes/bookings');
const rentalRoutes = require('./routes/rentalRoutes');

// Initialize Express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS (support multiple origins via comma-separated FRONTEND_URL)
const allowedOrigins = [
  'http://localhost:3000', // Default Vite dev server
  'http://localhost:5000', // Default backend port
  'http://localhost:5173', // Common Vite dev port
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : [])
].filter(Boolean);

console.log('[BOOT] CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development, you might want to be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[CORS] Allowing origin in development: ${origin}`);
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Serve static files with proper path resolution
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// Serve uploaded files with proper caching and path resolution
const uploadsPath = path.join(publicPath, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set proper cache control for uploaded files
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Log file serving for debugging
    console.log(`Serving file: ${filePath}`);
  }
}));

// Log paths for debugging
console.log('Public directory:', publicPath);
console.log('Uploads directory:', uploadsPath);

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/rentals', rentalRoutes);

// Error handler middleware (should be after all other middleware and routes)
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('[BOOT] Authenticating database...');
    // Test database connection
    await db.sequelize.authenticate();
    logger.info('Database connected...');

    // Sync database (set force: false in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[BOOT] Syncing database...');
      await db.sequelize.sync({ force: false });
      logger.info('Database synced');
    }

    console.log('[BOOT] Starting HTTP server on port', PORT);
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
