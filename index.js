const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://os.netlabdte.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint that doesn't require DB
app.get('/health', (req, res) => {
  const db = require('./src/database/pg.database');
  res.status(200).json({ 
    status: 'online', 
    database: db.isConnected() ? 'connected' : 'disconnected'
  });
});

// Delayed route loading to give DB time to connect
setTimeout(() => {
  // Register routes
  app.use('/store', require('./src/routes/store.route'));
  app.use('/user', require('./src/routes/user.route'));
  app.use('/item', require('./src/routes/item.route'));
  app.use('/transaction', require('./src/routes/transaction.route'));
  
  console.log('✅ Routes registered successfully');
}, 1000);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    payload: null
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    payload: process.env.NODE_ENV === 'development' ? { error: err.message } : null
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});