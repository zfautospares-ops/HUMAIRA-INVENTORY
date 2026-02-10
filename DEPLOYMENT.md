# MH TOWING - Render.com Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Create GitHub Account (if you don't have one)
- Go to https://github.com
- Sign up for free account
- Verify your email

### 2. Install Git (if not installed)
- Download from: https://git-scm.com/downloads
- Install with default settings

### 3. Push Your Code to GitHub

Open Command Prompt in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - MH Towing Job Cards"
```

Then create a new repository on GitHub:
- Go to https://github.com/new
- Name it: `mh-towing-job-cards`
- Don't initialize with README
- Click "Create repository"

Copy the commands shown and run them in your Command Prompt:
```bash
git remote add origin https://github.com/YOUR-USERNAME/mh-towing-job-cards.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Render.com

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (click "Sign in with GitHub")
4. Authorize Render to access your repositories

5. On Render Dashboard:
   - Click "New +"
   - Select "Web Service"
   - Connect your `mh-towing-job-cards` repository
   - Click "Connect"

6. Configure the service:
   - Name: `mh-towing-job-cards`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Select "Free" (or paid for better performance)
   - Click "Create Web Service"

7. Wait 2-5 minutes for deployment to complete

### 5. Your App is Live!

Once deployed, you'll get a URL like:
- `https://mh-towing-job-cards.onrender.com`

Share this with your drivers:
- Job Card Form: `https://mh-towing-job-cards.onrender.com`
- Admin Dashboard: `https://mh-towing-job-cards.onrender.com/admin.html`

### 6. Update the API URLs

After deployment, you need to update the API URLs in your code:

In `app.js`, change:
```javascript
fetch('http://localhost:3000/api/jobcards', {
```
To:
```javascript
fetch('https://YOUR-APP-NAME.onrender.com/api/jobcards', {
```

In `admin.js`, change all instances of:
```javascript
http://localhost:3000
```
To:
```javascript
https://YOUR-APP-NAME.onrender.com
```

Then commit and push the changes:
```bash
git add .
git commit -m "Update API URLs for production"
git push
```

Render will automatically redeploy!

### 7. Custom Domain (Optional)

To use your own domain like `jobs.mhtowing.co.za`:
1. In Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Custom Domain"
4. Add your domain
5. Update your domain's DNS settings as instructed

## Important Notes

### Free Tier Limitations:
- App sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for one app)

### Upgrade to Paid ($7/month) for:
- No sleeping
- Faster performance
- More reliability
- Better for production use

## Troubleshooting

**App not loading?**
- Check Render logs in dashboard
- Ensure all files are committed to GitHub
- Verify build completed successfully

**Data not saving?**
- Data persists in the `data` folder
- On free tier, data may be lost on redeploy
- Consider upgrading or using external database

## Support

Need help? Check:
- Render Docs: https://render.com/docs
- GitHub Issues: Create issue in your repository
