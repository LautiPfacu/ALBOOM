import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, /api/spotify corre con el mismo archivo que usa Vercel en producción (api/spotify.js).
// Así alcanza con `npm run dev` y la clave secreta de Spotify nunca pasa por el navegador.
function spotifyApiInDev(env) {
  return {
    name: 'alboom-spotify-api-dev',
    configureServer(server) {
      for (const key of ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET']) {
        if (env[key]) process.env[key] = env[key];
      }

      server.middlewares.use('/api/spotify', async (req, res) => {
        try {
          const { default: handler } = await server.ssrLoadModule('/api/spotify.js');
          await handler(req, res);
        } catch (error) {
          server.config.logger.error(error.stack || String(error));
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Falló /api/spotify. Mirá el error en la terminal.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // El tercer parámetro '' carga también las variables sin prefijo VITE_ (solo para Node, no para el navegador).
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), spotifyApiInDev(env)],
  };
});
