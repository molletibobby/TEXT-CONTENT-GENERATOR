const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Configure Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// Supported Media File Extensions & Mime Types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff',
  // Document PDFs
  'application/pdf',
  // Video
  'video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac'
];

// File Filter Function
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file format (${file.mimetype}). Please upload an image, scanner PDF, video (≤29s), or audio file.`, 400), false);
  }
};

// Multer Upload Instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024 // 50MB
  }
});

module.exports = upload;
