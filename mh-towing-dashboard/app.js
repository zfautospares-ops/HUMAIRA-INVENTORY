// Global State
let darkMode = false;
let currentSection = 'dashboard';
let bookings = [];
let jobs = [];
let fleet = [];
let drivers = [];
let customers = [];
let invoices = [];

// Initialize
window.addEventListener('load', () => {
    loadData();
    loadDarkMode();
    updateDashboard();
    displayRecentJobs();
});

// Load data from localStorage
function loadData() {
    bookings = JSON.parse(localStorage.getItem('mh_bookings')) || generateSampleBookings();
    jobs = JSON.parse(localStorage.getItem('mh_jobs')) || generateSampleJobs();
    fleet = JSON.parse(localStorage.getItem('mh_fleet')) || generateSampleFleet();
    drivers = JSON.parse(localStorage.getItem('mh_drivers')) || generateSampleDrivers();
    customers = JSON.parse(localStorage.getItem('mh_customers')) || generateSampleCustomers();
    invoices = JSON.parse(localStorage.getItem('mh_invoices')) || generateSampleInvoices();
    
    saveData();
}

function saveData() {
    localStorage.setItem('mh_bookings', JSON.stringify(bookings));
    localStorage.setItem('mh_jobs', JSON.stringify(jobs));
    localStorage.setItem('mh_fleet', JSON.stringify(fleet));
    localStorage.setItem('mh_drivers', JSON.stringify(drivers));
    localStorage.setItem('mh_customers', JSON.stringify(customers));
    localStorage.setItem('mh_invoices', JSON.stringify(invoices));
}

// Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    
    currentSection = section;
    document.getElementById('pageTitle').textContent = section.charAt(0).toUpperCase() + section.slice(1);
    
    // Load section data
    switch(section) {
        case 'bookings':
            displayBookings();
            break;
        case 'jobs':
            displayJobs();
            break;
        case 'fleet':
            displayFleet();
            break;
        case 'drivers':
            displayDrivers();
            break;
        case 'customers':
            displayCustomers();
            break;
        case 'invoices':
            displayInvoices();
            break;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// Dashboard
function updateDashboard() {
    const today = new Date().toDateString();
    const todayJobs = bookings.filter(b => new Date(b.date).toDateString() === today);
    const activeJobs = jobs.filter(j => j.status === 'active');
    const todayRevenue = todayJobs.reduce((sum, b) => sum + b.amount, 0);
    
    document.getElementById('todayJobs').textContent = todayJobs.length;
    document.getElementById('activeJobs').textContent = activeJobs.length;
    document.getElementById('todayRevenue').textContent = 'R' + todayRevenue.toFixed(2);
}

function displayRecentJobs() {
    const recent = bookings.slice(0, 5);
    const html = recent.map(b => `
        <div class="job-item">
            <div class="job-info">
                <strong>${b.customer}</strong>
                <p>${b.pickup} → ${b.dropoff}</p>
                <small>${new Date(b.date).toLocaleString()}</small>
            </div>
            <div class="job-status">
                <span class="status-badge ${b.status}">${b.status}</span>
                <strong>R${b.amount}</strong>
            </div>
        </div>
    `).join('');
    
    document.getElementById('recentJobs').innerHTML = html || '<p class="empty">No recent jobs</p>';
}


// Bookings
function displayBookings() {
    const tbody = document.getElementById('bookingsBody');
    const html = bookings.map((b, i) => `
        <tr>
            <td>#${b.id}</td>
            <td>${b.customer}</td>
            <td>${b.pickup}</td>
            <td>${b.dropoff}</td>
            <td>${new Date(b.date).toLocaleString()}</td>
            <td>${b.vehicle}</td>
            <td><span class="status-badge ${b.status}">${b.status}</span></td>
            <td>R${b.amount}</td>
            <td>
                <button class="btn-icon" onclick="viewBooking(${i})" title="View">👁️</button>
                <button class="btn-icon" onclick="editBooking(${i})" title="Edit">✏️</button>
                <button class="btn-icon danger" onclick="deleteBooking(${i})" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="9" class="empty">No bookings found</td></tr>';
}

function filterBookings() {
    const search = document.getElementById('bookingSearch').value.toLowerCase();
    const status = document.getElementById('bookingStatus').value;
    
    const filtered = bookings.filter(b => {
        const matchesSearch = b.customer.toLowerCase().includes(search) || 
                            b.pickup.toLowerCase().includes(search) ||
                            b.dropoff.toLowerCase().includes(search);
        const matchesStatus = !status || b.status === status;
        return matchesSearch && matchesStatus;
    });
    
    // Display filtered results
    const tbody = document.getElementById('bookingsBody');
    const html = filtered.map((b, i) => `
        <tr>
            <td>#${b.id}</td>
            <td>${b.customer}</td>
            <td>${b.pickup}</td>
            <td>${b.dropoff}</td>
            <td>${new Date(b.date).toLocaleString()}</td>
            <td>${b.vehicle}</td>
            <td><span class="status-badge ${b.status}">${b.status}</span></td>
            <td>R${b.amount}</td>
            <td>
                <button class="btn-icon" onclick="viewBooking(${bookings.indexOf(b)})" title="View">👁️</button>
                <button class="btn-icon" onclick="editBooking(${bookings.indexOf(b)})" title="Edit">✏️</button>
                <button class="btn-icon danger" onclick="deleteBooking(${bookings.indexOf(b)})" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="9" class="empty">No bookings found</td></tr>';
}

// Jobs
function displayJobs() {
    const grid = document.getElementById('jobsGrid');
    const activeJobs = jobs.filter(j => j.status === 'active');
    
    const html = activeJobs.map((j, i) => `
        <div class="job-card">
            <div class="job-card-header">
                <h3>Job #${j.id}</h3>
                <span class="status-badge ${j.status}">${j.status}</span>
            </div>
            <div class="job-card-body">
                <p><strong>Customer:</strong> ${j.customer}</p>
                <p><strong>Driver:</strong> ${j.driver || 'Unassigned'}</p>
                <p><strong>Vehicle:</strong> ${j.vehicle}</p>
                <p><strong>From:</strong> ${j.pickup}</p>
                <p><strong>To:</strong> ${j.dropoff}</p>
                <p><strong>Distance:</strong> ${j.distance}km</p>
                <p><strong>Amount:</strong> R${j.amount}</p>
            </div>
            <div class="job-card-footer">
                <button class="btn-sm" onclick="trackJob(${i})">📍 Track</button>
                <button class="btn-sm" onclick="completeJob(${i})">✅ Complete</button>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = html || '<p class="empty">No active jobs</p>';
}

// Fleet
function displayFleet() {
    const grid = document.getElementById('fleetGrid');
    const html = fleet.map((v, i) => `
        <div class="fleet-card">
            <div class="fleet-card-header">
                <h3>${v.name}</h3>
                <span class="status-badge ${v.status}">${v.status}</span>
            </div>
            <div class="fleet-card-body">
                <p><strong>Reg:</strong> ${v.registration}</p>
                <p><strong>Type:</strong> ${v.type}</p>
                <p><strong>Driver:</strong> ${v.driver || 'Unassigned'}</p>
                <p><strong>Mileage:</strong> ${v.mileage}km</p>
                <p><strong>Last Service:</strong> ${v.lastService}</p>
            </div>
            <div class="fleet-card-footer">
                <button class="btn-sm" onclick="editVehicle(${i})">✏️ Edit</button>
                <button class="btn-sm" onclick="serviceVehicle(${i})">🔧 Service</button>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = html;
}

// Drivers
function displayDrivers() {
    const grid = document.getElementById('driversGrid');
    const html = drivers.map((d, i) => `
        <div class="driver-card">
            <div class="driver-avatar">${d.name.charAt(0)}</div>
            <div class="driver-info">
                <h3>${d.name}</h3>
                <p>📞 ${d.phone}</p>
                <p>🚛 ${d.vehicle || 'No vehicle assigned'}</p>
                <p><strong>Status:</strong> <span class="status-badge ${d.status}">${d.status}</span></p>
                <p><strong>Jobs Today:</strong> ${d.jobsToday}</p>
                <p><strong>Rating:</strong> ⭐ ${d.rating}</p>
            </div>
            <div class="driver-actions">
                <button class="btn-sm" onclick="editDriver(${i})">✏️ Edit</button>
                <button class="btn-sm" onclick="viewDriverStats(${i})">📊 Stats</button>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = html;
}

// Customers
function displayCustomers() {
    const tbody = document.getElementById('customersBody');
    const html = customers.map((c, i) => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>${c.totalJobs}</td>
            <td>R${c.totalSpent}</td>
            <td>${c.lastJob}</td>
            <td>
                <button class="btn-icon" onclick="viewCustomer(${i})" title="View">👁️</button>
                <button class="btn-icon" onclick="editCustomer(${i})" title="Edit">✏️</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="7" class="empty">No customers found</td></tr>';
}

function filterCustomers() {
    const search = document.getElementById('customerSearch').value.toLowerCase();
    const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search)
    );
    
    const tbody = document.getElementById('customersBody');
    const html = filtered.map((c, i) => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>${c.totalJobs}</td>
            <td>R${c.totalSpent}</td>
            <td>${c.lastJob}</td>
            <td>
                <button class="btn-icon" onclick="viewCustomer(${customers.indexOf(c)})" title="View">👁️</button>
                <button class="btn-icon" onclick="editCustomer(${customers.indexOf(c)})" title="Edit">✏️</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="7" class="empty">No customers found</td></tr>';
}

// Invoices
function displayInvoices() {
    const tbody = document.getElementById('invoicesBody');
    const html = invoices.map((inv, i) => `
        <tr>
            <td>#${inv.id}</td>
            <td>${inv.customer}</td>
            <td>${inv.date}</td>
            <td>R${inv.amount}</td>
            <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewInvoice(${i})" title="View">👁️</button>
                <button class="btn-icon" onclick="downloadInvoice(${i})" title="Download">📥</button>
                <button class="btn-icon" onclick="sendInvoice(${i})" title="Send">📧</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="6" class="empty">No invoices found</td></tr>';
}

function filterInvoices() {
    const search = document.getElementById('invoiceSearch').value.toLowerCase();
    const status = document.getElementById('invoiceStatus').value;
    
    const filtered = invoices.filter(inv => {
        const matchesSearch = inv.customer.toLowerCase().includes(search) || inv.id.includes(search);
        const matchesStatus = !status || inv.status === status;
        return matchesSearch && matchesStatus;
    });
    
    const tbody = document.getElementById('invoicesBody');
    const html = filtered.map((inv, i) => `
        <tr>
            <td>#${inv.id}</td>
            <td>${inv.customer}</td>
            <td>${inv.date}</td>
            <td>R${inv.amount}</td>
            <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewInvoice(${invoices.indexOf(inv)})" title="View">👁️</button>
                <button class="btn-icon" onclick="downloadInvoice(${invoices.indexOf(inv)})" title="Download">📥</button>
                <button class="btn-icon" onclick="sendInvoice(${invoices.indexOf(inv)})" title="Send">📧</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="6" class="empty">No invoices found</td></tr>';
}


// Modal Functions
function openModal(title, content) {
    document.getElementById('modalBody').innerHTML = `<h2>${title}</h2>${content}`;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function openNewBooking() {
    const content = `
        <div class="form">
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="newCustomerName" placeholder="Enter customer name">
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" id="newCustomerPhone" placeholder="Enter phone number">
            </div>
            <div class="form-group">
                <label>Pickup Location</label>
                <input type="text" id="newPickup" placeholder="Enter pickup address">
            </div>
            <div class="form-group">
                <label>Dropoff Location</label>
                <input type="text" id="newDropoff" placeholder="Enter dropoff address">
            </div>
            <div class="form-group">
                <label>Vehicle Type</label>
                <select id="newVehicleType">
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Heavy Vehicle">Heavy Vehicle</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" id="newDateTime">
            </div>
            <div class="form-group">
                <label>Distance (km)</label>
                <input type="number" id="newDistance" placeholder="Enter distance">
            </div>
            <div class="form-group">
                <label>Amount (R)</label>
                <input type="number" id="newAmount" placeholder="Calculated amount">
            </div>
            <button class="btn-primary" onclick="saveNewBooking()">Create Booking</button>
        </div>
    `;
    openModal('New Booking', content);
}

function saveNewBooking() {
    const booking = {
        id: 'BK' + Date.now(),
        customer: document.getElementById('newCustomerName').value,
        phone: document.getElementById('newCustomerPhone').value,
        pickup: document.getElementById('newPickup').value,
        dropoff: document.getElementById('newDropoff').value,
        vehicle: document.getElementById('newVehicleType').value,
        date: document.getElementById('newDateTime').value,
        distance: parseFloat(document.getElementById('newDistance').value),
        amount: parseFloat(document.getElementById('newAmount').value),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    bookings.unshift(booking);
    saveData();
    closeModal();
    displayBookings();
    updateDashboard();
    alert('✅ Booking created successfully!');
}

function openQuoteCalculator() {
    window.open('https://towing-calc-v2.vercel.app', '_blank');
}

// Dark Mode
function loadDarkMode() {
    darkMode = localStorage.getItem('mh_darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').textContent = '☀️';
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('mh_darkMode', darkMode);
    document.querySelector('.theme-toggle').textContent = darkMode ? '☀️' : '🌙';
}

// Notifications
function showNotifications() {
    const content = `
        <div class="notifications">
            <div class="notification-item">
                <span class="notification-icon">🚛</span>
                <div class="notification-content">
                    <strong>New booking request</strong>
                    <p>John Doe - Tongaat to Durban</p>
                    <small>5 minutes ago</small>
                </div>
            </div>
            <div class="notification-item">
                <span class="notification-icon">✅</span>
                <div class="notification-content">
                    <strong>Job completed</strong>
                    <p>Driver: Mike - Job #12345</p>
                    <small>1 hour ago</small>
                </div>
            </div>
            <div class="notification-item">
                <span class="notification-icon">💰</span>
                <div class="notification-content">
                    <strong>Payment received</strong>
                    <p>R850 from Sarah Smith</p>
                    <small>2 hours ago</small>
                </div>
            </div>
        </div>
    `;
    openModal('Notifications', content);
}

// Sample Data Generators
function generateSampleBookings() {
    return [
        {
            id: 'BK001',
            customer: 'John Doe',
            phone: '0821234567',
            pickup: 'Tongaat',
            dropoff: 'Durban',
            vehicle: 'Car',
            date: new Date().toISOString(),
            distance: 25,
            amount: 450,
            status: 'confirmed'
        },
        {
            id: 'BK002',
            customer: 'Sarah Smith',
            phone: '0837654321',
            pickup: 'Ballito',
            dropoff: 'Umhlanga',
            vehicle: 'SUV',
            date: new Date(Date.now() - 86400000).toISOString(),
            distance: 15,
            amount: 350,
            status: 'completed'
        },
        {
            id: 'BK003',
            customer: 'Mike Johnson',
            phone: '0849876543',
            pickup: 'Phoenix',
            dropoff: 'Gateway',
            vehicle: 'Truck',
            date: new Date().toISOString(),
            distance: 30,
            amount: 750,
            status: 'pending'
        }
    ];
}

function generateSampleJobs() {
    return [
        {
            id: 'JOB001',
            customer: 'John Doe',
            driver: 'Driver 1',
            vehicle: 'Car',
            pickup: 'Tongaat',
            dropoff: 'Durban',
            distance: 25,
            amount: 450,
            status: 'active'
        }
    ];
}

function generateSampleFleet() {
    return [
        {
            name: 'Tow Truck 1',
            registration: 'ABC123GP',
            type: 'Flatbed',
            driver: 'Driver 1',
            status: 'available',
            mileage: 45000,
            lastService: '2024-01-15'
        },
        {
            name: 'Tow Truck 2',
            registration: 'XYZ789GP',
            type: 'Wheel Lift',
            driver: null,
            status: 'maintenance',
            mileage: 62000,
            lastService: '2024-02-01'
        }
    ];
}

function generateSampleDrivers() {
    return [
        {
            name: 'Driver 1',
            phone: '0821111111',
            vehicle: 'Tow Truck 1',
            status: 'active',
            jobsToday: 3,
            rating: 4.8
        },
        {
            name: 'Driver 2',
            phone: '0822222222',
            vehicle: null,
            status: 'available',
            jobsToday: 0,
            rating: 4.5
        }
    ];
}

function generateSampleCustomers() {
    return [
        {
            name: 'John Doe',
            phone: '0821234567',
            email: 'john@example.com',
            totalJobs: 5,
            totalSpent: 2500,
            lastJob: '2024-02-15'
        },
        {
            name: 'Sarah Smith',
            phone: '0837654321',
            email: 'sarah@example.com',
            totalJobs: 3,
            totalSpent: 1200,
            lastJob: '2024-02-10'
        }
    ];
}

function generateSampleInvoices() {
    return [
        {
            id: 'INV001',
            customer: 'John Doe',
            date: '2024-02-15',
            amount: 450,
            status: 'paid'
        },
        {
            id: 'INV002',
            customer: 'Sarah Smith',
            date: '2024-02-14',
            amount: 350,
            status: 'pending'
        }
    ];
}

// Placeholder functions
function viewBooking(i) { alert('View booking #' + bookings[i].id); }
function editBooking(i) { alert('Edit booking #' + bookings[i].id); }
function deleteBooking(i) { 
    if (confirm('Delete this booking?')) {
        bookings.splice(i, 1);
        saveData();
        displayBookings();
        updateDashboard();
    }
}
function trackJob(i) { alert('Track job #' + jobs[i].id); }
function completeJob(i) { 
    jobs[i].status = 'completed';
    saveData();
    displayJobs();
    alert('Job marked as completed!');
}
function addVehicle() { alert('Add vehicle feature coming soon'); }
function editVehicle(i) { alert('Edit vehicle: ' + fleet[i].name); }
function serviceVehicle(i) { alert('Schedule service for: ' + fleet[i].name); }
function addDriver() { alert('Add driver feature coming soon'); }
function editDriver(i) { alert('Edit driver: ' + drivers[i].name); }
function viewDriverStats(i) { alert('View stats for: ' + drivers[i].name); }
function addCustomer() { alert('Add customer feature coming soon'); }
function viewCustomer(i) { alert('View customer: ' + customers[i].name); }
function editCustomer(i) { alert('Edit customer: ' + customers[i].name); }
function createInvoice() { alert('Create invoice feature coming soon'); }
function viewInvoice(i) { alert('View invoice #' + invoices[i].id); }
function downloadInvoice(i) { alert('Download invoice #' + invoices[i].id); }
function sendInvoice(i) { alert('Send invoice #' + invoices[i].id + ' via email/WhatsApp'); }
function assignDriver() { alert('Assign driver feature coming soon'); }
