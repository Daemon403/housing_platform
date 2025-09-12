const nodemailer = require('nodemailer');
const logger = require('./logger');

// In development, avoid outbound SMTP connections; use JSON transport instead
let transporter;
if (process.env.NODE_ENV !== 'production') {
  transporter = nodemailer.createTransport({ jsonTransport: true });
  logger.info('Email transporter: JSON transport (development)');
} else {
  // Create a transporter object using SMTP in production
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
    tls: {
      // Do not fail on invalid certs outside production
      rejectUnauthorized: true,
    },
  });
}

// Verify connection configuration only in production with SMTP host configured
if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
  transporter.verify(function (error, success) {
    if (error) {
      logger.error('SMTP connection error:', error);
    } else {
      logger.info('SMTP server is ready to take our messages');
    }
  });
}

// Send email function
const sendEmail = async (options) => {
  try {
    // If in development, log the email instead of sending
    if (process.env.NODE_ENV === 'development') {
      logger.info('Email not sent in development mode. Email details:', {
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      return { messageId: 'simulated-message-id' };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      // Attachments can be added like this:
      // attachments: [
      //   {
      //     filename: 'text1.txt',
      //     content: 'hello world!'
      //   }
      // ]
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

// Email templates
const emailTemplates = {
  welcome: (user, url) => ({
    subject: 'Welcome to Student Housing Platform',
    html: `
      <h1>Welcome to Student Housing Platform!</h1>
      <p>Hello ${user.name},</p>
      <p>Thank you for signing up! We're excited to have you on board.</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  }),
  passwordReset: (user, url) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hello ${user.name},</p>
      <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
      <p>Please click the button below to reset your password:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `,
  }),
  bookingConfirmation: (user, booking) => ({
    subject: 'Booking Confirmation',
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hello ${user.name},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <ul>
        <li>Property: ${booking.listing.title}</li>
        <li>Check-in: ${new Date(booking.startDate).toLocaleDateString()}</li>
        <li>Check-out: ${new Date(booking.endDate).toLocaleDateString()}</li>
        <li>Total Amount: $${booking.totalAmount}</li>
      </ul>
      <p>Thank you for using our platform!</p>
    `,
  }),
  // Add more email templates as needed
};

module.exports = {
  sendEmail,
  emailTemplates,
};
