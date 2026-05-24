/**
 * MongoDB NoSQL Injection Sanitization Middleware
 * Recursively strips keys starting with '$' from objects
 */

const sanitize = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      continue; // Strip MongoDB operators
    }
    sanitized[key] = sanitize(obj[key]);
  }
  return sanitized;
};

const sanitizeMongo = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = { sanitize, sanitizeMongo };
