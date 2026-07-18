'use strict';
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    // accept any image/* mimetype, plus common types browsers may report differently
    if (file.mimetype.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|bmp|svg|ico)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const base = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${base}/uploads/${req.file.filename}` });
});

module.exports = router;
