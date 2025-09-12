const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure upload directory exists
const publicDir = path.resolve(__dirname, '..', 'public');
const uploadDir = process.env.FILE_UPLOAD_PATH || path.join(publicDir, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadDir}`);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${base}-${unique}${ext}`;
    console.log(`Saving file: ${filename}`);
    cb(null, filename);
  }
});

// Optional file filter (basic)
const fileFilter = (req, file, cb) => {
  // Accept common image types and pdf/doc for now
  const allowed = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(null, true); // allow all for now; tighten if needed
};

const limits = {
  files: Number(process.env.MAX_FILE_UPLOAD) || 5,
  fileSize: 10 * 1024 * 1024 // 10MB per file
};

const upload = multer({ storage, fileFilter, limits });

module.exports = { upload, uploadDir };
