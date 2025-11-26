const fs = require('fs');
const path = require('path');

const webBuildDir = path.join(__dirname, '..', 'web-build');

// Find all JavaScript files in the web-build directory
function findJSFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Replace absolute paths with relative paths
function fixPaths(content) {
  // Replace "/assets/ with "./assets/
  content = content.replace(/["']\/assets\//g, '"./assets/');
  
  // Replace "/_expo/ with "./_expo/
  content = content.replace(/["']\/_expo\//g, '"./_expo/');
  
  // Replace "/favicon.ico with "./favicon.ico
  content = content.replace(/["']\/favicon\.ico/g, '"./favicon.ico');
  
  // Replace any other absolute paths that start with "/" and are asset-like
  // This handles cases like "/static/" or other Expo paths
  content = content.replace(/["']\/(static|_next|assets|_expo)/g, '"./$1');
  
  return content;
}

// Process all JavaScript files
const jsFiles = findJSFiles(webBuildDir);
let totalReplacements = 0;

for (const filePath of jsFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const fixedContent = fixPaths(content);
  
  if (originalContent !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    const replacements = (originalContent.match(/["']\/assets\/|["']\/_expo\/|["']\/favicon\.ico/g) || []).length;
    totalReplacements += replacements;
    console.log(`Fixed ${replacements} paths in ${path.relative(webBuildDir, filePath)}`);
  }
}

// Also fix the HTML file if needed
const indexPath = path.join(webBuildDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  const originalHtml = htmlContent;
  
  // Ensure base tag is set correctly
  if (!htmlContent.includes('<base href')) {
    htmlContent = htmlContent.replace('<head>', '<head>\n    <base href="./" />');
  }
  
  // Fix any absolute paths in HTML
  htmlContent = htmlContent.replace(/href=["']\/(assets|_expo|favicon)/g, 'href="./$1');
  htmlContent = htmlContent.replace(/src=["']\/(assets|_expo|favicon)/g, 'src="./$1');
  
  if (originalHtml !== htmlContent) {
    fs.writeFileSync(indexPath, htmlContent, 'utf8');
    console.log('Fixed paths in index.html');
  }
}

console.log(`\n✅ Fixed ${totalReplacements} absolute paths in ${jsFiles.length} JavaScript files`);

