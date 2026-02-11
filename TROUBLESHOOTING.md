# Job Card Sync Troubleshooting Guide

## Problem: Driver submitted job card but it doesn't show in admin dashboard

### Possible Causes & Solutions:

### 1. **Server Deployment Delay**
- **Cause**: Render.com takes 2-3 minutes to deploy after code changes
- **Solution**: Wait 3-5 minutes after any updates, then refresh the admin page
- **Check**: Look at Render.com dashboard to see if deployment is complete

### 2. **Driver's Browser Cache**
- **Cause**: Driver's phone/tablet is using old cached version of the form
- **Solution**: Have driver do a "hard refresh":
  - **iPhone Safari**: Hold refresh button → "Request Desktop Website" → Reload
  - **Android Chrome**: Settings → Clear browsing data → Cached images and files
  - **Or**: Close browser completely and reopen the site

### 3. **Offline/Network Issue**
- **Cause**: Driver had poor signal when submitting, job saved locally instead
- **Solution**: 
  1. Have driver open the job card form: https://mh-towing-job-cards.onrender.com
  2. Click the **"🔄 Sync Local Jobs"** button at the bottom
  3. This will upload any locally saved jobs to the server
- **How to tell**: Driver would have seen a warning: "⚠️ Could not reach server. Job card saved locally"

### 4. **Admin Dashboard Not Refreshing**
- **Cause**: Admin page is showing cached data
- **Solution**: 
  1. Click the **"🔄 Refresh Data"** button in admin dashboard
  2. Or do a hard refresh of the admin page (Ctrl+F5 or Cmd+Shift+R)

### 5. **Server Error**
- **Cause**: Server might be sleeping (Render free tier) or experiencing issues
- **Solution**: 
  1. Open https://mh-towing-job-cards.onrender.com in a new tab
  2. Wait 30 seconds for server to wake up
  3. Try submitting again or sync local jobs

---

## Quick Diagnostic Steps:

1. **Check if server is running**:
   - Open: https://mh-towing-job-cards.onrender.com/api/stats
   - Should see JSON data with job counts
   - If error or timeout, server is down/sleeping

2. **Check admin dashboard**:
   - Open: https://mh-towing-job-cards.onrender.com/admin.html
   - Click "🔄 Refresh Data"
   - Check "Total Jobs" counter

3. **Check driver's device**:
   - Have driver open job card form
   - Click "🔄 Sync Local Jobs" button
   - If it says "Found X job cards", they were saved locally

4. **Check Render deployment**:
   - Go to: https://dashboard.render.com
   - Check if latest deployment is "Live"
   - Look for any error messages

---

## Prevention Tips:

1. **Always check for success message**: After submitting, driver should see "✅ Job card saved to server successfully!"

2. **Good internet connection**: Try to submit job cards when driver has good signal

3. **Sync regularly**: If working in areas with poor signal, use "🔄 Sync Local Jobs" button when back in coverage

4. **Keep browser updated**: Make sure driver's phone browser is up to date

---

## Emergency Recovery:

If job cards are stuck on driver's device and won't sync:

1. Have driver open browser console (if tech-savvy):
   - Chrome Android: chrome://inspect
   - Safari iOS: Connect to Mac → Safari → Develop menu

2. Run this in console:
   ```javascript
   console.log(localStorage.getItem('jobCards'));
   ```

3. Copy the output and send to you - you can manually add to server

---

## Contact Info:

- Production Site: https://mh-towing-job-cards.onrender.com
- Admin Dashboard: https://mh-towing-job-cards.onrender.com/admin.html
- GitHub Repo: https://github.com/zfautospares-ops/mh-towing-job-cards
