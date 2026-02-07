const mongoose = require('mongoose');

const checkDocs = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/deckflow');
    console.log('Connected to MongoDB');
    
    // Define a minimal schema
    const Document = mongoose.model('Document', new mongoose.Schema({
      title: String,
      fileUrl: String,
      fileName: String,
      status: String
    }), 'documents');

    const docs = await Document.find({});
    console.log(`Found ${docs.length} documents`);
    docs.forEach(doc => {
      console.log(`${doc._id} | ${doc.title} | ${doc.fileType} | ${doc.fileUrl}`);
    });
    console.log('--- END ---');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkDocs();
