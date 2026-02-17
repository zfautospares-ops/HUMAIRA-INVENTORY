// Enhanced Features Module
// Drivers, Fleet, Invoices, Expenses, and more

// ==================== DRIVERS MANAGEMENT ====================

function loadDrivers() {
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    const container = document.getElementById('driversList');
    
    if (drivers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🚗</div>
                <p>No drivers added yet</p>
                <p style="font-size: 0.9em; opacity: 0.7;">Add your first driver to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = drivers.map(driver => `
        <div class="driver-card">
            <div class="driver-avatar">${driver.name.charAt(0)}</div>
            <div class="driver-info">
                <h3>${driver.name}</h3>
                <p>📞 ${driver.phone}</p>
                <p>🚗 ${driver.licenseNumber}</p>
                <div class="driver-status ${driver.status}">
                    ${driver.status === 'available' ? '✅ Available' : '🚫 Busy'}
                </div>
            </div>
            <div class="driver-stats">
                <div class="stat-item">
                    <span class="stat-value">${driver.totalJobs || 0}</span>
                    <span class="stat-label">Jobs</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">R ${(driver.totalEarnings || 0).toFixed(0)}</span>
                    <span class="stat-label">Earnings</span>
                </div>
            </div>
            <div class="driver-actions">
                <button onclick="editDriver('${driver.id}')" class="icon-btn">✏️</button>
                <button onclick="deleteDriver('${driver.id}')" class="icon-btn" style="background: rgba(255,68,68,0.2);">🗑️</button>
            </div>
        </div>
    `).join('');
}

function addDriver() {
    const name = prompt('Driver Name:');
    if (!name) return;
    
    const phone = prompt('Phone Number:');
    const licenseNumber = prompt('License Number:');
    
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    const newDriver = {
        id: 'DRV-' + Date.now(),
        name,
        phone,
        licenseNumber,
        status: 'available',
        totalJobs: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString()
    };
    
    drivers.push(newDriver);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    loadDrivers();
    showNotification('Driver added successfully!', 'success');
}

function deleteDriver(id) {
    if (!confirm('Delete this driver?')) return;
    
    let drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    drivers = drivers.filter(d => d.id !== id);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    loadDrivers();
    showNotification('Driver deleted', 'success');
}

// ==================== FLEET MANAGEMENT ====================

function loadFleet() {
    const fleet = JSON.parse(localStorage.getItem('fleet')) || [];
    const container = document.getElementById('fleetList');
    
    if (fleet.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🚛</div>
                <p>No vehicles in fleet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = fleet.map(vehicle => `
        <div class="fleet-card">
            <div class="fleet-header">
                <h3>${vehicle.name}</h3>
                <span class="fleet-status ${vehicle.status}">${vehicle.status}</span>
            </div>
            <div class="fleet-details">
                <p>🚗 ${vehicle.registration}</p>
                <p>📅 ${vehicle.year}</p>
                <p>⛽ ${vehicle.fuelType}</p>
                <p>🔧 Last Service: ${vehicle.lastService || 'N/A'}</p>
            </div>
            <div class="fleet-stats">
                <div class="stat-item">
                    <span>${vehicle.totalKm || 0} km</span>
                    <span class="stat-label">Total Distance</span>
                </div>
                <div class="stat-item">
                    <span>${vehicle.totalJobs || 0}</span>
                    <span class="stat-label">Jobs</span>
                </div>
            </div>
            <div class="fleet-actions">
                <button onclick="editFleetVehicle('${vehicle.id}')" class="icon-btn">✏️</button>
                <button onclick="scheduleService('${vehicle.id}')" class="icon-btn">🔧</button>
                <button onclick="deleteFleetVehicle('${vehicle.id}')" class="icon-btn" style="background: rgba(255,68,68,0.2);">🗑️</button>
            </div>
        </div>
    `).join('');
}

function addVehicleToFleet() {
    const name = prompt('Vehicle Name (e.g., Flatbed 1):');
    if (!name) return;
    
    const registration = prompt('Registration Number:');
    const year = prompt('Year:');
    
    const fleet = JSON.parse(localStorage.getItem('fleet')) || [];
    const newVehicle = {
        id: 'VEH-' + Date.now(),
        name,
        registration,
        year,
        fuelType: 'Diesel',
        status: 'available',
        totalKm: 0,
        totalJobs: 0,
        lastService: null,
        createdAt: new Date().toISOString()
    };
    
    fleet.push(newVehicle);
    localStorage.setItem('fleet', JSON.stringify(fleet));
    loadFleet();
    showNotification('Vehicle added to fleet!', 'success');
}

function scheduleService(id) {
    const date = prompt('Service Date (YYYY-MM-DD):');
    if (!date) return;
    
    const fleet = JSON.parse(localStorage.getItem('fleet')) || [];
    const vehicle = fleet.find(v => v.id === id);
    if (vehicle) {
        vehicle.lastService = date;
        vehicle.nextService = new Date(new Date(date).setMonth(new Date(date).getMonth() + 3)).toISOString().split('T')[0];
        localStorage.setItem('fleet', JSON.stringify(fleet));
        loadFleet();
        showNotification('Service scheduled!', 'success');
    }
}

function deleteFleetVehicle(id) {
    if (!confirm('Remove this vehicle from fleet?')) return;
    
    let fleet = JSON.parse(localStorage.getItem('fleet')) || [];
    fleet = fleet.filter(v => v.id !== id);
    localStorage.setItem('fleet', JSON.stringify(fleet));
    loadFleet();
}

// ==================== INVOICES ====================

function loadInvoices() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const container = document.getElementById('invoicesList');
    
    if (invoices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🧾</div>
                <p>No invoices yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = invoices.map(invoice => `
        <div class="invoice-card ${invoice.status}">
            <div class="invoice-header">
                <h3>${invoice.invoiceNumber}</h3>
                <span class="invoice-status ${invoice.status}">${invoice.status.toUpperCase()}</span>
            </div>
            <div class="invoice-details">
                <p><strong>Customer:</strong> ${invoice.customerName}</p>
                <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                <p><strong>Due:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p class="invoice-amount"><strong>Amount:</strong> R ${invoice.total.toFixed(2)}</p>
            </div>
            <div class="invoice-actions">
                <button onclick="viewInvoice('${invoice.id}')" class="icon-btn">👁️</button>
                <button onclick="downloadInvoicePDF('${invoice.id}')" class="icon-btn">📥</button>
                <button onclick="sendInvoice('${invoice.id}')" class="icon-btn">📧</button>
                ${invoice.status === 'unpaid' ? `<button onclick="markAsPaid('${invoice.id}')" class="icon-btn" style="background: var(--success);">✅</button>` : ''}
            </div>
        </div>
    `).join('');
}

function filterInvoices(filter) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    let filtered = invoices;
    
    if (filter !== 'all') {
        filtered = invoices.filter(inv => inv.status === filter);
    }
    
    // Re-render with filtered data
    const container = document.getElementById('invoicesList');
    container.innerHTML = filtered.map(invoice => `
        <div class="invoice-card ${invoice.status}">
            <!-- Same as above -->
        </div>
    `).join('');
}

function markAsPaid(id) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
        invoice.status = 'paid';
        invoice.paidDate = new Date().toISOString();
        localStorage.setItem('invoices', JSON.stringify(invoices));
        loadInvoices();
        showNotification('Invoice marked as paid!', 'success');
    }
}

async function downloadInvoicePDF(id) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) return;
    
    const pdfGen = new PDFGenerator();
    await pdfGen.generateQuotePDF(invoice);
    pdfGen.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}

// ==================== EXPENSES ====================

function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const container = document.getElementById('expensesList');
    
    // Calculate summaries
    const now = new Date();
    const thisMonth = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);
    
    const lastMonth = expenses.filter(e => {
        const date = new Date(e.date);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);
    
    const thisYear = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);
    
    document.getElementById('expenseThisMonth').textContent = `R ${thisMonth.toFixed(2)}`;
    document.getElementById('expenseLastMonth').textContent = `R ${lastMonth.toFixed(2)}`;
    document.getElementById('expenseThisYear').textContent = `R ${thisYear.toFixed(2)}`;
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💵</div>
                <p>No expenses recorded</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = expenses.map(expense => `
        <div class="expense-card">
            <div class="expense-icon">${getCategoryIcon(expense.category)}</div>
            <div class="expense-details">
                <h4>${expense.description}</h4>
                <p>${expense.category} • ${new Date(expense.date).toLocaleDateString()}</p>
                ${expense.vehicle ? `<p>🚗 ${expense.vehicle}</p>` : ''}
            </div>
            <div class="expense-amount">R ${expense.amount.toFixed(2)}</div>
            <button onclick="deleteExpense('${expense.id}')" class="icon-btn" style="background: rgba(255,68,68,0.2);">🗑️</button>
        </div>
    `).join('');
}

function addExpense() {
    const description = prompt('Expense Description:');
    if (!description) return;
    
    const amount = parseFloat(prompt('Amount (R):'));
    if (isNaN(amount)) return;
    
    const category = prompt('Category (fuel/maintenance/toll/other):') || 'other';
    
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const newExpense = {
        id: 'EXP-' + Date.now(),
        description,
        amount,
        category,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    loadExpenses();
    showNotification('Expense added!', 'success');
}

function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    loadExpenses();
}

function getCategoryIcon(category) {
    const icons = {
        fuel: '⛽',
        maintenance: '🔧',
        toll: '🛣️',
        insurance: '🛡️',
        other: '💵'
    };
    return icons[category] || '💵';
}

// ==================== SETTINGS ====================

function saveAllSettings() {
    // Company settings
    localStorage.setItem('companyName', document.getElementById('settingsCompanyName').value);
    localStorage.setItem('companyPhone', document.getElementById('settingsCompanyPhone').value);
    localStorage.setItem('companyEmail', document.getElementById('settingsCompanyEmail').value);
    localStorage.setItem('companyAddress', document.getElementById('settingsCompanyAddress').value);
    localStorage.setItem('vatNumber', document.getElementById('settingsVatNumber').value);
    localStorage.setItem('regNumber', document.getElementById('settingsRegNumber').value);
    
    // Payment settings
    localStorage.setItem('payfastMerchantId', document.getElementById('payfastMerchantId').value);
    localStorage.setItem('payfastMerchantKey', document.getElementById('payfastMerchantKey').value);
    localStorage.setItem('bankName', document.getElementById('bankName').value);
    localStorage.setItem('bankAccount', document.getElementById('bankAccount').value);
    localStorage.setItem('branchCode', document.getElementById('branchCode').value);
    
    // SMS settings
    localStorage.setItem('smsProvider', document.getElementById('smsProvider').value);
    localStorage.setItem('smsApiKey', document.getElementById('smsApiKey').value);
    localStorage.setItem('smsSenderId', document.getElementById('smsSenderId').value);
    
    // Invoice settings
    localStorage.setItem('invoicePrefix', document.getElementById('invoicePrefix').value);
    localStorage.setItem('nextInvoiceNumber', document.getElementById('nextInvoiceNumber').value);
    localStorage.setItem('paymentTerms', document.getElementById('paymentTerms').value);
    localStorage.setItem('vatRate', document.getElementById('vatRate').value);
    localStorage.setItem('invoiceFooter', document.getElementById('invoiceFooter').value);
    
    // Language settings
    localStorage.setItem('defaultLanguage', document.getElementById('defaultLanguage').value);
    localStorage.setItem('currency', document.getElementById('currency').value);
    localStorage.setItem('dateFormat', document.getElementById('dateFormat').value);
    
    // Backup settings
    localStorage.setItem('autoBackup', document.getElementById('autoBackup').value);
    localStorage.setItem('backupRetention', document.getElementById('backupRetention').value);
    
    showNotification('All settings saved!', 'success');
}

function loadAllSettings() {
    // Load all settings from localStorage into form fields
    document.getElementById('settingsCompanyName').value = localStorage.getItem('companyName') || 'MH AUTO';
    document.getElementById('settingsCompanyPhone').value = localStorage.getItem('companyPhone') || '061 453 2160';
    document.getElementById('settingsCompanyEmail').value = localStorage.getItem('companyEmail') || 'info@mhauto.co.za';
    document.getElementById('settingsCompanyAddress').value = localStorage.getItem('companyAddress') || '784 Gopalall Hurbans, Tongaat, KZN';
    // ... load all other settings
}

// ==================== UTILITIES ====================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function createBackupNow() {
    const backup = {
        timestamp: new Date().toISOString(),
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        drivers: JSON.parse(localStorage.getItem('drivers') || '[]'),
        fleet: JSON.parse(localStorage.getItem('fleet') || '[]'),
        jobs: JSON.parse(localStorage.getItem('calculationHistory') || '[]'),
        invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
        expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
        vehicles: JSON.parse(localStorage.getItem('vehicles') || '[]')
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mh-auto-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Backup created successfully!', 'success');
}

function exportAllData() {
    createBackupNow();
}

// Initialize on page load
window.addEventListener('load', () => {
    if (document.getElementById('driversList')) loadDrivers();
    if (document.getElementById('fleetList')) loadFleet();
    if (document.getElementById('invoicesList')) loadInvoices();
    if (document.getElementById('expensesList')) loadExpenses();
});
