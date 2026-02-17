// API Helper for Backend Communication
// Handles all API calls with fallback to localStorage

const API_BASE_URL = '/api';  // Vercel serverless functions on same domain

// Check if backend is available
let backendAvailable = false;

async function checkBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        backendAvailable = response.ok;
        console.log('Backend status:', backendAvailable ? '✅ Available' : '❌ Unavailable');
        return backendAvailable;
    } catch (error) {
        backendAvailable = false;
        console.log('Backend status: ❌ Unavailable (using localStorage)');
        return false;
    }
}

// Initialize backend check on load
checkBackend();

// ========== INVOICES API ==========

async function getInvoices() {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('invoices') || '[]');
}

async function getInvoice(id) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices/${id}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    return invoices.find(inv => inv.id === id);
}

async function createInvoice(invoice) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoice)
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return invoice;
}

async function updateInvoice(id, updates) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const index = invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates };
        localStorage.setItem('invoices', JSON.stringify(invoices));
        return invoices[index];
    }
    return null;
}

async function deleteInvoice(id) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('invoices', JSON.stringify(filtered));
    return true;
}

async function getNextInvoiceNumber() {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/invoices/next-number`);
            if (response.ok) {
                const data = await response.json();
                return data.invoiceNumber;
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const year = new Date().getFullYear();
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
    
    return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
}

// ========== JOBS API ==========

async function getJobs() {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('jobs') || '[]');
}

async function createJob(job) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(job)
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    jobs.push(job);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    return job;
}

async function updateJob(id, updates) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const index = jobs.findIndex(job => job.id === id);
    if (index !== -1) {
        jobs[index] = { ...jobs[index], ...updates };
        localStorage.setItem('jobs', JSON.stringify(jobs));
        return jobs[index];
    }
    return null;
}

async function deleteJob(id) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const filtered = jobs.filter(job => job.id !== id);
    localStorage.setItem('jobs', JSON.stringify(filtered));
    return true;
}

// ========== EXPENSES API ==========

async function getExpenses() {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('expenses') || '[]');
}

async function createExpense(expense) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    return expense;
}

async function deleteExpense(id) {
    if (backendAvailable) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const filtered = expenses.filter(exp => exp.id !== id);
    localStorage.setItem('expenses', JSON.stringify(filtered));
    return true;
}
