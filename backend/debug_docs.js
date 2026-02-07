const mongoose = require('mongoose');
const Document = require('./Models/Document');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/deckflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to DB');
  const docs = await Document.find({}).sort({ submissionDate: -1 }).limit(5);
  console.log('Recent Documents:');
  docs.forEach(doc => {
    console.log(`Title: ${doc.title}`);
    console.log(`FileUrl: ${doc.fileUrl}`);
    console.log(`ID: ${doc._id}`);
    console.log('---');
  });
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
