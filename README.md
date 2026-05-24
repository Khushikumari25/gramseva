# GramSeva - One Village At A Time
**DEployed Link - https://gramseva-mdwk.onrender.com**

AI-powered rural ecosystem web application for farmers, villagers, women entrepreneurs, and rural communities.

## Features

- **Government Schemes** - 200+ schemes for Bihar, Haryana, UP, Punjab, Jharkhand
- **Marketplace** - Buy/sell dairy, handicrafts, organic products
- **Equipment Rental** - Rent tractors, harvesters, pump sets
- **AI Voice Assistant** - Multilingual farming guidance (Hindi, English, Bhojpuri, Punjabi, Haryanvi)
- **Crop Disease Detection** - Upload photos for AI-powered diagnosis
- **Smart Farming** - Weather alerts, crop suggestions, market trends
- **Emergency Services** - One-click emergency helplines
- **Village Tourism** - Promote rural tourism and cultural events
- **PWA Support** - Works offline with service workers
- **Admin Panel** - Complete management dashboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS, Tailwind CSS, GSAP |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB, Mongoose ODM |
| AI | Google Gemini API, OpenAI, LangChain |
| Payments | Razorpay |
| Maps | Google Maps API |
| Weather | OpenWeather API |
| Auth | JWT, OTP-based login |
| Storage | Multer (local uploads) |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- API keys (Gemini, OpenWeather, Razorpay, Google Maps)

### Installation

```bash
cd gramseva
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Seed Database

```bash
npm run seed
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5000`

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gramseva.in | admin123 |
| Farmer | ramesh@example.com | farmer123 |
| Seller | sunita@example.com | seller123 |
| Equipment Owner | manoj@example.com | owner123 |

## Project Structure

```
gramseva/
├── frontend/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── pages/
│   │   ├── admin.html
│   │   └── crop-disease.html
│   ├── assets/
│   │   ├── css/main.css
│   │   ├── images/
│   │   └── icons/
│   ├── js/
│   │   ├── app.js
│   │   ├── translations.js
│   │   └── components/
│   │       ├── schemes.js
│   │       ├── marketplace.js
│   │       ├── equipment.js
│   │       ├── emergency.js
│   │       └── ai-assistant.js
│   └── translations/
├── server/
│   ├── index.js
│   ├── config/db.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── sockets/
│   ├── uploads/
│   └── seeds/
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Schemes
- `GET /api/schemes` - List schemes (filter by state, category)
- `GET /api/schemes/:id` - Get scheme details
- `POST /api/schemes` - Create scheme (admin)
- `PUT /api/schemes/:id` - Update scheme (admin)
- `DELETE /api/schemes/:id` - Delete scheme (admin)
- `POST /api/schemes/:id/bookmark` - Bookmark scheme

### Marketplace
- `GET /api/marketplace` - List products
- `GET /api/marketplace/:id` - Product details
- `POST /api/marketplace` - Create product (seller)
- `POST /api/marketplace/order` - Create order
- `POST /api/marketplace/verify-payment` - Verify Razorpay payment

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment/:id/book` - Book equipment

### AI
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/crop-disease` - Detect crop disease
- `POST /api/ai/farming-recommendations` - Get farming tips

### Emergency
- `GET /api/emergency` - Get emergency contacts

### Weather
- `GET /api/weather?city=Patna` - Get weather
- `GET /api/weather/alerts` - Get weather alerts

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - Analytics data

## Multilingual Support

- Hindi (हिन्दी)
- English
- Bhojpuri (भोजपुरी)
- Punjabi (ਪੰਜਾਬੀ)
- Haryanvi (हरियाणवी)

## Deployment

### Production Build

```bash
NODE_ENV=production npm start
```

### Docker (optional)

```bash
docker build -t gramseva .
docker run -p 5000:5000 --env-file .env gramseva
```

## License

MIT
