const fs = require('fs');
const path = require('path');

// Create public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Files and folders to copy
const itemsToCopy = [
  'index.html',
  'styles.css',
  'script.js',
  'imagenes_maquinaria',
  'imaganes maquina',
  'background',
  'fondo',
  'logo'
];

// Copy each item
itemsToCopy.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(publicDir, item);
  
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`✅ Copied: ${item}`);
  } else {
    console.log(`⚠️ Not found: ${item}`);
  }
});

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('✅ Build complete!');
