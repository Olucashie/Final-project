const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const cors = require('cors');

app.use(cors({
  origin: 'https://unihost-project.vercel.app',
  credentials: true
}));
dotenv.config();

const PORT = 'https://final-project-00.onrender.com';

connectDB().then(() => {
	app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
});
