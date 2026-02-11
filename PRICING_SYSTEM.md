# Job Card Pricing System

## Overview
Automatic pricing system with manual override capability for MH Towing job cards. Calculates suggested prices based on distance, service type, and time factors.

---

## Pricing Configuration

### Base Rates (Editable in admin.js)

**Rate per Kilometer:** R15/km

**Base Fees by Service Type:**
- 🚗 Tow Service: R300
- ⚡ Jump Start: R150
- 🔧 Tire Change: R200
- 🔑 Lockout Service: R180
- ⛽ Fuel Delivery: R150
- 🪝 Winch Out: R400
- 🛻 Flatbed Tow: R500
- 🚨 Accident Recovery: R600
- 🔋 Battery Replacement: R250
- 📋 Other: R200

**Premium Multipliers:**
- After Hours (6pm-6am): 1.5x (50% extra)
- Weekends (Sat-Sun): 1.2x (20% extra)

---

## How It Works

### 1. Auto-Calculation
When you click "💰 Price" on a job card, the system automatically calculates:

```
Suggested Price = Base Fee + (Distance × Rate per km)

If after hours: Price × 1.5
If weekend: Price × 1.2
```

**Example:**
- Service: Tow Service (R300 base)
- Distance: 25 km
- Time: 8pm (after hours)

Calculation:
- Base: R300
- Distance: 25 km × R15 = R375
- Subtotal: R675
- After hours: R675 × 1.5 = R1,012.50

### 2. Manual Override
You can adjust the suggested price:
- Add extra charges (difficult terrain, extra equipment)
- Apply discounts (regular customer, promotional)
- Round to convenient amounts

### 3. Payment Tracking
Track payment status for each job:
- ❌ **Unpaid**: No payment received
- ⏳ **Partial**: Some payment received (specify amount)
- ✅ **Paid**: Fully paid

---

## Using the Pricing System

### Set Price for a Job

1. Open admin dashboard: https://mh-towing-job-cards.onrender.com/admin.html
2. Find the job card
3. Click "💰 Price" button
4. Review the suggested price breakdown
5. Adjust final price if needed
6. Select payment status
7. Add notes (optional)
8. Click "💾 Save Pricing"

### View Pricing Information

**In Job List:**
- Price badge shows final price
- Payment status indicator (Paid/Unpaid/Partial)

**In Job Details:**
- Full pricing breakdown
- Payment status
- Balance due (for partial payments)
- Pricing notes
- Edit button to update pricing

### Revenue Statistics

Dashboard shows:
- **Total Revenue**: Sum of all priced jobs
- **Unpaid**: Outstanding balance across all jobs

---

## Payment Status Details

### Unpaid (❌)
- No payment received
- Full amount outstanding
- Shows in unpaid revenue

### Partial Payment (⏳)
- Some payment received
- Specify amount paid
- Balance = Final Price - Amount Paid
- Balance shows in unpaid revenue

### Paid (✅)
- Fully paid
- No outstanding balance
- Counted in paid revenue

---

## Customizing Rates

To change pricing rates, edit `admin.js`:

```javascript
const PRICING_CONFIG = {
    ratePerKm: 15, // Change this
    baseFees: {
        'tow': 300, // Change these
        'jumpstart': 150,
        // ... etc
    },
    afterHoursPremium: 1.5, // 50% extra
    weekendPremium: 1.2 // 20% extra
};
```

After editing:
1. Save the file
2. Commit: `git add admin.js`
3. Commit: `git commit -m "Update pricing rates"`
4. Push: `git push origin main`
5. Wait 2-3 minutes for Render deployment

---

## Tips & Best Practices

### Pricing Strategy
- Use suggested price as starting point
- Consider job complexity
- Factor in fuel costs (already in distance rate)
- Account for wear and tear on equipment
- Be consistent with similar jobs

### Payment Tracking
- Update payment status immediately when paid
- Use partial payment for deposits
- Add notes for payment method (cash, card, EFT)
- Track outstanding balances regularly

### Revenue Management
- Review unpaid revenue weekly
- Follow up on overdue payments
- Use pricing notes for special arrangements
- Export job data for accounting

---

## Pricing Examples

### Example 1: Simple Tow
- Service: Tow Service
- Distance: 15 km
- Time: 2pm (regular hours)
- Day: Tuesday

**Calculation:**
- Base: R300
- Distance: 15 × R15 = R225
- **Total: R525**

### Example 2: After Hours Tow
- Service: Tow Service
- Distance: 30 km
- Time: 10pm (after hours)
- Day: Friday

**Calculation:**
- Base: R300
- Distance: 30 × R15 = R450
- Subtotal: R750
- After hours: R750 × 1.5
- **Total: R1,125**

### Example 3: Weekend Accident Recovery
- Service: Accident Recovery
- Distance: 45 km
- Time: 3pm
- Day: Saturday (weekend)

**Calculation:**
- Base: R600
- Distance: 45 × R15 = R675
- Subtotal: R1,275
- Weekend: R1,275 × 1.2
- **Total: R1,530**

### Example 4: After Hours Weekend
- Service: Flatbed Tow
- Distance: 20 km
- Time: 11pm Saturday

**Calculation:**
- Base: R500
- Distance: 20 × R15 = R300
- Subtotal: R800
- After hours: R800 × 1.5 = R1,200
- Weekend: R1,200 × 1.2
- **Total: R1,440**

---

## Troubleshooting

### Price not calculating
- Check that distance is recorded in job card
- Verify service type is selected
- Refresh admin dashboard

### Revenue stats not updating
- Click "🔄 Refresh Data" button
- Check that pricing is saved (not just viewed)
- Clear browser cache if needed

### Can't edit pricing
- Make sure you're on admin dashboard
- Check internet connection
- Verify server is running

---

## Future Enhancements

Potential additions:
- Bulk pricing for multiple jobs
- Pricing templates for common scenarios
- Invoice generation
- Payment reminders
- Discount codes
- Customer pricing history
- Profit margin tracking

---

## Contact & Support

- Production Site: https://mh-towing-job-cards.onrender.com
- Admin Dashboard: https://mh-towing-job-cards.onrender.com/admin.html
- GitHub: https://github.com/zfautospares-ops/mh-towing-job-cards
