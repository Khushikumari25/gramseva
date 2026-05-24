# Implementation Plan

## Overview

This task list implements the production-hardening bugfix for the GramSeva platform, addressing 15 critical production-readiness defects. Tasks are ordered by dependency: security first, then reliability, then observability, then validation, then quality infrastructure. The exploratory bug condition test and preservation tests are written BEFORE the fix to confirm the bugs exist and establish baseline behavior.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Production Security & Reliability Defects
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the 15 production-hardening defects exist
  - **Scoped PBT Approach**: Scope properties to concrete failing cases for each defect category
  - Test that server starts with weak JWT secret "gramseva_jwt_secret_dev_key_2024" (from Bug Condition: jwtSecretIsWeak)
  - Test that GET /health returns 404 or HTML instead of JSON health status (from Bug Condition: request.path == '/health')
  - Test that error handler leaks error.message/stack to client in production mode (from Bug Condition: error in production)
  - Test that CORS accepts requests from any origin including "https://evil.com" (from Bug Condition: originNotInAllowlist)
  - Test that CSP header is missing from responses (from Bug Condition: cspHeaderMissing)
  - Test that OTP is 4 digits and logged to console (from Bug Condition: path == '/api/auth/send-otp')
  - Test that NoSQL operators like {"$gt": ""} pass through to MongoDB queries (from Bug Condition: containsMongoOperators)
  - Test that updateProfile accepts isVerified, otp, otpExpiry fields (from Bug Condition: hasMassAssignment)
  - Test that file upload accepts 50MB files without auth (from Bug Condition: fileTooLarge OR noAuthOnUpload)
  - Test that DB connection exits immediately on failure with no retry (from Bug Condition: noReconnectionLogic)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root causes
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing API & Auth Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Valid JWT tokens authenticate users and grant access to protected routes on unfixed code
  - Observe: User registration with valid credentials creates account and returns token on unfixed code
  - Observe: Login with correct email/phone + password returns token and user profile on unfixed code
  - Observe: API requests within rate limit (100/15min) are processed normally on unfixed code
  - Observe: Frontend static assets and page files are served correctly on unfixed code
  - Observe: All domain endpoints (marketplace, equipment, schemes, tourism, weather, emergency, AI) return correct data for valid authenticated requests on unfixed code
  - Observe: Successful first-attempt MongoDB connection starts server without delay on unfixed code
  - Observe: Admin role-based authorization enforces access control on unfixed code
  - Write property-based tests: for all valid authenticated requests with proper input (no $ operators, no mass assignment, within size limits), the system processes them correctly and returns expected response structures (from Preservation Requirements in design)
  - Write property-based tests: for all valid JWT tokens, authentication continues to work (from Preservation Requirements 3.1)
  - Write property-based tests: for all valid file uploads under 5MB by authenticated users, uploads are accepted (from Preservation Requirements 3.7)
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Security hardening fixes

  - [x] 3.1 Implement JWT secret validation at startup
    - Add list of known weak secrets to reject: ['your_jwt_secret_key_here', 'gramseva_jwt_secret_dev_key_2024']
    - Validate JWT_SECRET env var exists, is at least 32 characters, and is not in weak list
    - Call process.exit(1) with descriptive error if validation fails
    - Add validation before connectDB() call in server/index.js
    - _Bug_Condition: isBugCondition(input) where input.event == 'startup' AND jwtSecretIsWeak(process.env.JWT_SECRET)_
    - _Expected_Behavior: System refuses to start with weak/missing JWT_SECRET_
    - _Preservation: Valid JWT tokens issued with strong secret continue to authenticate_
    - _Requirements: 2.1, 3.1_

  - [x] 3.2 Implement CORS origin allowlist
    - Read CORS_ORIGINS from environment variable (comma-separated list)
    - Replace `cors()` with `cors({ origin: allowedOrigins, credentials: true })`
    - Update Socket.IO cors config to use same allowlist instead of '*'
    - When CORS_ORIGINS is empty/unset in development, allow all (backward compat for dev)
    - _Bug_Condition: isBugCondition(input) where isCrossOrigin(request) AND originNotInAllowlist(request)_
    - _Expected_Behavior: Requests from unlisted origins are rejected_
    - _Preservation: Requests from allowed origins continue to work_
    - _Requirements: 2.6, 3.4_

  - [x] 3.3 Enable Content-Security-Policy via Helmet
    - Replace `helmet({ contentSecurityPolicy: false })` with proper CSP directives
    - Allow 'self' for default-src, script-src with 'unsafe-inline' (needed for PWA inline scripts)
    - Allow Google Fonts for style-src and font-src
    - Allow data: and https: for img-src
    - Allow wss:, OpenWeatherMap API, and Google Generative AI for connect-src
    - _Bug_Condition: isBugCondition(input) where cspHeaderMissing(response)_
    - _Expected_Behavior: CSP header present in all responses with appropriate directives_
    - _Preservation: Frontend assets, fonts, images, and API connections continue to load_
    - _Requirements: 2.7, 3.6_

  - [x] 3.4 Create NoSQL injection sanitization middleware
    - Create new file: server/middleware/sanitize.js
    - Implement recursive function to strip keys starting with '$' from objects
    - Handle nested objects and arrays
    - Apply to req.body, req.query, and req.params
    - Register middleware in server/index.js before routes
    - _Bug_Condition: isBugCondition(input) where containsMongoOperators(request)_
    - _Expected_Behavior: All $ operators stripped from user input before reaching controllers_
    - _Preservation: Normal string values in requests pass through unchanged_
    - _Requirements: 2.13, 3.8_

  - [x] 3.5 Fix OTP generation security (6-digit + remove logging + rate limit)
    - Change OTP generation from `Math.floor(1000 + Math.random() * 9000)` to `Math.floor(100000 + Math.random() * 900000)` in authController.js
    - Remove `console.log(\`OTP for ${phone}: ${otp}\`)` line
    - Add dedicated rate limiter in server/routes/auth.js for /send-otp: max 5 requests per phone per 15 minutes
    - _Bug_Condition: isBugCondition(input) where input.request.path == '/api/auth/send-otp'_
    - _Expected_Behavior: 6-digit OTP generated, not logged, rate limited per phone_
    - _Preservation: OTP verification flow continues to work for valid codes_
    - _Requirements: 2.9, 3.3_

  - [x] 3.6 Fix profile update mass assignment vulnerability
    - Replace blocklist approach in authController.js updateProfile with explicit allowlist
    - Allowlist: ['name', 'avatar', 'state', 'district', 'village', 'language']
    - Filter req.body to only include allowlisted fields before passing to findByIdAndUpdate
    - _Bug_Condition: isBugCondition(input) where hasMassAssignment(request.body)_
    - _Expected_Behavior: Only allowlisted fields are updated, all others rejected_
    - _Preservation: Legitimate profile updates (name, language, location) continue to work_
    - _Requirements: 2.12, 3.2_

  - [x] 3.7 Fix file upload size limit and add auth requirement
    - Change `limits: { fileSize: 50 * 1024 * 1024 }` to `limits: { fileSize: 5 * 1024 * 1024 }` in server/middleware/upload.js
    - Add `protect` middleware before `/uploads` static route in server/index.js
    - Or replace static serving with authenticated route handler
    - _Bug_Condition: isBugCondition(input) where fileTooLarge(request) OR noAuthOnUpload(request)_
    - _Expected_Behavior: Files > 5MB rejected, upload access requires authentication_
    - _Preservation: Valid uploads under 5MB by authenticated users continue to work_
    - _Requirements: 2.11, 3.7_

- [x] 4. Reliability fixes

  - [x] 4.1 Implement health check endpoint
    - Add `GET /health` route before API routes in server/index.js
    - Return JSON with status ('healthy'/'degraded'), db state (mongoose.connection.readyState), and uptime
    - Return HTTP 200 when healthy, 503 when DB disconnected
    - _Bug_Condition: isBugCondition(input) where input.request.path == '/health'_
    - _Expected_Behavior: JSON health response with DB status and uptime_
    - _Preservation: All other routes continue to function normally_
    - _Requirements: 2.2, 3.8_

  - [x] 4.2 Implement graceful shutdown handlers
    - Add SIGTERM and SIGINT signal handlers in server/index.js
    - Stop accepting new connections via server.close()
    - Close Socket.IO connections via io.close()
    - Close MongoDB connection via mongoose.connection.close()
    - Add configurable timeout (default 30s) for force exit
    - Log shutdown progress using structured logger
    - _Bug_Condition: isBugCondition(input) where input.signal IN ['SIGTERM', 'SIGINT']_
    - _Expected_Behavior: Graceful drain of connections, clean DB close, exit 0_
    - _Preservation: Normal server operation unaffected until signal received_
    - _Requirements: 2.3, 3.4_

  - [x] 4.3 Implement database connection retry with exponential backoff
    - Modify server/config/db.js to retry up to 5 times on initial connection failure
    - Implement exponential backoff delays: 1s, 2s, 4s, 8s, 16s
    - Add Mongoose connection event listeners for 'disconnected' and 'error' for runtime reconnection
    - Log each retry attempt with structured logger
    - Only call process.exit(1) after all retries exhausted
    - _Bug_Condition: isBugCondition(input) where input.event == 'dbFailure' AND noReconnectionLogic()_
    - _Expected_Behavior: Retry with backoff before exit, auto-reconnect on runtime disconnect_
    - _Preservation: Successful first-attempt connections start server without delay_
    - _Requirements: 2.10, 3.9_

- [x] 5. Observability fixes

  - [x] 5.1 Create structured logging utility
    - Create new file: server/utils/logger.js
    - Install and configure pino (or winston) with JSON output format
    - Configure log levels: error, warn, info, debug based on NODE_ENV
    - Include timestamps in ISO format
    - Export logger instance for use across the application
    - _Bug_Condition: isBugCondition(input) where loggingIsUnstructured()_
    - _Expected_Behavior: All logs in structured JSON format with levels and timestamps_
    - _Preservation: Application behavior unchanged, only log format changes_
    - _Requirements: 2.5_

  - [x] 5.2 Create request ID correlation middleware
    - Create new file: server/middleware/requestId.js
    - Generate UUID for each incoming request
    - Attach to req.id for use in downstream handlers
    - Include request ID in all log entries for that request
    - Add X-Request-ID response header
    - _Bug_Condition: isBugCondition(input) where loggingIsUnstructured()_
    - _Expected_Behavior: Every request has a unique correlation ID in logs and response headers_
    - _Preservation: No change to request/response body or status codes_
    - _Requirements: 2.5_

  - [x] 5.3 Implement production-safe error handler
    - Replace existing error handler in server/index.js
    - In production (NODE_ENV === 'production'): return generic "Internal Server Error" message
    - In development: return full error.message for debugging
    - Log full error details (stack, message, request info) server-side via structured logger
    - Include request ID in error log entries
    - _Bug_Condition: isBugCondition(input) where input.event == 'error' AND process.env.NODE_ENV == 'production'_
    - _Expected_Behavior: Generic error to client, full details logged server-side only_
    - _Preservation: Error responses still return { success: false, error: message } format_
    - _Requirements: 2.4, 3.8_

  - [x] 5.4 Replace morgan with structured request logging
    - Replace `app.use(morgan('dev'))` with pino-http or custom request logging middleware
    - Log method, url, status, response time, and request ID for each request
    - Use appropriate log levels (info for success, warn for 4xx, error for 5xx)
    - _Bug_Condition: isBugCondition(input) where loggingIsUnstructured()_
    - _Expected_Behavior: Request logs in structured JSON with correlation IDs_
    - _Preservation: No change to request processing or response behavior_
    - _Requirements: 2.5_

- [x] 6. Validation fixes

  - [x] 6.1 Add input validation to all API routes
    - Add express-validator validation chains to server/routes/schemes.js
    - Add express-validator validation chains to server/routes/marketplace.js
    - Add express-validator validation chains to server/routes/equipment.js
    - Add express-validator validation chains to server/routes/ai.js
    - Add express-validator validation chains to server/routes/emergency.js
    - Add express-validator validation chains to server/routes/tourism.js
    - Add express-validator validation chains to server/routes/weather.js
    - Add express-validator validation chains to server/routes/admin.js
    - Validate body, query, and param fields appropriate to each endpoint
    - Return 400 with validation errors for invalid input
    - _Bug_Condition: isBugCondition(input) where hasUnvalidatedInput(request)_
    - _Expected_Behavior: All input validated before reaching controllers, 400 for invalid_
    - _Preservation: Valid requests continue to be processed normally_
    - _Requirements: 2.8, 3.8_

- [x] 7. Quality infrastructure

  - [x] 7.1 Create PM2 ecosystem configuration
    - Create new file: ecosystem.config.js at project root
    - Configure cluster mode with instances based on CPU count
    - Set automatic restart on crash with max_restarts limit
    - Set memory limit (512MB max_old_space_size)
    - Configure log rotation and log file paths
    - Set environment variables for production (NODE_ENV=production)
    - _Bug_Condition: isBugCondition(input) where input.event == 'deploy' AND noProcessManager()_
    - _Expected_Behavior: PM2 manages process with clustering, restart, and memory limits_
    - _Preservation: Application behavior identical, only process management changes_
    - _Requirements: 2.14_

  - [x] 7.2 Set up test framework and write unit tests
    - Install Jest (or Vitest) as dev dependency
    - Create jest.config.js (or vitest.config.js) at project root
    - Add "test" script to package.json
    - Create tests/ directory structure
    - Write unit tests for: JWT secret validation, OTP generation (6-digit), MongoDB sanitization, profile allowlist, health check logic, error handler (prod vs dev), CORS validation, file upload size limit
    - _Bug_Condition: isBugCondition(input) where input.event == 'codeChange' AND noTestSuite()_
    - _Expected_Behavior: Test framework configured with unit tests for all security logic_
    - _Preservation: No runtime behavior change, tests run separately_
    - _Requirements: 2.15_

  - [ ] 7.3 Write integration tests for critical flows
    - Write integration tests for: registration → login → authenticated request flow
    - Write integration tests for: health check endpoint under various DB states
    - Write integration tests for: OTP rate limiting (6th request rejected)
    - Write integration tests for: file upload auth requirement and size limit
    - Write integration tests for: NoSQL injection blocked at middleware level
    - Write integration tests for: mass assignment rejected on profile update
    - Use supertest for HTTP testing against the Express app
    - _Bug_Condition: isBugCondition(input) where input.event == 'codeChange' AND noTestSuite()_
    - _Expected_Behavior: Integration tests verify end-to-end security flows_
    - _Preservation: No runtime behavior change, tests run separately_
    - _Requirements: 2.15, 3.2, 3.3_

  - [x] 7.4 Create CI/CD configuration
    - Create .github/workflows/ci.yml
    - Configure GitHub Actions to run on push and pull_request
    - Install dependencies, run linter (if configured), run test suite
    - Set up MongoDB service container for integration tests
    - Configure environment variables for test execution
    - _Bug_Condition: isBugCondition(input) where input.event == 'codeChange' AND noTestSuite()_
    - _Expected_Behavior: Automated test execution on every code change_
    - _Preservation: No runtime behavior change, CI runs in separate environment_
    - _Requirements: 2.15_

- [ ] 8. Verify bug condition exploration test now passes

  - [ ] 8.1 Re-run bug condition exploration test
    - **Property 1: Expected Behavior** - All 15 Defects Fixed
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior for all 15 defects
    - When this test passes, it confirms all security/reliability/observability fixes are working
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15_

  - [ ] 8.2 Re-run preservation tests
    - **Property 2: Preservation** - Existing Functionality Still Works
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Run full test suite (unit + integration + property-based tests)
  - Verify all 15 defects are addressed
  - Verify no regressions in existing functionality
  - Ensure all tests pass, ask the user if questions arise

## Task Dependency Graph

```json
{
  "waves": [
    ["1", "2"],
    ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7"],
    ["4.1", "4.2", "4.3"],
    ["5.1", "5.2", "5.3", "5.4"],
    ["6.1"],
    ["7.1", "7.2", "7.3", "7.4"],
    ["8.1", "8.2"],
    ["9"]
  ]
}
```

## Notes

- Tasks 1 and 2 MUST be completed before any implementation begins (tasks 3-7)
- Security fixes (task 3) are independent of each other and can be implemented in parallel
- Observability (task 5) should be implemented before validation (task 6) so that structured logging is available for validation error reporting
- The structured logger (5.1) must be created before graceful shutdown (4.2) and error handler (5.3) which depend on it
- PM2 config (7.1) and test framework (7.2-7.4) are independent of each other
- Task 8 re-runs the SAME tests from tasks 1 and 2 - no new tests are written
- All new dependencies (pino, express-mongo-sanitize or custom, supertest, jest) should use pinned versions
