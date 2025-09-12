const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  logger.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized';
    error = new ErrorResponse(message, 401);
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Session expired, please login again';
    error = new ErrorResponse(message, 401);
  }

  const status = error.statusCode || 500;
  const payload = {
    success: false,
    error: error.message || 'Server Error'
  };
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
    payload.name = err.name;
  }
  res.status(status).json(payload);
};

module.exports = errorHandler;
