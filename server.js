const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8086;
const HOST = '0.0.0.0';
const PUBLISH_DIR = path.join(__dirname, 'publish');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(PUBLISH_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexPath = path.join(PUBLISH_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Dynamic Forms Web UI running at http://${HOST}:${PORT}/`);
});
