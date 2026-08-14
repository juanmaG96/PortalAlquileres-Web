import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
// Importamos el nuevo motor de SSR de Angular 19
import { AngularNodeAppEngine, writeResponseToNodeResponse } from '@angular/ssr/node';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  const angularApp = new AngularNodeAppEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));

  server.use('/**', (req, res, next) => {
    angularApp.handle(req)
      .then((response: Response | null) => {
        if (response) {
          writeResponseToNodeResponse(response, res);
        } else {
          next();
        }
      })
      .catch((err: any) => next(err)); // Solución al TS7006 asignando ': any'
  });

  return server;
}