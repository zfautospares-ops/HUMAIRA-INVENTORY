# Google Maps API Setup Guide

To enable address autocomplete, you need a Google Maps API key.

## Step 1: Get Google Maps API Key

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## Step 2: Restrict Your API Key (Important for Security)

1. Click on your API key to edit it
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add your domains:
     - `https://mh-towing-job-cards.onrender.com/*`
     - `http://localhost:3000/*` (for testing)

3. Under "API restrictions":
   - Select "Restrict key"
   - Choose:
     - Maps JavaScript API
     - Places API
     - Geocoding API

4. Save

## Step 3: Update Your Code

In `index.html`, replace the placeholder API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places" async defer></script>
```

Replace `YOUR_ACTUAL_API_KEY` with your real key.

## Step 4: Deploy

```bash
git add .
git commit -m "Add Google Maps API key"
git push
```

## Pricing

- Google Maps offers $200 free credit per month
- Address autocomplete costs ~$2.83 per 1000 requests
- With free credit, you get ~70,000 free autocomplete requests/month
- More than enough for a small towing business!

## Alternative: Free Option (No API Key)

If you don't want to use Google Maps, the app still works with:
- GPS coordinates (manual entry)
- GPS button (uses device location)
- Manual address typing (no autocomplete)

The autocomplete is a nice-to-have feature but not required!
