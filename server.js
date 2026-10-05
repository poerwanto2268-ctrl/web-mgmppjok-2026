import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const distDir = path.resolve(__dirname, 'dist');

// Middleware to serve static files from dist
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Health check endpoint for Cloud Run
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// All other GET requests serve index.html for SPA routing
app.get('*', (_req, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('MGMP PJOK SMP Purbalingga - Application is initializing...');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[Production Server] Listening on 0.0.0.0:${port}`);
});
