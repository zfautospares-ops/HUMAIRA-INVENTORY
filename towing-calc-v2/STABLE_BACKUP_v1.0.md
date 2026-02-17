# Stable Backup v1.0 - February 17, 2026

## ✅ FULLY WORKING VERSION - SAFE TO ROLLBACK

This is a stable, fully tested version of MH AUTO Calculator with all features working correctly.

## Deployment Info
- **Live URL**: https://towing-calc-v2.vercel.app
- **Git Tag**: v1.0-stable
- **Commit**: 9ea32e7
- **Date**: February 17, 2026

## Working Features

### ✅ Core Calculator
- Distance calculation with Google Maps API
- Manual address entry
- Autocomplete suggestions
- GPS location detection
- Route visualization on map
- Traffic layer toggle

### ✅ Vehicle Management
- 3 default vehicles (Flatbed, Tow Truck, Heavy Duty)
- Custom vehicle creation
- Editable rates per km
- Fuel consumption per vehicle (km/L)
- Vehicle images or emoji icons

### ✅ Pricing Features
- Base towing cost calculation
- Time surcharges (After Hours 25%, Weekend 50%, Holiday 75%, Emergency 100%)
- Winching service with duration, rate, and difficulty multiplier
- Additional charges (custom line items)
- Discount (percentage or fixed amount)
- Editable base cost in results

### ✅ Advanced Routing
- **Return Trip Toggle**: Doubles distance for round trips
- **Start from Yard**: Complete route (Yard → Pickup → Drop-off → Yard)
- Yard location saved in Settings
- Cached yard coordinates for faster calculations
- Multi-leg route calculation

### ✅ Enhanced Results Display
- Trip details with one-way and total distance
- Cost breakdown with all charges
- Fuel cost analysis (consumption, fuel price, total cost)
- Profit analysis (revenue, fuel cost, net profit, profit margin)
- Customer-facing total (profit hidden from quotes)

### ✅ Quote Sharing
- WhatsApp share (formatted message)
- SMS share
- Email share
- Print quote
- Save quote to Jobs

### ✅ Jobs Management
- View all saved quotes/jobs
- Filter by status (Pending, In Progress, Completed, Cancelled)
- Search by customer name or job ID
- Create invoice from job
- Edit job status
- Delete jobs

### ✅ Invoices
- Create invoices manually or from jobs
- Auto-generated invoice numbers (INV-YYYY-NNNN)
- Customer details
- Line items with descriptions and amounts
- Share via WhatsApp
- View all invoices
- Search and filter

### ✅ Expenses Tracking
- Add business expenses
- Categories (Fuel, Maintenance, Insurance, Salaries, Other)
- Date, amount, description
- View all expenses
- Delete expenses
- Total expenses calculation

### ✅ Analytics Dashboard
- Time range selection (Today, This Week, This Month, This Year, All Time)
- 8 key metrics:
  - Total Revenue
  - Total Jobs
  - Average Job Value
  - Total Distance
  - Total Fuel Cost
  - Net Profit
  - Total Expenses
  - Profit Margin
- Performance summary
- Clear All Data option (with double confirmation)

### ✅ Settings
- Fuel price configuration
- Default fuel consumption
- Yard location (home base)
- Vehicle management
- Winching rates
- Time surcharge presets

### ✅ UI/UX Features
- Day/Night theme toggle
- Responsive mobile-first design
- Dropdown navigation menu
- Collapsible sections
- Professional branding (MH AUTO)
- 24HR animated badge
- "Heavy Duty Recovery Specialists" tagline
- Clean, modern interface

## Technical Details

### Key Files
- `index.html` - Main app structure
- `app.js` - Core application logic (2000+ lines)
- `enhanced-results.js` - Results display with profit analysis
- `styles.css` - Complete styling with day/night themes

### Google Maps Integration
- API Key: AIzaSyArc6Vzj2uzOK29RVvIJePIN9bS6yLPv1E
- Libraries: places, directions, geocoding
- Services: Autocomplete, Directions, Geocoding, Traffic Layer

### Data Storage
- localStorage for all data persistence
- Keys: vehicles, jobs, invoices, expenses, settings, yardLocation, yardLocationCoords

### Bug Fixes Applied
1. Fixed route calculation geocoding logic (always geocode both addresses)
2. Fixed `includeReturn` undefined error in enhanced-results.js
3. Added timeout handling for slow API responses
4. Cached yard location coordinates for faster lookups
5. Optimized Promise handling for parallel geocoding

## How to Rollback

### Option 1: Git Tag
```bash
cd towing-calc-v2
git checkout v1.0-stable
vercel --prod --yes
```

### Option 2: Git Commit
```bash
cd towing-calc-v2
git checkout 9ea32e7
vercel --prod --yes
```

### Option 3: Manual Restore
Copy these files from this backup:
- app.js
- enhanced-results.js
- index.html
- styles.css

## Testing Checklist

Before considering a new version stable, test:

- [ ] Manual address entry calculates route
- [ ] Autocomplete selection works
- [ ] GPS location detection works
- [ ] Return trip toggle doubles distance
- [ ] Start from Yard calculates 3-leg route
- [ ] Results display shows all sections
- [ ] Quote sharing (WhatsApp, SMS, Email, Print)
- [ ] Save quote to Jobs
- [ ] Create invoice from job
- [ ] Add expense
- [ ] Analytics shows correct totals
- [ ] Settings save and persist
- [ ] Day/Night theme toggle
- [ ] Navigation dropdown works
- [ ] Mobile responsive layout

## Known Limitations

1. No user authentication (single-user system)
2. No backend database (localStorage only)
3. Google Maps API quota limits
4. No offline mode
5. No data export/import
6. No multi-currency support

## Performance Notes

- Route calculation: 2-6 seconds typical
- Yard route calculation: 4-10 seconds typical
- Geocoding timeout: 4 seconds per address
- Directions timeout: 6 seconds (normal), 10 seconds (yard route)

## Support Info

If issues arise:
1. Check browser console for errors
2. Verify Google Maps API key is valid
3. Clear localStorage and refresh
4. Check internet connection
5. Try different addresses
6. Disable "Start from Yard" if slow

## Version History

- v1.0-stable (Feb 17, 2026) - Initial stable release
  - All features working
  - Route calculations fixed
  - UI complete
  - Workspace cleaned up

---

**IMPORTANT**: This version is production-ready and fully tested. Always test new features thoroughly before replacing this stable version.
