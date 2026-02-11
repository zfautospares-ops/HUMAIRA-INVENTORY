const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const backup = require('./backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file paths
const DATA_DIR = './data';
const JOB_CARDS_FILE = path.join(DATA_DIR, 'jobcards.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(JOB_CARDS_FILE)) {
    fs.writeFileSync(JOB_CARDS_FILE, JSON.stringify([]));
}

// Start automatic backup system (every 24 hours)
backup.scheduleBackups(24);

// Helper functions
function readJobCards() {
    const data = fs.readFileSync(JOB_CARDS_FILE, 'utf8');
    return JSON.parse(data);
}

function writeJobCards(jobCards) {
    fs.writeFileSync(JOB_CARDS_FILE, JSON.stringify(jobCards, null, 2));
    // Create backup after every write
    backup.createBackup();
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// API Routes

// Save job card
app.post('/api/jobcards', (req, res) => {
    try {
        const jobCard = req.body;
        jobCard.created_at = new Date().toISOString();
        
        const jobCards = readJobCards();
        jobCards.push(jobCard);
        writeJobCards(jobCards);
        
        res.json({ success: true, jobId: jobCard.jobId });
    } catch (error) {
        console.error('Error saving job card:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all job cards
app.get('/api/jobcards', (req, res) => {
    try {
        const jobCards = readJobCards();
        // Sort by created_at descending
        jobCards.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(jobCards);
    } catch (error) {
        console.error('Error fetching job cards:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single job card
app.get('/api/jobcards/:jobId', (req, res) => {
    try {
        const jobCards = readJobCards();
        const jobCard = jobCards.find(j => j.jobId === req.params.jobId);
        
        if (!jobCard) {
            return res.status(404).json({ error: 'Job card not found' });
        }
        
        res.json(jobCard);
    } catch (error) {
        console.error('Error fetching job card:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete job card
app.delete('/api/jobcards/:jobId', (req, res) => {
    try {
        let jobCards = readJobCards();
        jobCards = jobCards.filter(j => j.jobId !== req.params.jobId);
        writeJobCards(jobCards);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting job card:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
    try {
        const jobCards = readJobCards();
        const today = new Date().toISOString().split('T')[0];
        
        const todayJobs = jobCards.filter(j => 
            j.created_at && j.created_at.startsWith(today)
        ).length;
        
        const byServiceType = {};
        jobCards.forEach(j => {
            const type = j.service?.type || 'unknown';
            byServiceType[type] = (byServiceType[type] || 0) + 1;
        });
        
        const byServiceArray = Object.entries(byServiceType).map(([service_type, count]) => ({
            service_type,
            count
        }));
        
        res.json({
            totalJobs: jobCards.length,
            todayJobs: todayJobs,
            byServiceType: byServiceArray
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get next job number
app.get('/api/next-job-number', (req, res) => {
    try {
        const jobCards = readJobCards();
        const nextNumber = jobCards.length + 1;
        const year = new Date().getFullYear();
        const jobNumber = `MHT-${year}-${String(nextNumber).padStart(4, '0')}`;
        res.json({ jobNumber, nextNumber });
    } catch (error) {
        console.error('Error generating job number:', error);
        res.status(500).json({ error: error.message });
    }
});

// Backup Management API Routes

// List all backups
app.get('/api/backups', (req, res) => {
    try {
        const backups = backup.listBackups();
        res.json({ success: true, backups });
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create manual backup
app.post('/api/backups/create', (req, res) => {
    try {
        const backupPath = backup.createBackup();
        if (backupPath) {
            res.json({ success: true, message: 'Backup created successfully', path: backupPath });
        } else {
            res.status(500).json({ success: false, error: 'Failed to create backup' });
        }
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Restore from backup
app.post('/api/backups/restore/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const success = backup.restoreBackup(filename);
        
        if (success) {
            res.json({ success: true, message: 'Data restored successfully' });
        } else {
            res.status(500).json({ success: false, error: 'Failed to restore backup' });
        }
    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download backup file
app.get('/api/backups/download/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join('./backups', filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ success: false, error: 'Backup file not found' });
        }
        
        res.download(backupPath, filename);
    } catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
});
