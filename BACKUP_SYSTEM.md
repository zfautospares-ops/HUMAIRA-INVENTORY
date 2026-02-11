# 💾 Automatic Backup System

## Overview
The MH Towing system includes a comprehensive automatic backup system to protect ALL your data - job cards, spares inventory, and sales records.

## Features

### Automatic Backups
- **Scheduled Backups**: Runs automatically every 24 hours
- **On-Write Backups**: Creates a backup after every data change (new job card, deletion, inventory update, sale, etc.)
- **Auto-Cleanup**: Automatically removes backups older than 30 days
- **Complete System Backup**: Backs up all three systems in one file

### What Gets Backed Up ⭐ UPDATED
- **Job Cards**: All towing job records
- **Spares Inventory**: Complete parts inventory
- **Sales Records**: All sales transactions

### Manual Backup Management
Access the backup management interface from the Admin Dashboard:

1. Click the **💾 Backups** button in the header
2. View all available backups with:
   - Timestamps and file sizes
   - Record counts (job cards, spares, sales) ⭐ NEW
3. Create manual backups on-demand
4. Download backups to your local computer
5. Restore from any previous backup

## Backup Location
Backups are stored in the `./backups/` directory on the server.

## Backup File Format
- Filename pattern: `complete-backup-YYYY-MM-DDTHH-MM-SS-MMMZ.json` ⭐ UPDATED
- Format: JSON with structured data
- Contains: All job cards, spares, and sales at the time of backup ⭐ UPDATED

### Backup Structure ⭐ NEW
```json
{
  "timestamp": "2026-02-11T12:00:00.000Z",
  "version": "2.0",
  "data": {
    "jobcards": [...],
    "spares": [...],
    "sales": [...]
  }
}
```

## How to Use

### Create Manual Backup
1. Open Admin Dashboard
2. Click **💾 Backups** button
3. Click **➕ Create Backup Now**
4. Confirmation message will appear

### Download Backup
1. Open Backup Management modal
2. Find the backup you want to download
3. Click the **⬇️** (download) button
4. File will download to your computer

### Restore from Backup
1. Open Backup Management modal
2. Find the backup you want to restore
3. Review the record counts to verify it's the right backup ⭐ NEW
4. Click the **♻️** (restore) button
5. Confirm the restoration (WARNING: This will replace ALL current data)
6. Your current data is automatically backed up before restoration
7. Dashboard will refresh with restored data

## What Gets Restored ⭐ NEW
When you restore a backup, ALL systems are restored:
- Job cards system
- Spares inventory
- Sales records

This ensures complete data consistency across all systems.

## API Endpoints

### List Backups
```
GET /api/backups
```
Returns list of all available backups with metadata.

### Create Manual Backup
```
POST /api/backups/create
```
Creates a new backup immediately.

### Restore from Backup
```
POST /api/backups/restore/:filename
```
Restores data from the specified backup file.

### Download Backup
```
GET /api/backups/download/:filename
```
Downloads the specified backup file.

## Technical Details

### Backup Module (`backup.js`)
The backup system is implemented as a Node.js module with the following functions:

- `createBackup()` - Creates a timestamped comprehensive backup ⭐ UPDATED
- `listBackups()` - Returns array of backup files with metadata and record counts ⭐ UPDATED
- `restoreBackup(filename)` - Restores all systems from specified backup ⭐ UPDATED
- `cleanOldBackups(days)` - Removes backups older than specified days
- `scheduleBackups(hours)` - Sets up automatic backup schedule

### Integration
The backup system is integrated into `server.js`:
- Initialized on server startup
- Automatic backup every 24 hours
- Backup created after every write operation (any system) ⭐ UPDATED
- API endpoints for manual management

### Data Files Backed Up ⭐ NEW
- `./data/jobcards.json` - Job card records
- `./data/spares.json` - Spares inventory
- `./data/sales.json` - Sales transactions

## Safety Features

1. **Pre-Restore Backup**: Before restoring, current data is automatically backed up
2. **Confirmation Required**: Restore operations require user confirmation
3. **No Accidental Deletion**: Backups are only deleted automatically after 30 days
4. **Download Option**: You can download backups for external storage

## Best Practices

1. **Regular Downloads**: Download important backups to your local computer or cloud storage
2. **Before Major Changes**: Create a manual backup before making significant changes
3. **Test Restores**: Periodically test the restore function to ensure backups are valid
4. **Monitor Disk Space**: Check backup directory size if you have many job cards

## Troubleshooting

### Backup Not Created
- Check server logs for error messages
- Ensure `./backups/` directory has write permissions
- Verify `./data/jobcards.json` exists

### Restore Failed
- Ensure backup file exists in `./backups/` directory
- Check backup file is valid JSON
- Review server logs for specific error

### Old Backups Not Deleted
- Cleanup runs during scheduled backup (every 24 hours)
- Manually trigger by creating a new backup
- Check file timestamps in `./backups/` directory

## Support
For issues or questions about the backup system, check the server console logs for detailed error messages.
