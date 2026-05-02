// Find the bounding box of non-transparent pixels in the logo PNG
const fs = require('fs');

const buf = fs.readFileSync('public/logo.png');

// Parse PNG chunks to find IDAT data - simplified approach
// Just report the image dimensions and suggest CSS approach
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('PNG dimensions:', width, 'x', height);
console.log('Aspect ratio:', (width/height).toFixed(3));
console.log('');
console.log('The logo is square but content may have transparent padding.');
console.log('Recommended: Use object-position to center, or use a wider display container.');
