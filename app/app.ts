import express from 'express';
import compression from 'compression';
import config from 'config';
import path from 'path';

const idplistDefaultPath = './config/idplist-default.json';
const idplistOverridePath = './config/idplist-override.json';

const app = express();
app.use(compression());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('BCBox');
});

// Frontend configuration endpoint
app.get('/config', async (_req, res, next) => {
  try {
    const frontend = { ...config.get('frontend') };
    frontend.idpList = await readIdpList();
    res.status(200).json(frontend);
  } catch (err) {
    next(err);
  }
});

// Host the static frontend assets
const staticFilesPath = config.get('server.staticFiles');
app.use('/favicon.ico', (_req, res) => {
  res.redirect(`${staticFilesPath}/favicon.ico`);
});
app.use(staticFilesPath, express.static(path.join(__dirname, 'dist')));

async function readIdpList(): Promise<string> {
  return (await import(idplistOverridePath).catch(async e => {
    return await import(idplistDefaultPath);
  })).default;
}

export default app;
