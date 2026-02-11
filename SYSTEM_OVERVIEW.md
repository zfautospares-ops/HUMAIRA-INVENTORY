# MH TOWING - Complete Digital System Overview

## 🚛 Company Information
- **Name**: MH TOWING
- **Phone**: 061 453 2160
- **Address**: 784 Gopalall Hurbans, Tongaat, KZN
- **Website**: https://mh-towing-job-cards.onrender.com

---

## 📋 System Components

### 1. Digital Job Card System
**URL**: https://mh-towing-job-cards.onrender.com/index.html

**Features**:
- Mobile-friendly paperless job cards
- Customer and vehicle information capture
- Service type selection (10 types)
- GPS location tracking
- Photo upload (multiple photos)
- Digital signature capture
- Sequential job numbering (MHT-2026-0001, etc.)
- Google Maps address autocomplete
- Offline fallback to localStorage

**Service Types**:
- Tow Service
- Jump Start
- Tire Change
- Lockout Service
- Fuel Delivery
- Winch Out
- Flatbed Tow
- Accident Recovery
- Battery Replacement
- Other

---

### 2. Admin Dashboard
**URL**: https://mh-towing-job-cards.onrender.com/admin.html

**Features**:
- View all job cards
- Real-time statistics
- Search and filter functionality
- Detailed job card viewing
- Delete job cards
- Export capabilities
- Quick access to all systems

**Statistics Displayed**:
- Total jobs
- Today's jobs
- Jobs by service type

---

### 3. Distance & Pricing Calculator
**URL**: https://mh-towing-job-cards.onrender.com/calculator.html

**Features**:
- Google Maps route integration
- Multiple route options display
- Workshop route system (workshop → pickup → delivery → workshop)
- Distance calculation for each leg
- Multiple fuel costing methods:
  - Consumption-based (L/100km)
  - Fixed cost per km
  - Percentage of distance
  - Manual entry
- Vehicle type presets (6 types)
- Detailed fuel cost breakdown
- Load factor adjustment
- Terrain factor adjustment
- Idling time costs
- Profit calculation
- Share quote functionality

**Vehicle Presets**:
- Light Duty (8 L/100km)
- Medium Duty (12 L/100km)
- Heavy Duty (18 L/100km)
- Flatbed (15 L/100km)
- Recovery Truck (20 L/100km)
- Super Heavy Duty (25 L/100km)

---

### 4. Automatic Backup System
**Access**: Admin Dashboard → 💾 Backups button

**Features**:
- Automatic backups every 24 hours
- Backup on every data change
- Manual backup creation
- View all backups with timestamps
- Download backups to computer
- Restore from any backup
- Auto-cleanup (30+ days)
- Pre-restore safety backup

**Safety Features**:
- Current data backed up before restore
- Confirmation required for restore
- No accidental deletion
- Download for external storage

---

### 5. Truck Spares Inventory System ⭐ NEW
**URL**: https://mh-towing-job-cards.onrender.com/spares.html

**Features**:
- Complete inventory management
- Add/edit/view/delete spare parts
- Photo upload for each item
- Detailed part information
- Condition tracking (4 levels)
- Stock level monitoring
- Low stock alerts
- Location/shelf tracking
- Cost and selling price management
- Profit margin calculation
- Quick sell function
- Search and filter
- Real-time statistics

**Categories**:
- Engine Parts
- Transmission
- Suspension
- Brakes
- Electrical
- Body Parts
- Interior
- Wheels & Tires
- Other

**Stock Status**:
- In Stock (green) - 3+ units
- Low Stock (yellow) - 1-2 units
- Out of Stock (red) - 0 units

**Statistics**:
- Total items
- Items in stock
- Low stock alerts
- Total inventory value

---

## 🔗 System Navigation

### From Admin Dashboard:
- **🔄 Refresh** - Reload data
- **💾 Backups** - Backup management
- **🔧 Spares** - Inventory system
- **🧮 Calculator** - Distance & pricing
- **➕ New Job Card** - Create job card

### Quick Links:
- Job Cards: `/index.html`
- Admin: `/admin.html`
- Calculator: `/calculator.html`
- Spares: `/spares.html`

---

## 💾 Data Storage

### Files:
- `./data/jobcards.json` - Job card data
- `./data/spares.json` - Spares inventory data
- `./backups/` - Automatic backups

### Backup Schedule:
- Every 24 hours automatically
- After every data write
- Manual on-demand
- 30-day retention

---

## 🎨 Design System

**Theme**: Purple gradient (#667eea to #764ba2)

**Features**:
- Elegant and professional
- Mobile-responsive
- Touch-friendly
- Consistent across all pages
- Company branding on all pages

---

## 🔧 Technical Stack

**Frontend**:
- HTML5
- CSS3 (vanilla)
- JavaScript (vanilla, no frameworks)
- Google Maps API

**Backend**:
- Node.js
- Express.js
- JSON file storage

**Hosting**:
- Render.com
- Auto-deploy from GitHub
- GitHub repo: github.com/zfautospares-ops/mh-towing-job-cards

**APIs Used**:
- Google Maps JavaScript API
- Google Places API
- Google Directions API
- Google Geocoding API

---

## 📱 Mobile Support

All systems are fully mobile-responsive:
- Works on phones, tablets, desktops
- Touch-friendly controls
- Optimized layouts
- Fast loading
- Offline capabilities (job cards)

---

## 🚀 Deployment

**Current Status**: ✅ Live and Active

**Auto-Deploy**:
1. Push to GitHub main branch
2. Render.com auto-deploys
3. Live in 2-3 minutes

**Manual Deploy**:
- Via Render.com dashboard
- Or trigger from GitHub

---

## 📚 Documentation

### Quick Start Guides:
- `BACKUP_QUICK_START.md` - Backup system basics
- `SPARES_QUICK_START.md` - Inventory system basics

### Detailed Guides:
- `BACKUP_SYSTEM.md` - Complete backup documentation
- `SPARES_SYSTEM.md` - Complete inventory documentation
- `DEPLOYMENT.md` - Deployment instructions
- `GOOGLE_MAPS_SETUP.md` - Maps API setup

### This File:
- `SYSTEM_OVERVIEW.md` - Complete system overview

---

## 🎯 Use Cases

### Daily Operations:
1. Driver creates job card on phone
2. Admin monitors jobs in dashboard
3. Calculator used for quotes
4. Spares sold and tracked
5. Automatic backups protect data

### Business Management:
1. Track all towing jobs
2. Monitor service types
3. Calculate accurate pricing
4. Manage parts inventory
5. Track sales and profits
6. Generate reports

### Customer Service:
1. Professional digital job cards
2. Accurate distance quotes
3. Quick parts availability check
4. Digital signatures
5. Photo documentation

---

## 🔐 Security

- HTTPS encryption
- Secure API endpoints
- Data validation
- Backup protection
- No sensitive data exposure

---

## 📊 Business Benefits

### Paperless Operations:
- No paper job cards
- Digital signatures
- Photo documentation
- Easy searching
- Cloud storage

### Accurate Pricing:
- Distance-based quotes
- Fuel cost calculation
- Multiple pricing methods
- Profit tracking

### Inventory Control:
- Real-time stock levels
- Low stock alerts
- Sales tracking
- Profit margins
- Location tracking

### Data Protection:
- Automatic backups
- Manual backups
- Easy restore
- 30-day retention

---

## 🎓 Training Resources

### For Drivers:
- Job card creation
- Photo upload
- Digital signatures
- GPS location

### For Office Staff:
- Admin dashboard
- Job card management
- Calculator usage
- Backup management

### For Parts Department:
- Inventory management
- Adding items
- Stock updates
- Sales processing

---

## 🆘 Support

### Troubleshooting:
1. Check browser console (F12)
2. Verify internet connection
3. Clear browser cache
4. Check server status

### Common Issues:
- **Maps not loading**: Check API key
- **Data not saving**: Check server connection
- **Photos not uploading**: Check file size
- **Backup failed**: Check disk space

---

## 🔄 Future Enhancements

### Potential Features:
- Customer database
- Invoice generation
- SMS notifications
- Email reports
- Advanced analytics
- Multi-user accounts
- Role-based access
- Payment integration

---

## 📞 Contact

**MH TOWING**
- Phone: 061 453 2160
- Address: 784 Gopalall Hurbans, Tongaat, KZN

---

## ✅ System Status

All systems operational and deployed:
- ✅ Job Card System
- ✅ Admin Dashboard
- ✅ Distance Calculator
- ✅ Backup System
- ✅ Spares Inventory

**Last Updated**: February 11, 2026
**Version**: 2.0
**Status**: Production Ready
