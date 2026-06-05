const http = require('http');
const fs = require('fs');
const path = require('path');
const DESKTOP = 'C:/Users/Rodrigo Cruz/Desktop';
http.createServer((req, res) => {
  const file = path.join(DESKTOP, decodeURIComponent(req.url.slice(1)));
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Access-Control-Allow-Origin', '*');
  fs.createReadStream(file).pipe(res);
}).listen(9999, () => console.log('PDF server ready on :9999'));
