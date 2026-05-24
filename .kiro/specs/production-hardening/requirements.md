# Requirements Document

## Introduction

This specification defines the production-hardening and refactoring initiative for the GramSeva application. The goal is to refactor, stabilize, optimize, and productionize the entire application without breaking existing functionality. This includes cleaning up dead code, creating reusable components, restructuring into clean production-grade architecture, standardizing the UI/design system, enforcing code quality principles, optimizing performance, implementing robust error handling, improving security, and ensuring deployment readiness.

**Critical Constraints:**
- All existing functionality MUST be preserved
- All UI/UX behavior MUST remain unchanged
- All API contracts MUST remain backward-compatible
- All existing routes and integrations MUST continue to work
- Database schema MUST NOT change
- Refactoring MUST be incremental and safe

## Glossary

- **Application**: The GramSeva full-stack web application consisting of a Node.js/Express backend and vanilla HTML/CSS/JS frontend
- **Backend**: The Node.js/Express server located in the `server/` directory
- **Frontend**: The vanilla HTML/CSS/JavaScript client located in the `frontend/` directory
- **API_Contract**: The set of existing HTTP endpoints, their request/response shapes, and status codes as documented in the README
- **Dead_Code**: Unused imports, unreachable code blocks, commented-out code, and unused variables or functions
- **Shared_Utility**: A reusable JavaScript module providing common functionality used across multiple files
- **Design_System**: A standardized set of UI components, icons, colors, and typography rules applied consistently across all pages
- **Error_Boundary**: A structured error handling mechanism that catches, logs, and gracefully recovers from runtime errors
- **Rate_Limiter**: The express-rate-limit middleware that throttles API requests per time window
- **Service_Layer**: An abstraction layer between controllers and external APIs/database operations
- **Environment_Config**: Application configuration loaded from environment variables via dotenv
- **PWA**: Progressive Web App capabilities provided by the service worker and manifest.json

## Requirements

### Requirement 1: Dead Code Removal

**User Story:** As a developer, I want all dead code removed from the codebase, so that the application is easier to maintain and has a smaller footprint.

#### Acceptance Criteria

1. THE Application SHALL contain no unused import statements or require() calls in any JavaScript file, where "unused" means the imported/required binding is never referenced after its declaration within the same file or re-exported for external use
2. THE Application SHALL contain no commented-out code blocks exceeding two consecutive lines in any JavaScript file, excluding JSDoc documentation comments and license headers
3. THE Application SHALL contain no unreachable code after return, throw, break, or continue statements within the same block scope
4. THE Application SHALL contain no function declarations or variable assignments that are never invoked or read within the project source files (excluding node_modules), where exported symbols referenced by at least one other project file are considered used
5. THE Application SHALL contain no duplicate function implementations across files, where "duplicate" means two or more functions with identical logic (same AST structure or identical function body after whitespace normalization) that can be consolidated into a single shared utility
6. THE Application SHALL exclude third-party dependencies (node_modules), generated files, and build artifacts from all dead code analysis criteria

### Requirement 2: Shared Utilities Extraction

**User Story:** As a developer, I want common logic extracted into shared utility modules, so that code duplication is eliminated and maintenance is simplified.

#### Acceptance Criteria

1. THE Frontend SHALL provide a Shared_Utility module for HTTP request handling including authentication headers, error parsing, and base URL configuration
2. THE Frontend SHALL provide a Shared_Utility module for DOM manipulation including element creation, class toggling, and event delegation
3. THE Frontend SHALL provide a Shared_Utility module for form validation including required field checks and input sanitization
4. THE Backend SHALL provide a Shared_Utility module for standardized API response formatting with consistent success and error shapes
5. THE Backend SHALL provide a Shared_Utility module for async controller error wrapping that eliminates repetitive try-catch blocks
6. WHEN a Shared_Utility module is created, THE Application SHALL replace all duplicate inline implementations with calls to the shared module

### Requirement 3: Backend Architecture Restructuring

**User Story:** As a developer, I want the backend restructured into a clean layered architecture, so that business logic is separated from HTTP handling and external service calls.

#### Acceptance Criteria

1. THE Backend SHALL implement a Service_Layer within `server/services/` where each service module encapsulates the business logic for one domain (e.g., AI, weather, marketplace, equipment, schemes, tourism, emergency, auth) and exposes functions that accept plain data parameters and return plain data results without referencing Express request or response objects
2. THE Backend SHALL ensure controllers contain only request/response handling: extracting parameters from `req` (query, body, params, file), invoking the corresponding service function, and sending the service result via `res.json()` with no direct calls to third-party APIs or database queries within controller files
3. THE Backend SHALL organize all third-party API integrations (Gemini, OpenWeather, Razorpay) into dedicated service modules within `server/services/`, with one module per external provider (e.g., `geminiService.js`, `openWeatherService.js`, `razorpayService.js`), each exporting functions that encapsulate HTTP calls and response parsing for that provider
4. THE Backend SHALL maintain all existing API_Contract endpoints with identical request/response shapes after restructuring, verified by confirming that every route path, HTTP method, request parameter structure, and JSON response body structure defined in `server/routes/` remains unchanged
5. THE Backend SHALL implement a centralized error handling middleware that catches all unhandled errors and responds with a JSON object containing at minimum the fields `success` (boolean, always `false`), `error` (string describing the failure), and an HTTP status code of 500 for unexpected errors or the status code attached to the error object if present
6. IF a third-party service (Gemini, OpenWeather, or Razorpay) is unreachable or returns a non-success response, THEN THE Backend service module for that provider SHALL return a predefined fallback response rather than propagating the failure, so that the calling domain service can still return a valid response to the controller
7. THE Backend SHALL ensure that input validation logic using express-validator remains in route definitions or controller-level middleware and is not moved into the Service_Layer, so that validation executes before service invocation

### Requirement 4: Frontend Component Standardization

**User Story:** As a developer, I want the frontend organized into consistent, reusable component patterns, so that new features can be built faster and the UI remains consistent.

#### Acceptance Criteria

1. THE Frontend SHALL organize each page-specific JavaScript into a self-contained module that exports an initialization function named `init<ModuleName>()` which binds event listeners and triggers initial data loading, and that does not depend on global variables other than `API_BASE`, `currentLang`, and `authToken`
2. THE Frontend SHALL provide a shared card-rendering component that accepts a configuration object containing title, description, image URL, category label, primary action label, and primary action callback, and returns the card's HTML string
3. THE Frontend SHALL use the shared card-rendering component for all card displays in the schemes, marketplace, equipment, and tourism sections, with no section containing its own inline HTML-template string for card layout
4. THE Frontend SHALL provide a shared filter-and-search component that renders a text input for keyword search and one or more dropdown elements for category filtering, accepts a list of filter field definitions and a callback invoked on filter change, and debounces text input by 300 milliseconds before invoking the callback
5. THE Frontend SHALL provide a shared loading-state component that displays an animated placeholder skeleton in the target container, and a shared empty-state component that displays an icon and a configurable message indicating no results were found
6. WHEN a data-fetching section begins loading data, THE Frontend SHALL display the shared loading-state component in the target container until data is received or an error occurs
7. IF a data-fetching section receives an empty result set and no error, THEN THE Frontend SHALL display the shared empty-state component in the target container

### Requirement 5: UI Design System Standardization

**User Story:** As a developer, I want a consistent design system applied across all pages, so that the application looks professional and cohesive.

#### Acceptance Criteria

1. THE Frontend SHALL use SVG icons or an icon library for all UI elements, with zero emoji characters (Unicode emoji such as 📍, 🚜, 🎙, 🌾) present in any rendered page
2. THE Frontend SHALL define a color palette in CSS custom properties (within :root in main.css) or Tailwind configuration, and every page SHALL reference only these defined color tokens rather than hard-coded color values in inline styles or page-level stylesheets
3. THE Frontend SHALL apply the design tokens defined in main.css for card and section components: border-radius of 1rem, box-shadow matching the existing card hover shadow, and spacing (padding) of 1.5rem for card content areas, with no more than 2px deviation across all pages
4. THE Frontend SHALL ensure all pages (login, dashboard, admin, chatbot, crop-disease, equipment-booking, mnrega) include the same font-family declarations (Inter, Poppins, Noto Sans Devanagari), the same Tailwind configuration extending the shared color and font tokens, and a link to the shared main.css stylesheet; pages that use a distinct layout structure (such as the split-panel login page) SHALL still apply the shared color palette and typography tokens
5. THE Frontend SHALL maintain all existing user interaction behavior (click handlers, form submissions, navigation links, and dynamic content loading) after standardization, verified by confirming that each interactive element on every page triggers the same action as before the change

### Requirement 6: Code Quality Enforcement

**User Story:** As a developer, I want the codebase to follow SOLID and DRY principles with proper documentation, so that the code is readable, testable, and maintainable.

#### Acceptance Criteria

1. THE Application SHALL ensure each function performs a single responsibility with a maximum cyclomatic complexity of 10
2. THE Application SHALL ensure no function exceeds 50 lines of code excluding blank lines and comments
3. THE Application SHALL include JSDoc comments on all exported functions documenting parameters, return types, and purpose
4. THE Backend SHALL ensure each Mongoose model file contains only the schema definition, validation rules, and model export, with instance methods, static methods, hooks, and query logic placed in separate service or utility modules
5. THE Application SHALL use variable and function names that are a minimum of 3 characters long, use camelCase for variables and functions, use PascalCase for classes, and avoid abbreviations unless defined in the project glossary, with single-letter names permitted only for loop iterators
6. IF a block of logic consisting of 3 or more statements is duplicated in 2 or more locations, THEN THE Application SHALL extract that logic into a shared reusable function

### Requirement 7: Performance Optimization

**User Story:** As a user, I want the application to load and respond quickly, so that I can access services even on slow rural network connections.

#### Acceptance Criteria

1. THE Frontend SHALL implement lazy loading for images that are below the viewport fold, initiating image fetch when the image element is within 200 pixels of the visible viewport boundary
2. THE Frontend SHALL defer loading of non-critical JavaScript (GSAP animations, component scripts) until after the DOMContentLoaded event has fired, using the `defer` or dynamic import mechanism
3. THE Backend SHALL implement response caching for weather API data with a time-to-live of 10 minutes, serving the cached response for repeated identical requests within that window without calling the external weather API
4. THE Backend SHALL implement response caching for government schemes data with a time-to-live of 1 hour, serving the cached response for repeated identical requests within that window without querying the database
5. THE Frontend SHALL batch DOM updates when rendering lists of cards (schemes, products, equipment) by constructing the complete list markup before performing a single DOM insertion, rather than appending elements individually in a loop
6. THE Backend SHALL add database index definitions on the fields used for filtering and sorting in list queries: scheme state, scheme category, product category, equipment type, and createdAt timestamp
7. WHEN the Frontend is loaded on a network connection of 3G speed (approximately 750 Kbps), THE Frontend SHALL render above-the-fold content within 5 seconds and achieve full interactive state within 8 seconds
8. THE Frontend SHALL keep the total initial page transfer size (HTML, CSS, and critical JavaScript before deferred scripts) to no more than 500 KB uncompressed
9. IF the Backend cache is unavailable or has expired, THEN THE Backend SHALL fetch fresh data from the source and respond to the client within 3 seconds for weather endpoints and within 2 seconds for schemes list endpoints

### Requirement 8: Error Handling and Stability

**User Story:** As a user, I want the application to handle errors gracefully without crashing, so that I can continue using other features when one service is unavailable.

#### Acceptance Criteria

1. WHEN an API request returns an HTTP error status (4xx or 5xx) or a network failure occurs, THE Frontend SHALL display a non-technical error message in the current language that describes the failed action and a suggested next step, without exposing stack traces, server paths, or internal error codes
2. WHEN an external service (Gemini, OpenWeather, Razorpay) is unavailable or does not respond within 10 seconds, THE Backend SHALL return an HTTP 503 status code with a JSON body containing `success: false` and a `fallback` field providing cached or default data for Gemini (offline keyword-based responses) and OpenWeather (last-known or static weather data), or an empty fallback for Razorpay
3. IF an unhandled exception occurs in a route handler, THEN THE Backend SHALL log the full error stack trace to the server log and return an HTTP 500 response with a JSON body containing `success: false` and a generic error field without leaking internal file paths, stack traces, or configuration details
4. WHEN a network request does not receive a response within 15 seconds, THE Frontend SHALL abort the request, display an inline error message indicating the timeout, and present a "Retry" button that re-initiates the same request when activated
5. THE Frontend SHALL wrap each major section (schemes, marketplace, equipment, AI assistant, weather, tourism) in an independent error-containment boundary so that a JavaScript exception in one section does not prevent rendering or interaction in the remaining sections
6. WHEN the MongoDB connection is lost, THE Backend SHALL attempt automatic reconnection using exponential backoff starting at 1 second, doubling on each attempt up to a maximum interval of 30 seconds, for a maximum of 10 reconnection attempts, and SHALL log each connection state change (disconnected, reconnecting, reconnected, failed)
7. IF all MongoDB reconnection attempts are exhausted without success, THEN THE Backend SHALL log a critical-level error and continue running to serve requests that do not require database access, returning HTTP 503 with an error message indicating database unavailability for database-dependent routes

### Requirement 9: Security Hardening

**User Story:** As an administrator, I want the application secured against common web vulnerabilities, so that user data and system integrity are protected.

#### Acceptance Criteria

1. THE Backend SHALL validate and sanitize all user input on every API endpoint using express-validator before processing
2. IF input validation fails on any API endpoint, THEN THE Backend SHALL reject the request with a 400 status and a response body containing the list of validation errors without exposing internal system details
3. THE Backend SHALL store all sensitive configuration (API keys, database credentials, JWT secrets) exclusively in environment variables and never in source code
4. THE Backend SHALL implement rate limiting on all API endpoints, allowing a maximum of 100 requests per 15-minute window per IP address, and returning a 429 status with an error message when the limit is exceeded
5. THE Frontend SHALL sanitize all user-generated content before rendering it in the DOM to prevent XSS attacks
6. THE Backend SHALL configure Helmet middleware with Content Security Policy that restricts script sources to same-origin and explicitly trusted external domains, and restricts object and frame sources to none
7. THE Backend SHALL issue JWT access tokens with a maximum expiration of 7 days, and the auth middleware SHALL reject tokens that have exceeded their expiration time
8. IF an authentication token is invalid or expired, THEN THE Backend SHALL return a 401 status with a JSON body containing `success: false` and an error message indicating the authentication failure, and THE Frontend SHALL redirect the user to the login page
9. THE Backend SHALL configure CORS to allow requests only from explicitly listed origin domains defined in environment variables, rejecting requests from unlisted origins

### Requirement 10: Deployment Readiness

**User Story:** As a DevOps engineer, I want the application ready for production deployment, so that it can be reliably hosted and monitored.

#### Acceptance Criteria

1. THE Application SHALL provide a Dockerfile with multi-stage build that separates a dependency-installation stage from a final application stage, resulting in a final image that excludes devDependencies and build tools
2. WHEN a GET request is made to `/api/health`, THE Application SHALL return a JSON response within 5 seconds containing fields for status ("healthy" or "unhealthy"), database connectivity (connected or disconnected), and server uptime in seconds, with HTTP 200 when all checks pass and HTTP 503 when any check fails
3. THE Backend SHALL implement structured JSON logging where each log entry contains a timestamp in ISO 8601 format, a severity level (one of "info", "warn", "error"), and a message field
4. THE Application SHALL load all environment-specific configuration values (database URI, API keys, port, JWT secret) from environment variables, requiring no code changes to switch between development, staging, and production environments
5. WHEN a SIGTERM or SIGINT signal is received, THE Backend SHALL stop accepting new connections, wait for in-flight requests to complete up to a maximum of 30 seconds, close database connections, and then exit the process
6. IF in-flight requests do not complete within the 30-second shutdown timeout, THEN THE Backend SHALL force-terminate remaining connections and exit the process
7. THE Application SHALL provide a docker-compose.yml for local development that includes the application service and a MongoDB service, with the application service depending on MongoDB being available

### Requirement 11: PWA and Offline Stability

**User Story:** As a rural user with intermittent connectivity, I want the application to work reliably offline, so that I can access cached information when network is unavailable.

#### Acceptance Criteria

1. THE Frontend SHALL implement a service worker using a network-first caching strategy that caches all static assets defined in the precache list (HTML, CSS, JS, images) upon successful service worker installation, and SHALL serve subsequent requests from cache when the network request fails within 3 seconds
2. WHEN the network becomes unavailable, THE Frontend SHALL display a persistent offline indicator visible on all pages within 2 seconds of connectivity loss, and SHALL continue to serve all previously cached pages and assets from the local cache
3. THE Frontend SHALL provide a valid manifest.json that includes at minimum a name, short_name, start_url set to the application root, display mode set to standalone, theme_color, and icons in both 192x192 and 512x512 sizes, enabling the browser install prompt for PWA installation
4. WHEN the network is restored, THE Frontend SHALL automatically synchronize all queued user actions (bookmarks, form submissions) with the server in the order they were created, storing a maximum of 50 pending actions in IndexedDB while offline
5. IF synchronization of a queued action fails after 3 retry attempts, THEN THE Frontend SHALL retain the failed action in the queue, display a notification to the user indicating which action failed to sync, and reattempt synchronization on the next connectivity restoration event

### Requirement 12: Backward Compatibility Verification

**User Story:** As a developer, I want automated verification that refactoring preserves existing behavior, so that regressions are caught before deployment.

#### Acceptance Criteria

1. WHEN any of the existing URL routes (`/`, `/pages/login.html`, `/pages/dashboard.html`, `/pages/admin.html`, `/pages/chatbot.html`, `/pages/crop-disease.html`, `/pages/equipment-booking.html`, `/pages/mnrega.html`) is requested via HTTP GET, THE Application SHALL return an HTTP 200 status code and an HTML response whose `<title>` element and primary content container match the pre-refactoring baseline
2. THE Application SHALL maintain all existing API endpoints (`/api/auth`, `/api/schemes`, `/api/marketplace`, `/api/equipment`, `/api/ai`, `/api/emergency`, `/api/tourism`, `/api/weather`, `/api/admin`) with identical HTTP methods, URL paths, request body field names and types, and response JSON field names, nesting structure, and value types as documented in the pre-refactoring baseline
3. THE Backend SHALL maintain all existing database model schemas (User, ChatMessage, Equipment, Order, Product, Scheme, Tourism) without field additions, removals, or type changes
4. THE Application SHALL maintain all existing WebSocket events (`sendMessage`, `getChatHistory`, `markRead`, `typing` as client-emitted events and `newMessage`, `messageSent`, `chatHistory`, `messagesRead`, `userTyping`, `error` as server-emitted events) with identical payload field names and value types
5. THE Frontend SHALL maintain all existing localStorage keys (`gramseva_token` as a JWT string, `gramseva_lang` as a language code string of 2 characters, `gramseva_theme` as either `light` or `dark`, `gramseva_user` as a JSON-serialized user object) with read and write operations preserving these formats
6. IF a refactoring change causes any existing API endpoint to return a different HTTP status code, add or remove a response JSON field, or change a field's value type compared to the pre-refactoring baseline, THEN THE Application SHALL fail the backward compatibility verification and report which endpoint and field diverged
7. IF a refactoring change causes any existing WebSocket event to add, remove, or rename a payload field compared to the pre-refactoring baseline, THEN THE Application SHALL fail the backward compatibility verification and report which event and field diverged
