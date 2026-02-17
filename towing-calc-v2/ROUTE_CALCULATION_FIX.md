# Route Calculation Fix - February 2026

## Problem
Route calculations stopped working completely after optimization attempts. Users could not calculate any routes.

## Root Cause
The `calculateDistance()` function had a critical logic flaw:
- It only geocoded addresses if `startLocation` or `endLocation` were `null`
- When users typed addresses manually (without using autocomplete), these variables remained `null`
- The promises array could be empty, causing `Promise.all([])` to resolve immediately
- The code then tried to use `null` locations for route calculation, causing failures

## Solution
Simplified the geocoding logic to always geocode both addresses:
```javascript
// OLD (broken):
const promises = [];
if (!startLocation) {
    promises.push(geocodeAddress(startInput).then(loc => startLocation = loc));
}
if (!endLocation) {
    promises.push(geocodeAddress(endInput).then(loc => endLocation = loc));
}
Promise.all(promises).then(() => { /* use locations */ });

// NEW (working):
Promise.all([
    geocodeAddress(startInput),
    geocodeAddress(endInput)
]).then(([start, end]) => {
    startLocation = start;
    endLocation = end;
    // use locations
});
```

## Benefits
- Always ensures valid location objects before route calculation
- Simpler, more predictable code flow
- Works for both autocomplete and manual address entry
- Proper error handling with clear messages

## Testing
Deployed to: https://towing-calc-v2.vercel.app
- Test manual address entry
- Test autocomplete selection
- Test GPS location
- Test yard route calculation

## Files Modified
- `towing-calc-v2/app.js` - Fixed `calculateDistance()` function
