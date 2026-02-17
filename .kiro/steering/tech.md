# Technology Stack

## Architecture
Full-stack web application with Node.js backend and vanilla JavaScript frontend.

### Backend
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: Dual-mode storage
  - PostgreSQL (production with DATABASE_URL)
  - JSON files (development/fallback)
- **Key Libraries**:
  - `express` - Web server
  - `cors` - Cross-origin requests
  - `pg` - PostgreSQL client

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Maps**: Google Maps JavaScript API
  - Places API (address autocomplete)
  - Distance Matrix API (accurate road distances)
  - Directions API (route visualization)
  - Geocoding API (address to coordinates)
- **UI Pattern**: Tab-based navigation, modal dialogs
- **Mobile**: Touch-optimized, GPS integration

### Data Storage
- **Production**: PostgreSQL database (Render/Heroku)
- **Development**: JSON files in `./data/` directory
  - `jobcards.json` - Job card records
  - `spares.json` - Inventory items
  - `sales.json` - Sales transactions
  - `pricing-config.json` - Pricing configuration
- **Backups**: Automated JSON backups in `./backups/`

### Deployment
- **Platform**: Vercel (frontend + serverless functions)
- **Alternative**: Render (full-stack with PostgreSQL)
- **Config**: `vercel.json` for deployment settings
- **Environment**: Production uses DATABASE_URL for PostgreSQL

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or
npm start

# Server runs on http://localhost:3000
```

### Database Setup
```bash
# Set PostgreSQL connection (production)
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Without DATABASE_URL, falls back to JSON files
```

### File Structure
```
/                       # Root directory
├── index.html         # Main job card form
├── admin.html         # Admin dashboard
├── calculator.html    # Distance & pricing calculator
├── distance-calculator.html  # Standalone calculator
├── app.js            # Main job card logic
├── admin.js          # Admin dashboard logic
├── calculator.js     # Calculator logic
├── database.js       # Database abstraction layer
├── backup.js         # Backup system
├── server.js         # Express server
├── data/             # JSON data files (gitignored)
├── backups/          # Automatic backups (gitignored)
└── mh-towing-dashboard/  # Pro version (separate)
```

### API Endpoints
- `POST /api/jobcards` - Create job card
- `GET /api/jobcards` - List all job cards
- `GET /api/jobcards/:jobId` - Get single job card
- `PUT /api/jobcards/:jobId` - Update job card
- `DELETE /api/jobcards/:jobId` - Delete job card
- `GET /api/next-job-number` - Get next sequential job number
- `GET /api/stats` - Dashboard statistics
- `GET /api/spares` - Inventory management
- `POST /api/spares/sales` - Record sales
- `GET /api/backups` - Backup management
- `GET /api/pricing-config` - Pricing configuration

### External Dependencies
- Google Maps API key required for full functionality
- API key stored in `index.html` and calculator files
- Free tier sufficient for typical usage
- Enable: Maps JavaScript API, Places API, Distance Matrix API, Directions API, Geocoding API

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- LocalStorage for client-side data
- Geolocation API for GPS features
