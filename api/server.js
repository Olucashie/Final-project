// server.js

const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const app = require('./app');

dotenv.config();

// ✅ Apply CORS before any routes
const allowedOrigins = [
  'https://unihost-project.vercel.app',
  'http://localhost:5173', // for local frontend testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      return callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

// Parse JSON before your routes
app.use(require('express').json());

const PORT = process.env.PORT || 'https://final-project-00.onrender.com';

// ✅ Start after DB connects
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ API listening on port ${PORT}`));
});
