const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use PostgreSQL if DATABASE_URL is available, otherwise fall back to JSON files
const useDatabase = !!process.env.DATABASE_URL;

let pool;
if (useDatabase) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    console.log('✅ Using PostgreSQL database for persistent storage');
} else {
    console.log('⚠️ Using JSON files (data will be lost on restart). Set DATABASE_URL for persistent storage.');
}

// Initialize database tables
async function initDatabase() {
    if (!useDatabase) return;
    
    try {
        // Create job cards table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS job_cards (
                id SERIAL PRIMARY KEY,
                job_id VARCHAR(255) UNIQUE NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create spares table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS spares (
                id SERIAL PRIMARY KEY,
                spare_id VARCHAR(255) UNIQUE NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create sales table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                sale_id VARCHAR(255) UNIQUE NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create pricing config table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pricing_config (
                id SERIAL PRIMARY KEY,
                config JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
}

// Job Cards functions
async function getAllJobCards() {
    if (useDatabase) {
        const result = await pool.query('SELECT data FROM job_cards ORDER BY created_at DESC');
        return result.rows.map(row => row.data);
    } else {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'jobcards.json'), 'utf8');
        return JSON.parse(data);
    }
}

async function getJobCard(jobId) {
    if (useDatabase) {
        const result = await pool.query('SELECT data FROM job_cards WHERE job_id = $1', [jobId]);
        return result.rows[0]?.data || null;
    } else {
        const jobCards = await getAllJobCards();
        return jobCards.find(j => j.jobId === jobId) || null;
    }
}

async function saveJobCard(jobCard) {
    if (useDatabase) {
        await pool.query(
            `INSERT INTO job_cards (job_id, data) VALUES ($1, $2)
             ON CONFLICT (job_id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
            [jobCard.jobId, JSON.stringify(jobCard)]
        );
    } else {
        const jobCards = await getAllJobCards();
        const index = jobCards.findIndex(j => j.jobId === jobCard.jobId);
        if (index >= 0) {
            jobCards[index] = jobCard;
        } else {
            jobCards.push(jobCard);
        }
        fs.writeFileSync(path.join(__dirname, 'data', 'jobcards.json'), JSON.stringify(jobCards, null, 2));
    }
}

async function deleteJobCard(jobId) {
    if (useDatabase) {
        await pool.query('DELETE FROM job_cards WHERE job_id = $1', [jobId]);
    } else {
        let jobCards = await getAllJobCards();
        jobCards = jobCards.filter(j => j.jobId !== jobId);
        fs.writeFileSync(path.join(__dirname, 'data', 'jobcards.json'), JSON.stringify(jobCards, null, 2));
    }
}

// Spares functions
async function getAllSpares() {
    if (useDatabase) {
        const result = await pool.query('SELECT data FROM spares ORDER BY updated_at DESC');
        return result.rows.map(row => row.data);
    } else {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'spares.json'), 'utf8');
        return JSON.parse(data);
    }
}

async function saveSpare(spare) {
    if (useDatabase) {
        await pool.query(
            `INSERT INTO spares (spare_id, data) VALUES ($1, $2)
             ON CONFLICT (spare_id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
            [spare.id, JSON.stringify(spare)]
        );
    } else {
        const spares = await getAllSpares();
        const index = spares.findIndex(s => s.id === spare.id);
        if (index >= 0) {
            spares[index] = spare;
        } else {
            spares.push(spare);
        }
        fs.writeFileSync(path.join(__dirname, 'data', 'spares.json'), JSON.stringify(spares, null, 2));
    }
}

async function deleteSpare(spareId) {
    if (useDatabase) {
        await pool.query('DELETE FROM spares WHERE spare_id = $1', [spareId]);
    } else {
        let spares = await getAllSpares();
        spares = spares.filter(s => s.id !== spareId);
        fs.writeFileSync(path.join(__dirname, 'data', 'spares.json'), JSON.stringify(spares, null, 2));
    }
}

// Sales functions
async function getAllSales() {
    if (useDatabase) {
        const result = await pool.query('SELECT data FROM sales ORDER BY created_at DESC');
        return result.rows.map(row => row.data);
    } else {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'sales.json'), 'utf8');
        return JSON.parse(data);
    }
}

async function saveSale(sale) {
    if (useDatabase) {
        await pool.query(
            'INSERT INTO sales (sale_id, data) VALUES ($1, $2)',
            [sale.id, JSON.stringify(sale)]
        );
    } else {
        const sales = await getAllSales();
        sales.push(sale);
        fs.writeFileSync(path.join(__dirname, 'data', 'sales.json'), JSON.stringify(sales, null, 2));
    }
}

// Pricing config functions
async function getPricingConfig() {
    if (useDatabase) {
        const result = await pool.query('SELECT config FROM pricing_config ORDER BY id DESC LIMIT 1');
        return result.rows[0]?.config || null;
    } else {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'pricing-config.json'), 'utf8');
        return JSON.parse(data);
    }
}

async function savePricingConfig(config) {
    if (useDatabase) {
        await pool.query(
            'INSERT INTO pricing_config (config) VALUES ($1)',
            [JSON.stringify(config)]
        );
    } else {
        fs.writeFileSync(path.join(__dirname, 'data', 'pricing-config.json'), JSON.stringify(config, null, 2));
    }
}

module.exports = {
    initDatabase,
    getAllJobCards,
    getJobCard,
    saveJobCard,
    deleteJobCard,
    getAllSpares,
    saveSpare,
    deleteSpare,
    getAllSales,
    saveSale,
    getPricingConfig,
    savePricingConfig
};
