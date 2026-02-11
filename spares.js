let allItems = [];
let editingItemId = null;
let currentPhotoData = null;

const API_URL = 'https://mh-towing-job-cards.onrender.com';

// Load data on page load
window.addEventListener('load', () => {
    loadStats();
    loadInventory();
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
    
    const quantity = prompt(`How many units to sell? (Available: ${item.quantity})`);
    if (!quantity || quantity <= 0) return;
    
    const sellQty = parseInt(quantity);
    if (sellQty > item.quantity) {
        alert('Not enough stock available!');
        return;
    }
    
    const newQuantity = item.quantity - sellQty;
    
    fetch(`${API_URL}/api/spares/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, quantity: newQuantity, updated_at: new Date().toISOString() })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Sold ${sellQty} unit(s) of ${item.partName}\nTotal: R ${(sellQty * item.sellingPrice).toFixed(2)}`);
            loadStats();
            loadInventory();
        }
    })
    .catch(error => {
        console.error('Error updating stock:', error);
        alert('Error updating stock');
    });
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
    if (event.target === itemModal) {
        closeItemModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
}
