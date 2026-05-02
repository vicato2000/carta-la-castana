import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    // Dev-only plugin: saves menu.json to disk when admin edits
    {
      name: 'save-menu-json',
      configureServer(server) {
        server.middlewares.use('/api/save-menu', (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405);
            res.end();
            return;
          }
          let body = '';
          req.on('data', (chunk: string) => (body += chunk));
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(
                './public/data/menu.json',
                JSON.stringify(parsed, null, 2) + '\n',
                'utf-8'
              );
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
            } catch {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        });
      },
    },
  ],
})
