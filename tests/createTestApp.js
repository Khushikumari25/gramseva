/**
 * Creates an Express app instance for testing without starting the server
 * or connecting to a real database. This mirrors server/index.js but skips
 * connectDB() and server.listen().
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

function createTestApp() {
  const app = express();

  // Security Middleware (same as server/index.js)
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(compression());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static Files
  app.use('/uploads', express.static(path.join(__dirname, '..', 'server', 'uploads')));
  app.use(express.static(path.join(__dirname, '..', 'frontend')));

  // API Routes
  app.use('/api/auth', require('../server/routes/auth'));
  app.use('/api/schemes', require('../server/routes/schemes'));
  app.use('/api/marketplace', require('../server/routes/marketplace'));
  app.use('/api/equipment', require('../server/routes/equipment'));
  app.use('/api/ai', require('../server/routes/ai'));
  app.use('/api/emergency', require('../server/routes/emergency'));
  app.use('/api/tourism', require('../server/routes/tourism'));
  app.use('/api/weather', require('../server/routes/weather'));
  app.use('/api/admin', require('../server/routes/admin'));

  // Serve Frontend
  app.get('*', (req, res) => {
    const pagePath = path.join(__dirname, '..', 'frontend', req.path);
    if (req.path.startsWith('/pages/') && require('fs').existsSync(pagePath)) {
      return res.sendFile(pagePath);
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });

  // Error Handler (same as server/index.js)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}

module.exports = createTestApp;
