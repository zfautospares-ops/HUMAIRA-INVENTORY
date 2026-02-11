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

// Initialize Google Maps Autocomplete
let pickupAutocomplete, dropoffAutocomplete;

function initAutocomplete() {
    // Check if Google Maps is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.log('Google Maps not loaded. Address autocomplete disabled. GPS and manual entry still work!');
        return;
    }

    try {
        const options = {
            componentRestrictions: { country: 'za' }, // Restrict to South Africa
            fields: ['formatted_address', 'geometry', 'name']
        };

        const pickupInput = document.getElementById('pickupLocation');
        const dropoffInput = document.getElementById('dropoffLocation');

        pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, options);
        dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, options);

        // Listen for place selection
        pickupAutocomplete.addListener('place_changed', function() {
            const place = pickupAutocomplete.getPlace();
            if (place.geometry) {
                pickupCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                pickupInput.value = place.formatted_address || place.name;
                calculateDistance();
            }
        });

        dropoffAutocomplete.addListener('place_changed', function() {
            const place = dropoffAutocomplete.getPlace();
            if (place.geometry) {
                dropoffCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                dropoffInput.value = place.formatted_address || place.name;
                calculateDistance();
            }
        });
        
        console.log('Google Maps autocomplete initialized successfully!');
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
        alert('Google Maps autocomplete unavailable. Please use GPS button or type address manually.');
    }
}

// Make initAutocomplete available globally for callback
window.initAutocomplete = initAutocomplete;

// Geolocation
let workshopCoords = null;
let pickupCoords = null;
let dropoffCoords = null;
let additionalStopsCoords = [];
let stopCounter = 0;
let map = null;
let directionsService = null;
let directionsRenderer = null;

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
            
            if (type === 'workshop') {
                document.getElementById('workshopLocation').value = locationString;
                workshopCoords = { lat, lon };
            } else if (type === 'pickup') {
                document.getElementById('pickupLocation').value = locationString;
                pickupCoords = { lat, lon };
            } else if (type === 'dropoff') {
                document.getElementById('dropoffLocation').value = locationString;
                dropoffCoords = { lat, lon };
            } else if (type.startsWith('stop')) {
                const stopNum = parseInt(type.replace('stop', ''));
                document.getElementById(`${type}Location`).value = locationString;
                additionalStopsCoords[stopNum - 1] = { lat, lon };
            }
            
            // Calculate distance if locations are set
            calculateAllDistances();
            
            button.textContent = '📍 Use Current GPS';
            button.disabled = false;
        },
        (error) => {
            alert('Unable to get location: ' + error.message);
            button.textContent = '📍 Use Current GPS';
            button.disabled = false;
        }
    );
}

// Calculate all distances for the complete route using Google Maps
function calculateAllDistances() {
    const routeSegments = document.getElementById('routeSegments');
    const distanceBreakdown = document.getElementById('distanceBreakdown');
    
    if (!routeSegments) return;
    
    routeSegments.innerHTML = '';
    
    // Build route array
    const route = [];
    if (workshopCoords) route.push({ name: 'Workshop', coords: workshopCoords });
    if (pickupCoords) route.push({ name: 'Pickup', coords: pickupCoords });
    
    // Add additional stops
    additionalStopsCoords.forEach((coords, index) => {
        if (coords) {
            route.push({ name: `Stop ${index + 1}`, coords: coords });
        }
    });
    
    if (dropoffCoords) route.push({ name: 'Drop-off', coords: dropoffCoords });
    
    // Check if user wants to include return trip
    const includeReturn = document.getElementById('includeReturnTrip');
    const shouldIncludeReturn = includeReturn ? includeReturn.checked : true;
    
    // Add return to workshop only if checkbox is checked and we have at least 2 points
    if (workshopCoords && route.length > 1 && shouldIncludeReturn) {
        route.push({ name: 'Workshop (Return)', coords: workshopCoords });
    }
    
    if (route.length < 2) {
        distanceBreakdown.style.display = 'none';
        document.getElementById('showMapBtn').style.display = 'none';
        return;
    }
    
    // Use Google Maps Distance Matrix API for accurate road distances
    if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
        calculateWithGoogleMaps(route);
    } else {
        // Fallback to Haversine if Google Maps not available
        calculateWithHaversine(route);
    }
}

// Calculate distances using Google Maps Distance Matrix API (accurate road distances)
function calculateWithGoogleMaps(route) {
    const service = new google.maps.DistanceMatrixService();
    const routeSegments = document.getElementById('routeSegments');
    const distanceBreakdown = document.getElementById('distanceBreakdown');
    
    routeSegments.innerHTML = '<div class="loading" style="padding: 10px; text-align: center; color: #667eea;">📍 Calculating road distances...</div>';
    distanceBreakdown.style.display = 'block';
    
    let totalDistance = 0;
    let segmentsCalculated = 0;
    const totalSegments = route.length - 1;
    const segments = [];
    
    // Calculate each segment
    for (let i = 0; i < route.length - 1; i++) {
        const from = route[i];
        const to = route[i + 1];
        
        const origin = new google.maps.LatLng(from.coords.lat, from.coords.lon);
        const destination = new google.maps.LatLng(to.coords.lat, to.coords.lon);
        
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        }, function(response, status) {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                const distanceInMeters = response.rows[0].elements[0].distance.value;
                const distanceInKm = distanceInMeters / 1000;
                
                segments[i] = {
                    from: from.name,
                    to: to.name,
                    distance: distanceInKm,
                    index: i
                };
                
                totalDistance += distanceInKm;
            } else {
                // Fallback to Haversine for this segment
                const distance = calculateDistanceBetween(from.coords, to.coords);
                segments[i] = {
                    from: from.name,
                    to: to.name,
                    distance: distance,
                    index: i
                };
                totalDistance += distance;
            }
            
            segmentsCalculated++;
            
            // When all segments are calculated, display them
            if (segmentsCalculated === totalSegments) {
                displayDistanceSegments(segments, totalDistance);
            }
        });
    }
}

// Display distance segments in order
function displayDistanceSegments(segments, totalDistance) {
    const routeSegments = document.getElementById('routeSegments');
    const distanceBreakdown = document.getElementById('distanceBreakdown');
    
    routeSegments.innerHTML = '';
    
    // Sort segments by index to maintain order
    segments.sort((a, b) => a.index - b.index);
    
    segments.forEach((segment, index) => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'distance-item';
        segmentDiv.innerHTML = `
            <span class="distance-label">${index === 0 ? '🏠' : '🚗'} ${segment.from} → ${segment.to}:</span>
            <span class="distance-value">${segment.distance.toFixed(2)} km</span>
        `;
        routeSegments.appendChild(segmentDiv);
    });
    
    // Update total
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(2) + ' km';
    document.getElementById('mileage').value = totalDistance.toFixed(2);
    
    distanceBreakdown.style.display = 'block';
    document.getElementById('showMapBtn').style.display = 'inline-block';
}

// Fallback: Calculate distances using Haversine formula (straight-line distance)
function calculateWithHaversine(route) {
    const routeSegments = document.getElementById('routeSegments');
    const distanceBreakdown = document.getElementById('distanceBreakdown');
    
    routeSegments.innerHTML = '';
    let totalDistance = 0;
    
    // Calculate distances between consecutive points
    for (let i = 0; i < route.length - 1; i++) {
        const from = route[i];
        const to = route[i + 1];
        const distance = calculateDistanceBetween(from.coords, to.coords);
        totalDistance += distance;
        
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'distance-item';
        segmentDiv.innerHTML = `
            <span class="distance-label">${i === 0 ? '🏠' : '🚗'} ${from.name} → ${to.name}:</span>
            <span class="distance-value">${distance.toFixed(2)} km (approx)</span>
        `;
        routeSegments.appendChild(segmentDiv);
    }
    
    // Update total
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(2) + ' km';
    document.getElementById('mileage').value = totalDistance.toFixed(2);
    
    distanceBreakdown.style.display = 'block';
    document.getElementById('showMapBtn').style.display = 'inline-block';
}

// Update route display with Google Maps route data
function updateRouteDisplay(segments, totalDistance) {
    const routeSegments = document.getElementById('routeSegments');
    routeSegments.innerHTML = '';
    
    segments.forEach((segment, index) => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'distance-item';
        segmentDiv.innerHTML = `
            <span class="distance-label">${index === 0 ? '🏠' : '🚗'} Leg ${index + 1}:</span>
            <span class="distance-value">${segment.distance} km</span>
        `;
        routeSegments.appendChild(segmentDiv);
    });
    
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(2) + ' km';
    document.getElementById('mileage').value = totalDistance.toFixed(2);
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistanceBetween(coords1, coords2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Parse workshop location on page load
window.addEventListener('load', function() {
    const workshopInput = document.getElementById('workshopLocation');
    if (workshopInput && workshopInput.value) {
        // Try to parse as coordinates first
        const coords = parseCoordinates(workshopInput.value);
        if (coords) {
            workshopCoords = coords;
        } else {
            // Geocode the address
            geocodeAndCalculate(workshopInput.value, 'workshop');
        }
    }
});

// Add additional stop
function addStop() {
    stopCounter++;
    const stopDiv = document.createElement('div');
    stopDiv.className = 'form-group additional-stop';
    stopDiv.id = `stop-${stopCounter}`;
    stopDiv.innerHTML = `
        <label for="stop${stopCounter}Location">Stop ${stopCounter} Location</label>
        <input type="text" id="stop${stopCounter}Location" placeholder="Start typing address..." class="stop-input">
        <button type="button" class="btn-secondary" onclick="getLocation('stop${stopCounter}')">📍 Use Current GPS</button>
        <button type="button" class="btn-secondary" onclick="removeStop(${stopCounter})" style="background: #ff5252; color: white; border-color: #ff5252;">
            ❌ Remove
        </button>
    `;
    document.getElementById('additionalStops').appendChild(stopDiv);
    
    // Add autocomplete to new stop
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        const input = document.getElementById(`stop${stopCounter}Location`);
        const autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: 'za' },
            fields: ['formatted_address', 'geometry', 'name']
        });
        
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const coords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                additionalStopsCoords[stopCounter - 1] = coords;
                input.value = place.formatted_address || place.name;
                calculateAllDistances();
            }
        });
        
        input.addEventListener('blur', function() {
            geocodeAndCalculate(this.value, `stop${stopCounter}`);
        });
    }
}

// Remove stop
function removeStop(stopNum) {
    const stopDiv = document.getElementById(`stop-${stopNum}`);
    if (stopDiv) {
        stopDiv.remove();
        delete additionalStopsCoords[stopNum - 1];
        calculateAllDistances();
    }
}

// Show route map
function showRouteMap() {
    if (typeof google === 'undefined' || !google.maps) {
        alert('Google Maps is not loaded. Cannot display map.');
        return;
    }
    
    const mapDiv = document.getElementById('routeMap');
    mapDiv.style.display = 'block';
    
    // Initialize map if not already done
    if (!map) {
        map = new google.maps.Map(mapDiv, {
            zoom: 10,
            center: workshopCoords || { lat: -29.5733, lng: 31.0847 } // Tongaat, KZN
        });
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);
    }
    
    // Build waypoints array
    const waypoints = [];
    
    if (pickupCoords) {
        waypoints.push({
            location: new google.maps.LatLng(pickupCoords.lat, pickupCoords.lon),
            stopover: true
        });
    }
    
    // Add additional stops
    additionalStopsCoords.forEach((coords, index) => {
        if (coords) {
            waypoints.push({
                location: new google.maps.LatLng(coords.lat, coords.lon),
                stopover: true
            });
        }
    });
    
    if (dropoffCoords) {
        waypoints.push({
            location: new google.maps.LatLng(dropoffCoords.lat, dropoffCoords.lon),
            stopover: true
        });
    }
    
    if (waypoints.length === 0) {
        alert('Please enter at least pickup and drop-off locations');
        return;
    }
    
    // Calculate and display route
    const origin = workshopCoords ? new google.maps.LatLng(workshopCoords.lat, workshopCoords.lon) : waypoints[0].location;
    const destination = workshopCoords ? new google.maps.LatLng(workshopCoords.lat, workshopCoords.lon) : waypoints[waypoints.length - 1].location;
    
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'ZA'
    };
    
    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Update distances from actual route
            const route = result.routes[0];
            let totalDistance = 0;
            const segments = [];
            
            route.legs.forEach((leg, index) => {
                const distanceKm = (leg.distance.value / 1000).toFixed(2);
                totalDistance += parseFloat(distanceKm);
                segments.push({
                    from: leg.start_address,
                    to: leg.end_address,
                    distance: distanceKm
                });
            });
            
            // Update UI with route distances
            updateRouteDisplay(segments, totalDistance);
        } else {
            alert('Could not calculate route: ' + status);
        }
    });
}

// Allow manual location entry to trigger distance calculation with geocoding
document.getElementById('workshopLocation').addEventListener('blur', function() {
    geocodeAndCalculate(this.value, 'workshop');
});

document.getElementById('pickupLocation').addEventListener('blur', function() {
    geocodeAndCalculate(this.value, 'pickup');
});

document.getElementById('dropoffLocation').addEventListener('blur', function() {
    geocodeAndCalculate(this.value, 'dropoff');
});

// Geocode address and calculate distances
function geocodeAndCalculate(address, type) {
    if (!address || address.trim() === '') return;
    
    // Check if it's already coordinates
    const coords = parseCoordinates(address);
    if (coords) {
        if (type === 'workshop') workshopCoords = coords;
        else if (type === 'pickup') pickupCoords = coords;
        else if (type === 'dropoff') dropoffCoords = coords;
        else if (type.startsWith('stop')) {
            const stopNum = parseInt(type.replace('stop', ''));
            additionalStopsCoords[stopNum - 1] = coords;
        }
        calculateAllDistances();
        return;
    }
    
    // Use Google Maps Geocoding API if available
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address, componentRestrictions: { country: 'za' } }, function(results, status) {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const coords = { lat: location.lat(), lon: location.lng() };
                
                if (type === 'workshop') workshopCoords = coords;
                else if (type === 'pickup') pickupCoords = coords;
                else if (type === 'dropoff') dropoffCoords = coords;
                else if (type.startsWith('stop')) {
                    const stopNum = parseInt(type.replace('stop', ''));
                    additionalStopsCoords[stopNum - 1] = coords;
                }
                
                calculateAllDistances();
                console.log(`Geocoded ${type}: ${address} to`, coords);
            } else {
                console.log(`Geocoding failed for ${type}: ${status}`);
            }
        });
    }
}

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
    // Collect additional stops
    const additionalStops = [];
    document.querySelectorAll('.additional-stop').forEach((stopDiv) => {
        const input = stopDiv.querySelector('.stop-input');
        if (input && input.value) {
            additionalStops.push(input.value);
        }
    });
    
    // Build route segments for saving
    const routeSegments = [];
    const segmentElements = document.querySelectorAll('#routeSegments .distance-item');
    segmentElements.forEach((element) => {
        const label = element.querySelector('.distance-label').textContent;
        const value = element.querySelector('.distance-value').textContent;
        routeSegments.push({ label, distance: value });
    });
    
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
            workshopLocation: document.getElementById('workshopLocation').value,
            pickupLocation: document.getElementById('pickupLocation').value,
            additionalStops: additionalStops,
            dropoffLocation: document.getElementById('dropoffLocation').value,
            mileage: document.getElementById('mileage').value,
            routeSegments: routeSegments,
            totalDistance: document.getElementById('totalDistance').textContent.replace(' km', '')
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
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('✅ Job card saved to server successfully:', data.jobId);
            alert('✅ Job card saved to server successfully!');
        } else {
            throw new Error('Server save failed: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('❌ Error saving to server, saving locally:', error);
        alert('⚠️ Could not reach server. Job card saved locally on this device. Please sync when back online.');
        // Fallback to localStorage if server is unavailable
        const savedJobs = JSON.parse(localStorage.getItem('jobCards') || '[]');
        savedJobs.push(jobCard);
        localStorage.setItem('jobCards', JSON.stringify(savedJobs));
        console.log('📱 Saved to localStorage. Total local jobs:', savedJobs.length);
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

// Sync locally saved job cards to server
function syncLocalJobs() {
    const savedJobs = JSON.parse(localStorage.getItem('jobCards') || '[]');
    
    if (savedJobs.length === 0) {
        alert('✅ No local job cards to sync. All jobs are already on the server.');
        return;
    }
    
    if (!confirm(`Found ${savedJobs.length} job card(s) saved locally. Sync them to the server now?`)) {
        return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    const syncPromises = savedJobs.map(jobCard => {
        return fetch('https://mh-towing-job-cards.onrender.com/api/jobcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobCard)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                successCount++;
                return true;
            } else {
                failCount++;
                return false;
            }
        })
        .catch(error => {
            console.error('Error syncing job:', error);
            failCount++;
            return false;
        });
    });
    
    Promise.all(syncPromises).then(() => {
        if (successCount > 0) {
            // Clear localStorage after successful sync
            localStorage.removeItem('jobCards');
            alert(`✅ Successfully synced ${successCount} job card(s) to server!${failCount > 0 ? `\n⚠️ ${failCount} failed to sync.` : ''}`);
        } else {
            alert(`❌ Failed to sync job cards. Please check your internet connection and try again.`);
        }
    });
}
