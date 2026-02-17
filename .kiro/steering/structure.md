# Project Structure

## Directory Organization

### Root Level Files
- **HTML Pages**: Main application entry points
  - `index.html` - Digital job card form (primary interface)
  - `admin.html` - Admin dashboard for viewing/managing job cards
  - `calculator.html` - Distance & pricing calculator with quotation
  - `distance-calculator.html` - Standalone distance calculator
  
- **JavaScript Files**: Application logic
  - `app.js` - Job card form logic, signature canvas, GPS, Google Maps integration
  - `admin.js` - Admin dashboard, statistics, job card management
  - `calculator.js` - Distance calculation, pricing, quotation generation
  - `distance-calculator.js` - Standalone calculator logic
  - `database.js` - Database abstraction (PostgreSQL/JSON dual-mode)
  - `backup.js` - Automatic backup system
  - `server.js` - Express server, API routes, initialization

- **CSS Files**: Styling
  - `admin-styles.css` - Admin dashboard styles
  - `calculator-styles.css` - Calculator page styles
  - `distance-calculator-styles.css` - Standalone calculator styles
  - Note: Main job card styles are inline in `index.html`

- **Configuration**
  - `package.json` - Node.js dependencies and scripts
  - `vercel.json` - Vercel deployment configuration
  - `.gitignore` - Excludes node_modules, data, backups, logs

### Data Directory (`./data/`)
Runtime data storage (gitignored, created automatically):
- `jobcards.json` - All job card records
- `spares.json` - Inventory items
- `sales.json` - Sales transactions
- `pricing-config.json` - Configurable pricing rates

### Backups Directory (`./backups/`)
Automatic backups (gitignored):
- Format: `complete-backup-YYYY-MM-DDTHH-MM-SS-MMMZ.json`
- Contains: All job cards, spares, and sales at backup time
- Retention: 30 days (auto-cleanup)
- Frequency: Every 24 hours + after each write operation

### Documentation Files
Markdown documentation in root:
- `BACKUP_SYSTEM.md` - Backup system documentation
- `BACKUP_QUICK_START.md` - Quick backup guide
- `CALCULATOR_QUOTATION.md` - Quotation feature guide
- `DATABASE_SETUP_CHECKLIST.md` - Database setup instructions
- `DEPLOYMENT.md` - Deployment guide
- `DISTANCE_CALCULATOR_INFO.md` - Calculator documentation
- `DAMAGE_DIAGRAM_UPDATE.md` - Damage tracking notes
- `FULL_PRO_SUMMARY.md` - Pro version feature summary
- `GOOGLE_MAPS_API_FIX.md` - Google Maps troubleshooting
- `GOOGLE_MAPS_SETUP.md` - Google Maps API setup

### Separate Pro Version (`./mh-towing-dashboard/`)
Enhanced version with additional features:
- Customer management
- Driver management
- Analytics dashboard
- Invoice system
- PWA support
- Separate deployment on Vercel

## Code Organization Patterns

### Frontend Architecture
- **No build process**: Vanilla JavaScript, no bundler
- **Direct DOM manipulation**: `document.getElementById()`, event listeners
- **Global functions**: Functions defined in global scope for HTML onclick handlers
- **Inline event handlers**: Mix of inline `onclick` and `addEventListener`
- **Canvas API**: Used for signature capture
- **LocalStorage**: Client-side data persistence in some features

### Backend Architecture
- **Express middleware**: CORS, JSON body parser (50mb limit for images)
- **Database abstraction**: `database.js` provides unified interface for PostgreSQL/JSON
- **Automatic initialization**: Creates data files and database tables on startup
- **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Error handling**: Try-catch blocks with console logging and HTTP error responses

### Data Flow
1. **Job Card Creation**: Form → `app.js` → POST `/api/jobcards` → `database.js` → Storage
2. **Admin Dashboard**: `admin.html` → GET `/api/jobcards` → `admin.js` → Display
3. **Calculator**: Form → `calculator.js` → Google Maps APIs → Quotation generation
4. **Backups**: Write operation → `backup.js` → Create backup → `./backups/`

### Google Maps Integration
- **API Key**: Hardcoded in HTML files (should be environment variable)
- **Libraries**: places, directions, geocoding
- **Features**: Address autocomplete, route calculation, distance matrix, map visualization
- **Fallback**: GPS coordinates work without API key, autocomplete disabled

### Mobile-First Considerations
- Responsive CSS with media queries
- Touch-friendly button sizes
- GPS geolocation API integration
- File input with `capture="environment"` for camera
- Canvas signature with touch events
- WhatsApp/SMS sharing via URL schemes

## Naming Conventions

### Files
- Lowercase with hyphens: `admin-styles.css`, `distance-calculator.html`
- Descriptive names indicating purpose

### Variables
- camelCase: `jobIdInput`, `pickupCoords`, `workshopLocation`
- Descriptive names, avoid abbreviations

### Functions
- camelCase: `generateJobId()`, `calculateAllDistances()`, `geocodeAddress()`
- Verb-based names indicating action

### API Routes
- RESTful: `/api/jobcards`, `/api/spares`, `/api/backups`
- Plural nouns for collections
- ID parameters: `/api/jobcards/:jobId`

### Database Fields
- camelCase in JSON: `jobId`, `customerName`, `vehicleMake`
- snake_case in PostgreSQL: `job_id`, `created_at`, `updated_at`
- Timestamps: ISO 8601 format (`created_at`, `updated_at`)

## Key Architectural Decisions

1. **Dual Storage Mode**: Supports both PostgreSQL (production) and JSON files (development)
2. **No Authentication**: Open system, suitable for internal use
3. **Automatic Backups**: Every write operation triggers backup
4. **Sequential Job Numbers**: Format `MHT-YYYY-NNNN`
5. **Image Storage**: Base64 encoded in JSON/database (no separate file storage)
6. **Client-Side Heavy**: Much logic in frontend JavaScript
7. **No Framework**: Vanilla JavaScript for simplicity and minimal dependencies
