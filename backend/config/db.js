// config/db.js
const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://docflow4:codewarrior69@cluster0.jbz4kgu.mongodb.net/?appName=Cluster0'; // or from .env

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB; // Export the function