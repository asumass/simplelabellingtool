const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;

  if (filePath === './') {
    filePath = './index.html'; // Serve index.html as the default page
  }

  const contentType = getContentType(filePath);
  const encoding = getEncoding(contentType);

  fs.readFile(filePath, encoding, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

function getContentType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    default:
      return 'text/plain';
  }
}

function getEncoding(contentType) {
  if (contentType.includes('text')) {
    return 'utf-8';
  }
  return 'binary';
}
