const mongoose = require('mongoose');

const fixDocs = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/deckflow');
    console.log('Connected to MongoDB');
    
    const Document = mongoose.model('Document', new mongoose.Schema({
      fileUrl: String,
      fileType: String
    }), 'documents');

    const docs = await Document.find({ 
      $or: [
        { fileType: { $exists: false } }, 
        { fileType: null },
        { fileType: 'undefined' }
      ] 
    });
    console.log(`Found ${docs.length} docs to fix`);
    
    for (const doc of docs) {
      if (!doc.fileUrl) continue;
      
      let type = 'application/pdf';
      const lowercaseUrl = doc.fileUrl.toLowerCase();
      if (lowercaseUrl.endsWith('.jpg') || lowercaseUrl.endsWith('.jpeg')) type = 'image/jpeg';
      else if (lowercaseUrl.endsWith('.png')) type = 'image/png';
      
      doc.fileType = type;
      await doc.save();
      console.log(`Fixed doc ${doc._id} (${doc.title}) with type ${type}`);
    }
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error(err);
  }
};

fixDocs();
