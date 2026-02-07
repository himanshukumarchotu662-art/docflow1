// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'], // All common frontend ports
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Database connection
mongoose.connect('mongodb://localhost:27017/deckflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('💡 Make sure MongoDB is running:');
  console.log('   Windows: Run "services.msc" and start MongoDB service');
  console.log('   Or run: "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe"');
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    app: 'DeckFlow',
    description: 'Presentation and Slide Deck Management System',
    status: '🚀 Backend API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      health: 'GET /health',
      test: 'GET /api/test',
      api: 'All routes under /api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: process.memoryUsage()
  });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoint test successful!',
    data: {
      sample: 'This is test data from DeckFlow backend',
      items: ['Presentation', 'Slides', 'Templates', 'Collaboration'],
      count: 4
    }
  });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Check / endpoint for available routes'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎉 DeckFlow Backend Server Started!`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toLocaleTimeString()}`);
  console.log(`\n🔗 Available endpoints:`);
  console.log(`   • Home: http://localhost:${PORT}/`);
  console.log(`   • Health: http://localhost:${PORT}/health`);
  console.log(`   • Test API: http://localhost:${PORT}/api/test`);
  console.log(`\n📝 Press Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server gracefully...');
  mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});