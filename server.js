const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const authRoutes = require('./routes/auth');
const quotationRoutes = require('./routes/quotation');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;