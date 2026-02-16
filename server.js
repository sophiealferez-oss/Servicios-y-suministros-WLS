const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error', err));

const authRoutes = require('./routes/auth');
const quotationRoutes = require('./routes/quotation');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('Machinery Rental API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
