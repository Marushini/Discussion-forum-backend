// Import Dependencies
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Initialize App and Load Environment Variables
dotenv.config();
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const replyRoutes = require('./routes/replies');

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/replies', replyRoutes);

// **Root Route (Fix for 404 Error)**
app.get('/', (req, res) => {
  res.send('Welcome to the Discussion Forum API!');
});

// **404 Error Handler**
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
