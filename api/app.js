const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors("*"));
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
