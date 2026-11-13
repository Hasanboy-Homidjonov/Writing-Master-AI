import fs from 'fs';

if (fs.existsSync('dist/assets')) {
  fs.cpSync('dist/assets', 'assets', { recursive: true });
}
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/index.html');
}
console.log('✅ Assets synced successfully');
