# Production Hardening Bugfix Design

## Overview

The GramSeva platform has 15 critical production-readiness defects spanning security, reliability, observability, validation, and quality. The application currently runs with a weak JWT secret, open CORS, disabled CSP, mass assignment vulnerabilities, NoSQL injection exposure, weak OTP generation, no health checks, no graceful shutdown, no DB reconnection, error detail leakage, unstructured logging, missing input validation, oversized file uploads, no process manager, and no test suite. The fix approach applies defense-in-depth: harden the security layer first, then add reliability primitives, then observability, then validation, and finally quality infrastructure — all while preserving existing API contracts and Socket.IO behavior.

## Glossary

- **Bug_Condition (C)**: Any request or system event that triggers one of the 15 defective behaviors (e.g., weak JWT used for signing, unvalidated input reaching a controller, error stack sent to client)
- **Property (P)**: The desired secure/reliable behavior for each defect — strong secrets, validated input, generic error responses, structured logs, etc.
- **Preservation**: Existing authentication flows, API response contracts, Socket.IO messaging, rate limiting, static file serving, and role-based authorization that must remain unchanged
- **server/index.js**: The Express application entry point that configures middleware, routes, and starts the HTTP server
- **server/config/db.js**: The MongoDB connection module that currently exits on failure with no retry
- **server/middleware/auth.js**: JWT verification middleware using `jsonwebtoken`
- **server/controllers/authController.js**: Handles registration, login, OTP send/verify, and profile updates

## Bug Details

### Bug Condition

The bug manifests across 15 distinct conditions where the application either exposes sensitive information, accepts malicious input, lacks operational primitives, or has no quality gates. Each condition is independently triggerable by normal production traffic or operational events.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { event: string, request?: HTTPRequest, signal?: ProcessSignal }
  OUTPUT: boolean

  RETURN (input.event == 'startup' AND jwtSecretIsWeak(process.env.JWT_SECRET))
         OR (input.event == 'request' AND input.request.path == '/health')
         OR (input.event == 'signal' AND input.signal IN ['SIGTERM', 'SIGINT'])
         OR (input.event == 'error' AND process.env.NODE_ENV == 'production')
         OR (input.event == 'log' AND loggingIsUnstructured())
         OR (input.event == 'request' AND isCrossOrigin(input.request) AND originNotInAllowlist(input.request))
         OR (input.event == 'response' AND cspHeaderMissing(input.response))
         OR (input.event == 'request' AND hasUnvalidatedInput(input.request))
         OR (input.event == 'request' AND input.request.path == '/api/auth/send-otp')
         OR (input.event == 'dbFailure' AND noReconnectionLogic())
         OR (input.event == 'upload' AND (fileTooLarge(input.request) OR noAuthOnUpload(input.request)))
         OR (input.event == 'request' AND input.request.path == '/api/auth/profile' AND hasMassAssignment(input.request.body))
         OR (input.event == 'request' AND containsMongoOperators(input.request))
         OR (input.event == 'deploy' AND noProcessManager())
         OR (input.event == 'codeChange' AND noTestSuite())
END FUNCTION
```

### Examples

- **Weak JWT**: Attacker uses `jwt.sign({id: 'admin_id', role: 'admin'}, 'gramseva_jwt_secret_dev_key_2024')` to forge admin tokens
- **No health check**: Kubernetes/load balancer probe to `GET /health` returns 404 or index.html, marking the pod as unhealthy
- **Error leakage**: A Mongoose CastError returns `"Cast to ObjectId failed for value \"abc\" at path \"_id\""` to the client, revealing schema details
- **Open CORS**: Malicious site `evil.com` makes authenticated API calls using stolen cookies/tokens with no origin restriction
- **Mass assignment**: `PUT /api/auth/profile` with body `{"isVerified": true, "role": "admin"}` escalates privileges
- **NoSQL injection**: `POST /api/auth/login` with body `{"email": {"$gt": ""}, "password": {"$gt": ""}}` bypasses authentication
- **4-digit OTP**: Attacker brute-forces all 10,000 combinations in under 2 minutes with no dedicated rate limit on the OTP endpoint

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid JWT tokens issued before the fix must continue to work until they expire (rolling migration)
- User registration with valid credentials continues to create accounts and return tokens
- Login with correct email/phone + password continues to return tokens and user profiles
- Socket.IO clients with valid auth tokens continue real-time messaging, chat history, and typing indicators
- API requests within rate limits (100/15min) continue to be processed normally
- Frontend static assets and page files continue to be served correctly
- Valid file uploads (images, videos, PDFs) by authenticated users continue to be accepted (within new 5MB limit)
- All domain endpoints (marketplace, equipment, schemes, tourism, weather, emergency, AI) continue returning correct data for valid authenticated requests
- Successful first-attempt MongoDB connections start the server without delay
- Admin role-based authorization continues to enforce access control

**Scope:**
All inputs that do NOT trigger any of the 15 bug conditions should be completely unaffected by this fix. This includes:
- Normal authenticated API requests with valid tokens and valid input
- Frontend page navigation and static asset loading
- Socket.IO connections with valid tokens
- File uploads under the new size limit by authenticated users
- MongoDB operations with normal string values (no $ operators)

## Hypothesized Root Cause

Based on the code analysis, the root causes are:

1. **Security Shortcuts for Development Speed**: The application was built with development convenience prioritized over security — hardcoded weak JWT secret, `cors()` with no options, `contentSecurityPolicy: false`, and `console.log(OTP)` for testing without SMS integration.

2. **Missing Operational Infrastructure**: No health check, graceful shutdown, or DB reconnection because the app was only run locally with `nodemon` during development. The `process.exit(1)` in db.js confirms a "fail fast" development mindset.

3. **Incomplete Input Validation**: Only the auth routes have partial `express-validator` usage. All other routes pass `req.body` directly to Mongoose without sanitization. The `updateProfile` controller uses `req.body` with a minimal blocklist instead of an allowlist.

4. **No Production Deployment Planning**: No PM2 config, no test framework, no CI/CD — the project has only `"start"` and `"dev"` scripts, confirming it was never prepared for production deployment.

## Correctness Properties

Property 1: Bug Condition - Security Hardening Prevents Exploitation

_For any_ request or system event where one of the 15 bug conditions holds (isBugCondition returns true), the fixed system SHALL reject, sanitize, or handle the input securely — refusing weak secrets at startup, returning generic errors in production, validating all input, restricting CORS origins, enabling CSP, generating 6-digit OTPs without logging them, enforcing upload limits with auth, using field allowlists for updates, and stripping MongoDB operators.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15**

Property 2: Preservation - Existing Functionality Unchanged

_For any_ request or system event where none of the 15 bug conditions hold (isBugCondition returns false), the fixed system SHALL produce the same observable behavior as the original system, preserving authentication flows, API response formats, Socket.IO messaging, rate limiting, static file serving, and role-based authorization.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `server/index.js`

**Changes**:
1. **JWT Secret Validation**: Add startup check that rejects weak/missing JWT_SECRET. Validate minimum 32 characters and reject known defaults.
   ```js
   const WEAK_SECRETS = ['your_jwt_secret_key_here', 'gramseva_jwt_secret_dev_key_2024'];
   if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || WEAK_SECRETS.includes(process.env.JWT_SECRET)) {
     console.error('FATAL: JWT_SECRET must be a strong random string of at least 32 characters');
     process.exit(1);
   }
   ```

2. **CORS Allowlist**: Replace `cors()` with origin validation from `CORS_ORIGINS` env var.
   ```js
   const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
   app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false, credentials: true }));
   ```

3. **Enable CSP**: Replace `contentSecurityPolicy: false` with a policy that allows the app to function.
   ```js
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"],  // needed for inline PWA scripts
         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", "wss:", "https://api.openweathermap.org", "https://generativelanguage.googleapis.com"],
         fontSrc: ["'self'", "https://fonts.gstatic.com"]
       }
     }
   }));
   ```

4. **Health Check Endpoint**: Add `GET /health` before API routes.
   ```js
   app.get('/health', async (req, res) => {
     const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
     const status = dbState === 'connected' ? 200 : 503;
     res.status(status).json({ status: dbState === 'connected' ? 'healthy' : 'degraded', db: dbState, uptime: process.uptime() });
   });
   ```

5. **Graceful Shutdown**: Add SIGTERM/SIGINT handlers.
   ```js
   const gracefulShutdown = async (signal) => {
     logger.info(`${signal} received, starting graceful shutdown`);
     server.close(async () => {
       io.close();
       await mongoose.connection.close();
       process.exit(0);
     });
     setTimeout(() => process.exit(1), 30000); // force exit after 30s
   };
   process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
   process.on('SIGINT', () => gracefulShutdown('SIGINT'));
   ```

6. **Error Handler (production-safe)**: Replace error handler to hide details in production.
   ```js
   app.use((err, req, res, next) => {
     logger.error({ err, reqId: req.id }, 'Unhandled error');
     const status = err.status || 500;
     const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
     res.status(status).json({ success: false, error: message });
   });
   ```

7. **NoSQL Injection Middleware**: Add middleware to strip `$` operators from req.body/query/params.
   ```js
   const sanitizeMongo = (obj) => { /* recursively remove keys starting with $ */ };
   app.use((req, res, next) => {
     req.body = sanitizeMongo(req.body);
     req.query = sanitizeMongo(req.query);
     req.params = sanitizeMongo(req.params);
     next();
   });
   ```

---

**File**: `server/config/db.js`

**Changes**:
1. **Retry with Exponential Backoff**: Replace single-attempt connection with retry loop (max 5 attempts, delays: 1s, 2s, 4s, 8s, 16s).
2. **Runtime Reconnection**: Add Mongoose connection event listeners for `disconnected` and `error` to trigger reconnection.

---

**File**: `server/controllers/authController.js`

**Changes**:
1. **6-digit OTP**: Change `Math.floor(1000 + Math.random() * 9000)` to `Math.floor(100000 + Math.random() * 900000)`.
2. **Remove OTP logging**: Delete `console.log(\`OTP for ${phone}: ${otp}\`)`.
3. **Profile Allowlist**: Replace blocklist approach with explicit allowlist: `['name', 'avatar', 'state', 'district', 'village', 'language']`.

---

**File**: `server/routes/auth.js`

**Changes**:
1. **OTP Rate Limiting**: Add dedicated rate limiter for `/send-otp` (5 requests per phone per 15 minutes).

---

**File**: `server/middleware/upload.js`

**Changes**:
1. **Reduce file size limit**: Change `50 * 1024 * 1024` to `5 * 1024 * 1024` (5MB).

---

**File**: `server/routes/*.js` (all non-auth routes)

**Changes**:
1. **Add express-validator**: Add validation chains for all route parameters (body, query, params) on schemes, marketplace, equipment, ai, emergency, tourism, weather, and admin routes.

---

**New File**: `server/middleware/sanitize.js`

**Changes**:
1. **MongoDB Sanitization Middleware**: Recursive function to strip keys starting with `$` from objects.

---

**New File**: `server/utils/logger.js`

**Changes**:
1. **Structured Logging**: Configure `pino` (or `winston`) with JSON output, log levels, timestamps, and request ID generation middleware.

---

**New File**: `ecosystem.config.js`

**Changes**:
1. **PM2 Configuration**: Cluster mode, auto-restart, memory limit (512MB), log rotation, env variables.

---

**New File**: `server/middleware/requestId.js`

**Changes**:
1. **Correlation IDs**: Generate UUID per request, attach to `req.id`, include in all log entries.

---

**New Files**: `tests/`, `jest.config.js` or `vitest.config.js`, `.github/workflows/ci.yml`

**Changes**:
1. **Test Framework**: Install and configure Jest/Vitest with test scripts.
2. **Unit Tests**: Auth logic (JWT validation, password hashing, OTP generation).
3. **Integration Tests**: Critical API endpoints (register, login, health check).
4. **CI Configuration**: GitHub Actions workflow for lint + test on push/PR.

---

**File**: `server/index.js` (uploads route)

**Changes**:
1. **Authenticated Upload Access**: Add `protect` middleware before serving `/uploads` static directory, or replace static serving with a route that checks ownership.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that exercise each of the 15 defect conditions against the unfixed codebase and observe the insecure/broken behavior.

**Test Cases**:
1. **Weak JWT Test**: Sign a token with the known weak secret and verify it authenticates successfully (will pass on unfixed code, proving the weakness)
2. **Health Check Test**: Send `GET /health` and observe 404 response (will fail on unfixed code)
3. **Error Leakage Test**: Send a request that triggers a Mongoose CastError and observe the raw error in response (will leak on unfixed code)
4. **CORS Test**: Send a request with `Origin: https://evil.com` and observe it is accepted (will pass on unfixed code)
5. **Mass Assignment Test**: Send `PUT /api/auth/profile` with `{"isVerified": true}` and observe the field is set (will succeed on unfixed code)
6. **NoSQL Injection Test**: Send `POST /api/auth/login` with `{"email": {"$gt": ""}}` and observe query behavior (will not be blocked on unfixed code)
7. **OTP Brute Force Test**: Verify OTP is 4 digits and logged to console (will confirm on unfixed code)
8. **Large Upload Test**: Upload a 50MB file and observe it is accepted (will succeed on unfixed code)

**Expected Counterexamples**:
- Forged JWT tokens authenticate successfully
- NoSQL injection operators pass through to MongoDB queries
- Mass assignment allows setting privileged fields
- Possible causes: no input sanitization, blocklist instead of allowlist, development defaults left in place

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed system produces the expected secure behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedSystem(input)
  ASSERT expectedBehavior(result)
  // e.g., weak JWT → startup failure
  // e.g., NoSQL operators → stripped from input
  // e.g., mass assignment → rejected fields
  // e.g., /health → 200 with status JSON
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed system produces the same result as the original system.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
  // e.g., valid JWT → still authenticates
  // e.g., normal login → still returns token
  // e.g., valid file upload (< 5MB) → still accepted
  // e.g., Socket.IO with valid token → still connects
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for normal authenticated requests, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Auth Preservation**: Verify valid registration/login flows continue to work identically after fix
2. **API Response Preservation**: Verify all domain endpoints return same response structure for valid requests
3. **Socket.IO Preservation**: Verify real-time messaging continues with valid auth tokens
4. **Static File Preservation**: Verify frontend assets continue to be served correctly
5. **Rate Limit Preservation**: Verify requests within limits continue to be processed

### Unit Tests

- JWT secret validation logic (rejects weak secrets, accepts strong ones)
- OTP generation produces 6-digit codes
- MongoDB sanitization strips `$` operators recursively
- Profile update allowlist rejects disallowed fields
- Health check returns correct status based on DB state
- Error handler hides details in production, shows in development
- CORS origin validation accepts/rejects correctly
- File upload size validation (rejects > 5MB, accepts ≤ 5MB)

### Property-Based Tests

- Generate random request bodies and verify MongoDB operators are always stripped
- Generate random profile update payloads and verify only allowlisted fields are applied
- Generate random JWT secrets and verify startup validation correctly classifies weak vs strong
- Generate random file sizes and verify upload limit enforcement
- Generate random origins and verify CORS allowlist enforcement

### Integration Tests

- Full registration → login → authenticated request flow with new security measures
- Health check endpoint returns correct status under various DB states
- Graceful shutdown completes in-flight requests before exiting
- OTP flow with rate limiting (6th request within window is rejected)
- File upload with authentication requirement enforced
- CSP headers present in all responses
- Error responses in production mode contain no stack traces
