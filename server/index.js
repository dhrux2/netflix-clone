import { createApp } from './app.js';

const { app, db } = createApp();
const port = Number(process.env.PORT || 3001);
const server = app.listen(port, '127.0.0.1', () =>
  console.log(`Afterglow API: http://127.0.0.1:${port}`),
);
function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
