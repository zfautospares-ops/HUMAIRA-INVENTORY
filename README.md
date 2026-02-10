# Digital Tow Truck Job Card System

A complete, mobile-friendly web application for digitizing tow truck job cards with backend storage and admin dashboard.

## Features

### Job Card Form
- ✅ Customer information capture
- ✅ Vehicle details (make, model, VIN, license plate)
- ✅ Service type selection
- ✅ GPS location capture for pickup/dropoff
- ✅ Photo capture for vehicle condition
- ✅ Digital signature pad
- ✅ Driver notes and damage documentation
- ✅ Offline fallback (saves to browser storage)
- ✅ Mobile-responsive design

### Admin Dashboard
- ✅ View all completed job cards
- ✅ Real-time statistics (total jobs, today's jobs)
- ✅ Search and filter functionality
- ✅ Detailed job card viewer
- ✅ Delete job cards
- ✅ Service type breakdown

### Backend
- ✅ SQLite database for permanent storage
- ✅ REST API for job card management
- ✅ Photo storage support
- ✅ Statistics endpoint

## Quick Start

### Prerequisites
- Node.js installed (download from nodejs.org)

### Installation

1. Double-click `start.bat` (Windows) or run:
```bash
npm install
npm start
```

2. Open your browser to:
   - **Job Card Form**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin.html

3. On mobile devices, connect to the same network and use your computer's IP address:
   - Example: http://192.168.1.100:3000

## Usage

### For Drivers (Job Card Form)
1. Fill out customer and vehicle information
2. Select service type
3. Use GPS to capture locations or enter manually
4. Take photos of the vehicle
5. Add any notes about the job or pre-existing damage
6. Get customer signature
7. Submit to save the job card

### For Office (Admin Dashboard)
1. View all completed job cards
2. Search by customer name, phone, vehicle, or job ID
3. Filter by service type
4. Click any job card to view full details
5. Delete completed jobs when no longer needed

## Data Storage

All job cards are stored in `jobcards.db` (SQLite database) in the same folder as the application.

## Deployment Options

### Local Network (Easiest)
- Run on office computer
- Drivers access via local IP address
- No internet required

### Cloud Hosting
Deploy to services like:
- Heroku (free tier available)
- DigitalOcean
- AWS
- Render

### VPS/Dedicated Server
- Full control
- Can use custom domain
- Best for larger operations

## Browser Compatibility

Works on all modern browsers (Chrome, Safari, Firefox, Edge)
Requires JavaScript enabled

## Future Enhancements

- PDF export for invoicing
- User authentication for drivers
- Email notifications
- Integration with billing systems
- Real-time dispatch integration
- Mobile apps (iOS/Android)
