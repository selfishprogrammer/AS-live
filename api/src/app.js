'use strict';

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check — handy for deploy platform probes.
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/auth', authRoutes);
  app.use('/posts', postsRoutes);

  // 404 fallback.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Centralised error handler.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
