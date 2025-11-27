/**
 * Post-export script for web builds
 * Runs after `expo export --platform web` to:
 * 1. Fix asset paths for static hosting
 * 2. Move the dist folder to web-build
 * 
 * This script is cross-platform (works on Windows, Mac, Linux)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const webBuildDir = path.join(projectRoot, 'web-build');

// Step 1: Run the path fix script
console.log('Fixing web build paths...');
require('./fix-web-build-paths.js');

// Step 2: Move dist to web-build
console.log('\nMoving dist to web-build...');

// Remove existing web-build if it exists
if (fs.existsSync(webBuildDir)) {
  fs.rmSync(webBuildDir, { recursive: true, force: true });
  console.log('Removed existing web-build folder');
}

// Copy dist to web-build (more reliable than move on Windows)
if (fs.existsSync(distDir)) {
  copyFolderSync(distDir, webBuildDir);
  console.log('Copied dist to web-build');
  
  // Try to remove dist folder
  try {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('Removed dist folder');
  } catch (e) {
    console.log('Note: Could not remove dist folder (this is okay)');
  }
} else {
  console.error('Error: dist folder not found!');
  process.exit(1);
}

console.log('\n✅ Web build ready in web-build folder!');

// Helper function to copy folder recursively
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

