# Persistent Storage Setup for Render

## ⚡ Quick Start (5 Minutes)

Since you've already created the PostgreSQL database on Render, here's what to do:

1. **Get Database URL**
   - Go to https://dashboard.render.com
   - Click on your database: `mh-towing-db`
   - Copy the "Internal Database URL" (starts with `postgresql://`)

2. **Add to Web Service**
   - Go to your web service: `mh-towing-job-cards`
   - Click "Environment" tab
   - Find `DATABASE_URL` variable
   - Paste the Internal Database URL as the value
   - Click "Save Changes"

3. **Wait for Auto-Deploy**
   - Render will automatically redeploy with the new environment variable
   - Check logs for: "✅ Using PostgreSQL database for persistent storage"
   - Your data will now persist forever!

---

## Problem

Render's free tier uses **ephemeral storage** - when your server sleeps or restarts, all data in files is lost. This means:
- Job cards disappear
- Spares inventory is lost
- Sales records vanish
- Pricing settings reset

## Solution Options

### Option 1: Use Render PostgreSQL Database (Recommended - FREE)

This is the best free solution. Your data will persist forever.

#### Steps:

1. **Create PostgreSQL Database on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "PostgreSQL"
   - Name: `mh-towing-db`
   - Database: `mhtowing`
   - User: `mhtowing`
   - Region: Same as your web service
   - Plan: **Free**
   - Click "Create Database"

2. **Connect Database to Your Web Service**
   - Go to your web service: `mh-towing-job-cards`
   - Click "Environment"
   - Add new environment variable:
     - Key: `DATABASE_URL`
     - Value: Copy the "Internal Database URL" from your PostgreSQL database
   - Click "Save Changes"

3. **Deploy Updated Code**
   - The code is already prepared to use PostgreSQL
   - Just push the latest changes to GitHub
   - Render will auto-deploy

4. **Verify It's Working**
   - Check server logs for: "✅ Using PostgreSQL database for persistent storage"
   - Create a test job card
   - Wait for server to sleep (or manually restart)
   - Check if job card is still there

#### Benefits:
- ✅ **FREE** - Render's free PostgreSQL tier
- ✅ **Persistent** - Data never disappears
- ✅ **Automatic backups** - Render handles backups
- ✅ **Fast** - Database queries are quick
- ✅ **Scalable** - Can upgrade later if needed

---

### Option 2: Download Backups Regularly (Manual)

If you don't want to set up a database, you can manually download backups.

#### Steps:

1. **Download Backup Before Server Sleeps**
   - Go to admin dashboard
   - Click "💾 Backups"
   - Click "⬇️" to download latest backup
   - Save to your computer

2. **Restore After Server Wakes Up**
   - Go to admin dashboard
   - Click "💾 Backups"
   - Click "♻️" next to the backup you want to restore
   - Confirm restoration

#### Drawbacks:
- ❌ Manual process
- ❌ Easy to forget
- ❌ Data loss if you forget to backup
- ❌ Not suitable for production use

---

### Option 3: Keep Server Awake (Costs Money)

Upgrade to Render's paid plan to keep server always running.

#### Steps:

1. Go to your web service settings
2. Upgrade to "Starter" plan ($7/month)
3. Server never sleeps
4. Data persists in files

#### Drawbacks:
- ❌ Costs $7/month
- ❌ Still uses ephemeral storage (data lost on redeploy)
- ❌ Not recommended - use PostgreSQL instead

---

## Recommended: Option 1 (PostgreSQL)

**This is the best solution because:**
1. It's completely FREE
2. Data is truly persistent
3. No manual work required
4. Professional and reliable
5. The code is already prepared for it

---

## Current Status

✅ **DATABASE INTEGRATION COMPLETE!**

Your system is now fully configured to:
- ✅ Use PostgreSQL if `DATABASE_URL` is set
- ✅ Fall back to JSON files if no database
- ✅ Show which storage method is being used in logs
- ✅ All endpoints updated to use database module
- ✅ Code deployed to GitHub and Render

**Next Step: Connect your PostgreSQL database (see Option 1 above)**

---

## Verification

After setting up PostgreSQL, check the server logs:

**Good (PostgreSQL working):**
```
✅ Using PostgreSQL database for persistent storage
✅ Database tables initialized
```

**Warning (Still using files):**
```
⚠️ Using JSON files (data will be lost on restart). Set DATABASE_URL for persistent storage.
```

---

## Migration

If you already have data in JSON files and want to move to PostgreSQL:

1. Download a backup from admin dashboard
2. Set up PostgreSQL (Option 1)
3. Restore the backup
4. Data will be saved to PostgreSQL
5. Future data will persist forever

---

## Need Help?

If you have issues setting up PostgreSQL:
1. Check that DATABASE_URL environment variable is set correctly
2. Make sure you're using the "Internal Database URL" not "External"
3. Check server logs for error messages
4. Verify the database was created successfully on Render

The setup takes about 5 minutes and solves the data loss problem permanently!
