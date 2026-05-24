# Bugfix Requirements Document

## Introduction

The GramSeva platform — an Express.js + MongoDB + Socket.IO application serving rural communities in India — has multiple critical production-readiness gaps. These include exposed secrets, missing health checks, no graceful shutdown, error detail leakage, unstructured logging, overly permissive CORS, disabled CSP, missing input validation, OTP security weaknesses, no database reconnection logic, oversized file uploads without access control, mass assignment vulnerabilities, no MongoDB injection protection, no process manager configuration, and no test suite. These issues collectively make the application unsafe for production deployment and vulnerable to common attack vectors.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the server starts THEN the system uses a weak, guessable JWT secret ("gramseva_jwt_secret_dev_key_2024") that can be brute-forced to forge authentication tokens

1.2 WHEN a load balancer or monitoring system sends a request to check application health THEN the system has no /health or /ready endpoint and returns a 404 or the frontend index.html

1.3 WHEN the process receives SIGTERM or SIGINT THEN the system terminates immediately without draining in-flight requests, closing database connections, or disconnecting Socket.IO clients

1.4 WHEN an unhandled error occurs in production THEN the system sends the raw error.message (including stack traces and internal details) directly to the client in the 500 response

1.5 WHEN the application logs events THEN the system uses unstructured console.log/console.error with no log levels, no timestamps in structured format, and no request correlation IDs

1.6 WHEN a cross-origin request is made THEN the system accepts requests from any origin via cors() with no restriction and Socket.IO cors origin set to '*'

1.7 WHEN the server applies security headers via Helmet THEN the system explicitly disables Content-Security-Policy (contentSecurityPolicy: false), removing XSS protection headers

1.8 WHEN requests are made to non-auth API routes (schemes, marketplace, equipment, ai, emergency, tourism, weather, admin) THEN the system accepts unvalidated input with no express-validator checks

1.9 WHEN an OTP is generated THEN the system creates a 4-digit code (only 10,000 combinations, brute-forceable), logs the OTP to console in plaintext, and has no dedicated rate limiting on the OTP endpoint

1.10 WHEN the initial MongoDB connection fails THEN the system calls process.exit(1) immediately with no retry logic or exponential backoff

1.11 WHEN a file is uploaded THEN the system allows files up to 50MB, stores them locally with no access control, and serves the uploads directory as public static files

1.12 WHEN a user calls updateProfile THEN the system only blocks password and role fields but allows an attacker to set isVerified, otp, otpExpiry, savedSchemes, or any other model field via mass assignment

1.13 WHEN user-supplied values are used in MongoDB queries THEN the system performs no explicit sanitization against NoSQL injection operators ($gt, $ne, $regex, etc.)

1.14 WHEN the application is started in production THEN the system runs as a bare node process with no process manager (PM2), no cluster mode, and no automatic restart on crash

1.15 WHEN code changes are made THEN the system has no test framework, no unit tests, no integration tests, and no CI/CD configuration to catch regressions

### Expected Behavior (Correct)

2.1 WHEN the server starts THEN the system SHALL require a cryptographically random JWT secret of at least 256 bits (32 bytes) and SHALL refuse to start if JWT_SECRET is missing or matches known weak defaults

2.2 WHEN a request is made to GET /health THEN the system SHALL respond with a JSON payload containing application status, database connectivity status, and uptime information with appropriate HTTP status codes (200 for healthy, 503 for degraded)

2.3 WHEN the process receives SIGTERM or SIGINT THEN the system SHALL stop accepting new connections, wait for in-flight requests to complete (with a configurable timeout), close the database connection gracefully, disconnect Socket.IO clients, and then exit with code 0

2.4 WHEN an unhandled error occurs in production THEN the system SHALL return a generic error message ("Internal Server Error") to the client and SHALL log the full error details server-side only; in development mode, detailed errors MAY be returned

2.5 WHEN the application logs events THEN the system SHALL use a structured logging library (e.g., pino or winston) with configurable log levels (error, warn, info, debug), JSON format output, timestamps, and request correlation IDs

2.6 WHEN a cross-origin request is made THEN the system SHALL validate the request origin against a configurable allowlist of permitted origins defined via environment variable, rejecting requests from unlisted origins

2.7 WHEN the server applies security headers THEN the system SHALL enable Content-Security-Policy with appropriate directives that allow the application to function while blocking inline scripts and unauthorized resource loading

2.8 WHEN requests are made to API routes THEN the system SHALL validate and sanitize all input parameters using express-validator (or equivalent) before processing, returning 400 errors for invalid input

2.9 WHEN an OTP is generated THEN the system SHALL create a 6-digit code (1,000,000 combinations), SHALL NOT log the OTP value, and SHALL enforce dedicated rate limiting (max 5 OTP requests per phone number per 15 minutes) on the OTP endpoint

2.10 WHEN a MongoDB connection attempt fails THEN the system SHALL retry with exponential backoff (up to 5 attempts with increasing delays) before exiting, and SHALL handle runtime disconnections with automatic reconnection

2.11 WHEN a file is uploaded THEN the system SHALL enforce a maximum file size of 5MB, SHALL require authentication for upload access, and SHALL NOT serve uploaded files without verifying the requesting user has appropriate permissions

2.12 WHEN a user calls updateProfile THEN the system SHALL only allow updating an explicit allowlist of fields (name, avatar, state, district, village, language) and SHALL reject any other fields

2.13 WHEN user-supplied values are used in MongoDB queries THEN the system SHALL sanitize input to strip MongoDB operators (keys starting with $) from request body, query parameters, and route parameters

2.14 WHEN the application is deployed to production THEN the system SHALL include PM2 ecosystem configuration with cluster mode, automatic restart on crash, memory limits, and log rotation

2.15 WHEN code changes are made THEN the system SHALL have a test framework (Jest or Vitest) configured with at minimum: unit tests for auth logic, integration tests for critical API endpoints, and a CI configuration file for automated test execution

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid JWT token is presented in the Authorization header THEN the system SHALL CONTINUE TO authenticate the user and grant access to protected routes

3.2 WHEN a user registers with valid credentials THEN the system SHALL CONTINUE TO create the user account, hash the password, and return a signed JWT token

3.3 WHEN a user logs in with correct email/phone and password THEN the system SHALL CONTINUE TO return a valid JWT token and user profile information

3.4 WHEN Socket.IO clients connect with a valid auth token THEN the system SHALL CONTINUE TO allow real-time messaging, chat history retrieval, and typing indicators

3.5 WHEN API requests are made within the rate limit (100 requests per 15 minutes) THEN the system SHALL CONTINUE TO process them normally without throttling

3.6 WHEN the frontend requests static assets or page files THEN the system SHALL CONTINUE TO serve them correctly from the frontend directory

3.7 WHEN valid file uploads (images, videos, PDFs) are submitted by authenticated users THEN the system SHALL CONTINUE TO accept and store them (subject to the new size limit)

3.8 WHEN marketplace, equipment, scheme, tourism, weather, emergency, and AI endpoints receive valid authenticated requests THEN the system SHALL CONTINUE TO return correct data and perform expected operations

3.9 WHEN the MongoDB connection is established successfully on first attempt THEN the system SHALL CONTINUE TO start normally without unnecessary delays

3.10 WHEN admin users access admin-only routes THEN the system SHALL CONTINUE TO enforce role-based authorization via the authorize middleware
