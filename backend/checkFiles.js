const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadsDir);

console.log(`Checking ${files.length} files in ${uploadsDir}`);

files.forEach(file => {
  const filePath = path.join(uploadsDir, file);
  const stats = fs.statSync(filePath);
  const buffer = Buffer.alloc(4);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);
  
  const header = buffer.toString();
  const isValid = header === '%PDF';
  
  console.log(`${file} | Size: ${stats.size} | Header: ${header} | Valid PDF: ${isValid}`);
  
  if (!isValid && stats.size < 1000) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`  Content: ${content.substring(0, 100)}...`);
  }
});
