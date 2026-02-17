const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

connectDB()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error', err));

const authRoutes = require('./routes/auth');
const quotationRoutes = require('./routes/quotation');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/contact', contactRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
