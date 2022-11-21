const express = require('express');
const compression = require('compression');
const config = require('config');
const path = require('path');

const app = express();
app.use(compression());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Vue 3 Scaffold');
});

app.get('/api/hello', (req, res) => {
  res.send('Hello world!');
});

// Frontend configuration endpoint
app.get('/config', (_req, res, next) => {
  try {
    const frontend = config.get('frontend');
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

module.exports = app;
