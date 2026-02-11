const fs = require('fs');
const path = require('path');

// Backup configuration
const BACKUP_DIR = './backups';
const DATA_FILE = './data/jobcards.json';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create backup with timestamp
function createBackup() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('No data file to backup');
            return null;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `jobcards-backup-${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupFileName);

        // Copy data file to backup
        fs.copyFileSync(DATA_FILE, backupPath);

        console.log(`✅ Backup created: ${backupFileName}`);
        return backupPath;
    } catch (error) {
        console.error('❌ Backup failed:', error);
        return null;
    }
}

// Clean old backups (keep last 30 days)
function cleanOldBackups(daysToKeep = 30) {
    try {
        const files = fs.readdirSync(BACKUP_DIR);
        const now = Date.now();
        const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted old backup: ${file}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning old backups:', error);
    }
}

// Get all backups
function listBackups() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            return [];
        }

        const files = fs.readdirSync(BACKUP_DIR);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created);
    } catch (error) {
        console.error('Error listing backups:', error);
        return [];
    }
}

// Restore from backup
function restoreBackup(backupFileName) {
    try {
        const backupPath = path.join(BACKUP_DIR, backupFileName);
        
        if (!fs.existsSync(backupPath)) {
            throw new Error('Backup file not found');
        }

        // Create backup of current data before restoring
        createBackup();

        // Restore backup
        fs.copyFileSync(backupPath, DATA_FILE);
        console.log(`✅ Restored from backup: ${backupFileName}`);
        return true;
    } catch (error) {
        console.error('❌ Restore failed:', error);
        return false;
    }
}

// Schedule automatic backups
function scheduleBackups(intervalHours = 24) {
    console.log(`📅 Scheduling automatic backups every ${intervalHours} hours`);
    
    // Create initial backup
    createBackup();
    
    // Schedule recurring backups
    setInterval(() => {
        console.log('⏰ Running scheduled backup...');
        createBackup();
        cleanOldBackups(30);
    }, intervalHours * 60 * 60 * 1000);
}

module.exports = {
    createBackup,
    cleanOldBackups,
    listBackups,
    restoreBackup,
    scheduleBackups
};
