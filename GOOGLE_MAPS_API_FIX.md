# Google Maps API Setup & Fix

## Current Issues

You're seeing these errors because some Google Maps APIs are not enabled in your Google Cloud Console project.

## Required APIs to Enable

You need to enable these 3 APIs in Google Cloud Console:

1. **Maps JavaScript API** ✅ (Already enabled)
2. **Places API** ⚠️ (Need to enable)
3. **Distance Matrix API** ⚠️ (Need to enable)
4. **Geocoding API** ⚠️ (Need to enable - for address lookups)

---

## How to Enable APIs

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select your project (the one with your API key)

### Step 2: Enable Places API
1. Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
2. Click "ENABLE"
3. Wait for it to activate (takes a few seconds)

### Step 3: Enable Distance Matrix API
1. Go to: https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com
2. Click "ENABLE"
3. Wait for it to activate

### Step 4: Enable Geocoding API
1. Go to: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
2. Click "ENABLE"
3. Wait for it to activate

### Step 5: Verify Your API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key: `AIzaSyArc6Vzj2uzOK29RVvIJePIN9bS6yLPv1E`
3. Click on it to edit
4. Under "API restrictions", make sure these are allowed:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
   - Geocoding API

---

## Quick Enable Links

Use these direct links (make sure you're logged into the correct Google account):

1. **Places API**: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
2. **Distance Matrix API**: https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com
3. **Geocoding API**: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

---

## After Enabling APIs

1. Wait 2-3 minutes for changes to propagate
2. Clear your browser cache (Ctrl+Shift+Delete)
3. Reload the job card page
4. The errors should be gone

---

## What Each API Does

**Maps JavaScript API**
- Displays the interactive map
- Shows route visualization
- Already working ✅

**Places API**
- Address autocomplete (as you type)
- Location search
- Place details

**Distance Matrix API**
- Calculates actual road distances
- Provides driving distances between points
- More accurate than straight-line calculations

**Geocoding API**
- Converts addresses to coordinates
- Converts coordinates to addresses
- Used for manual address entry

---

## Cost Information

All these APIs have generous free tiers:

- **Places API**: $0 for first 100,000 requests/month
- **Distance Matrix API**: $5 per 1,000 requests (first $200/month free)
- **Geocoding API**: $5 per 1,000 requests (first $200/month free)

For a towing company, you'll likely stay well within the free tier.

---

## Troubleshooting

### Still seeing errors after enabling?

1. **Wait longer**: API activation can take up to 5 minutes
2. **Check API key restrictions**: Make sure your key isn't restricted to specific IPs or domains
3. **Verify billing**: Some APIs require billing to be enabled (even if you stay in free tier)
4. **Clear cache**: Hard refresh with Ctrl+F5

### "API key not valid" error?

1. Check that the key in `index.html` matches your Google Cloud Console key
2. Make sure the key isn't restricted to specific websites
3. Try creating a new API key if the old one has issues

### Distance calculations not working?

1. Make sure Distance Matrix API is enabled
2. Check browser console for specific error messages
3. Try using GPS coordinates instead of addresses

---

## Alternative: Unrestricted API Key (Not Recommended for Production)

If you're just testing, you can create an unrestricted API key:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "CREATE CREDENTIALS" → "API key"
3. Don't add any restrictions
4. Use this key for testing only
5. Add restrictions before going live

---

## Current API Key

Your current key: `AIzaSyArc6Vzj2uzOK29RVvIJePIN9bS6yLPv1E`

This key is embedded in:
- `index.html` (job card form)
- `calculator.html` (distance calculator)

---

## Need Help?

If you're still having issues after enabling all APIs:

1. Check the browser console (F12) for specific error messages
2. Verify your Google Cloud project has billing enabled
3. Make sure you're using the correct API key
4. Try the system with GPS coordinates instead of addresses (GPS doesn't require Places API)

---

## Summary Checklist

- [ ] Enable Places API
- [ ] Enable Distance Matrix API  
- [ ] Enable Geocoding API
- [ ] Verify API key has access to all 3 APIs
- [ ] Wait 2-3 minutes
- [ ] Clear browser cache
- [ ] Test the job card form
- [ ] Check that autocomplete works
- [ ] Check that distances calculate correctly
