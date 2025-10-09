const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ CORS setup (safe)
// Read allowed origins from env CORS_ORIGINS (comma-separated) or use defaults.
const defaultOrigins = [
  'https://unihost-project.vercel.app',
  'http://localhost:5173',
];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Serve uploaded files when Cloudinary isn't used
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Multer error handler for clearer messages
app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    const code = err.code || 'UPLOAD_ERROR';
    let message = 'Upload failed';
    if (code === 'LIMIT_FILE_SIZE') message = 'File too large. Max ~200MB total per request.';
    if (code === 'LIMIT_UNEXPECTED_FILE') message = `Unexpected file field: ${err.field || 'unknown'}`;
    return res.status(400).json({ message, code });
  }
  return next(err);
});

// ✅ Main API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hostels', require('./routes/hostelRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

module.exports = app;
