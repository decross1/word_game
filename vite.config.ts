import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// A simple middleware to parse JSON POST bodies
function jsonParser(req: any, res: any, next: any) {
  if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        next();
      } catch (e) {
        res.statusCode = 400;
        res.end('Invalid JSON');
      }
    });
  } else {
    next();
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sokoban-map-reporter-plugin',
      configureServer(server) {
        server.middlewares.use(jsonParser);

        server.middlewares.use('/api/report-map', (req: any, res: any) => {
          if (req.method !== 'POST') {
            res.statusCode = 405; // Method Not Allowed
            return res.end();
          }

          const { board, playerStart } = req.body;
          if (!board || !playerStart) {
            res.statusCode = 400;
            return res.end('Missing board or playerStart data in request body.');
          }

          const mapDataString = `\n\nexport const reportedMap${Date.now()} = {\n  board: [\n${board.map((row: any) => `    '${row.join('')}'`).join(',\n')}\n  ],\n  playerStart: [${playerStart[0]}, ${playerStart[1]}],\n};`;

          const filePath = path.resolve(__dirname, 'src/levels/reportedMaps.ts');

          fs.appendFile(filePath, mapDataString, (err: any) => {
            if (err) {
              console.error('Failed to save reported map:', err);
              res.statusCode = 500;
              return res.end('Failed to save map to file.');
            }
            console.log(`Successfully appended reported map to ${filePath}`);
            res.statusCode = 200;
            res.end('Map reported and saved successfully.');
          });
        });
      },
    },
  ],
});
