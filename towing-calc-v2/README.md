# MH AUTO Backend API

Backend API for MH AUTO towing calculator with invoices, jobs, and expenses management.

## 🚀 One-Click Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/nodejs?referralCode=mhauto)

**OR manually deploy:**

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select this repository
4. Set Root Directory to: `towing-calc-v2`
5. Deploy!

## Features

- ✅ RESTful API for invoices, jobs, expenses
- ✅ File-based storage (JSON)
- ✅ Auto-generated invoice numbers
- ✅ CORS enabled
- ✅ Always-on (no sleeping)

## API Endpoints

- `GET/POST/PUT/DELETE /api/invoices`
- `GET/POST/PUT/DELETE /api/jobs`
- `GET/POST/DELETE /api/expenses`
- `GET /api/health`

## Local Development

```bash
npm install
npm run dev
```

Server runs on http://localhost:3000

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Documentation

- [Backend Setup Guide](BACKEND_SETUP.md)
- [Railway Deployment](RAILWAY_DEPLOYMENT.md)
- [Quick Start](BACKEND_QUICK_START.md)
