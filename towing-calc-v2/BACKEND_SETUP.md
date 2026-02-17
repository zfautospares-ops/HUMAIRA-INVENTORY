# Backend Setup Guide

## Overview
This backend provides API endpoints for storing invoices, jobs, and expenses in JSON files instead of localStorage.

## Features
- RESTful API for invoices, jobs, and expenses
- File-based storage (JSON files in `./data/` directory)
- Auto-generated invoice numbers (INV-YYYY-NNNN format)
- CORS enabled for frontend access
- Easy to deploy on Vercel, Render, or any Node.js host

## Installation

### 1. Install Dependencies
```bash
cd towing-calc-v2
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Start Production Server
```bash
npm start
```

## API Endpoints

### Invoices

#### Get all invoices
```
GET /api/invoices
```

#### Get single invoice
```
GET /api/invoices/:id
```

#### Create invoice
```
POST /api/invoices
Body: {
  id: "unique-id",
  invoiceNumber: "INV-2026-0001",
  customerName: "John Doe",
  customerPhone: "0614532160",
  items: [...],
  total: 1500.00,
  status: "unpaid"
}
```

#### Update invoice
```
PUT /api/invoices/:id
Body: { ...updated fields }
```

#### Delete invoice
```
DELETE /api/invoices/:id
```

#### Get next invoice number
```
GET /api/invoices/next-number
Response: { invoiceNumber: "INV-2026-0001" }
```

### Jobs

#### Get all jobs
```
GET /api/jobs
```

#### Create job
```
POST /api/jobs
Body: {
  id: "unique-id",
  customerName: "John Doe",
  pickupLocation: "Address 1",
  dropoffLocation: "Address 2",
  distance: 50.5,
  total: 750.00,
  status: "pending"
}
```

#### Update job
```
PUT /api/jobs/:id
Body: { ...updated fields }
```

#### Delete job
```
DELETE /api/jobs/:id
```

### Expenses

#### Get all expenses
```
GET /api/expenses
```

#### Create expense
```
POST /api/expenses
Body: {
  id: "unique-id",
  date: "2026-02-17",
  category: "Fuel",
  amount: 500.00,
  description: "Diesel refill"
}
```

#### Delete expense
```
DELETE /api/expenses/:id
```

### Health Check
```
GET /api/health
Response: { status: "ok", timestamp: "..." }
```

## Data Storage

Data is stored in JSON files in the `./data/` directory:
- `data/invoices.json` - All invoices
- `data/jobs.json` - All jobs/quotes
- `data/expenses.json` - All expenses

The data directory is automatically created on first run and is gitignored.

## Frontend Integration

Update your frontend code to use the API instead of localStorage:

### Example: Fetch Invoices
```javascript
// OLD (localStorage)
const invoices = JSON.parse(localStorage.getItem('invoices')) || [];

// NEW (API)
const response = await fetch('http://localhost:3000/api/invoices');
const invoices = await response.json();
```

### Example: Create Invoice
```javascript
// OLD (localStorage)
invoices.push(newInvoice);
localStorage.setItem('invoices', JSON.stringify(invoices));

// NEW (API)
await fetch('http://localhost:3000/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newInvoice)
});
```

## Deployment

### Vercel
1. Add `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "*.html", "use": "@vercel/static" },
    { "src": "*.css", "use": "@vercel/static" },
    { "src": "*.js", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

2. Deploy:
```bash
vercel --prod
```

### Render
1. Create new Web Service
2. Connect your repository
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy

### Railway/Heroku
Similar to Render - just point to your repo and set start command to `npm start`.

## Environment Variables

For production, you can set:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Get invoices
curl http://localhost:3000/api/invoices

# Create invoice
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"id":"test-1","invoiceNumber":"INV-2026-0001","total":1000}'
```

## Backup

The `./data/` directory contains all your data. To backup:
```bash
cp -r data/ data-backup-$(date +%Y%m%d)/
```

## Migration from localStorage

To migrate existing data from localStorage to the backend:

1. Export from browser console:
```javascript
const data = {
    invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
    jobs: JSON.parse(localStorage.getItem('jobs') || '[]'),
    expenses: JSON.parse(localStorage.getItem('expenses') || '[]')
};
console.log(JSON.stringify(data, null, 2));
```

2. Save to files in `./data/` directory
3. Restart server

## Troubleshooting

### Port already in use
Change the port:
```bash
PORT=3001 npm start
```

### CORS errors
Make sure the backend is running and CORS is enabled (already configured).

### Data not persisting
Check that the `./data/` directory exists and has write permissions.

## Next Steps

- Add PostgreSQL database support for production
- Add authentication/authorization
- Add data validation
- Add rate limiting
- Add backup automation
- Add email notifications for invoices
