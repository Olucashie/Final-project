const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ Define all allowed origins
const allowedOrigins = [
  'https://unihost-project.vercel.app',
  'http://localhost:5173', // for local frontend testing
];

// ✅ CORS setup
app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (like curl or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Handle preflight (OPTIONS) requests
app.options('*', cors());

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
