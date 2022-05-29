// @ts-check
import { exec } from 'child_process';
import liveServer from 'live-server';
import path from 'path';

/**
 * @type {liveServer.LiveServerParams}
 */
const params = {
  port: 3200, // Set the server port. Defaults to 8080.
  host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: path.resolve(process.cwd(), '../'), // Set root directory that's being served. Defaults to cwd.
  ignore: '**/.git/**', // comma-separated string for paths to ignore
  open: false,
  file: 'github-demo/index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  wait: 0, // Waits for all changes, before reloading. Defaults to 0 sec.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
};
liveServer.start(params);

exec(`open http://localhost:${params.port}/github-demo/index.html`);
