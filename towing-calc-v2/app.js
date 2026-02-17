// Global variables
let autocompleteService;
let placesService;
let directionsService;
let geocoder;
let startLocation = null;
let endLocation = null;
let selectedVehicle = null;
let editMode = false;
let editingVehicleId = null;
let currentVehicleImage = null;
let additionalChargesCount = 0;

// Backup & Restore Functions
function exportAllData() {
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            vehicles: localStorage.getItem('vehicles'),
            companyName: localStorage.getItem('companyName'),
            companyPhone: localStorage.getItem('companyPhone'),
            companyAddress: localStorage.getItem('companyAddress'),
            yardLocation: localStorage.getItem('yardLocation'),
            yardLocationCoords: localStorage.getItem('yardLocationCoords'),
            fuelPrice: localStorage.getItem('fuelPrice'),
            fuelConsumption: localStorage.getItem('fuelConsumption'),
            customers: localStorage.getItem('customers'),
            quotes: localStorage.getItem('quotes'),
            calculationHistory: localStorage.getItem('calculationHistory')
        }
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mh-auto-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Backup downloaded! Keep this file safe to restore your data later.');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);
                
                if (!backup.data) {
                    alert('❌ Invalid backup file');
                    return;
                }
                
                if (!confirm('⚠️ This will replace all current data. Continue?')) {
                    return;
                }
                
                // Restore all data
                Object.keys(backup.data).forEach(key => {
                    if (backup.data[key]) {
                        localStorage.setItem(key, backup.data[key]);
                    }
                });
                
                alert('✅ Data restored successfully! Refreshing page...');
                location.reload();
            } catch (error) {
                alert('❌ Error reading backup file: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Navigation Dropdown Functions
function toggleNavDropdown() {
    const menu = document.getElementById('navDropdownMenu');
    const btn = document.querySelector('.nav-dropdown-btn');
    
    menu.classList.toggle('active');
    btn.classList.toggle('active');
}

function selectPage(pageName, icon, displayName) {
    // Update dropdown button
    document.querySelector('.current-page-icon').textContent = icon;
    document.querySelector('.current-page-name').textContent = displayName;
    
    // Update active state in menu
    document.querySelectorAll('.nav-dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-dropdown-item').classList.add('active');
    
    // Close dropdown
    toggleNavDropdown();
    
    // Show the page
    showPage(pageName);
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Page mapping
    const pageMap = {
        'calculator': 'calculatorPage',
        'customers': 'customersPage',
        'jobs': 'jobsPage',
        'drivers': 'driversPage',
        'fleet': 'fleetPage',
        'invoices': 'invoicesPage',
        'expenses': 'expensesPage',
        'analytics': 'analyticsPage',
        'settings': 'settingsPage'
    };
    
    const pageId = pageMap[pageName];
    if (pageId) {
        const pageElement = document.getElementById(pageId);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Load data for the page
        switch(pageName) {
            case 'drivers':
                if (typeof loadDrivers === 'function') loadDrivers();
                break;
            case 'fleet':
                if (typeof loadFleet === 'function') loadFleet();
                break;
            case 'invoices':
                if (typeof loadInvoices === 'function') loadInvoices();
                break;
            case 'expenses':
                if (typeof loadExpenses === 'function') loadExpenses();
                break;
            case 'customers':
                if (typeof loadCustomers === 'function') loadCustomers();
                break;
            case 'jobs':
                if (typeof loadJobs === 'function') loadJobs();
                break;
            case 'analytics':
                if (typeof loadAnalytics === 'function') loadAnalytics();
                break;
            case 'settings':
                if (typeof loadAllSettings === 'function') loadAllSettings();
                break;
        }
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.querySelector('.nav-dropdown');
    const menu = document.getElementById('navDropdownMenu');
    
    if (dropdown && menu && !dropdown.contains(e.target)) {
        menu.classList.remove('active');
        document.querySelector('.nav-dropdown-btn')?.classList.remove('active');
    }
});

// Default vehicles
const defaultVehicles = [
    { id: 1, name: 'Flatbed', emoji: '🚛', rate: 15, consumption: 12, callOutFee: 500, winchingRate: 600, image: null },
    { id: 2, name: 'Tow Truck', emoji: '🚙', rate: 12, consumption: 10, callOutFee: 400, winchingRate: 500, image: null },
    { id: 3, name: 'Heavy Duty', emoji: '🚚', rate: 20, consumption: 15, callOutFee: 600, winchingRate: 800, image: null }
];

// Initialize
window.addEventListener('load', () => {
    // Initialize Google Maps services
    autocompleteService = new google.maps.places.AutocompleteService();
    placesService = new google.maps.places.PlacesService(document.createElement('div'));
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    
    // Setup autocomplete
    setupAutocomplete('start');
    setupAutocomplete('end');
    
    // Load vehicles
    loadVehicles();
    
    // Load settings
    loadSettings();
    
    // Load fuel settings
    const savedFuelPrice = localStorage.getItem('fuelPrice');
    const savedConsumption = localStorage.getItem('fuelConsumption');
    
    if (savedFuelPrice) {
        document.getElementById('fuelPrice').value = savedFuelPrice;
    }
    if (savedConsumption) {
        document.getElementById('fuelConsumption').value = savedConsumption;
    }
    
    // Set current time for winching
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('winchStartTime').value = timeString;
});

// Vehicle Management
function loadVehicles() {
    let vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const container = document.getElementById('vehicleTypes');
    container.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.onclick = () => selectVehicle(vehicle.id);
        
        const imageOrEmoji = vehicle.image 
            ? `<img src="${vehicle.image}" alt="${vehicle.name}" class="vehicle-image">`
            : `<span class="vehicle-icon">${vehicle.emoji}</span>`;
        
        card.innerHTML = `
            ${imageOrEmoji}
            <div class="vehicle-name">${vehicle.name}</div>
            <div class="vehicle-rate">R${vehicle.rate}/km</div>
            <div class="vehicle-rate" style="font-size: 0.85em; color: var(--text-secondary);">Call-out: R${vehicle.callOutFee || 0}</div>
            <div class="edit-icon" onclick="event.stopPropagation(); openEditModal(${vehicle.id})">✏️</div>
        `;
        
        container.appendChild(card);
    });
}

function selectVehicle(id) {
    if (editMode) return;
    
    selectedVehicle = id;
    document.querySelectorAll('.vehicle-card').forEach((card, index) => {
        const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
        if (vehicles[index].id === id) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Auto-fill winching rate from selected vehicle
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle && vehicle.winchingRate) {
        document.getElementById('winchRate').value = vehicle.winchingRate;
        if (document.getElementById('winchingEnabled').checked) {
            updateWinchingTotal();
        }
    }
    
    updateCalculation();
}

function toggleEditMode() {
    editMode = !editMode;
    const editBtn = event.target.closest('.edit-btn');
    if (editMode) {
        editBtn.style.background = 'var(--primary)';
        document.querySelectorAll('.edit-icon').forEach(icon => icon.style.display = 'flex');
    } else {
        editBtn.style.background = '';
        document.querySelectorAll('.edit-icon').forEach(icon => icon.style.display = '');
    }
}

function openAddVehicleModal() {
    editingVehicleId = null;
    currentVehicleImage = null;
    document.getElementById('editVehicleName').value = '';
    document.getElementById('editVehicleRate').value = '';
    document.getElementById('editVehicleConsumption').value = '10';
    document.getElementById('editVehicleCallOutFee').value = '0';
    document.getElementById('editVehicleWinchingRate').value = '0';
    document.getElementById('editVehicleEmoji').value = '🚛';
    document.getElementById('vehicleImagePreview').innerHTML = `
        <span class="upload-icon">📷</span>
        <span class="upload-text">Click to upload image</span>
    `;
    document.getElementById('removeImageBtn').style.display = 'none';
    document.getElementById('deleteVehicleBtn').style.display = 'none';
    document.getElementById('editVehicleModal').classList.add('active');
}

function openEditModal(id) {
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === id);
    
    editingVehicleId = id;
    currentVehicleImage = vehicle.image;
    document.getElementById('editVehicleName').value = vehicle.name;
    document.getElementById('editVehicleRate').value = vehicle.rate;
    document.getElementById('editVehicleConsumption').value = vehicle.consumption || 10;
    document.getElementById('editVehicleCallOutFee').value = vehicle.callOutFee || 0;
    document.getElementById('editVehicleWinchingRate').value = vehicle.winchingRate || 0;
    document.getElementById('editVehicleEmoji').value = vehicle.emoji;
    
    if (vehicle.image) {
        document.getElementById('vehicleImagePreview').innerHTML = `<img src="${vehicle.image}" alt="${vehicle.name}">`;
        document.getElementById('removeImageBtn').style.display = 'block';
    } else {
        document.getElementById('vehicleImagePreview').innerHTML = `
            <span class="upload-icon">📷</span>
            <span class="upload-text">Click to upload image</span>
        `;
        document.getElementById('removeImageBtn').style.display = 'none';
    }
    
    document.getElementById('deleteVehicleBtn').style.display = 'block';
    document.getElementById('editVehicleModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editVehicleModal').classList.remove('active');
    editingVehicleId = null;
    currentVehicleImage = null;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show loading state
    const preview = document.getElementById('vehicleImagePreview');
    preview.innerHTML = `
        <span class="upload-icon">⏳</span>
        <span class="upload-text">Processing image...</span>
    `;
    
    // Increased limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
        alert('Image too large. Maximum size is 5MB.');
        preview.innerHTML = `
            <span class="upload-icon">📷</span>
            <span class="upload-text">Click to upload image</span>
            <span class="upload-subtext">Max 5MB • Auto-compressed</span>
        `;
        return;
    }
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        preview.innerHTML = `
            <span class="upload-icon">📷</span>
            <span class="upload-text">Click to upload image</span>
            <span class="upload-subtext">Max 5MB • Auto-compressed</span>
        `;
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Compress image if needed
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Max dimensions for compression
            const maxWidth = 800;
            const maxHeight = 800;
            
            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression (0.8 quality)
            currentVehicleImage = canvas.toDataURL('image/jpeg', 0.8);
            
            const originalSize = (file.size / 1024).toFixed(2);
            const compressedSize = (currentVehicleImage.length / 1024).toFixed(2);
            
            preview.innerHTML = `<img src="${currentVehicleImage}" alt="Vehicle">`;
            document.getElementById('removeImageBtn').style.display = 'block';
            
            console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% reduction)`);
            
            // Show success message briefly
            const successMsg = document.createElement('div');
            successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--success); color: white; padding: 15px 20px; border-radius: 10px; z-index: 9999; animation: slideIn 0.3s;';
            successMsg.textContent = `✓ Image uploaded (${compressedSize}KB)`;
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
        };
        img.onerror = () => {
            alert('Failed to load image. Please try another file.');
            preview.innerHTML = `
                <span class="upload-icon">📷</span>
                <span class="upload-text">Click to upload image</span>
                <span class="upload-subtext">Max 5MB • Auto-compressed</span>
            `;
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        alert('Failed to read file. Please try again.');
        preview.innerHTML = `
            <span class="upload-icon">📷</span>
            <span class="upload-text">Click to upload image</span>
            <span class="upload-subtext">Max 5MB • Auto-compressed</span>
        `;
    };
    reader.readAsDataURL(file);
}

function removeVehicleImage() {
    currentVehicleImage = null;
    document.getElementById('vehicleImagePreview').innerHTML = `
        <span class="upload-icon">📷</span>
        <span class="upload-text">Click to upload image</span>
    `;
    document.getElementById('removeImageBtn').style.display = 'none';
}

function saveVehicleEdit() {
    const name = document.getElementById('editVehicleName').value.trim();
    const rate = parseFloat(document.getElementById('editVehicleRate').value);
    const consumption = parseFloat(document.getElementById('editVehicleConsumption').value) || 10;
    const callOutFee = parseFloat(document.getElementById('editVehicleCallOutFee').value) || 0;
    const winchingRate = parseFloat(document.getElementById('editVehicleWinchingRate').value) || 0;
    const emoji = document.getElementById('editVehicleEmoji').value.trim() || '🚛';
    
    if (!name || !rate) {
        alert('Please fill in all fields');
        return;
    }
    
    let vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    
    if (editingVehicleId) {
        // Edit existing
        const index = vehicles.findIndex(v => v.id === editingVehicleId);
        vehicles[index] = { ...vehicles[index], name, rate, consumption, callOutFee, winchingRate, emoji, image: currentVehicleImage };
    } else {
        // Add new
        const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
        vehicles.push({ id: newId, name, rate, consumption, callOutFee, winchingRate, emoji, image: currentVehicleImage });
    }
    
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    loadVehicles();
    closeEditModal();
}

function deleteVehicle() {
    if (!confirm('Delete this vehicle?')) return;
    
    let vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    vehicles = vehicles.filter(v => v.id !== editingVehicleId);
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    loadVehicles();
    closeEditModal();
}

// Autocomplete
function setupAutocomplete(type) {
    const input = document.getElementById(`${type}Input`);
    const suggestionsDiv = document.getElementById(`${type}Suggestions`);
    
    let debounceTimer;
    
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const value = this.value.trim();
        
        if (value.length < 2) {
            suggestionsDiv.classList.remove('active');
            return;
        }
        
        debounceTimer = setTimeout(() => {
            getSuggestions(value, suggestionsDiv, type);
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.classList.remove('active');
        }
    });
}

function getSuggestions(query, suggestionsDiv, type) {
    autocompleteService.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'za' },
        types: ['geocode']
    }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            displaySuggestions(predictions, suggestionsDiv, type);
        } else {
            suggestionsDiv.classList.remove('active');
        }
    });
}

function displaySuggestions(predictions, suggestionsDiv, type) {
    suggestionsDiv.innerHTML = '';
    
    predictions.forEach(prediction => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = prediction.description;
        div.onclick = () => selectPlace(prediction.place_id, type);
        suggestionsDiv.appendChild(div);
    });
    
    suggestionsDiv.classList.add('active');
}

function selectPlace(placeId, type) {
    placesService.getDetails({ placeId: placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const input = document.getElementById(`${type}Input`);
            const suggestionsDiv = document.getElementById(`${type}Suggestions`);
            
            input.value = place.formatted_address;
            suggestionsDiv.classList.remove('active');
            
            if (type === 'start') {
                startLocation = place.geometry.location;
            } else {
                endLocation = place.geometry.location;
            }
        }
    });
}

// GPS
function useGPS(type) {
    if (!navigator.geolocation) {
        alert('GPS not supported on this device');
        return;
    }
    
    const input = document.getElementById(`${type}Input`);
    input.value = 'Getting location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const location = new google.maps.LatLng(lat, lng);
            
            geocoder.geocode({ location: location }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    input.value = results[0].formatted_address;
                    
                    if (type === 'start') {
                        startLocation = location;
                    } else {
                        endLocation = location;
                    }
                } else {
                    input.value = `${lat}, ${lng}`;
                    if (type === 'start') {
                        startLocation = location;
                    } else {
                        endLocation = location;
                    }
                }
            });
        },
        (error) => {
            alert('Could not get location: ' + error.message);
            input.value = '';
        }
    );
}

// Distance Calculation
function calculateDistance() {
    const startInput = document.getElementById('startInput').value.trim();
    const endInput = document.getElementById('endInput').value.trim();
    const startFromYard = document.getElementById('startFromYard').checked;
    
    if (!startInput || !endInput) {
        alert('Please enter both locations');
        return;
    }
    
    if (!selectedVehicle) {
        alert('Please select a vehicle type');
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="loading">📍 Calculating route...</div>';
    resultsDiv.classList.remove('hidden');
    
    // Set timeout for slow responses
    const timeoutId = setTimeout(() => {
        resultsDiv.innerHTML = '<div class="loading" style="color: #ff9800;">⏳ Still calculating... Please wait.</div>';
    }, 2000);
    
    // Always geocode both addresses to ensure we have valid locations
    Promise.all([
        geocodeAddress(startInput),
        geocodeAddress(endInput)
    ]).then(([start, end]) => {
        clearTimeout(timeoutId);
        startLocation = start;
        endLocation = end;
        
        if (startFromYard) {
            calculateYardRouteFast();
        } else {
            getDirectionsFast();
        }
    }).catch(error => {
        clearTimeout(timeoutId);
        resultsDiv.innerHTML = `<div class="loading" style="color: #ff4444;">❌ Error: ${error}<br><small>Check your internet connection and try again</small></div>`;
    });
}

function getDirectionsFast() {
    const resultsDiv = document.getElementById('results');
    
    // Add timeout to directions request - reduced to 6 seconds
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject('Route calculation timeout'), 6000)
    );
    
    const directionsPromise = new Promise((resolve, reject) => {
        directionsService.route({
            origin: startLocation,
            destination: endLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false, // Faster with single route
            avoidHighways: false,
            avoidTolls: false
        }, (result, status) => {
            if (status === 'OK') {
                resolve(result);
            } else {
                reject(`Route failed: ${status}`);
            }
        });
    });
    
    Promise.race([directionsPromise, timeoutPromise])
        .then(result => {
            displayResultsEnhanced(result);
            showRouteOnMap(result);
        })
        .catch(error => {
            resultsDiv.innerHTML = `<div class="loading" style="color: #ff4444;">❌ ${error}<br><small>Try simplifying your addresses or check your connection</small></div>`;
        });
}

function calculateYardRouteFast() {
    const yardLocation = localStorage.getItem('yardLocation');
    if (!yardLocation) {
        alert('Please set your Yard Location in Settings first!');
        document.getElementById('startFromYard').checked = false;
        getDirections();
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="loading">🏠 Calculating yard route (3 legs)...</div>';
    
    // Use cached yard location if available
    const cachedYardLoc = localStorage.getItem('yardLocationCoords');
    
    if (cachedYardLoc) {
        const coords = JSON.parse(cachedYardLoc);
        const yardLoc = new google.maps.LatLng(coords.lat, coords.lng);
        calculateYardDirections(yardLoc);
    } else {
        // Geocode and cache yard location
        geocodeAddress(yardLocation).then(yardLoc => {
            // Cache the coordinates for faster future lookups
            localStorage.setItem('yardLocationCoords', JSON.stringify({
                lat: yardLoc.lat(),
                lng: yardLoc.lng()
            }));
            calculateYardDirections(yardLoc);
        }).catch(error => {
            resultsDiv.innerHTML = `<div class="loading" style="color: #ff4444;">❌ Could not find yard location: ${error}</div>`;
            document.getElementById('startFromYard').checked = false;
            setTimeout(() => getDirections(), 2000);
        });
    }
}

function calculateYardDirections(yardLoc) {
    const resultsDiv = document.getElementById('results');
    
    // Add timeout for yard route calculation
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject('Yard route timeout - try again'), 10000)
    );
    
    const directionsPromise = new Promise((resolve, reject) => {
        // Optimize: Use DirectionsService with optimizeWaypoints
        directionsService.route({
            origin: yardLoc,
            destination: yardLoc,
            waypoints: [
                { location: startLocation, stopover: true },
                { location: endLocation, stopover: true }
            ],
            optimizeWaypoints: false, // Keep order: yard -> pickup -> dropoff -> yard
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false, // Faster with single route
            avoidHighways: false,
            avoidTolls: false
        }, (result, status) => {
            if (status === 'OK') {
                resolve(result);
            } else if (status === 'ZERO_RESULTS') {
                reject('No route found between these locations');
            } else if (status === 'OVER_QUERY_LIMIT') {
                reject('Too many requests. Please wait a moment and try again.');
            } else {
                reject(`Route calculation failed: ${status}`);
            }
        });
    });
    
    Promise.race([directionsPromise, timeoutPromise])
        .then(result => {
            console.log('Yard route calculated successfully');
            displayResultsEnhanced(result, true);
            showRouteOnMap(result);
        })
        .catch(error => {
            console.error('Yard route error:', error);
            resultsDiv.innerHTML = `<div class="loading" style="color: #ff4444;">❌ ${error}<br><small>Try again or disable "Start from Yard"</small></div>`;
        });
}

function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address, region: 'za' }, (results, status) => {
            if (status === 'OK' && results[0]) {
                resolve(results[0].geometry.location);
            } else {
                reject('Could not find location: ' + address);
            }
        });
    });
}

function getDirections() {
    directionsService.route({
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
        if (status === 'OK') {
            displayResultsEnhanced(result);
            showRouteOnMap(result); // Show route on map
        } else {
            document.getElementById('results').innerHTML = 
                `<div class="loading" style="color: #ff4444;">❌ Could not calculate route</div>`;
        }
    });
}

function displayResults(result) {
    const route = result.routes[0].legs[0];
    let distance = route.distance.value / 1000; // km
    
    const includeReturn = document.getElementById('returnTrip').checked;
    if (includeReturn) {
        distance *= 2;
    }
    
    // Get vehicle rate
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const ratePerKm = vehicle.rate;
    
    // Base cost
    let baseCost = distance * ratePerKm;
    
    // Time surcharge
    const timeSurcharge = parseInt(document.getElementById('timeSurcharge').value);
    const surchargeAmount = (baseCost * timeSurcharge) / 100;
    
    // Winching
    let winchingCost = 0;
    if (document.getElementById('winchingEnabled').checked) {
        winchingCost = calculateWinchingCost();
    }
    
    // Additional charges
    let additionalTotal = 0;
    document.querySelectorAll('.charge-item').forEach(item => {
        const amount = parseFloat(item.querySelector('.charge-amount').value) || 0;
        additionalTotal += amount;
    });
    
    // Subtotal
    let subtotal = baseCost + surchargeAmount + winchingCost + additionalTotal;
    
    // Discount
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    let discount = 0;
    if (discountType === 'percent') {
        discount = (subtotal * discountAmount) / 100;
    } else {
        discount = discountAmount;
    }
    
    // Total
    const total = subtotal - discount;
    
    // Display
    let html = `
        <h3 style="margin-bottom: 20px;">📊 Calculation Breakdown</h3>
        
        <div class="result-item">
            <span>Distance (${includeReturn ? 'Round Trip' : 'One Way'})</span>
            <span class="result-value">${distance.toFixed(2)} km</span>
        </div>
        
        <div class="result-item">
            <span>Base Cost (R${ratePerKm}/km)</span>
            <span class="result-value">R ${baseCost.toFixed(2)}</span>
        </div>
    `;
    
    if (timeSurcharge > 0) {
        html += `
            <div class="result-item">
                <span>Time Surcharge (+${timeSurcharge}%)</span>
                <span class="result-value">R ${surchargeAmount.toFixed(2)}</span>
            </div>
        `;
    }
    
    if (winchingCost > 0) {
        const duration = parseInt(document.getElementById('winchDuration').value);
        const rate = parseFloat(document.getElementById('winchRate').value);
        html += `
            <div class="result-item">
                <span>Winching (${duration} min × R${rate}/min)</span>
                <span class="result-value">R ${winchingCost.toFixed(2)}</span>
            </div>
        `;
    }
    
    if (additionalTotal > 0) {
        html += `
            <div class="result-item">
                <span>Additional Charges</span>
                <span class="result-value">R ${additionalTotal.toFixed(2)}</span>
            </div>
        `;
    }
    
    if (discount > 0) {
        html += `
            <div class="result-item">
                <span>Discount</span>
                <span class="result-value" style="color: #ff4444;">-R ${discount.toFixed(2)}</span>
            </div>
        `;
    }
    
    // Add fuel cost breakdown if enabled
    if (document.getElementById('fuelCostEnabled').checked) {
        const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 24.50;
        const consumption = parseFloat(document.getElementById('fuelConsumption').value) || 15;
        const fuelUsed = (consumption * distance) / 100;
        const fuelCost = fuelUsed * fuelPrice;
        const profit = total - fuelCost;
        
        html += `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border);">
                <h3 style="color: #ffd700; margin-bottom: 15px;">⛽ Fuel Cost Analysis</h3>
                <div class="result-item">
                    <span>Fuel Used</span>
                    <span class="result-value">${fuelUsed.toFixed(2)} L</span>
                </div>
                <div class="result-item">
                    <span>Fuel Cost</span>
                    <span class="result-value" style="color: #ff6b35;">R ${fuelCost.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span>Your Profit</span>
                    <span class="result-value" style="color: var(--success); font-size: 1.2em;">R ${profit.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="total-box">
            <h3>Total Amount</h3>
            <div class="total-amount-large">R ${total.toFixed(2)}</div>
        </div>
    `;
    
    document.getElementById('results').innerHTML = html;
    
    // Update fuel cost if enabled
    if (document.getElementById('fuelCostEnabled').checked) {
        updateFuelCost();
    }
    
    // Save to history
    saveToHistory({
        startLocation: document.getElementById('startInput').value,
        endLocation: document.getElementById('endInput').value,
        distance: distance,
        total: total
    });
}

// Winching Functions
function toggleWinching() {
    const enabled = document.getElementById('winchingEnabled').checked;
    const details = document.getElementById('winchingDetails');
    details.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        updateWinchingTotal();
    }
    
    updateCalculation();
}

// Prep to Tow Functions
function togglePrepToTow() {
    const enabled = document.getElementById('prepToTowEnabled').checked;
    const details = document.getElementById('prepToTowDetails');
    details.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        updatePrepToTowTotal();
    }
    
    updateCalculation();
}

function updatePrepToTowTotal() {
    let total = 0;
    
    if (document.getElementById('useUnderlift').checked) {
        total += parseFloat(document.getElementById('underliftFee').value) || 0;
    }
    
    if (document.getElementById('removePropshaft').checked) {
        total += parseFloat(document.getElementById('propshaftFee').value) || 0;
    }
    
    if (document.getElementById('releaseBrakes').checked) {
        total += parseFloat(document.getElementById('brakesFee').value) || 0;
    }
    
    document.getElementById('prepToTowTotal').textContent = `R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    updateCalculation();
}

function calculatePrepToTowCost() {
    let total = 0;
    
    if (document.getElementById('useUnderlift').checked) {
        total += parseFloat(document.getElementById('underliftFee').value) || 0;
    }
    
    if (document.getElementById('removePropshaft').checked) {
        total += parseFloat(document.getElementById('propshaftFee').value) || 0;
    }
    
    if (document.getElementById('releaseBrakes').checked) {
        total += parseFloat(document.getElementById('brakesFee').value) || 0;
    }
    
    return total;
}

// Fuel Cost Functions
function toggleFuelCost() {
    const enabled = document.getElementById('fuelCostEnabled').checked;
    const details = document.getElementById('fuelCostDetails');
    details.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        updateFuelCost();
    }
    
    updateCalculation();
}

function updateFuelCost() {
    console.log('updateFuelCost called');
    
    // Get current distance from results if available
    const distanceElement = document.querySelector('.result-value');
    let distance = 0;
    
    if (distanceElement) {
        distance = parseFloat(distanceElement.textContent.replace(' km', '')) || 0;
    }
    
    const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 24.50;
    
    // Get consumption from selected vehicle or use manual input
    let consumption = parseFloat(document.getElementById('fuelConsumption').value) || 15;
    
    if (selectedVehicle) {
        const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
        const vehicle = vehicles.find(v => v.id === selectedVehicle);
        if (vehicle && vehicle.consumption) {
            consumption = vehicle.consumption;
            // Update the input field to show vehicle's consumption
            document.getElementById('fuelConsumption').value = consumption;
        }
    }
    
    // Calculate fuel used (L/100km * distance / 100)
    const fuelUsed = (consumption * distance) / 100;
    
    // Calculate fuel cost
    const fuelCost = fuelUsed * fuelPrice;
    
    // Get total charge from results
    const totalElement = document.querySelector('.total-amount-large');
    let totalCharge = 0;
    
    if (totalElement) {
        totalCharge = parseFloat(totalElement.textContent.replace('R ', '').replace(',', '')) || 0;
    }
    
    // Calculate profit (total charge - fuel cost)
    const profit = totalCharge - fuelCost;
    
    // Update display
    document.getElementById('fuelDistance').textContent = `${distance.toFixed(2)} km`;
    document.getElementById('fuelUsed').textContent = `${fuelUsed.toFixed(2)} L`;
    document.getElementById('fuelCostAmount').textContent = `R ${fuelCost.toFixed(2)}`;
    document.getElementById('fuelProfit').textContent = `R ${profit.toFixed(2)}`;
    
    // Save to localStorage
    localStorage.setItem('fuelPrice', fuelPrice);
    localStorage.setItem('fuelConsumption', consumption);
    
    console.log('Fuel calculation:', { distance, fuelUsed, fuelCost, profit, vehicleConsumption: consumption });
}

function calculateWinchingDuration() {
    const startTime = document.getElementById('winchStartTime').value;
    const endTime = document.getElementById('winchEndTime').value;
    
    if (!startTime || !endTime) return;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let diff = (end - start) / 1000 / 60 / 60; // hours
    if (diff < 0) diff += 24; // Handle overnight
    
    document.getElementById('winchDuration').value = diff.toFixed(1);
    updateWinchingTotal();
}

function updateWinchingTotal() {
    const hours = parseFloat(document.getElementById('winchDuration').value) || 0;
    const rate = parseFloat(document.getElementById('winchRate').value) || 0;
    const difficulty = parseFloat(document.getElementById('winchDifficulty').value) || 1;
    
    const total = hours * rate * difficulty;
    document.getElementById('winchTotalDisplay').textContent = `R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    updateCalculation();
}

function adjustWinchingRate() {
    updateWinchingTotal();
}

function calculateWinchingCost() {
    const hours = parseFloat(document.getElementById('winchDuration').value) || 0;
    const rate = parseFloat(document.getElementById('winchRate').value) || 0;
    const difficulty = parseFloat(document.getElementById('winchDifficulty').value) || 1;
    
    return hours * rate * difficulty;
}

// Additional Charges
function addCharge() {
    additionalChargesCount++;
    const container = document.getElementById('additionalCharges');
    
    const chargeDiv = document.createElement('div');
    chargeDiv.className = 'charge-item';
    chargeDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
    chargeDiv.innerHTML = `
        <input type="text" class="charge-desc" placeholder="Description" style="flex: 2;">
        <input type="number" class="charge-amount" placeholder="Amount" min="0" step="10" style="flex: 1;" onchange="updateCalculation()">
        <button onclick="removeCharge(this)" style="padding: 10px; background: #ff4444; color: white; border: none; border-radius: 8px; cursor: pointer;">×</button>
    `;
    
    container.appendChild(chargeDiv);
}

function removeCharge(btn) {
    btn.parentElement.remove();
    updateCalculation();
}

// Collapsible Sections
function toggleSection(id) {
    const content = document.getElementById(id);
    const header = event.currentTarget;
    
    content.classList.toggle('active');
    header.classList.toggle('active');
}

// Update Calculation
function updateCalculation() {
    // Only recalculate if we have a complete calculation
    if (startLocation && endLocation && selectedVehicle) {
        getDirections();
    }
}

// Settings
function loadSettings() {
    const companyName = localStorage.getItem('companyName') || 'MH AUTO';
    const companyPhone = localStorage.getItem('companyPhone') || '061 453 2160';
    const companyAddress = localStorage.getItem('companyAddress') || '784 Gopalall Hurbans, Tongaat, KZN';
    
    document.getElementById('companyName').value = companyName;
    document.getElementById('companyPhone').value = companyPhone;
    document.getElementById('companyAddress').value = companyAddress;
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function saveSettings() {
    localStorage.setItem('companyName', document.getElementById('companyName').value);
    localStorage.setItem('companyPhone', document.getElementById('companyPhone').value);
    localStorage.setItem('companyAddress', document.getElementById('companyAddress').value);
    closeSettings();
}

// Clear All
function clearAll() {
    if (!confirm('Clear all fields?')) return;
    
    document.getElementById('startInput').value = '';
    document.getElementById('endInput').value = '';
    startLocation = null;
    endLocation = null;
    selectedVehicle = null;
    
    document.querySelectorAll('.vehicle-card').forEach(card => card.classList.remove('active'));
    document.getElementById('timeSurcharge').value = '0';
    document.getElementById('winchingEnabled').checked = false;
    toggleWinching();
    document.getElementById('additionalCharges').innerHTML = '';
    document.getElementById('discountAmount').value = '0';
    document.getElementById('specialNotes').value = '';
    document.getElementById('results').classList.add('hidden');
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected page
    const pageElement = document.getElementById(pageName + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Set active nav button - find the button that was clicked
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(pageName) || 
            btn.getAttribute('onclick').includes(pageName)) {
            btn.classList.add('active');
        }
    });
    
    // Load data for the page
    if (pageName === 'customers') {
        loadCustomers();
    } else if (pageName === 'jobs') {
        loadJobs();
    } else if (pageName === 'analytics') {
        loadAnalytics();
    } else if (pageName === 'settings') {
        // Load settings
        const nameInput = document.getElementById('settingsCompanyName');
        const phoneInput = document.getElementById('settingsCompanyPhone');
        const addressInput = document.getElementById('settingsCompanyAddress');
        
        if (nameInput) nameInput.value = localStorage.getItem('companyName') || 'MH AUTO';
        if (phoneInput) phoneInput.value = localStorage.getItem('companyPhone') || '061 453 2160';
        if (addressInput) addressInput.value = localStorage.getItem('companyAddress') || '784 Gopalall Hurbans, Tongaat, KZN';
    }
}

// Save Quote
async function saveQuote() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv.classList.contains('hidden')) {
        alert('Please calculate a quote first');
        return;
    }
    
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    const quote = {
        id: Date.now(),
        date: new Date().toISOString(),
        startLocation: document.getElementById('startInput').value,
        endLocation: document.getElementById('endInput').value,
        vehicleType: vehicle ? vehicle.name : 'Unknown',
        distance: parseFloat(document.querySelector('.result-value')?.textContent.replace(' km', '')) || 0,
        total: parseFloat(document.querySelector('.total-amount-large')?.textContent.replace('R ', '').replace(',', '')) || 0,
        returnTrip: document.getElementById('returnTrip').checked,
        timeSurcharge: document.getElementById('timeSurcharge').value,
        winchingEnabled: document.getElementById('winchingEnabled').checked,
        notes: document.getElementById('specialNotes').value,
        status: 'pending'
    };
    
    await createJob(quote);
    alert('Quote saved successfully!');
}

// Share Detailed Internal Summary
function shareInternalSummary() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv.classList.contains('hidden')) {
        alert('Please calculate a quote first');
        return;
    }
    
    const companyName = localStorage.getItem('companyName') || 'MH AUTO';
    const companyPhone = localStorage.getItem('companyPhone') || '061 453 2160';
    
    const startLocation = document.getElementById('startInput').value;
    const endLocation = document.getElementById('endInput').value;
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    const distanceElement = document.getElementById('totalDistanceValue');
    const distance = distanceElement ? parseFloat(distanceElement.getAttribute('data-distance')) : 0;
    const total = parseFloat(document.querySelector('.total-amount-large')?.textContent.replace('R ', '').replace(',', '')) || 0;
    const notes = document.getElementById('specialNotes').value;
    
    // Calculate all costs
    const baseCost = distance * (vehicle ? vehicle.rate : 0);
    const callOutFee = vehicle ? vehicle.callOutFee : 0;
    const timeSurcharge = parseInt(document.getElementById('timeSurcharge').value);
    const surchargeAmount = (baseCost * timeSurcharge) / 100;
    const winchingCost = document.getElementById('winchingEnabled').checked ? calculateWinchingCost() : 0;
    const prepCost = document.getElementById('prepToTowEnabled').checked ? calculatePrepToTowCost() : 0;
    
    // Calculate fuel costs
    const fuelPrice = parseFloat(localStorage.getItem('fuelPrice')) || 24.50;
    let consumption = parseFloat(localStorage.getItem('fuelConsumption')) || 15;
    
    // Get vehicle consumption if available
    if (vehicle && vehicle.consumption) {
        consumption = vehicle.consumption;
    }
    
    // Calculate fuel used (L/100km format)
    const fuelUsed = (consumption * distance) / 100;
    const fuelCost = fuelUsed * fuelPrice;
    
    // Calculate profit
    const grossProfit = total - fuelCost;
    const profitMargin = total > 0 ? ((grossProfit / total) * 100) : 0;
    
    // Build detailed internal message
    let message = `*${companyName} - INTERNAL CALCULATION*\n`;
    message += `📊 Business Analysis Report\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `*JOB DETAILS:*\n`;
    message += `📍 From: ${startLocation}\n`;
    message += `🎯 To: ${endLocation}\n`;
    message += `🚛 Vehicle: ${vehicle ? vehicle.name : 'N/A'}\n`;
    message += `📏 Distance: ${distance.toFixed(2)} km\n`;
    message += `📅 Date: ${new Date().toLocaleString('en-ZA')}\n\n`;
    
    message += `*REVENUE BREAKDOWN:*\n`;
    message += `Base Towing (${distance.toFixed(2)}km × R${vehicle ? vehicle.rate : 0}/km): R ${baseCost.toFixed(2)}\n`;
    
    if (callOutFee > 0) {
        message += `Call-Out Fee: R ${callOutFee.toFixed(2)}\n`;
    }
    
    if (timeSurcharge > 0) {
        message += `Time Surcharge (+${timeSurcharge}%): R ${surchargeAmount.toFixed(2)}\n`;
    }
    
    if (winchingCost > 0) {
        const hours = parseFloat(document.getElementById('winchDuration').value);
        const rate = vehicle ? vehicle.winchingRate : 0;
        message += `Winching (${hours}hr × R${rate}/hr): R ${winchingCost.toFixed(2)}\n`;
    }
    
    if (prepCost > 0) {
        message += `Prep to Tow: R ${prepCost.toFixed(2)}\n`;
        if (document.getElementById('useUnderlift').checked) {
            message += `  • Underlift Used\n`;
        }
        if (document.getElementById('removePropshaft').checked) {
            message += `  • Propshaft Removed\n`;
        }
        if (document.getElementById('releaseBrakes').checked) {
            message += `  • Brakes Released\n`;
        }
    }
    
    // Additional charges
    const additionalCharges = document.querySelectorAll('.charge-item');
    let additionalTotal = 0;
    if (additionalCharges.length > 0) {
        additionalCharges.forEach(item => {
            const desc = item.querySelector('.charge-desc').value;
            const amount = parseFloat(item.querySelector('.charge-amount').value) || 0;
            if (desc && amount > 0) {
                message += `${desc}: R ${amount.toFixed(2)}\n`;
                additionalTotal += amount;
            }
        });
    }
    
    // Discount
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    if (discountAmount > 0) {
        const discountType = document.getElementById('discountType').value;
        if (discountType === 'percent') {
            const discountValue = (total / (1 - discountAmount/100)) * (discountAmount/100);
            message += `Discount (-${discountAmount}%): -R ${discountValue.toFixed(2)}\n`;
        } else {
            message += `Discount: -R ${discountAmount.toFixed(2)}\n`;
        }
    }
    
    message += `\n💰 *TOTAL REVENUE: R ${total.toFixed(2)}*\n\n`;
    
    message += `*COST ANALYSIS:*\n`;
    message += `⛽ Fuel Used: ${fuelUsed.toFixed(2)} L\n`;
    message += `⛽ Fuel Cost (R${fuelPrice.toFixed(2)}/L): R ${fuelCost.toFixed(2)}\n`;
    message += `📊 Consumption: ${consumption.toFixed(1)} L/100km\n\n`;
    
    message += `*PROFIT ANALYSIS:*\n`;
    message += `💵 Gross Profit: R ${grossProfit.toFixed(2)}\n`;
    message += `📈 Profit Margin: ${profitMargin.toFixed(1)}%\n`;
    message += `💰 Profit per KM: R ${(grossProfit / distance).toFixed(2)}/km\n\n`;
    
    message += `*PERFORMANCE METRICS:*\n`;
    message += `📊 Revenue per KM: R ${(total / distance).toFixed(2)}/km\n`;
    message += `⛽ Fuel Cost per KM: R ${(fuelCost / distance).toFixed(2)}/km\n`;
    message += `🎯 Break-even Distance: ${(fuelCost / (vehicle ? vehicle.rate : 1)).toFixed(2)} km\n\n`;
    
    if (notes) {
        message += `*NOTES:*\n${notes}\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⚠️ INTERNAL USE ONLY - DO NOT SHARE WITH CUSTOMERS\n`;
    message += `Generated: ${new Date().toLocaleString('en-ZA')}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Share Quote via WhatsApp
function shareQuote() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv.classList.contains('hidden')) {
        alert('Please calculate a quote first');
        return;
    }
    
    const companyName = localStorage.getItem('companyName') || 'MH AUTO';
    const companyPhone = localStorage.getItem('companyPhone') || '061 453 2160';
    
    const startLocation = document.getElementById('startInput').value;
    const endLocation = document.getElementById('endInput').value;
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    // Get distance from the specific element with data attribute
    const distanceElement = document.getElementById('totalDistanceValue');
    const distance = distanceElement ? parseFloat(distanceElement.getAttribute('data-distance')) : 0;
    
    const total = parseFloat(document.querySelector('.total-amount-large')?.textContent.replace('R ', '').replace(',', '')) || 0;
    const notes = document.getElementById('specialNotes').value;
    
    // Build detailed breakdown
    let message = `*${companyName}*\n`;
    message += `📞 ${companyPhone}\n\n`;
    message += `*TOWING QUOTE*\n\n`;
    message += `📍 From: ${startLocation}\n`;
    message += `🎯 To: ${endLocation}\n`;
    message += `🚛 Vehicle: ${vehicle ? vehicle.name : 'N/A'}\n`;
    message += `📏 Distance: ${distance.toFixed(2)} km\n\n`;
    
    // Cost Breakdown
    message += `*COST BREAKDOWN:*\n`;
    
    // Base cost
    const baseCost = distance * (vehicle ? vehicle.rate : 0);
    message += `Towing: R ${baseCost.toFixed(2)}\n`;
    
    // Call-out fee
    if (vehicle && vehicle.callOutFee > 0) {
        message += `Call-Out Fee: R ${vehicle.callOutFee.toFixed(2)}\n`;
    }
    
    // Time surcharge
    const timeSurcharge = parseInt(document.getElementById('timeSurcharge').value);
    if (timeSurcharge > 0) {
        const surchargeAmount = (baseCost * timeSurcharge) / 100;
        message += `Time Surcharge (+${timeSurcharge}%): R ${surchargeAmount.toFixed(2)}\n`;
    }
    
    // Winching
    if (document.getElementById('winchingEnabled').checked) {
        const winchingCost = calculateWinchingCost();
        const hours = parseFloat(document.getElementById('winchDuration').value);
        message += `Winching (${hours}hr): R ${winchingCost.toFixed(2)}\n`;
    }
    
    // Prep to Tow
    if (document.getElementById('prepToTowEnabled').checked) {
        const prepCost = calculatePrepToTowCost();
        message += `Prep to Tow: R ${prepCost.toFixed(2)}\n`;
        if (document.getElementById('useUnderlift').checked) {
            message += `  • Underlift\n`;
        }
        if (document.getElementById('removePropshaft').checked) {
            message += `  • Propshaft Removal\n`;
        }
        if (document.getElementById('releaseBrakes').checked) {
            message += `  • Brake Release\n`;
        }
    }
    
    // Additional charges
    const additionalCharges = document.querySelectorAll('.charge-item');
    if (additionalCharges.length > 0) {
        additionalCharges.forEach(item => {
            const desc = item.querySelector('.charge-desc').value;
            const amount = parseFloat(item.querySelector('.charge-amount').value) || 0;
            if (desc && amount > 0) {
                message += `${desc}: R ${amount.toFixed(2)}\n`;
            }
        });
    }
    
    // Discount
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    if (discountAmount > 0) {
        const discountType = document.getElementById('discountType').value;
        if (discountType === 'percent') {
            message += `Discount (-${discountAmount}%): -R ${((total / (1 - discountAmount/100)) * (discountAmount/100)).toFixed(2)}\n`;
        } else {
            message += `Discount: -R ${discountAmount.toFixed(2)}\n`;
        }
    }
    
    message += `\n💰 *TOTAL: R ${total.toFixed(2)}*\n`;
    
    if (notes) {
        message += `\n📝 Notes: ${notes}\n`;
    }
    message += `\nThank you for choosing ${companyName}!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Print Quote
function printQuote() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv.classList.contains('hidden')) {
        alert('Please calculate a quote first');
        return;
    }
    
    const companyName = localStorage.getItem('companyName') || 'MH AUTO';
    const companyPhone = localStorage.getItem('companyPhone') || '061 453 2160';
    const companyAddress = localStorage.getItem('companyAddress') || '784 Gopalall Hurbans, Tongaat, KZN';
    
    const startLocation = document.getElementById('startInput').value;
    const endLocation = document.getElementById('endInput').value;
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const resultsHTML = resultsDiv.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Quote - ${companyName}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    color: #ff6b35;
                }
                .header p {
                    margin: 5px 0;
                    color: #666;
                }
                .section {
                    margin: 20px 0;
                }
                .section h3 {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                }
                .result-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                .total-box {
                    background: #ff6b35;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    margin-top: 20px;
                    border-radius: 10px;
                }
                .total-amount-large {
                    font-size: 2em;
                    font-weight: bold;
                }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${companyName}</h1>
                <p>📞 ${companyPhone}</p>
                <p>📍 ${companyAddress}</p>
            </div>
            
            <div class="section">
                <h3>TOWING QUOTE</h3>
                <p><strong>Date:</strong> ${new Date().toLocaleString('en-ZA')}</p>
                <p><strong>From:</strong> ${startLocation}</p>
                <p><strong>To:</strong> ${endLocation}</p>
                <p><strong>Vehicle Type:</strong> ${vehicle ? vehicle.name : 'N/A'}</p>
            </div>
            
            <div class="section">
                ${resultsHTML}
            </div>
            
            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
                <p>Thank you for choosing ${companyName}</p>
                <p>This quote is valid for 7 days from the date of issue</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Load Quotes
function loadQuotes() {
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const container = document.getElementById('quotesList');
    
    if (quotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No saved quotes yet</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Calculate and save quotes to see them here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = quotes.map(quote => {
        const date = new Date(quote.date);
        const dateStr = date.toLocaleDateString('en-ZA', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="quote-item">
                <div class="item-header">
                    <div class="item-title">${quote.startLocation} → ${quote.endLocation}</div>
                    <div class="item-date">${dateStr}</div>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <span>Vehicle:</span>
                        <span>${quote.vehicleType}</span>
                    </div>
                    <div class="item-detail">
                        <span>Distance:</span>
                        <span>${quote.distance.toFixed(2)} km</span>
                    </div>
                    <div class="item-detail">
                        <span>Total:</span>
                        <span style="color: var(--success); font-weight: 600;">R ${quote.total.toFixed(2)}</span>
                    </div>
                </div>
                ${quote.notes ? `<div style="padding: 8px; background: rgba(255,255,255,0.02); border-radius: 6px; margin-top: 8px; font-size: 0.9em;"><strong>Notes:</strong> ${quote.notes}</div>` : ''}
                <div class="item-actions">
                    <button class="item-btn view" onclick="viewQuote(${quote.id})">👁️ View</button>
                    <button class="item-btn delete" onclick="deleteQuote(${quote.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// View Quote
function viewQuote(id) {
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const quote = quotes.find(q => q.id === id);
    
    if (!quote) return;
    
    // Switch to calculator page
    showPageByName('calculator');
    
    // Fill in the form
    document.getElementById('startInput').value = quote.startLocation;
    document.getElementById('endInput').value = quote.endLocation;
    document.getElementById('returnTrip').checked = quote.returnTrip;
    document.getElementById('timeSurcharge').value = quote.timeSurcharge;
    document.getElementById('winchingEnabled').checked = quote.winchingEnabled;
    document.getElementById('specialNotes').value = quote.notes || '';
    
    // Select vehicle
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.name === quote.vehicleType);
    if (vehicle) {
        selectVehicle(vehicle.id);
    }
    
    alert('Quote loaded! Click Calculate to recalculate.');
}

// Delete Quote
function deleteQuote(id) {
    if (!confirm('Delete this quote?')) return;
    
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    quotes = quotes.filter(q => q.id !== id);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    loadQuotes();
}

// Export Quotes
function exportQuotes() {
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    if (quotes.length === 0) {
        alert('No quotes to export');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mh-towing-quotes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Load History
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    const container = document.getElementById('historyList');
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No calculation history yet</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Your calculations will appear here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = history.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('en-ZA', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="history-item">
                <div class="item-header">
                    <div class="item-title">${item.startLocation} → ${item.endLocation}</div>
                    <div class="item-date">${dateStr}</div>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <span>Distance:</span>
                        <span>${item.distance.toFixed(2)} km</span>
                    </div>
                    <div class="item-detail">
                        <span>Total:</span>
                        <span style="color: var(--success); font-weight: 600;">R ${item.total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="item-btn delete" onclick="deleteHistoryItem(${item.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Delete History Item
function deleteHistoryItem(id) {
    if (!confirm('Delete this history item?')) return;
    
    let history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    history = history.filter(h => h.id !== id);
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    loadHistory();
}

// Clear History
function clearHistory() {
    if (!confirm('Clear all calculation history?')) return;
    
    localStorage.removeItem('calculationHistory');
    loadHistory();
}

// Helper function to show page by name
function showPageByName(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageName + 'Page').classList.add('active');
    
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(pageName)) {
            btn.classList.add('active');
        }
    });
}

// Save to history when calculation is done
function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    
    const historyItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        distance: data.distance,
        total: data.total
    };
    
    history.unshift(historyItem);
    
    // Keep only last 100 items
    if (history.length > 100) {
        history = history.slice(0, 100);
    }
    
    localStorage.setItem('calculationHistory', JSON.stringify(history));
}


// ========== CUSTOMERS PAGE ==========
function addCustomer() {
    console.log('addCustomer called');
    const modal = document.getElementById('customerModal');
    if (!modal) {
        console.error('customerModal not found');
        return;
    }
    
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    modal.classList.add('active');
}

function closeCustomerModal() {
    const modal = document.getElementById('customerModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function saveCustomer() {
    console.log('saveCustomer called');
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    if (!name || !phone) {
        alert('Please enter name and phone number');
        return;
    }
    
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    customers.push({
        id: Date.now(),
        name,
        phone,
        email,
        address,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('customers', JSON.stringify(customers));
    console.log('Customer saved:', customers);
    closeCustomerModal();
    loadCustomers();
    alert('Customer added successfully!');
}

function loadCustomers() {
    console.log('loadCustomers called');
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const container = document.getElementById('customersList');
    
    if (!container) {
        console.error('customersList container not found');
        return;
    }
    
    console.log('Customers:', customers);
    
    if (customers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <p>No customers yet</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Add customers to manage your client database</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="quote-item">
            <div class="item-header">
                <div class="item-title">${customer.name}</div>
                <div class="item-date">${customer.phone}</div>
            </div>
            ${customer.email ? `<div style="padding: 8px; color: var(--text-secondary);">📧 ${customer.email}</div>` : ''}
            ${customer.address ? `<div style="padding: 8px; color: var(--text-secondary);">📍 ${customer.address}</div>` : ''}
            <div class="item-actions">
                <button class="item-btn view" onclick="callCustomer('${customer.phone}')">📞 Call</button>
                <button class="item-btn delete" onclick="deleteCustomer(${customer.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function callCustomer(phone) {
    window.location.href = `tel:${phone}`;
}

function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers = customers.filter(c => c.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
    loadCustomers();
}

// ========== JOBS PAGE ==========
function createJob() {
    // Switch to calculator page to create a new job
    showPageByName('calculator');
    alert('Fill in the calculator to create a new job');
}

async function loadJobs() {
    const quotes = await getJobs();
    const container = document.getElementById('jobsList');
    
    if (quotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No jobs yet</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Create jobs from the calculator</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = quotes.map(quote => {
        const date = new Date(quote.date);
        const dateStr = date.toLocaleDateString('en-ZA', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="quote-item">
                <div class="item-header">
                    <div class="item-title">${quote.startLocation} → ${quote.endLocation}</div>
                    <div class="item-date">${dateStr}</div>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <span>Vehicle:</span>
                        <span>${quote.vehicleType}</span>
                    </div>
                    <div class="item-detail">
                        <span>Distance:</span>
                        <span>${quote.distance.toFixed(2)} km</span>
                    </div>
                    <div class="item-detail">
                        <span>Total:</span>
                        <span style="color: var(--success); font-weight: 600;">R ${quote.total.toFixed(2)}</span>
                    </div>
                </div>
                ${quote.notes ? `<div style="padding: 8px; background: rgba(255,255,255,0.02); border-radius: 6px; margin-top: 8px; font-size: 0.9em;"><strong>Notes:</strong> ${quote.notes}</div>` : ''}
                <div class="item-actions">
                    <button class="item-btn view" onclick="viewQuote(${quote.id})">👁️ View</button>
                    <button class="item-btn delete" onclick="deleteQuote(${quote.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// ========== ANALYTICS PAGE ==========
async function loadAnalytics() {
    console.log('loadAnalytics called');
    const rangeSelect = document.getElementById('analyticsRange');
    const range = rangeSelect ? parseInt(rangeSelect.value) : 30;
    
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    const quotes = await getJobs();
    const expenses = await getExpenses();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - range);
    
    const recentHistory = history.filter(h => new Date(h.date) >= cutoffDate);
    const recentQuotes = quotes.filter(q => new Date(q.date) >= cutoffDate);
    
    const totalJobs = recentHistory.length;
    const totalRevenue = recentHistory.reduce((sum, h) => sum + (h.total || 0), 0);
    const totalDistance = recentHistory.reduce((sum, h) => sum + (h.distance || 0), 0);
    const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;
    
    const container = document.getElementById('analyticsContent');
    if (!container) {
        console.error('analyticsContent container not found');
        return;
    }
    
    console.log('Analytics data:', { totalJobs, totalRevenue, totalDistance, avgJobValue });
    
    container.innerHTML = `
        <div class="analytics-grid">
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-value">${totalJobs}</div>
                <div class="stat-label">Total Jobs</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">R ${totalRevenue.toFixed(2)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📏</div>
                <div class="stat-value">${totalDistance.toFixed(0)} km</div>
                <div class="stat-label">Total Distance</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">R ${avgJobValue.toFixed(2)}</div>
                <div class="stat-label">Avg Job Value</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💾</div>
                <div class="stat-value">${recentQuotes.length}</div>
                <div class="stat-label">Saved Quotes</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value">${(JSON.parse(localStorage.getItem('customers')) || []).length}</div>
                <div class="stat-label">Customers</div>
            </div>
        </div>
    `;
}

function clearAllAnalytics() {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL data including:\n\n• All saved quotes\n• All jobs\n• All invoices\n• All expenses\n• Calculation history\n• Customer data\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?')) {
        return;
    }
    
    // Second confirmation
    if (!confirm('🚨 FINAL CONFIRMATION\n\nYou are about to delete ALL your business data.\n\nClick OK to proceed with deletion.')) {
        return;
    }
    
    // Clear all localStorage data
    localStorage.removeItem('quotes');
    localStorage.removeItem('calculationHistory');
    localStorage.removeItem('invoices');
    localStorage.removeItem('expenses');
    localStorage.removeItem('customers');
    
    // Reload analytics to show empty state
    loadAnalytics();
    
    alert('✅ All analytics data has been cleared successfully.');
}

// ========== SETTINGS PAGE ==========
function saveSettingsPage() {
    const name = document.getElementById('settingsCompanyName').value;
    const phone = document.getElementById('settingsCompanyPhone').value;
    const address = document.getElementById('settingsCompanyAddress').value;
    const yardLocation = document.getElementById('settingsYardLocation').value;
    
    // Clear cached yard coordinates if location changed
    const oldYardLocation = localStorage.getItem('yardLocation');
    if (oldYardLocation !== yardLocation) {
        localStorage.removeItem('yardLocationCoords');
    }
    
    localStorage.setItem('companyName', name);
    localStorage.setItem('companyPhone', phone);
    localStorage.setItem('companyAddress', address);
    localStorage.setItem('yardLocation', yardLocation);
    
    alert('Settings saved successfully!');
}

function loadAllSettings() {
    const name = localStorage.getItem('companyName') || 'MH AUTO';
    const phone = localStorage.getItem('companyPhone') || '061 453 2160';
    const address = localStorage.getItem('companyAddress') || '784 Gopalall Hurbans, Tongaat, KZN';
    const yardLocation = localStorage.getItem('yardLocation') || '';
    
    document.getElementById('settingsCompanyName').value = name;
    document.getElementById('settingsCompanyPhone').value = phone;
    document.getElementById('settingsCompanyAddress').value = address;
    document.getElementById('settingsYardLocation').value = yardLocation;
}

function toggleYardStart() {
    const startFromYard = document.getElementById('startFromYard').checked;
    const yardLocation = localStorage.getItem('yardLocation');
    
    if (startFromYard) {
        if (!yardLocation) {
            alert('Please set your Yard Location in Settings first!');
            document.getElementById('startFromYard').checked = false;
            return;
        }
        // The calculation will handle the yard routing
    }
}


// ========== THEME SYSTEM ==========
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    
    themeIcon.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Reinitialize particles with new theme
    if (window.particlesInitialized) {
        initParticles();
    }
}

// Load saved theme
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
});

// ========== PARTICLE SYSTEM ==========
let particlesInitialized = false;

function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    const isLight = document.body.classList.contains('light-mode');
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = isLight ? `rgba(0, 0, 0, ${this.opacity * 0.3})` : `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.strokeStyle = isLight 
                        ? `rgba(0, 0, 0, ${(1 - distance / 100) * 0.1})`
                        : `rgba(255, 255, 255, ${(1 - distance / 100) * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    particlesInitialized = true;
}

// Initialize particles on load
window.addEventListener('load', initParticles);
window.addEventListener('resize', () => {
    const canvas = document.getElementById('particles');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// ========== MAP PREVIEW ==========
let map = null;
let directionsRenderer = null;
let trafficLayer = null;

function initMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    map = new google.maps.Map(mapDiv, {
        zoom: 10,
        center: { lat: -29.5833, lng: 31.0500 }, // Tongaat, KZN
        styles: [
            {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#242f3e' }]
            },
            {
                featureType: 'all',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#242f3e' }]
            },
            {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#746855' }]
            }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });
    
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#ff6b35',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });
    
    trafficLayer = new google.maps.TrafficLayer();
}

function showRouteOnMap(result) {
    if (!map) {
        initMap();
    }
    
    directionsRenderer.setDirections(result);
    document.getElementById('mapPreview').classList.remove('hidden');
    
    // Scroll to map
    setTimeout(() => {
        document.getElementById('mapPreview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

function toggleTraffic() {
    if (!trafficLayer) return;
    
    const icon = document.getElementById('trafficIcon');
    
    if (trafficLayer.getMap()) {
        trafficLayer.setMap(null);
        icon.textContent = '🚦';
    } else {
        trafficLayer.setMap(map);
        icon.textContent = '✅';
    }
}

// ========== SMS/EMAIL QUOTE SENDER ==========
function sendQuote() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv.classList.contains('hidden')) {
        alert('Please calculate a quote first');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'send-quote-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📤 Send Quote</h3>
                <button class="close-btn" onclick="this.closest('.send-quote-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="send-options">
                    <button class="send-option-btn" onclick="sendViaWhatsApp()">
                        <span class="icon">💬</span>
                        WhatsApp
                    </button>
                    <button class="send-option-btn" onclick="sendViaSMS()">
                        <span class="icon">📱</span>
                        SMS
                    </button>
                    <button class="send-option-btn" onclick="sendViaEmail()">
                        <span class="icon">📧</span>
                        Email
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function sendViaWhatsApp() {
    shareQuote(); // Use existing WhatsApp function
    document.querySelector('.send-quote-modal').remove();
}

function sendViaSMS() {
    const companyName = localStorage.getItem('companyName') || 'MH AUTO';
    const companyPhone = localStorage.getItem('companyPhone') || '061 453 2160';
    const total = document.querySelector('.total-amount-large')?.textContent || 'N/A';
    
    const message = `${companyName} Quote: ${total}. Call ${companyPhone} to confirm.`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    document.querySelector('.send-quote-modal').remove();
}

function sendViaEmail() {
    const companyName = localStorage.getItem('companyName') || 'MH AUTO';
    const companyPhone = localStorage.getItem('companyPhone') || '061 453 2160';
    const startLocation = document.getElementById('startInput').value;
    const endLocation = document.getElementById('endInput').value;
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const distanceElement = document.getElementById('totalDistanceValue');
    const distance = distanceElement ? parseFloat(distanceElement.getAttribute('data-distance')) : 0;
    const total = parseFloat(document.querySelector('.total-amount-large')?.textContent.replace('R ', '').replace(',', '')) || 0;
    
    const subject = `Towing Quote from ${companyName}`;
    let body = `${companyName}\n${companyPhone}\n\nTOWING QUOTE\n\n`;
    body += `From: ${startLocation}\n`;
    body += `To: ${endLocation}\n`;
    body += `Vehicle: ${vehicle ? vehicle.name : 'N/A'}\n`;
    body += `Distance: ${distance.toFixed(2)} km\n\n`;
    body += `COST BREAKDOWN:\n`;
    
    // Base cost
    const baseCost = distance * (vehicle ? vehicle.rate : 0);
    body += `Towing: R ${baseCost.toFixed(2)}\n`;
    
    // Call-out fee
    if (vehicle && vehicle.callOutFee > 0) {
        body += `Call-Out Fee: R ${vehicle.callOutFee.toFixed(2)}\n`;
    }
    
    // Winching
    if (document.getElementById('winchingEnabled').checked) {
        const winchingCost = calculateWinchingCost();
        body += `Winching: R ${winchingCost.toFixed(2)}\n`;
    }
    
    // Prep to Tow
    if (document.getElementById('prepToTowEnabled').checked) {
        const prepCost = calculatePrepToTowCost();
        body += `Prep to Tow: R ${prepCost.toFixed(2)}\n`;
    }
    
    body += `\nTOTAL: R ${total.toFixed(2)}\n\n`;
    body += `Thank you for choosing ${companyName}!`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('.send-quote-modal').remove();
}
