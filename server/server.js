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

// Initialize Express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS (support multiple origins via comma-separated FRONTEND_URL)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
console.log('[BOOT] CORS allowed origins:', allowedOrigins);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/bookings', bookingRoutes);

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
