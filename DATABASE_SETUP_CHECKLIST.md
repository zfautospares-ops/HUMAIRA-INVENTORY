# ✅ Database Setup Checklist

## What You Need to Do Now

Since you've already created the PostgreSQL database on Render, follow these steps:

### Step 1: Get Database Connection URL
- [ ] Go to https://dashboard.render.com
- [ ] Click on your database: **mh-towing-db**
- [ ] Find and copy the **Internal Database URL**
  - It looks like: `postgresql://mhtowing:xxxxx@dpg-xxxxx/mhtowing`
  - Make sure it's the INTERNAL URL, not External

### Step 2: Connect Database to Web Service
- [ ] Go to your web service: **mh-towing-job-cards**
- [ ] Click the **Environment** tab
- [ ] Look for `DATABASE_URL` variable (it should already be there from render.yaml)
- [ ] Paste the Internal Database URL as the value
- [ ] Click **Save Changes**

### Step 3: Wait for Deployment
- [ ] Render will automatically redeploy (takes 2-3 minutes)
- [ ] Watch the deployment logs
- [ ] Look for this message: **"✅ Using PostgreSQL database for persistent storage"**
- [ ] Also look for: **"✅ Database tables initialized"**

### Step 4: Test It Works
- [ ] Go to your job cards page: https://mh-towing-job-cards.onrender.com
- [ ] Create a test job card
- [ ] Go to admin dashboard and verify it appears
- [ ] Wait 15 minutes (or manually restart the service)
- [ ] Check if the job card is still there
- [ ] If yes, **SUCCESS!** Your data is now persistent forever

---

## What Was Done

✅ Created `database.js` module with all database operations
✅ Updated all API endpoints to use PostgreSQL
✅ Added automatic fallback to JSON files if no database
✅ Configured `render.yaml` with database settings
✅ Added `pg` dependency for PostgreSQL
✅ Deployed all changes to GitHub and Render

---

## If You See Errors

**Error: "Using JSON files (data will be lost on restart)"**
- The DATABASE_URL environment variable is not set correctly
- Go back to Step 2 and verify the URL

**Error: "Database connection failed"**
- Check that you copied the INTERNAL Database URL, not External
- Verify the database is running on Render
- Make sure the database and web service are in the same region

**Error: "relation does not exist"**
- The database tables haven't been created yet
- Check logs for "Database tables initialized"
- If missing, the database might not be accessible

---

## Need Help?

Check the full guide: `PERSISTENT_STORAGE_SETUP.md`

The setup takes about 5 minutes and solves the data loss problem permanently!
