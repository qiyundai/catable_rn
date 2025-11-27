const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'src', 'assets', 'icons');

// Get all SVG files
const svgFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

console.log(`Found ${svgFiles.length} SVG files to process...\n`);

svgFiles.forEach(filename => {
  const filePath = path.join(iconsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Create a unique prefix from the filename (remove .svg, replace spaces/special chars)
  const prefix = filename
    .replace('.svg', '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  
  // Find all IDs in the file
  const idPattern = /id="([^"]*)"/g;
  const ids = new Set();
  let match;
  
  while ((match = idPattern.exec(content)) !== null) {
    ids.add(match[1]);
  }
  
  if (ids.size === 0) {
    console.log(`${filename}: No IDs found, skipping`);
    return;
  }
  
  // Replace each ID with a prefixed version
  ids.forEach(oldId => {
    const newId = `${prefix}_${oldId}`;
    
    // Replace id="oldId" with id="newId"
    content = content.replace(new RegExp(`id="${oldId}"`, 'g'), `id="${newId}"`);
    
    // Replace #oldId references (in url() and xlink:href)
    content = content.replace(new RegExp(`url\\(#${oldId}\\)`, 'g'), `url(#${newId})`);
    content = content.replace(new RegExp(`xlink:href="#${oldId}"`, 'g'), `xlink:href="#${newId}"`);
    content = content.replace(new RegExp(`href="#${oldId}"`, 'g'), `href="#${newId}"`);
  });
  
  // Write the updated content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`${filename}: Updated ${ids.size} IDs with prefix "${prefix}_"`);
});

console.log('\n✅ All SVG files updated with unique IDs!');

