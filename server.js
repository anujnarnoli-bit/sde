const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8000);
const HOST = '0.0.0.0';
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const applications = [];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

function validateApplication(body) {
  const requiredStrings = ['fullName', 'email', 'stack', 'pitch'];
  for (const key of requiredStrings) {
    if (typeof body[key] !== 'string' || body[key].trim().length === 0) {
      return `Invalid or missing field: ${key}`;
    }
  }

  if (!Number.isFinite(body.experience) || body.experience < 0 || body.experience > 40) {
    return 'Experience must be a number between 0 and 40.';
  }

  if (!Array.isArray(body.skills) || body.skills.length === 0) {
    return 'At least one skill is required.';
  }

  if (body.pitch.trim().length < 40) {
    return 'Pitch should be at least 40 characters.';
  }

  return '';
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);

  if (req.method === 'POST' && url.pathname === '/api/applications') {
    try {
      const body = await parseJsonBody(req);
      const error = validateApplication(body);
      if (error) {
        sendJson(res, 400, { error });
        return;
      }

      const record = {
        id: applications.length + 1,
        fullName: body.fullName.trim(),
        email: body.email.trim(),
        experience: body.experience,
        stack: body.stack.trim(),
        skills: body.skills,
        pitch: body.pitch.trim(),
        submittedAt: new Date().toISOString(),
      };

      applications.push(record);
      sendJson(res, 201, {
        message: 'Application stored successfully.',
        applicationId: record.id,
      });
      return;
    } catch (error) {
      const code = error.message === 'Payload too large' ? 413 : 400;
      sendJson(res, code, { error: error.message });
      return;
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/applications') {
    sendJson(res, 200, { count: applications.length, applications });
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(requestedPath).replace(/^\.+/, '');
  const finalPath = path.join(ROOT, safePath);

  if (!finalPath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  serveFile(res, finalPath);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
