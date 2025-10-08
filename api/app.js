const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load env early so CORS origins can come from env
dotenv.config();

const app = express();

// Configure CORS using environment variable or sensible defaults
// Set CORS_ORIGINS to a comma-separated list in your environment (e.g. https://unihost-project.vercel.app)
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://unihost-project.vercel.app').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (like curl) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Serve uploaded files when Cloudinary isn't used
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer error handler for clearer messages
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

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hostels', require('./routes/hostelRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

module.exports = app;
