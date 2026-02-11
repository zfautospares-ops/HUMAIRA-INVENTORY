const fs = require('fs');
const path = require('path');

// Backup configuration
const BACKUP_DIR = './backups';
const DATA_DIR = './data';
const DATA_FILES = {
    jobcards: path.join(DATA_DIR, 'jobcards.json'),
    spares: path.join(DATA_DIR, 'spares.json'),
    sales: path.join(DATA_DIR, 'sales.json')
};

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create comprehensive backup with timestamp
function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `complete-backup-${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupFileName);

        // Collect all data
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            data: {}
        };

        // Backup each data file
        let hasData = false;
        Object.keys(DATA_FILES).forEach(key => {
            const filePath = DATA_FILES[key];
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                backupData.data[key] = JSON.parse(data);
                hasData = true;
            } else {
                backupData.data[key] = [];
            }
        });

        if (!hasData) {
            console.log('No data files to backup');
            return null;
        }

        // Write comprehensive backup
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        console.log(`✅ Complete backup created: ${backupFileName}`);
        console.log(`   - Job Cards: ${backupData.data.jobcards.length} records`);
        console.log(`   - Spares: ${backupData.data.spares.length} items`);
        console.log(`   - Sales: ${backupData.data.sales.length} transactions`);
        
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
                
                // Try to read backup to get record counts
                let recordCounts = null;
                try {
                    const backupContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (backupContent.data) {
                        recordCounts = {
                            jobcards: backupContent.data.jobcards?.length || 0,
                            spares: backupContent.data.spares?.length || 0,
                            sales: backupContent.data.sales?.length || 0
                        };
                    }
                } catch (e) {
                    // Legacy backup format
                }
                
                return {
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.mtime,
                    recordCounts
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

        // Read backup file
        const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        // Check if it's new format (v2.0) or legacy
        if (backupContent.data) {
            // New format - restore all data files
            Object.keys(DATA_FILES).forEach(key => {
                const filePath = DATA_FILES[key];
                const data = backupContent.data[key] || [];
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            });
            console.log(`✅ Restored complete backup: ${backupFileName}`);
        } else {
            // Legacy format - restore only jobcards
            fs.writeFileSync(DATA_FILES.jobcards, JSON.stringify(backupContent, null, 2));
            console.log(`✅ Restored legacy backup: ${backupFileName}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Restore failed:', error);
        return false;
    }
}

// Schedule automatic backups
function scheduleBackups(intervalHours = 24) {
    console.log(`📅 Scheduling automatic backups every ${intervalHours} hours`);
    console.log(`   Backing up: Job Cards, Spares, Sales`);
    
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
