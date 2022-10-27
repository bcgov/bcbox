const express = require('express');
const config = require('config');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
  res.send('Vue 3 Scaffold');
});

app.get('/api/hello', (req, res) => {
  res.send('Hello world!');
});

// Host the static frontend assets
const staticFilesPath = config.get('server.staticFiles');
app.use('/favicon.ico', (_req, res) => {
  res.redirect(`${staticFilesPath}/favicon.ico`);
});
app.use(staticFilesPath, express.static(path.join(__dirname, 'dist')));

module.exports = app;
