require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const initSocket = require('./sockets/chat');
const logger = require('./utils/logger');
const requestId = require('./middleware/requestId');
const { sanitizeMongo } = require('./middleware/sanitize');
const { protect } = require('./middleware/auth');

// JWT Secret Validation
const WEAK_SECRETS = ['your_jwt_secret_key_here', 'gramseva_jwt_secret_dev_key_2024', 'secret', 'jwt_secret'];
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || WEAK_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error('FATAL: JWT_SECRET must be a strong random string of at least 32 characters');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// CORS Origin Allowlist
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && allowedOrigins.length 
    ? allowedOrigins 
    : true,
  credentials: true
};

const io = new Server(server, {
  cors: { 
    origin: process.env.NODE_ENV === 'production' && allowedOrigins.length 
      ? allowedOrigins 
      : '*', 
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect Database
connectDB();

// Request ID Middleware (before other middleware)
app.use(requestId);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:", "https:", "http://localhost:*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
      mediaSrc: ["'self'", "blob:", "https:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"]
    }
  }
}));
app.use(cors(corsOptions));
app.use(compression());

// Structured Request Logging (replaces morgan)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]({ reqId: req.id, method: req.method, url: req.url, status: res.statusCode, duration: `${duration}ms` }, 'request');
  });
  next();
});

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

// NoSQL Injection Sanitization (after body parsers, before routes)
app.use(sanitizeMongo);

// Health Check Endpoint (before API routes)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  const status = dbState === 1 ? 200 : 503;
  res.status(status).json({
    status: dbState === 1 ? 'healthy' : 'degraded',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/tourism', require('./routes/tourism'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO
initSocket(io);

// Serve Frontend
app.get('*', (req, res) => {
  // Serve page files directly if they exist
  const pagePath = path.join(__dirname, '..', 'frontend', req.path);
  if (req.path.startsWith('/pages/') && require('fs').existsSync(pagePath)) {
    return res.sendFile(pagePath);
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Production-Safe Error Handler
app.use((err, req, res, next) => {
  logger.error({ err, reqId: req.id, method: req.method, url: req.url }, 'Unhandled error');
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(status).json({ success: false, error: message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`GramSeva server running on port ${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log('HTTP server closed');
    io.close(() => {
      console.log('Socket.IO closed');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server, io };
