const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Helper functions for file-based storage
async function readData(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeData(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ========== INVOICE ENDPOINTS ==========

// Get all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await readData('invoices.json');
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Get single invoice
app.get('/api/invoices/:id', async (req, res) => {
    try {
        const invoices = await readData('invoices.json');
        const invoice = invoices.find(inv => inv.id === req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        res.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

// Create invoice
app.post('/api/invoices', async (req, res) => {
    try {
        const invoices = await readData('invoices.json');
        const newInvoice = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        invoices.push(newInvoice);
        await writeData('invoices.json', invoices);
        
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// Update invoice
app.put('/api/invoices/:id', async (req, res) => {
    try {
        const invoices = await readData('invoices.json');
        const index = invoices.findIndex(inv => inv.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        invoices[index] = {
            ...invoices[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeData('invoices.json', invoices);
        res.json(invoices[index]);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
    try {
        const invoices = await readData('invoices.json');
        const filtered = invoices.filter(inv => inv.id !== req.params.id);
        
        if (filtered.length === invoices.length) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        await writeData('invoices.json', filtered);
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});

// Get next invoice number
app.get('/api/invoices/next-number', async (req, res) => {
    try {
        const invoices = await readData('invoices.json');
        const year = new Date().getFullYear();
        
        // Find highest invoice number for current year
        const yearInvoices = invoices.filter(inv => 
            inv.invoiceNumber && inv.invoiceNumber.startsWith(`INV-${year}`)
        );
        
        let nextNumber = 1;
        if (yearInvoices.length > 0) {
            const numbers = yearInvoices.map(inv => {
                const match = inv.invoiceNumber.match(/INV-\d{4}-(\d{4})/);
                return match ? parseInt(match[1]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        
        const invoiceNumber = `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
        res.json({ invoiceNumber });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        res.status(500).json({ error: 'Failed to generate invoice number' });
    }
});

// ========== JOBS ENDPOINTS ==========

// Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await readData('jobs.json');
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Create job
app.post('/api/jobs', async (req, res) => {
    try {
        const jobs = await readData('jobs.json');
        const newJob = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        jobs.push(newJob);
        await writeData('jobs.json', jobs);
        
        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// Update job
app.put('/api/jobs/:id', async (req, res) => {
    try {
        const jobs = await readData('jobs.json');
        const index = jobs.findIndex(job => job.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        jobs[index] = {
            ...jobs[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeData('jobs.json', jobs);
        res.json(jobs[index]);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// Delete job
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const jobs = await readData('jobs.json');
        const filtered = jobs.filter(job => job.id !== req.params.id);
        
        if (filtered.length === jobs.length) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        await writeData('jobs.json', filtered);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// ========== EXPENSES ENDPOINTS ==========

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await readData('expenses.json');
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
    try {
        const expenses = await readData('expenses.json');
        const newExpense = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        expenses.push(newExpense);
        await writeData('expenses.json', expenses);
        
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const expenses = await readData('expenses.json');
        const filtered = expenses.filter(exp => exp.id !== req.params.id);
        
        if (filtered.length === expenses.length) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        await writeData('expenses.json', filtered);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'MH AUTO Backend API is running'
    });
});

// Start server
async function startServer() {
    await ensureDataDir();
    app.listen(PORT, () => {
        console.log(`🚀 MH AUTO Backend running on port ${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
        console.log(`🌐 API endpoints available at http://localhost:${PORT}/api`);
    });
}

startServer().catch(console.error);
