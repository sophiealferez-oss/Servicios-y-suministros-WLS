const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB()
.then(db => {
  global.dbConnection = db; // Store connection globally for use in models
  console.log('Database connected');
})
.catch(err => console.error('Database connection error', err));

// Import routes
const authRoutes = require('./routes/auth');
const quotationRoutes = require('./routes/quotation');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Machinery Rental API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});