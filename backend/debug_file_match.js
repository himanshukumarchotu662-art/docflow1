const mongoose = require('mongoose');
const Document = require('./Models/Document');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/deckflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to DB');
  
  // Get latest document
  const doc = await Document.findOne({}).sort({ submissionDate: -1 });
  
  if (!doc) {
    console.log('No documents found in DB');
    process.exit();
  }
  
  console.log('--- DB Record ---');
  console.log(`Title: ${doc.title}`);
  console.log(`FileUrl: ${doc.fileUrl}`);
  console.log(`Expected Filename: ${doc.fileUrl.replace('/uploads/', '')}`);
  
  // Check disk
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory DOES NOT EXIST');
    process.exit();
  }
  
  const files = fs.readdirSync(uploadsDir);
  console.log('--- Disk Files ---');
  files.forEach(f => console.log(f));
  
  // Comparison
  const expectedFilename = doc.fileUrl.replace('/uploads/', '');
  if (files.includes(expectedFilename)) {
    console.log('✅ MATCH: File exists on disk');
  } else {
    console.log('❌ MISMATCH: File NOT found on disk');
  }
  
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
