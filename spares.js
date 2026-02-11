let allItems = [];
let allSales = [];
let editingItemId = null;
let sellingItemId = null;
let currentPhotoData = null;

const API_URL = 'https://mh-towing-job-cards.onrender.com';

// Load data on page load
window.addEventListener('load', () => {
    loadStats();
    loadInventory();
    loadSales();
});

function loadStats() {
    fetch(`${API_URL}/api/spares/stats`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalItems').textContent = data.totalItems || 0;
            document.getElementById('inStock').textContent = data.inStock || 0;
            document.getElementById('lowStock').textContent = data.lowStock || 0;
            document.getElementById('totalValue').textContent = 'R ' + (data.totalValue || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });
    
    // Load sales stats
    fetch(`${API_URL}/api/spares/sales/stats`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('todaySales').textContent = 'R ' + (data.todaySales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
            document.getElementById('totalSales').textContent = 'R ' + (data.totalSales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
        })
        .catch(error => {
            console.error('Error loading sales stats:', error);
        });
}

function loadInventory() {
    fetch(`${API_URL}/api/spares`)
        .then(response => response.json())
        .then(data => {
            allItems = data;
            displayItems(data);
        })
        .catch(error => {
            console.error('Error loading inventory:', error);
            document.getElementById('inventoryContainer').innerHTML = 
                '<div class="loading">❌ Error loading inventory. Make sure the server is running.</div>';
        });
}

function displayItems(items) {
    const container = document.getElementById('inventoryContainer');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="loading">No items in inventory. Click "Add Item" to get started.</div>';
        return;
    }
    
    container.innerHTML = '<div class="inventory-grid">' + items.map(item => `
        <div class="item-card" onclick="viewItem('${item.id}')">
            ${item.photo ? `<img src="${item.photo}" class="item-photo" alt="${item.partName}">` : '<div class="item-photo"></div>'}
            <div class="item-header">
                <div class="item-name">${item.partName}</div>
                ${item.partNumber ? `<div class="item-part-number">#${item.partNumber}</div>` : ''}
            </div>
            <div class="item-details">
                <div class="detail-row">
                    <span class="detail-label">Category:</span>
                    <span class="category-badge category-${item.category}">${formatCategory(item.category)}</span>
                </div>
                ${item.vehicle ? `
                <div class="detail-row">
                    <span class="detail-label">Vehicle:</span>
                    <span class="detail-value">${item.vehicle}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Condition:</span>
                    <span class="condition-badge condition-${item.condition}">${formatCondition(item.condition)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Stock:</span>
                    <span class="stock-status stock-${getStockStatus(item.quantity)}">${item.quantity} ${item.quantity === 1 ? 'unit' : 'units'}</span>
                </div>
            </div>
            <div class="item-price">R ${parseFloat(item.sellingPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
            <div class="item-actions" onclick="event.stopPropagation()">
                <button class="btn-view" onclick="viewItem('${item.id}')">👁️</button>
                <button class="btn-edit" onclick="editItem('${item.id}')">✏️</button>
                <button class="btn-sell" onclick="sellItem('${item.id}')">💰</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">🗑️</button>
            </div>
        </div>
    `).join('') + '</div>';
}

function showAddItemForm() {
    editingItemId = null;
    currentPhotoData = null;
    document.getElementById('modalTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('itemModal').style.display = 'block';
}

function editItem(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    
    editingItemId = itemId;
    currentPhotoData = item.photo || null;
    
    document.getElementById('modalTitle').textContent = 'Edit Item';
    document.getElementById('partName').value = item.partName;
    document.getElementById('partNumber').value = item.partNumber || '';
    document.getElementById('category').value = item.category;
    document.getElementById('vehicle').value = item.vehicle || '';
    document.getElementById('condition').value = item.condition;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('costPrice').value = item.costPrice || '';
    document.getElementById('sellingPrice').value = item.sellingPrice;
    document.getElementById('location').value = item.location || '';
    document.getElementById('description').value = item.description || '';
    
    if (item.photo) {
        document.getElementById('photoPreview').innerHTML = `<img src="${item.photo}" alt="Preview">`;
    }
    
    document.getElementById('itemModal').style.display = 'block';
}

function saveItem(event) {
    event.preventDefault();
    
    const itemData = {
        id: editingItemId || 'SPARE-' + Date.now(),
        partName: document.getElementById('partName').value,
        partNumber: document.getElementById('partNumber').value,
        category: document.getElementById('category').value,
        vehicle: document.getElementById('vehicle').value,
        condition: document.getElementById('condition').value,
        quantity: parseInt(document.getElementById('quantity').value),
        costPrice: parseFloat(document.getElementById('costPrice').value) || 0,
        sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        photo: currentPhotoData,
        created_at: editingItemId ? allItems.find(i => i.id === editingItemId).created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    const url = editingItemId ? `${API_URL}/api/spares/${editingItemId}` : `${API_URL}/api/spares`;
    const method = editingItemId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(editingItemId ? 'Item updated successfully!' : 'Item added successfully!');
            closeItemModal();
            loadStats();
            loadInventory();
        }
    })
    .catch(error => {
        console.error('Error saving item:', error);
        alert('Error saving item');
    });
}

function viewItem(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    
    const modalBody = document.getElementById('viewModalBody');
    modalBody.innerHTML = `
        <h2>${item.partName}</h2>
        ${item.photo ? `<img src="${item.photo}" class="view-photo" alt="${item.partName}">` : ''}
        
        <div class="view-section">
            <h3>Part Information</h3>
            <div class="view-grid">
                ${item.partNumber ? `
                <div class="view-item">
                    <div class="view-label">Part Number</div>
                    <div class="view-value">${item.partNumber}</div>
                </div>
                ` : ''}
                <div class="view-item">
                    <div class="view-label">Category</div>
                    <div class="view-value">
                        <span class="category-badge category-${item.category}">${formatCategory(item.category)}</span>
                    </div>
                </div>
                ${item.vehicle ? `
                <div class="view-item">
                    <div class="view-label">Vehicle</div>
                    <div class="view-value">${item.vehicle}</div>
                </div>
                ` : ''}
                <div class="view-item">
                    <div class="view-label">Condition</div>
                    <div class="view-value">
                        <span class="condition-badge condition-${item.condition}">${formatCondition(item.condition)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="view-section">
            <h3>Stock & Pricing</h3>
            <div class="view-grid">
                <div class="view-item">
                    <div class="view-label">Quantity</div>
                    <div class="view-value">
                        <span class="stock-status stock-${getStockStatus(item.quantity)}">${item.quantity} ${item.quantity === 1 ? 'unit' : 'units'}</span>
                    </div>
                </div>
                ${item.location ? `
                <div class="view-item">
                    <div class="view-label">Location</div>
                    <div class="view-value">${item.location}</div>
                </div>
                ` : ''}
                ${item.costPrice ? `
                <div class="view-item">
                    <div class="view-label">Cost Price</div>
                    <div class="view-value">R ${parseFloat(item.costPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                </div>
                ` : ''}
                <div class="view-item">
                    <div class="view-label">Selling Price</div>
                    <div class="view-value" style="font-size: 20px; color: #667eea;">R ${parseFloat(item.sellingPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                </div>
                ${item.costPrice ? `
                <div class="view-item">
                    <div class="view-label">Profit Margin</div>
                    <div class="view-value">R ${(parseFloat(item.sellingPrice) - parseFloat(item.costPrice)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        ${item.description ? `
        <div class="view-section">
            <h3>Description</h3>
            <p style="color: #666; line-height: 1.6;">${item.description}</p>
        </div>
        ` : ''}
        
        <div class="view-section">
            <h3>Record Information</h3>
            <div class="view-grid">
                <div class="view-item">
                    <div class="view-label">Added</div>
                    <div class="view-value">${formatDate(item.created_at)}</div>
                </div>
                <div class="view-item">
                    <div class="view-label">Last Updated</div>
                    <div class="view-value">${formatDate(item.updated_at)}</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('viewModal').style.display = 'block';
}

function sellItem(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.quantity === 0) {
        alert('This item is out of stock!');
        return;
    }
    
    sellingItemId = itemId;
    
    // Populate sell form
    document.getElementById('sellQuantity').max = item.quantity;
    document.getElementById('sellQuantity').value = 1;
    document.getElementById('sellPrice').value = item.sellingPrice;
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('saleNotes').value = '';
    
    // Show item info
    document.getElementById('sellItemInfo').innerHTML = `
        <div class="sell-info-item">
            <span class="sell-info-label">Part:</span>
            <span class="sell-info-value">${item.partName}</span>
        </div>
        ${item.partNumber ? `
        <div class="sell-info-item">
            <span class="sell-info-label">Part Number:</span>
            <span class="sell-info-value">${item.partNumber}</span>
        </div>
        ` : ''}
        <div class="sell-info-item">
            <span class="sell-info-label">Available Stock:</span>
            <span class="sell-info-value">${item.quantity} units</span>
        </div>
        <div class="sell-info-item">
            <span class="sell-info-label">Standard Price:</span>
            <span class="sell-info-value">R ${parseFloat(item.sellingPrice).toFixed(2)}</span>
        </div>
    `;
    
    updateSaleTotal();
    document.getElementById('sellModal').style.display = 'block';
    
    // Add event listeners for total calculation
    document.getElementById('sellQuantity').addEventListener('input', updateSaleTotal);
    document.getElementById('sellPrice').addEventListener('input', updateSaleTotal);
}

function updateSaleTotal() {
    const quantity = parseInt(document.getElementById('sellQuantity').value) || 0;
    const price = parseFloat(document.getElementById('sellPrice').value) || 0;
    const total = quantity * price;
    document.getElementById('saleTotal').textContent = 'R ' + total.toFixed(2);
}

function processSale(event) {
    event.preventDefault();
    
    const item = allItems.find(i => i.id === sellingItemId);
    if (!item) return;
    
    const quantity = parseInt(document.getElementById('sellQuantity').value);
    const price = parseFloat(document.getElementById('sellPrice').value);
    const total = quantity * price;
    
    if (quantity > item.quantity) {
        alert('Not enough stock available!');
        return;
    }
    
    const saleData = {
        id: 'SALE-' + Date.now(),
        itemId: item.id,
        partName: item.partName,
        partNumber: item.partNumber || '',
        category: item.category,
        quantity: quantity,
        unitPrice: price,
        totalAmount: total,
        costPrice: item.costPrice || 0,
        profit: total - (item.costPrice * quantity),
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        notes: document.getElementById('saleNotes').value,
        saleDate: new Date().toISOString()
    };
    
    // Save sale
    fetch(`${API_URL}/api/spares/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update item stock
            const newQuantity = item.quantity - quantity;
            return fetch(`${API_URL}/api/spares/${sellingItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, quantity: newQuantity, updated_at: new Date().toISOString() })
            });
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Sale completed!\n\nQuantity: ${quantity}\nTotal: R ${total.toFixed(2)}`);
            closeSellModal();
            loadStats();
            loadInventory();
            loadSales();
        }
    })
    .catch(error => {
        console.error('Error processing sale:', error);
        alert('Error processing sale');
    });
}

function loadSales() {
    fetch(`${API_URL}/api/spares/sales`)
        .then(response => response.json())
        .then(data => {
            allSales = data;
        })
        .catch(error => {
            console.error('Error loading sales:', error);
        });
}

function showSalesHistory() {
    loadSales();
    
    // Calculate sales summaries
    fetch(`${API_URL}/api/spares/sales/stats`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('modalTodaySales').textContent = 'R ' + (data.todaySales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
            document.getElementById('modalWeekSales').textContent = 'R ' + (data.weekSales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
            document.getElementById('modalMonthSales').textContent = 'R ' + (data.monthSales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
            document.getElementById('modalTotalSales').textContent = 'R ' + (data.totalSales || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
        });
    
    // Load and display sales
    setTimeout(() => {
        displaySales(allSales);
    }, 500);
    
    document.getElementById('salesModal').style.display = 'block';
}

function displaySales(sales) {
    const container = document.getElementById('salesList');
    
    if (sales.length === 0) {
        container.innerHTML = `
            <div class="no-sales">
                <div class="no-sales-icon">📊</div>
                <p>No sales recorded yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sales.map(sale => `
        <div class="sale-item">
            <div class="sale-header">
                <div>
                    <strong>${sale.partName}</strong>
                    ${sale.partNumber ? `<span style="color: #999; font-size: 12px; margin-left: 8px;">#${sale.partNumber}</span>` : ''}
                </div>
                <div class="sale-amount">R ${parseFloat(sale.totalAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="sale-date">${formatDate(sale.saleDate)}</div>
            <div class="sale-details">
                <div class="sale-detail">
                    <div class="sale-detail-label">Quantity</div>
                    <div class="sale-detail-value">${sale.quantity} units</div>
                </div>
                <div class="sale-detail">
                    <div class="sale-detail-label">Unit Price</div>
                    <div class="sale-detail-value">R ${parseFloat(sale.unitPrice).toFixed(2)}</div>
                </div>
                ${sale.profit ? `
                <div class="sale-detail">
                    <div class="sale-detail-label">Profit</div>
                    <div class="sale-detail-value" style="color: #4caf50;">R ${parseFloat(sale.profit).toFixed(2)}</div>
                </div>
                ` : ''}
                ${sale.customerName ? `
                <div class="sale-detail">
                    <div class="sale-detail-label">Customer</div>
                    <div class="sale-detail-value">${sale.customerName}</div>
                </div>
                ` : ''}
                ${sale.customerPhone ? `
                <div class="sale-detail">
                    <div class="sale-detail-label">Phone</div>
                    <div class="sale-detail-value">${sale.customerPhone}</div>
                </div>
                ` : ''}
            </div>
            ${sale.notes ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8e8e8; font-size: 13px; color: #666;">
                <strong>Notes:</strong> ${sale.notes}
            </div>
            ` : ''}
        </div>
    `).join('');
}

function filterSales() {
    const dateFrom = document.getElementById('salesDateFrom').value;
    const dateTo = document.getElementById('salesDateTo').value;
    const searchTerm = document.getElementById('salesSearch').value.toLowerCase();
    
    let filtered = allSales;
    
    if (dateFrom) {
        filtered = filtered.filter(sale => new Date(sale.saleDate) >= new Date(dateFrom));
    }
    
    if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(sale => new Date(sale.saleDate) <= endDate);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(sale => 
            sale.partName.toLowerCase().includes(searchTerm) ||
            (sale.partNumber && sale.partNumber.toLowerCase().includes(searchTerm)) ||
            (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm))
        );
    }
    
    displaySales(filtered);
}

function closeSellModal() {
    document.getElementById('sellModal').style.display = 'none';
    sellingItemId = null;
}

function closeSalesModal() {
    document.getElementById('salesModal').style.display = 'none';
}

function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    fetch(`${API_URL}/api/spares/${itemId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Item deleted successfully');
            loadStats();
            loadInventory();
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
    });
}

function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentPhotoData = e.target.result;
        document.getElementById('photoPreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

function closeItemModal() {
    document.getElementById('itemModal').style.display = 'none';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    
    let filtered = allItems;
    
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.partName.toLowerCase().includes(searchTerm) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm)) ||
            (item.vehicle && item.vehicle.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (categoryFilter) {
        filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    if (stockFilter) {
        filtered = filtered.filter(item => {
            const status = getStockStatus(item.quantity);
            if (stockFilter === 'in-stock') return status === 'in';
            if (stockFilter === 'low-stock') return status === 'low';
            if (stockFilter === 'out-of-stock') return status === 'out';
            return true;
        });
    }
    
    displayItems(filtered);
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatCondition(condition) {
    return condition.charAt(0).toUpperCase() + condition.slice(1);
}

function getStockStatus(quantity) {
    if (quantity === 0) return 'out';
    if (quantity <= 2) return 'low';
    return 'in';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    const itemModal = document.getElementById('itemModal');
    const viewModal = document.getElementById('viewModal');
    const sellModal = document.getElementById('sellModal');
    const salesModal = document.getElementById('salesModal');
    
    if (event.target === itemModal) {
        closeItemModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
    if (event.target === sellModal) {
        closeSellModal();
    }
    if (event.target === salesModal) {
        closeSalesModal();
    }
}
