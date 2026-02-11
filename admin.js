let allJobCards = [];

// Load data on page load
window.addEventListener('load', () => {
    loadStats();
    loadJobCards();
});

function loadStats() {
    fetch('https://mh-towing-job-cards.onrender.com/api/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalJobs').textContent = data.totalJobs;
            document.getElementById('todayJobs').textContent = data.todayJobs;
            
            const towJobs = data.byServiceType.find(s => s.service_type === 'tow');
            document.getElementById('towJobs').textContent = towJobs ? towJobs.count : 0;
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });
}

function loadJobCards() {
    fetch('https://mh-towing-job-cards.onrender.com/api/jobcards')
        .then(response => response.json())
        .then(data => {
            allJobCards = data;
            displayJobCards(data);
        })
        .catch(error => {
            console.error('Error loading job cards:', error);
            document.getElementById('jobCardsContainer').innerHTML = 
                '<div class="loading">❌ Error loading job cards. Make sure the server is running.</div>';
        });
}

function displayJobCards(jobCards) {
    const container = document.getElementById('jobCardsContainer');
    
    if (jobCards.length === 0) {
        container.innerHTML = '<div class="loading">No job cards found.</div>';
        return;
    }
    
    container.innerHTML = jobCards.map(job => `
        <div class="job-card-item" onclick="viewJobDetails('${job.jobId}')">
            <div class="job-card-header">
                <div class="job-id">Job #${job.jobId}</div>
                <div class="job-date">${formatDate(job.created_at)}</div>
            </div>
            <div class="job-details">
                <div class="detail-item">
                    <div class="detail-label">Customer</div>
                    <div class="detail-value">${job.customer.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${job.customer.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Vehicle</div>
                    <div class="detail-value">${job.vehicle.make} ${job.vehicle.model}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">License Plate</div>
                    <div class="detail-value">${job.vehicle.licensePlate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Service</div>
                    <div class="detail-value">
                        <span class="service-badge service-${job.service.type}">${formatServiceType(job.service.type)}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pickup Location</div>
                    <div class="detail-value">${truncate(job.service.pickupLocation, 30)}</div>
                </div>
            </div>
            <div class="job-actions" onclick="event.stopPropagation()">
                <button class="btn-view" onclick="viewJobDetails('${job.jobId}')">👁️ View Details</button>
                <button class="btn-delete" onclick="deleteJob('${job.jobId}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function viewJobDetails(jobId) {
    fetch(`https://mh-towing-job-cards.onrender.com/api/jobcards/${jobId}`)
        .then(response => response.json())
        .then(job => {
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h2>Job Card Details</h2>
                <div class="modal-section">
                    <h3>Job Information</h3>
                    <div class="modal-grid">
                        <div class="detail-item">
                            <div class="detail-label">Job ID</div>
                            <div class="detail-value">${job.jobId}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Date</div>
                            <div class="detail-value">${formatDate(job.created_at)}</div>
                        </div>
                    </div>
                </div>

                <div class="modal-section">
                    <h3>Customer Information</h3>
                    <div class="modal-grid">
                        <div class="detail-item">
                            <div class="detail-label">Name</div>
                            <div class="detail-value">${job.customer.name}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Phone</div>
                            <div class="detail-value">${job.customer.phone}</div>
                        </div>
                        ${job.customer.email ? `
                        <div class="detail-item">
                            <div class="detail-label">Email</div>
                            <div class="detail-value">${job.customer.email}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="modal-section">
                    <h3>Vehicle Information</h3>
                    <div class="modal-grid">
                        <div class="detail-item">
                            <div class="detail-label">Make & Model</div>
                            <div class="detail-value">${job.vehicle.make} ${job.vehicle.model}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Year</div>
                            <div class="detail-value">${job.vehicle.year || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Color</div>
                            <div class="detail-value">${job.vehicle.color || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">License Plate</div>
                            <div class="detail-value">${job.vehicle.licensePlate}</div>
                        </div>
                        ${job.vehicle.vin ? `
                        <div class="detail-item">
                            <div class="detail-label">VIN</div>
                            <div class="detail-value">${job.vehicle.vin}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="modal-section">
                    <h3>Service Details</h3>
                    <div class="modal-grid">
                        <div class="detail-item">
                            <div class="detail-label">Service Type</div>
                            <div class="detail-value">
                                <span class="service-badge service-${job.service.type}">${formatServiceType(job.service.type)}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Total Distance</div>
                            <div class="detail-value">${job.service.totalDistance || job.service.mileage || 'N/A'} km</div>
                        </div>
                    </div>
                    
                    <div class="modal-grid" style="margin-top: 15px;">
                        ${job.service.workshopLocation ? `
                        <div class="detail-item">
                            <div class="detail-label">🏠 Workshop Location</div>
                            <div class="detail-value">${job.service.workshopLocation}</div>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <div class="detail-label">📍 Pickup Location</div>
                            <div class="detail-value">${job.service.pickupLocation}</div>
                        </div>
                    </div>
                    
                    ${job.service.additionalStops && job.service.additionalStops.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <div class="detail-label" style="margin-bottom: 10px;">🚗 Additional Stops</div>
                        ${job.service.additionalStops.map((stop, index) => `
                            <div class="detail-value" style="margin-bottom: 5px; padding-left: 15px;">
                                Stop ${index + 1}: ${stop}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${job.service.dropoffLocation ? `
                    <div class="modal-grid" style="margin-top: 15px;">
                        <div class="detail-item">
                            <div class="detail-label">🎯 Final Drop-off Location</div>
                            <div class="detail-value">${job.service.dropoffLocation}</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${job.service.routeSegments && job.service.routeSegments.length > 0 ? `
                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <div class="detail-label" style="margin-bottom: 10px; font-weight: 700;">📊 Route Breakdown</div>
                        ${job.service.routeSegments.map(segment => `
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e0e0e0;">
                                <span>${segment.label}</span>
                                <span style="font-weight: 600; color: #667eea;">${segment.distance}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>

                ${job.notes.driver || job.notes.damage ? `
                <div class="modal-section">
                    <h3>Notes</h3>
                    ${job.notes.driver ? `
                    <div class="detail-item" style="margin-bottom: 15px;">
                        <div class="detail-label">Driver Notes</div>
                        <div class="detail-value">${job.notes.driver}</div>
                    </div>
                    ` : ''}
                    ${job.notes.damage ? `
                    <div class="detail-item">
                        <div class="detail-label">Pre-existing Damage</div>
                        <div class="detail-value">${job.notes.damage}</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${job.signature ? `
                <div class="modal-section">
                    <h3>Customer Signature</h3>
                    <img src="${job.signature}" class="signature-preview" alt="Customer Signature">
                </div>
                ` : ''}

                ${job.photos && job.photos.length > 0 ? `
                <div class="modal-section">
                    <h3>Vehicle Photos</h3>
                    <div class="photos-grid">
                        ${job.photos.map(photo => `<img src="${photo}" alt="Vehicle Photo">`).join('')}
                    </div>
                </div>
                ` : ''}
            `;
            
            document.getElementById('jobModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading job details:', error);
            alert('Error loading job details');
        });
}

function closeModal() {
    document.getElementById('jobModal').style.display = 'none';
}

function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job card?')) {
        return;
    }
    
    fetch(`https://mh-towing-job-cards.onrender.com/api/jobcards/${jobId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Job card deleted successfully');
            refreshData();
        }
    })
    .catch(error => {
        console.error('Error deleting job:', error);
        alert('Error deleting job card');
    });
}

function refreshData() {
    loadStats();
    loadJobCards();
}

function filterJobs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const serviceFilter = document.getElementById('serviceFilter').value;
    
    let filtered = allJobCards;
    
    if (searchTerm) {
        filtered = filtered.filter(job => 
            job.customer.name.toLowerCase().includes(searchTerm) ||
            job.customer.phone.includes(searchTerm) ||
            job.jobId.toLowerCase().includes(searchTerm) ||
            job.vehicle.make.toLowerCase().includes(searchTerm) ||
            job.vehicle.model.toLowerCase().includes(searchTerm) ||
            job.vehicle.licensePlate.toLowerCase().includes(searchTerm)
        );
    }
    
    if (serviceFilter) {
        filtered = filtered.filter(job => job.service.type === serviceFilter);
    }
    
    displayJobCards(filtered);
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

function formatServiceType(type) {
    return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('jobModal');
    const backupModal = document.getElementById('backupModal');
    if (event.target === modal) {
        closeModal();
    }
    if (event.target === backupModal) {
        closeBackupModal();
    }
}

// Backup Management Functions

function openBackupModal() {
    document.getElementById('backupModal').style.display = 'block';
    loadBackups();
}

function closeBackupModal() {
    document.getElementById('backupModal').style.display = 'none';
}

function loadBackups() {
    fetch('https://mh-towing-job-cards.onrender.com/api/backups')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.backups.length > 0) {
                displayBackups(data.backups);
            } else {
                document.getElementById('backupList').innerHTML = '<div class="loading">No backups found.</div>';
            }
        })
        .catch(error => {
            console.error('Error loading backups:', error);
            document.getElementById('backupList').innerHTML = '<div class="loading">❌ Error loading backups.</div>';
        });
}

function displayBackups(backups) {
    const container = document.getElementById('backupList');
    container.innerHTML = backups.map(backup => `
        <div class="backup-item">
            <div class="backup-info">
                <div class="backup-filename">📄 ${backup.filename}</div>
                <div class="backup-meta">
                    <span>📅 ${formatDate(backup.created)}</span>
                    <span>💾 ${formatFileSize(backup.size)}</span>
                </div>
                ${backup.recordCounts ? `
                <div class="backup-records">
                    <span>📋 ${backup.recordCounts.jobcards} job cards</span>
                    <span>🔧 ${backup.recordCounts.spares} spares</span>
                    <span>💰 ${backup.recordCounts.sales} sales</span>
                </div>
                ` : ''}
            </div>
            <div class="backup-actions">
                <button onclick="downloadBackup('${backup.filename}')" class="btn-download" title="Download">⬇️</button>
                <button onclick="restoreBackup('${backup.filename}')" class="btn-restore" title="Restore">♻️</button>
                <button onclick="deleteBackup('${backup.filename}')" class="btn-delete-backup" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function createManualBackup() {
    if (!confirm('Create a manual backup now?')) {
        return;
    }

    fetch('https://mh-towing-job-cards.onrender.com/api/backups/create', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Backup created successfully!');
            loadBackups();
        } else {
            alert('❌ Failed to create backup: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error creating backup:', error);
        alert('❌ Error creating backup');
    });
}

function restoreBackup(filename) {
    if (!confirm(`⚠️ WARNING: This will restore data from backup "${filename}".\n\nYour current data will be backed up first, but this action cannot be undone.\n\nAre you sure you want to continue?`)) {
        return;
    }

    fetch(`https://mh-towing-job-cards.onrender.com/api/backups/restore/${filename}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Data restored successfully! Refreshing dashboard...');
            closeBackupModal();
            refreshData();
        } else {
            alert('❌ Failed to restore backup: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error restoring backup:', error);
        alert('❌ Error restoring backup');
    });
}

function downloadBackup(filename) {
    window.location.href = `https://mh-towing-job-cards.onrender.com/api/backups/download/${filename}`;
}

function deleteBackup(filename) {
    if (!confirm(`⚠️ WARNING: Are you sure you want to delete this backup?\n\n"${filename}"\n\nThis action cannot be undone!`)) {
        return;
    }

    fetch(`https://mh-towing-job-cards.onrender.com/api/backups/${filename}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Backup deleted successfully!');
            loadBackups();
        } else {
            alert('❌ Failed to delete backup: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error deleting backup:', error);
        alert('❌ Error deleting backup');
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
