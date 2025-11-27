/**
 * Script to extract PNG images from SVG files
 * 
 * The SVG files contain embedded base64 images. This script extracts them
 * and saves as PNG files for use on web.
 * 
 * Run: node scripts/convert-svg-to-png.js
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'src', 'assets', 'icons');
const pngDir = path.join(__dirname, '..', 'src', 'assets', 'icons-png');

// Create PNG directory if it doesn't exist
if (!fs.existsSync(pngDir)) {
  fs.mkdirSync(pngDir, { recursive: true });
}

// Get all SVG files
const svgFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

console.log(`Found ${svgFiles.length} SVG files to process...\n`);

svgFiles.forEach(filename => {
  const filePath = path.join(iconsDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract base64 image data from the SVG
  // Pattern: xlink:href="data:image/png;base64,..."
  const base64Match = content.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  
  if (base64Match) {
    const base64Data = base64Match[1];
    const pngFilename = filename.replace('.svg', '.png');
    const pngPath = path.join(pngDir, pngFilename);
    
    // Decode base64 and write PNG file
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`✅ ${filename} -> ${pngFilename}`);
  } else {
    console.log(`⚠️  ${filename}: No embedded PNG found (may be vector-only)`);
  }
});

console.log(`\n✅ PNG files saved to: src/assets/icons-png/`);

