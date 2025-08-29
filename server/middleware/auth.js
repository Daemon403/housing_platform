const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models').User;

// Protect routes - User must be logged in
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is the owner of a resource or admin
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      const resource = await model.findByPk(req.params[paramName]);
      
      if (!resource) {
        return next(
          new ErrorResponse('Resource not found', 404)
        );
      }

      // Check if the resource has an ownerId field
      if (resource.ownerId && resource.ownerId === req.user.id) {
        return next();
      }
      
      // Check if the resource has a userId field
      if (resource.userId && resource.userId === req.user.id) {
        return next();
      }
      
      // For student-specific resources
      if (resource.studentId && resource.studentId === req.user.id) {
        return next();
      }

      return next(
        new ErrorResponse('Not authorized to access this resource', 403)
      );
    } catch (err) {
      return next(err);
    }
  };
};
