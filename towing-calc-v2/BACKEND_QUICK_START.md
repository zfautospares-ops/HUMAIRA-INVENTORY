# Backend Quick Start

## What Changed?

Your app now uses a backend API for storing invoices, jobs, and expenses instead of just localStorage!

## Benefits

- **Data Persistence**: Data is stored in files on the server
- **Backup**: Easy to backup the `./data/` directory
- **Scalability**: Can easily switch to PostgreSQL later
- **Fallback**: Still works with localStorage if backend is unavailable

## How to Test Locally

### 1. Start the Backend Server

```bash
cd towing-calc-v2
npm install
npm run dev
```

Server starts on http://localhost:3000

### 2. Open the App

Open http://localhost:3000 in your browser

### 3. Check Backend Status

Open browser console (F12) and look for:
```
Backend status: ✅ Available
```

If you see `❌ Unavailable`, the app will use localStorage as fallback.

## What Works with Backend

✅ **Jobs** - Save and load quotes/jobs
✅ **Invoices** - Create and manage invoices  
✅ **Expenses** - Track business expenses
✅ **Analytics** - View statistics from backend data

## What Still Uses localStorage

- Vehicle settings
- Fuel prices
- Yard location
- Theme preferences
- Calculation history

## Data Location

All backend data is stored in:
```
towing-calc-v2/data/
├── jobs.json
├── invoices.json
└── expenses.json
```

## Deployment

The backend is ready to deploy on:
- **Vercel** (recommended - already configured)
- **Render** (easy setup)
- **Railway** (simple deployment)
- **Heroku** (classic option)

See `BACKEND_SETUP.md` for detailed deployment instructions.

## Troubleshooting

### Backend not starting?
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Use different port
PORT=3001 npm run dev
```

### Data not saving?
1. Check browser console for errors
2. Verify `./data/` directory exists
3. Check file permissions

### Want to use localStorage only?
Just don't start the backend server. The app will automatically fall back to localStorage.

## Next Steps

1. Test locally with `npm run dev`
2. Create some jobs and invoices
3. Check `./data/` directory for saved files
4. Deploy to Vercel when ready

## Questions?

Check `BACKEND_SETUP.md` for full documentation!
