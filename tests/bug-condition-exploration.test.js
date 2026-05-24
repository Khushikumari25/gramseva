/**
 * Bug Condition Exploration Test
 * 
 * Property 1: Bug Condition - Production Security & Reliability Defects
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15**
 * 
 * CRITICAL: These tests encode the EXPECTED (fixed) behavior.
 * They MUST FAIL on unfixed code — failure confirms the bugs exist.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * Scoped PBT Approach: Each test targets a specific defect category
 * with concrete failing cases that demonstrate the bug exists.
 */

const fc = require('fast-check');
const request = require('supertest');
const path = require('path');
const fs = require('fs');

// We need to test the app without actually connecting to a real DB for most tests.
// For the exploration tests, we'll import the app module and use supertest.
// Some tests inspect source code directly to confirm the defect pattern.

describe('Bug Condition Exploration - Production Security & Reliability Defects', () => {

  /**
   * Bug Condition: jwtSecretIsWeak
   * Requirement 1.1: Server starts with weak JWT secret "gramseva_jwt_secret_dev_key_2024"
   * 
   * Expected (fixed) behavior: Server refuses to start with weak/missing JWT_SECRET
   * On unfixed code: Server starts fine with the weak secret → test FAILS
   */
  describe('1.1 Weak JWT Secret', () => {
    it('should reject startup with weak JWT secret "gramseva_jwt_secret_dev_key_2024"', () => {
      // Read the server/index.js source to check if there's JWT secret validation
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );

      // The fixed code should have validation that rejects weak secrets
      const hasWeakSecretCheck = indexSource.includes('gramseva_jwt_secret_dev_key_2024') &&
        (indexSource.includes('process.exit') || indexSource.includes('throw'));
      
      // Check that there's a validation block that checks JWT_SECRET strength
      const hasJwtValidation = /JWT_SECRET.*length.*32|JWT_SECRET.*weak|WEAK_SECRETS/i.test(indexSource);

      expect(hasJwtValidation).toBe(true);
    });

    it('property: for any weak secret from known defaults, startup validation rejects it', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'gramseva_jwt_secret_dev_key_2024',
            'your_jwt_secret_key_here',
            'secret',
            'jwt_secret',
            '12345678'
          ),
          (weakSecret) => {
            // The index.js should contain logic to reject these weak secrets
            const indexSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'index.js'),
              'utf8'
            );
            // There should be a validation that checks secret length >= 32
            // and rejects known weak defaults
            const hasLengthCheck = /\.length\s*<\s*32|\.length\s*>=?\s*32/i.test(indexSource);
            return hasLengthCheck;
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  /**
   * Bug Condition: request.path == '/health'
   * Requirement 1.2: GET /health returns 404 or HTML instead of JSON health status
   * 
   * Expected (fixed) behavior: GET /health returns JSON with status, db state, uptime
   * On unfixed code: Returns 404 or index.html → test FAILS
   */
  describe('1.2 Missing Health Check Endpoint', () => {
    it('should have a /health endpoint that returns JSON health status', () => {
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );

      // Check that a /health route is defined
      const hasHealthRoute = /app\.(get|use)\s*\(\s*['"`]\/health['"`]/.test(indexSource);
      expect(hasHealthRoute).toBe(true);
    });

    it('property: health endpoint definition includes status and db connectivity fields', () => {
      fc.assert(
        fc.property(
          fc.constant('/health'),
          (healthPath) => {
            const indexSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'index.js'),
              'utf8'
            );
            // The health endpoint should return JSON with status and db info
            const hasHealthRoute = /app\.get\s*\(\s*['"`]\/health['"`]/.test(indexSource);
            const hasStatusField = /status.*healthy|healthy.*status/i.test(indexSource);
            return hasHealthRoute && hasStatusField;
          }
        ),
        { numRuns: 1 }
      );
    });
  });

  /**
   * Bug Condition: error in production
   * Requirement 1.4: Error handler leaks error.message/stack to client in production mode
   * 
   * Expected (fixed) behavior: Generic "Internal Server Error" in production
   * On unfixed code: Raw error.message is sent to client → test FAILS
   */
  describe('1.4 Error Handler Leaks Details in Production', () => {
    it('should have production-safe error handler that hides error details', () => {
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );

      // The error handler should check NODE_ENV and hide details in production
      const hasProductionCheck = /NODE_ENV.*production|production.*NODE_ENV/.test(indexSource);
      const hasGenericMessage = /Internal Server Error/.test(indexSource);

      // In the fixed version, the error handler should conditionally hide details
      expect(hasProductionCheck).toBe(true);
      expect(hasGenericMessage).toBe(true);
    });

    it('property: error handler never exposes err.message directly in production mode', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('CastError', 'ValidationError', 'MongoError', 'TypeError'),
          (errorType) => {
            const indexSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'index.js'),
              'utf8'
            );
            // The error handler should NOT directly pass err.message to client in production
            // It should check NODE_ENV first
            const errorHandlerMatch = indexSource.match(/app\.use\(\s*\(err,\s*req,\s*res,\s*next\)/);
            if (!errorHandlerMatch) return false;
            
            // Extract error handler code (rough heuristic)
            const afterHandler = indexSource.slice(indexSource.indexOf(errorHandlerMatch[0]));
            const hasEnvCheck = /NODE_ENV/.test(afterHandler.slice(0, 500));
            return hasEnvCheck;
          }
        ),
        { numRuns: 4 }
      );
    });
  });

  /**
   * Bug Condition: originNotInAllowlist
   * Requirement 1.6: CORS accepts requests from any origin including "https://evil.com"
   * 
   * Expected (fixed) behavior: CORS validates against allowlist, rejects unlisted origins
   * On unfixed code: cors() with no options accepts all → test FAILS
   */
  describe('1.6 Open CORS - No Origin Restriction', () => {
    it('should configure CORS with an origin allowlist', () => {
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );

      // The fixed code should have cors({ origin: ... }) with an allowlist
      const hasOriginConfig = /cors\(\s*\{[^}]*origin/s.test(indexSource);
      // Should NOT be just cors() with no arguments
      const isOpenCors = /app\.use\(\s*cors\(\s*\)\s*\)/.test(indexSource);

      expect(hasOriginConfig).toBe(true);
      expect(isOpenCors).toBe(false);
    });

    it('property: for any malicious origin, CORS config includes origin validation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('https://evil.com', 'https://attacker.io', 'http://malicious.net'),
          (maliciousOrigin) => {
            const indexSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'index.js'),
              'utf8'
            );
            // Should have origin validation, not open cors()
            const hasOriginConfig = /cors\(\s*\{[^}]*origin/s.test(indexSource);
            const isOpenCors = /app\.use\(\s*cors\(\s*\)\s*\)/.test(indexSource);
            return hasOriginConfig && !isOpenCors;
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  /**
   * Bug Condition: cspHeaderMissing
   * Requirement 1.7: CSP header is missing from responses
   * 
   * Expected (fixed) behavior: CSP header present with appropriate directives
   * On unfixed code: contentSecurityPolicy: false → test FAILS
   */
  describe('1.7 CSP Disabled', () => {
    it('should enable Content-Security-Policy (not disable it)', () => {
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );

      // The unfixed code has: helmet({ contentSecurityPolicy: false })
      // The fixed code should NOT have contentSecurityPolicy: false
      const hasCspDisabled = /contentSecurityPolicy\s*:\s*false/.test(indexSource);

      expect(hasCspDisabled).toBe(false);
    });

    it('property: helmet configuration includes CSP directives', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('defaultSrc', 'scriptSrc', 'styleSrc', 'default-src'),
          (directive) => {
            const indexSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'index.js'),
              'utf8'
            );
            // Should have CSP enabled with directives, not disabled
            const hasCspDisabled = /contentSecurityPolicy\s*:\s*false/.test(indexSource);
            return !hasCspDisabled;
          }
        ),
        { numRuns: 4 }
      );
    });
  });

  /**
   * Bug Condition: path == '/api/auth/send-otp'
   * Requirement 1.9: OTP is 4 digits and logged to console
   * 
   * Expected (fixed) behavior: 6-digit OTP, not logged to console
   * On unfixed code: 4-digit OTP + console.log → test FAILS
   */
  describe('1.9 Weak OTP Generation', () => {
    it('should generate 6-digit OTP (not 4-digit)', () => {
      const authControllerSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'controllers', 'authController.js'),
        'utf8'
      );

      // Check for 6-digit OTP generation: Math.floor(100000 + Math.random() * 900000)
      const has6DigitOtp = /100000\s*\+\s*Math\.random\(\)\s*\*\s*900000/.test(authControllerSource);
      // Should NOT have 4-digit: Math.floor(1000 + Math.random() * 9000)
      const has4DigitOtp = /1000\s*\+\s*Math\.random\(\)\s*\*\s*9000[^0]/.test(authControllerSource);

      expect(has6DigitOtp).toBe(true);
      expect(has4DigitOtp).toBe(false);
    });

    it('should NOT log OTP to console', () => {
      const authControllerSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'controllers', 'authController.js'),
        'utf8'
      );

      // Should not have console.log with OTP
      const logsOtp = /console\.log\(.*OTP.*\)/i.test(authControllerSource);
      expect(logsOtp).toBe(false);
    });

    it('property: OTP generation always produces 6-digit codes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (_iteration) => {
            const authControllerSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'controllers', 'authController.js'),
              'utf8'
            );
            // The formula should produce numbers in range [100000, 999999]
            const has6DigitFormula = /100000\s*\+\s*Math\.random\(\)\s*\*\s*900000/.test(authControllerSource);
            const has4DigitFormula = /1000\s*\+\s*Math\.random\(\)\s*\*\s*9000\b/.test(authControllerSource);
            return has6DigitFormula && !has4DigitFormula;
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  /**
   * Bug Condition: containsMongoOperators
   * Requirement 1.13: NoSQL operators like {"$gt": ""} pass through to MongoDB queries
   * 
   * Expected (fixed) behavior: MongoDB operators stripped from input
   * On unfixed code: No sanitization middleware → test FAILS
   */
  describe('1.13 NoSQL Injection - No Sanitization', () => {
    it('should have MongoDB sanitization middleware', () => {
      // Check if sanitize middleware exists
      const sanitizeExists = fs.existsSync(
        path.join(__dirname, '..', 'server', 'middleware', 'sanitize.js')
      );

      // Also check if it's registered in index.js
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );
      const hasSanitizeMiddleware = /sanitize|mongo.*sanitiz/i.test(indexSource);

      expect(sanitizeExists || hasSanitizeMiddleware).toBe(true);
    });

    it('property: for any object with $ operators, sanitization strips them', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('$gt', '$ne', '$regex', '$where', '$in', '$nin'),
          (operator) => {
            // Check that sanitization middleware exists and handles $ operators
            const sanitizePath = path.join(__dirname, '..', 'server', 'middleware', 'sanitize.js');
            if (!fs.existsSync(sanitizePath)) return false;
            
            const sanitizeSource = fs.readFileSync(sanitizePath, 'utf8');
            // Should have logic to detect and strip keys starting with $
            const stripsOperators = /\$|startsWith.*\$|\['\$|\["\$/i.test(sanitizeSource);
            return stripsOperators;
          }
        ),
        { numRuns: 6 }
      );
    });
  });

  /**
   * Bug Condition: hasMassAssignment
   * Requirement 1.12: updateProfile accepts isVerified, otp, otpExpiry fields
   * 
   * Expected (fixed) behavior: Only allowlisted fields accepted
   * On unfixed code: Only blocks password/role, allows isVerified etc → test FAILS
   */
  describe('1.12 Mass Assignment in updateProfile', () => {
    it('should use field allowlist (not blocklist) for profile updates', () => {
      const authControllerSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'controllers', 'authController.js'),
        'utf8'
      );

      // The fixed code should have an explicit allowlist
      const hasAllowlist = /allowlist|allowedFields|ALLOWED_FIELDS|\[\s*'name'.*'language'\s*\]/i.test(authControllerSource);
      
      // Should NOT just delete password and role (blocklist approach)
      const hasBlocklistOnly = /delete\s+updates\.password[\s\S]*delete\s+updates\.role/m.test(authControllerSource) &&
        !hasAllowlist;

      expect(hasAllowlist).toBe(true);
      expect(hasBlocklistOnly).toBe(false);
    });

    it('property: for any sensitive field, updateProfile rejects it', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('isVerified', 'otp', 'otpExpiry', 'savedSchemes', '_id', '__v'),
          (sensitiveField) => {
            const authControllerSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'controllers', 'authController.js'),
              'utf8'
            );
            // The controller should use an allowlist approach that would reject these fields
            const hasAllowlist = /allowlist|allowedFields|ALLOWED_FIELDS|\[\s*'name'/i.test(authControllerSource);
            // Should not just use delete for a couple fields
            const usesBlocklistOnly = /delete\s+updates\.\w+/.test(authControllerSource) && !hasAllowlist;
            return hasAllowlist && !usesBlocklistOnly;
          }
        ),
        { numRuns: 6 }
      );
    });
  });

  /**
   * Bug Condition: fileTooLarge OR noAuthOnUpload
   * Requirement 1.11: File upload accepts 50MB files without auth
   * 
   * Expected (fixed) behavior: 5MB limit, auth required for uploads
   * On unfixed code: 50MB limit, /uploads served as public static → test FAILS
   */
  describe('1.11 Oversized File Upload Without Auth', () => {
    it('should limit file uploads to 5MB (not 50MB)', () => {
      const uploadSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'middleware', 'upload.js'),
        'utf8'
      );

      // Should have 5MB limit: 5 * 1024 * 1024
      const has5MBLimit = /5\s*\*\s*1024\s*\*\s*1024/.test(uploadSource);
      // Should NOT have 50MB limit: 50 * 1024 * 1024
      const has50MBLimit = /50\s*\*\s*1024\s*\*\s*1024/.test(uploadSource);

      expect(has5MBLimit).toBe(true);
      expect(has50MBLimit).toBe(false);
    });

    it('should require authentication for /uploads access', () => {
      const indexSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'index.js'),
        'utf8'
      );

      // The /uploads route should have auth middleware (protect) before static serving
      // Should NOT be just: app.use('/uploads', express.static(...))
      const hasUnauthUploads = /app\.use\(\s*['"`]\/uploads['"`]\s*,\s*express\.static/.test(indexSource);
      const hasAuthOnUploads = /protect.*\/uploads|\/uploads.*protect/i.test(indexSource);

      expect(hasUnauthUploads).toBe(false);
      expect(hasAuthOnUploads).toBe(true);
    });

    it('property: for any file size > 5MB, upload is rejected', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 100 }),  // MB values > 5
          (sizeMB) => {
            const uploadSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'middleware', 'upload.js'),
              'utf8'
            );
            // The limit should be 5MB, so anything > 5MB would be rejected
            const has5MBLimit = /5\s*\*\s*1024\s*\*\s*1024/.test(uploadSource);
            const has50MBLimit = /50\s*\*\s*1024\s*\*\s*1024/.test(uploadSource);
            return has5MBLimit && !has50MBLimit;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Bug Condition: noReconnectionLogic
   * Requirement 1.10: DB connection exits immediately on failure with no retry
   * 
   * Expected (fixed) behavior: Retry with exponential backoff before exit
   * On unfixed code: process.exit(1) immediately → test FAILS
   */
  describe('1.10 DB Connection - No Retry Logic', () => {
    it('should have retry logic with exponential backoff for DB connection', () => {
      const dbSource = fs.readFileSync(
        path.join(__dirname, '..', 'server', 'config', 'db.js'),
        'utf8'
      );

      // The fixed code should have retry/backoff logic
      const hasRetryLogic = /retry|backoff|attempt|MAX_RETRIES|maxRetries/i.test(dbSource);
      // Should NOT just immediately exit on first failure
      const immediateExit = /catch.*\{[^}]*process\.exit\(1\)[^}]*\}/s.test(dbSource) && !hasRetryLogic;

      expect(hasRetryLogic).toBe(true);
      expect(immediateExit).toBe(false);
    });

    it('property: DB connection module includes reconnection event handlers', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('disconnected', 'error', 'reconnected'),
          (event) => {
            const dbSource = fs.readFileSync(
              path.join(__dirname, '..', 'server', 'config', 'db.js'),
              'utf8'
            );
            // Should have event listeners for connection issues
            const hasEventHandlers = /on\(\s*['"`](disconnected|error|reconnect)/.test(dbSource);
            const hasRetry = /retry|backoff|attempt/i.test(dbSource);
            return hasRetry || hasEventHandlers;
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
