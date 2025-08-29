const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    email: {
      type: DataTypes.STRING,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    role: {
      type: DataTypes.ENUM('student', 'homeowner', 'admin'),
      defaultValue: 'student'
    },
    password: {
      type: DataTypes.STRING,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false // Don't return password by default
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE,
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'banned'),
      defaultValue: 'active'
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  });

  // Encrypt password using bcrypt before saving
  User.beforeSave(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Sign JWT and return
  User.prototype.getSignedJwtToken = function() {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  };

  // Match user entered password to hashed password in database
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Generate and hash password token
  User.prototype.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };

  // Generate email verification token
  User.prototype.getEmailVerificationToken = function() {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to verificationToken field
    this.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    return verificationToken;
  };

  // Define associations
  User.associate = (models) => {
    User.hasMany(models.Listing, {
      foreignKey: 'ownerId',
      as: 'listings'
    });
    
    User.hasMany(models.Booking, {
      foreignKey: 'studentId',
      as: 'bookings'
    });
    
    User.hasMany(models.Review, {
      foreignKey: 'reviewerId',
      as: 'reviewsGiven'
    });
    
    User.hasMany(models.Review, {
      foreignKey: 'revieweeId',
      as: 'reviewsReceived'
    });
    
    User.hasMany(models.MaintenanceRequest, {
      foreignKey: 'requesterId',
      as: 'maintenanceRequests'
    });
    
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'sentMessages'
    });
    
    User.hasMany(models.Message, {
      foreignKey: 'receiverId',
      as: 'receivedMessages'
    });
  };

  return User;
};
