/**
 * Preservation Property Tests (Task 2)
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**
 * 
 * These tests verify existing baseline behavior on UNFIXED code.
 * They must PASS on the current codebase to establish what must be preserved.
 * 
 * Property 2: Preservation - Existing API & Auth Behavior Unchanged
 * For all valid inputs that do NOT trigger bug conditions, the system processes
 * them correctly and returns expected response structures.
 */

const fc = require('fast-check');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const createTestApp = require('./createTestApp');

// Set env vars before loading app
process.env.JWT_SECRET = 'gramseva_jwt_secret_dev_key_2024';
process.env.JWT_EXPIRE = '7d';
process.env.NODE_ENV = 'development';

let app;
let User;

beforeAll(async () => {
  await setupTestDB();
  app = createTestApp();
  User = require('../server/models/User');
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

// ============================================================
// GENERATORS (fast-check v4 compatible)
// ============================================================

/**
 * Generate valid user names (alphabetic, 2-30 chars)
 */
const validNameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z ]{1,28}[a-zA-Z]$/)
  .filter(s => s.trim().length >= 2);

/**
 * Generate valid email addresses
 */
const validEmailArb = fc.emailAddress();

/**
 * Generate valid passwords (6+ chars alphanumeric)
 */
const validPasswordArb = fc.stringMatching(/^[a-zA-Z0-9]{6,20}$/);

/**
 * Generate valid phone numbers (Indian format, 10 digits starting with 6-9)
 */
const validPhoneArb = fc.stringMatching(/^[6-9][0-9]{9}$/);

/**
 * Generate valid profile update fields (only allowlisted fields, no $ operators)
 */
const validProfileUpdateArb = fc.record({
  name: fc.option(validNameArb, { nil: undefined }),
  state: fc.option(fc.constantFrom('Bihar', 'UP', 'MP', 'Rajasthan'), { nil: undefined }),
  district: fc.option(fc.constantFrom('Patna', 'Lucknow', 'Bhopal'), { nil: undefined }),
  village: fc.option(fc.constantFrom('Rampur', 'Sundarpur', 'Greenfield'), { nil: undefined }),
  language: fc.option(fc.constantFrom('hi', 'en', 'bn', 'ta'), { nil: undefined })
}).map(obj => {
  // Remove undefined values
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}).filter(obj => Object.keys(obj).length > 0);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Create a test user and return their JWT token
 */
async function createTestUser(overrides = {}) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('TestPass123', salt);
  
  const userData = {
    name: 'Test User',
    email: `testuser${Date.now()}${Math.random().toString(36).slice(2)}@test.com`,
    password: hashedPassword,
    role: 'farmer',
    language: 'hi',
    isVerified: true,
    ...overrides
  };
  
  const user = await User.create(userData);
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { user, token };
}

/**
 * Create an admin user and return their JWT token
 */
async function createAdminUser() {
  return createTestUser({ role: 'admin', email: `admin${Date.now()}@test.com` });
}

// ============================================================
// PROPERTY TESTS
// ============================================================

describe('Property 2: Preservation - Existing API & Auth Behavior Unchanged', () => {

  /**
   * **Validates: Requirements 3.1**
   * 
   * Property: For all valid JWT tokens, authentication continues to work.
   * Valid tokens signed with the current JWT_SECRET should authenticate
   * users and grant access to protected routes.
   */
  describe('3.1 - Valid JWT tokens authenticate users', () => {
    it('property: for all valid JWT tokens signed with the secret, authentication succeeds', async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArb,
          validEmailArb,
          async (name, email) => {
            // Create a user with a valid token
            const { token } = await createTestUser({ 
              name, 
              email: `${email.split('@')[0]}${Date.now()}${Math.random().toString(36).slice(2)}@${email.split('@')[1]}` 
            });

            // Use the token to access a protected route
            const res = await request(app)
              .get('/api/auth/me')
              .set('Authorization', `Bearer ${token}`);

            // Token should authenticate successfully
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
          }
        ),
        { numRuns: 5 } // Limited runs since each creates a DB user
      );
    });

    it('property: tokens without Bearer prefix are rejected', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token); // Missing 'Bearer' prefix

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('property: requests without token are rejected', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: User registration with valid credentials creates account and returns token.
   */
  describe('3.2 - User registration with valid credentials', () => {
    it('property: for all valid registration inputs, account is created with token', async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArb,
          validPasswordArb,
          async (name, password) => {
            const uniqueEmail = `user${Date.now()}${Math.random().toString(36).slice(2)}@test.com`;
            
            const res = await request(app)
              .post('/api/auth/register')
              .send({ name, email: uniqueEmail, password });

            // Registration should succeed
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe('string');
            expect(res.body.token.length).toBeGreaterThan(0);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.name).toBe(name);
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  /**
   * **Validates: Requirements 3.3**
   * 
   * Property: Login with correct email/phone + password returns token and user profile.
   */
  describe('3.3 - Login with correct credentials returns token', () => {
    it('property: for all valid login credentials, token and profile are returned', async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArb,
          validEmailArb,
          validPasswordArb,
          async (name, email, password) => {
            const uniqueEmail = `${email.split('@')[0]}${Date.now()}${Math.random().toString(36).slice(2)}@${email.split('@')[1]}`;
            
            // First register the user
            await request(app)
              .post('/api/auth/register')
              .send({ name, email: uniqueEmail, password });

            // Then login
            const res = await request(app)
              .post('/api/auth/login')
              .send({ email: uniqueEmail, password });

            // Login should succeed
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe('string');
            expect(res.body.user).toBeDefined();
            expect(res.body.user.name).toBe(name);
            expect(res.body.user.role).toBeDefined();
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  /**
   * **Validates: Requirements 3.5**
   * 
   * Property: API requests within rate limit (100/15min) are processed normally.
   */
  describe('3.5 - Requests within rate limit are processed', () => {
    it('property: sequential requests within limit are not throttled', async () => {
      const { token } = await createTestUser();

      // Make several requests - all should succeed (well within 100 limit)
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  /**
   * **Validates: Requirements 3.6**
   * 
   * Property: Frontend static assets and page files are served correctly.
   */
  describe('3.6 - Frontend static assets served correctly', () => {
    it('property: index.html is served for root path', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });

    it('property: CSS files are served with correct content type', async () => {
      const res = await request(app).get('/assets/css/main.css');
      // Should return 200 if file exists, or fallback to index.html
      expect([200, 304]).toContain(res.status);
    });

    it('property: page files are served correctly', async () => {
      const pages = ['/pages/login.html', '/pages/dashboard.html', '/pages/admin.html'];
      
      for (const page of pages) {
        const res = await request(app).get(page);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
      }
    });

    it('property: manifest.json is served', async () => {
      const res = await request(app).get('/manifest.json');
      expect(res.status).toBe(200);
    });
  });

  /**
   * **Validates: Requirements 3.8**
   * 
   * Property: For all valid authenticated requests with proper input (no $ operators,
   * no mass assignment, within size limits), the system processes them correctly
   * and returns expected response structures.
   */
  describe('3.8 - Domain endpoints return correct data for valid requests', () => {
    it('property: GET /api/schemes returns array data for authenticated users', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/schemes')
        .set('Authorization', `Bearer ${token}`);

      // Should return success with data (even if empty array)
      expect([200, 304]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
      }
    });

    it('property: GET /api/marketplace returns products list', async () => {
      const res = await request(app)
        .get('/api/marketplace');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('property: GET /api/equipment returns equipment list', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 304]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
      }
    });

    it('property: valid authenticated requests return { success: true } structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/api/auth/me'),
          async (endpoint) => {
            const { token } = await createTestUser();

            const res = await request(app)
              .get(endpoint)
              .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  /**
   * **Validates: Requirements 3.2 (profile updates)**
   * 
   * Property: For all valid profile update fields (name, state, district, village, language),
   * the system processes them correctly.
   */
  describe('3.2 - Valid profile updates are processed', () => {
    it('property: for all valid profile fields, update succeeds', async () => {
      await fc.assert(
        fc.asyncProperty(
          validProfileUpdateArb,
          async (profileData) => {
            const { token } = await createTestUser();

            const res = await request(app)
              .put('/api/auth/profile')
              .set('Authorization', `Bearer ${token}`)
              .send(profileData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
            
            // Verify the fields were actually updated
            for (const [key, value] of Object.entries(profileData)) {
              if (value !== undefined) {
                expect(res.body.user[key]).toBe(value);
              }
            }
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  /**
   * **Validates: Requirements 3.7**
   * 
   * Property: For all valid file uploads under 5MB by authenticated users,
   * uploads are accepted. (On unfixed code, the limit is 50MB, so anything
   * under 5MB should definitely work.)
   */
  describe('3.7 - Valid file uploads under 5MB are accepted', () => {
    it('property: for all valid small file uploads, the system accepts them', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random file sizes between 1KB and 10KB (small for test speed)
          fc.integer({ min: 1024, max: 10240 }),
          fc.constantFrom('test.jpg', 'photo.png', 'doc.pdf'),
          fc.constantFrom('dairy', 'blankets', 'handicrafts', 'homemade', 'organic', 'farming'),
          async (fileSize, filename, category) => {
            const { token } = await createTestUser({ role: 'seller' });

            // Create a buffer of the specified size
            const buffer = Buffer.alloc(fileSize);

            const res = await request(app)
              .post('/api/marketplace')
              .set('Authorization', `Bearer ${token}`)
              .field('name', 'Test Product')
              .field('description', 'A test product for marketplace')
              .field('price', '100')
              .field('category', category)
              .field('unit', 'kg')
              .attach('images', buffer, { filename, contentType: 'image/jpeg' });

            // The upload should be accepted (file is well under any limit)
            // Status 201 for created, or 200 for success
            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  /**
   * **Validates: Requirements 3.9**
   * 
   * Property: Successful first-attempt MongoDB connection starts server without delay.
   * (Verified by the fact that our test setup connects successfully and the app works.)
   */
  describe('3.9 - Successful DB connection works without delay', () => {
    it('property: app responds immediately when DB is connected', async () => {
      // The fact that we can make requests proves the DB connected successfully
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected

      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });
  });

  /**
   * **Validates: Requirements 3.10**
   * 
   * Property: Admin role-based authorization enforces access control.
   */
  describe('3.10 - Admin authorization enforces access control', () => {
    it('property: admin users can access admin routes', async () => {
      const { token } = await createAdminUser();

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('property: non-admin users are rejected from admin routes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('farmer', 'seller', 'equipment_owner'),
          async (role) => {
            const { token } = await createTestUser({ 
              role,
              email: `${role}${Date.now()}${Math.random().toString(36).slice(2)}@test.com`
            });

            const res = await request(app)
              .get('/api/admin/dashboard')
              .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
