// Generate unique job ID
function generateJobId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}-${random}`;
}

// Initialize job card with sequential number
let currentJobId = generateJobId();
const jobIdInput = document.getElementById('jobIdInput');

// Fetch next sequential job number from server
fetch('https://mh-towing-job-cards.onrender.com/api/next-job-number')
    .then(response => response.json())
    .then(data => {
        currentJobId = data.jobNumber;
        jobIdInput.value = data.jobNumber;
    })
    .catch(error => {
        console.error('Error fetching job number:', error);
        // Fallback to timestamp-based ID
        jobIdInput.value = currentJobId;
    });

// Update currentJobId when user edits the input
jobIdInput.addEventListener('input', function() {
    currentJobId = this.value;
});

// Signature canvas setup
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let hasSignature = false;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Signature drawing
function startDrawing(e) {
    isDrawing = true;
    hasSignature = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
}

// Geolocation
let pickupCoords = null;
let dropoffCoords = null;

function getLocation(type) {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    const button = event.target;
    button.textContent = '📍 Getting location...';
    button.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const locationString = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            
            if (type === 'pickup') {
                document.getElementById('pickupLocation').value = locationString;
                pickupCoords = { lat, lon };
            } else {
                document.getElementById('dropoffLocation').value = locationString;
                dropoffCoords = { lat, lon };
            }
            
            // Calculate distance if both locations are set
            calculateDistance();
            
            button.textContent = '📍 Use Current Location';
            button.disabled = false;
        },
        (error) => {
            alert('Unable to get location: ' + error.message);
            button.textContent = '📍 Use Current Location';
            button.disabled = false;
        }
    );
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance() {
    if (!pickupCoords || !dropoffCoords) {
        return;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(dropoffCoords.lat - pickupCoords.lat);
    const dLon = toRad(dropoffCoords.lon - pickupCoords.lon);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(pickupCoords.lat)) * Math.cos(toRad(dropoffCoords.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Update mileage field
    document.getElementById('mileage').value = distance.toFixed(2);
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Also allow manual location entry to trigger distance calculation
document.getElementById('pickupLocation').addEventListener('change', function() {
    const coords = parseCoordinates(this.value);
    if (coords) {
        pickupCoords = coords;
        calculateDistance();
    }
});

document.getElementById('dropoffLocation').addEventListener('change', function() {
    const coords = parseCoordinates(this.value);
    if (coords) {
        dropoffCoords = coords;
        calculateDistance();
    }
});

// Parse coordinates from string format "lat, lon"
function parseCoordinates(str) {
    const parts = str.split(',').map(s => s.trim());
    if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
        }
    }
    return null;
}

// Photo preview
document.getElementById('vehiclePhotos').addEventListener('change', function(e) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Form submission
document.getElementById('jobCardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!hasSignature) {
        if (!confirm('No signature captured. Continue anyway?')) {
            return;
        }
    }
    
    const jobCard = collectFormData();
    saveJobCard(jobCard);
    
    document.getElementById('successMessage').style.display = 'block';
    setTimeout(() => {
        if (confirm('Job card saved! Start a new job card?')) {
            resetForm();
        }
    }, 1500);
});

function collectFormData() {
    const formData = {
        jobId: currentJobId,
        timestamp: new Date().toISOString(),
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value
        },
        vehicle: {
            make: document.getElementById('vehicleMake').value,
            model: document.getElementById('vehicleModel').value,
            year: document.getElementById('vehicleYear').value,
            color: document.getElementById('vehicleColor').value,
            licensePlate: document.getElementById('licensePlate').value,
            vin: document.getElementById('vin').value
        },
        service: {
            type: document.getElementById('serviceType').value,
            pickupLocation: document.getElementById('pickupLocation').value,
            dropoffLocation: document.getElementById('dropoffLocation').value,
            mileage: document.getElementById('mileage').value
        },
        notes: {
            driver: document.getElementById('driverNotes').value,
            damage: document.getElementById('damageNotes').value
        },
        signature: hasSignature ? canvas.toDataURL() : null,
        photos: []
    };
    
    return formData;
}

function saveJobCard(jobCard) {
    // Try to save to server first
    fetch('https://mh-towing-job-cards.onrender.com/api/jobcards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobCard)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Job card saved to server:', data.jobId);
        } else {
            throw new Error('Server save failed');
        }
    })
    .catch(error => {
        console.error('Error saving to server, saving locally:', error);
        // Fallback to localStorage if server is unavailable
        const savedJobs = JSON.parse(localStorage.getItem('jobCards') || '[]');
        savedJobs.push(jobCard);
        localStorage.setItem('jobCards', JSON.stringify(savedJobs));
    });
}

function saveDraft() {
    const jobCard = collectFormData();
    localStorage.setItem('draftJobCard', JSON.stringify(jobCard));
    alert('Draft saved!');
}

function resetForm() {
    document.getElementById('jobCardForm').reset();
    clearSignature();
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('successMessage').style.display = 'none';
    
    // Fetch next sequential job number
    fetch('https://mh-towing-job-cards.onrender.com/api/next-job-number')
        .then(response => response.json())
        .then(data => {
            currentJobId = data.jobNumber;
            document.getElementById('jobIdInput').value = data.jobNumber;
        })
        .catch(error => {
            console.error('Error fetching job number:', error);
            currentJobId = generateJobId();
            document.getElementById('jobIdInput').value = currentJobId;
        });
}

// Check for saved draft on load
window.addEventListener('load', () => {
    const draft = localStorage.getItem('draftJobCard');
    if (draft && confirm('Found a saved draft. Load it?')) {
        const jobCard = JSON.parse(draft);
        // Populate form with draft data
        document.getElementById('customerName').value = jobCard.customer.name || '';
        document.getElementById('customerPhone').value = jobCard.customer.phone || '';
        // ... populate other fields as needed
        localStorage.removeItem('draftJobCard');
    }
});

// Offline detection
window.addEventListener('online', () => {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) indicator.remove();
});

window.addEventListener('offline', () => {
    if (!document.querySelector('.offline-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.textContent = '⚠️ Offline Mode';
        document.body.appendChild(indicator);
    }
});
