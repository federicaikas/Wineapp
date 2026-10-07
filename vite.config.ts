import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function syncDbPlugin() {
  return {
    name: 'sync-db-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/sync-wines', (req: any, res: any, next: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const wines = JSON.parse(body);
              const tsContent = `import type { WineBottle } from '../types/wine';\n\nexport const SEED_WINES: WineBottle[] = ${JSON.stringify(wines, null, 2)};\n`;
              const targetPath = path.resolve(process.cwd(), 'src/db/seedWines.ts');
              fs.writeFileSync(targetPath, tsContent, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncDbPlugin()],
  server: {
    port: 5173,
    host: true, // Esponi su localhost e rete locale (IP) per mobile testing
  },
  css: {
    devSourcemap: true, // Source maps per i CSS
  },
  build: {
    sourcemap: true, // Source maps per TypeScript e JavaScript
  },
})
