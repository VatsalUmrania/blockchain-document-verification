// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DocVerify API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'API endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DocVerify API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});
