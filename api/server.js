const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const cors = require('cors');

app.use(cors({
  origin: 'https://unihost-project.vercel.app',
  credentials: true
}));
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
	app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
});
