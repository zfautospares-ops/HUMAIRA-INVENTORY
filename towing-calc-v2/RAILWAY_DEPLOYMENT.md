# Railway Deployment Guide

## Why Railway?

✅ **Always On** - No sleeping like Render free tier
✅ **$5 Free Credit** - Covers ~1 month of usage
✅ **Simple Setup** - 3 clicks to deploy
✅ **PostgreSQL Included** - Easy database setup
✅ **Auto-Deploy** - Push to GitHub, auto-updates

## Step-by-Step Deployment

### 1. Push Code to GitHub

If you haven't already:

```bash
cd towing-calc-v2
git init
git add .
git commit -m "Initial commit - MH AUTO backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub (recommended)
4. No credit card needed to start!

### 3. Deploy from GitHub

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `towing-calc-v2` repository
4. Railway will auto-detect Node.js and deploy!

### 4. Add PostgreSQL Database (Optional)

1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway creates and connects it automatically
4. Database URL is auto-added to environment variables

### 5. Configure Environment Variables

In Railway dashboard:
1. Click on your service
2. Go to "Variables" tab
3. Add these:

```
PORT=3000
NODE_ENV=production
```

### 6. Get Your Backend URL

1. Go to "Settings" tab
2. Click "Generate Domain"
3. You'll get a URL like: `your-app.up.railway.app`
4. Copy this URL!

### 7. Update Frontend to Use Railway Backend

Update `towing-calc-v2/api.js`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-app.up.railway.app/api';  // ← Add your Railway URL here
```

### 8. Deploy Frontend to Vercel

```bash
vercel --prod --yes
```

Done! Your backend is on Railway, frontend on Vercel.

## Cost Breakdown

### Free Tier
- **$5 credit/month** included
- Typical usage: ~$3-5/month
- **First month FREE** with credit

### After Free Credit
- **Execution Time**: $0.000463/minute (~$20/month for 24/7)
- **Memory**: $0.000231/GB-minute
- **Typical Cost**: $5-10/month for small app

### Cost Optimization Tips
1. Use PostgreSQL instead of file storage (more efficient)
2. Enable auto-sleep for dev environments
3. Monitor usage in Railway dashboard

## Features You Get

✅ **Automatic HTTPS** - SSL certificates included
✅ **Auto-Deploy** - Push to GitHub, auto-updates
✅ **Logs** - Real-time logs in dashboard
✅ **Metrics** - CPU, memory, network usage
✅ **Rollback** - Easy rollback to previous versions
✅ **Environment Variables** - Secure config management
✅ **Custom Domains** - Add your own domain

## Monitoring Your App

### Check if Backend is Running

Visit: `https://your-app.up.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T...",
  "message": "MH AUTO Backend API is running"
}
```

### View Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "Logs" tab
4. See real-time logs

### Check Usage

1. Go to "Metrics" tab
2. See CPU, memory, network usage
3. Monitor costs in "Usage" section

## Troubleshooting

### Backend not starting?

Check logs in Railway dashboard for errors.

Common issues:
- Missing dependencies: Run `npm install` locally first
- Port issues: Railway auto-assigns PORT variable
- Database connection: Check DATABASE_URL variable

### Frontend can't connect to backend?

1. Check Railway URL is correct in `api.js`
2. Verify CORS is enabled in `server.js` (already done)
3. Check browser console for errors
4. Test backend directly: `https://your-app.up.railway.app/api/health`

### Database not working?

1. Make sure PostgreSQL service is running
2. Check DATABASE_URL variable is set
3. Update `server.js` to use PostgreSQL (see below)

## Upgrade to PostgreSQL (Recommended)

Railway makes it easy to use PostgreSQL instead of JSON files:

### 1. Add PostgreSQL Service

In Railway:
1. Click "New" → "Database" → "PostgreSQL"
2. Railway auto-connects it to your app
3. DATABASE_URL is automatically set

### 2. Update server.js

Replace file-based storage with PostgreSQL queries. I can help you with this!

### 3. Migrate Data

Copy data from JSON files to PostgreSQL:
```bash
node migrate-to-postgres.js
```

## Auto-Deploy Setup

Railway auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push
```

Railway detects the push and redeploys automatically!

## Custom Domain (Optional)

1. Go to "Settings" tab
2. Click "Custom Domain"
3. Add your domain (e.g., `api.mhauto.co.za`)
4. Update DNS records as shown
5. Railway handles SSL automatically

## Backup Your Data

### Download from Railway

1. Go to PostgreSQL service
2. Click "Data" tab
3. Export data

### Automatic Backups

Railway doesn't backup by default. Options:
1. Use Railway's backup plugin
2. Set up automated exports to cloud storage
3. Keep local backups of `./data/` directory

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Get your backend URL
3. ✅ Update frontend API URL
4. ✅ Test everything
5. ⏭️ Consider upgrading to PostgreSQL
6. ⏭️ Set up monitoring alerts
7. ⏭️ Add custom domain

---

## Quick Reference

**Railway Dashboard**: https://railway.app/dashboard
**Your Backend**: https://your-app.up.railway.app
**Health Check**: https://your-app.up.railway.app/api/health
**Frontend**: https://towing-calc-v2.vercel.app

**Need help?** Just ask me to:
- Set up PostgreSQL
- Migrate your data
- Configure custom domain
- Optimize costs
