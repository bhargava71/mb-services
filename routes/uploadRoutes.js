import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import protect from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 20);
    cb(null, `${cleanBaseName}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const isExtAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeAllowed = allowedTypes.test(file.mimetype);

  if (isExtAllowed && isMimeAllowed) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are supported!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

// @desc    Upload local image file
// @route   POST /api/upload
// @access  Protected (Authenticated users / Admins)
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded',
    });
  }

  // Generate full URL
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: fileUrl,
      path: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
    },
  });
});

export default router;
