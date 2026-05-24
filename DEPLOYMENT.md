# GramSeva Production Deployment Guide

## Prerequisites

- Node.js 20+ installed
- MongoDB Atlas account
- Render/Railway account (backend)
- Vercel/Netlify account (frontend)
- Cloudinary account (media storage)
- Domain name (optional but recommended)

---

## Step 1: Environment Setup

### Generate a Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output — this is your production JWT_SECRET.

### Production Environment Variables

Create these on your deployment platform:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gramseva?retryWrites=true&w=majority
JWT_SECRET=<your-64-char-random-hex-string>
JWT_EXPIRE=7d
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
GEMINI_API_KEY=<your-gemini-key>
OPENAI_API_KEY=<your-openai-key>
OPENWEATHER_API_KEY=<your-openweather-key>
OTP_API_KEY=<your-otp-service-key>
OTP_SENDER_ID=GRMSVA
```

---

## Step 2: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (M0 free tier or M10+ for production)
3. Create a database user with a strong password
4. Whitelist IP addresses:
   - For Render/Railway: whitelist `0.0.0.0/0` (all IPs) since they use dynamic IPs
   - For specific IPs: add your server's IP
5. Get connection string: Click "Connect" → "Connect your application" → Copy the URI
6. Replace `<password>` with your database user's password

### Recommended Indexes

```javascript
// Run in MongoDB Atlas shell or via mongoose
db.users.createIndex({ email: 1 }, { unique: true, sparse: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.products.createIndex({ category: 1, createdAt: -1 });
db.schemes.createIndex({ category: 1, state: 1 });
db.equipment.createIndex({ category: 1, available: 1 });
```

---

## Step 3: Backend Deployment (Render)

### Option A: Render

1. Go to [Render](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. Settings:
   - **Name**: gramseva-api
   - **Root Directory**: `gramseva` (if monorepo)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Starter ($7/mo) or higher
4. Add all environment variables from Step 1
5. Deploy

### Option B: Railway

1. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
2. Select your repository
3. Settings:
   - **Start Command**: `npm start`
4. Add environment variables in the Variables tab
5. Railway auto-detects Node.js and deploys

### Health Check

After deployment, verify: `GET https://your-backend-url.com/health`

Expected response:
```json
{"status":"healthy","db":"connected","uptime":123.45,"timestamp":"2026-05-24T..."}
```

---

## Step 4: Frontend Deployment (Vercel)

### Option A: Vercel

1. Go to [Vercel](https://vercel.com) → New Project
2. Import your GitHub repository
3. Settings:
   - **Framework Preset**: Other
   - **Root Directory**: `gramseva/frontend`
   - **Build Command**: (leave empty — static files)
   - **Output Directory**: `.` (current directory)
4. Deploy

### Option B: Netlify

1. Go to [Netlify](https://netlify.com) → Add new site → Import from Git
2. Settings:
   - **Base directory**: `gramseva/frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `gramseva/frontend`
3. Deploy

### Frontend Configuration

Update the API base URL in your frontend JavaScript to point to your backend:
```javascript
const API_BASE = 'https://your-backend-url.com';
```

---

## Step 5: Domain & SSL

### Custom Domain (Vercel)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL is automatic

### Custom Domain (Render)
1. Go to Service Settings → Custom Domains
2. Add your domain
3. Add CNAME record pointing to your Render URL
4. SSL is automatic

---

## Step 6: PM2 Setup (if self-hosting)

```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem config
pm2 start ecosystem.config.js --env production

# Save process list
pm2 save

# Setup startup script (auto-start on reboot)
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs gramseva
```

---

## Step 7: Post-Deployment Verification

### Checklist

- [ ] `GET /health` returns 200 with `"status":"healthy"`
- [ ] Registration works: `POST /api/auth/register`
- [ ] Login works: `POST /api/auth/login`
- [ ] OTP flow works: `POST /api/auth/send-otp` → `POST /api/auth/verify-otp`
- [ ] Protected routes reject unauthenticated requests (401)
- [ ] Rate limiting works (100 req/15min on /api/)
- [ ] OTP rate limiting works (5 req/15min per phone)
- [ ] CORS rejects unauthorized origins
- [ ] CSP headers present in responses
- [ ] Error responses don't leak internal details
- [ ] File uploads reject files > 5MB
- [ ] NoSQL injection operators are stripped
- [ ] Frontend loads correctly
- [ ] PWA installs on mobile
- [ ] Offline mode works for cached pages

### Terminal Commands for Verification

```bash
# Health check
curl https://your-backend.com/health

# Test CORS rejection
curl -H "Origin: https://evil.com" -I https://your-backend.com/api/auth/me

# Test rate limiting
for i in {1..101}; do curl -s -o /dev/null -w "%{http_code}\n" https://your-backend.com/api/schemes; done

# Test CSP header
curl -I https://your-backend.com/ | grep -i content-security-policy
```

---

## Step 8: Monitoring & Backups

### MongoDB Atlas Backups
- Enable continuous backup in Atlas (available on M10+)
- Or schedule daily snapshots

### Application Monitoring
- Use Render/Railway built-in metrics
- Or add Sentry for error tracking:
  ```bash
  npm install @sentry/node
  ```

### Log Monitoring
- Structured JSON logs (pino) are production-ready
- Pipe to a log aggregator (Datadog, Papertrail, etc.) if needed

---

## Security Hardening Summary

| Feature | Status |
|---------|--------|
| JWT Secret Validation (32+ chars) | ✅ |
| CORS Origin Allowlist | ✅ |
| Content-Security-Policy | ✅ |
| NoSQL Injection Prevention | ✅ |
| Input Validation (all routes) | ✅ |
| 6-digit OTP (no console logging) | ✅ |
| OTP Rate Limiting (5/15min) | ✅ |
| Mass Assignment Protection | ✅ |
| File Upload Limit (5MB) | ✅ |
| Authenticated Upload Access | ✅ |
| Production Error Hiding | ✅ |
| Structured Logging (pino) | ✅ |
| Request ID Correlation | ✅ |
| Health Check Endpoint | ✅ |
| Graceful Shutdown | ✅ |
| DB Connection Retry | ✅ |
| PM2 Cluster Mode | ✅ |
| CI/CD (GitHub Actions) | ✅ |
| API Rate Limiting | ✅ |
| Helmet Security Headers | ✅ |

---

## Architecture After Hardening

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                  │
│  Static HTML/CSS/JS + PWA + Service Worker           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│                 BACKEND (Render/Railway)              │
│                                                      │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │RequestID│→ │  Helmet   │→ │  CORS Allowlist   │  │
│  └─────────┘  │  + CSP    │  └───────────────────┘  │
│               └──────────┘                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Rate Limiter│→ │Body Parsers  │→ │  Sanitize │  │
│  └─────────────┘  └──────────────┘  │  (NoSQL)  │  │
│                                      └───────────┘  │
│  ┌──────────────────────────────────────────────┐   │
│  │         Express Routes + Validation           │   │
│  │  auth | schemes | marketplace | equipment     │   │
│  │  ai | emergency | tourism | weather | admin   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────┐  ┌────────────┐  ┌───────────┐   │
│  │Error Handler │  │  Logger    │  │ Graceful  │   │
│  │(prod-safe)   │  │  (pino)    │  │ Shutdown  │   │
│  └──────────────┘  └────────────┘  └───────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              MongoDB Atlas (with retry)               │
│         Indexes | Backups | Connection Pool           │
└─────────────────────────────────────────────────────┘
```
