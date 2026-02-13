// Google Maps services
let directionsService;
let directionsRenderer;
let map;
let geocoder;
let startAutocomplete;
let endAutocomplete;
let stopCounter = 0;

// Initialize Google Maps
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder();
    
    // Initialize autocomplete for start and end locations
    startAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('startLocation'),
        { componentRestrictions: { country: 'za' } }
    );
    
    endAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('endLocation'),
        { componentRestrictions: { country: 'za' } }
    );
}

// Initialize on page load
window.addEventListener('load', initMap);

// Get GPS location for start
function getStartGPS() {
    if (navigator.geolocation) {
        document.getElementById('startLocation').value = 'Getting location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('startLocation').value = results[0].formatted_address;
                    } else {
                        document.getElementById('startLocation').value = `${lat}, ${lng}`;
                    }
                });
            },
            (error) => {
                alert('Error getting location: ' + error.message);
                document.getElementById('startLocation').value = '';
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Get GPS location for end
function getEndGPS() {
    if (navigator.geolocation) {
        document.getElementById('endLocation').value = 'Getting location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('endLocation').value = results[0].formatted_address;
                    } else {
                        document.getElementById('endLocation').value = `${lat}, ${lng}`;
                    }
                });
            },
            (error) => {
                alert('Error getting location: ' + error.message);
                document.getElementById('endLocation').value = '';
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Add additional stop
function addStop() {
    stopCounter++;
    const stopsContainer = document.getElementById('stopsContainer');
    
    const stopDiv = document.createElement('div');
    stopDiv.className = 'stop-group';
    stopDiv.id = `stop-${stopCounter}`;
    stopDiv.innerHTML = `
        <label>Stop ${stopCounter}</label>
        <input type="text" class="location-input stop-input" id="stopLocation-${stopCounter}" placeholder="Enter stop address">
        <button class="gps-btn" onclick="getStopGPS(${stopCounter})">📍 Use GPS</button>
        <button class="remove-stop-btn" onclick="removeStop(${stopCounter})">✖ Remove</button>
    `;
    
    stopsContainer.appendChild(stopDiv);
    
    // Initialize autocomplete for this stop
    new google.maps.places.Autocomplete(
        document.getElementById(`stopLocation-${stopCounter}`),
        { componentRestrictions: { country: 'za' } }
    );
}

// Remove stop
function removeStop(stopId) {
    const stopDiv = document.getElementById(`stop-${stopId}`);
    if (stopDiv) {
        stopDiv.remove();
    }
}

// Get GPS for specific stop
function getStopGPS(stopId) {
    if (navigator.geolocation) {
        const input = document.getElementById(`stopLocation-${stopId}`);
        input.value = 'Getting location...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        input.value = results[0].formatted_address;
                    } else {
                        input.value = `${lat}, ${lng}`;
                    }
                });
            },
            (error) => {
                alert('Error getting location: ' + error.message);
                input.value = '';
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Calculate distance
async function calculateDistance() {
    const startLocation = document.getElementById('startLocation').value.trim();
    const endLocation = document.getElementById('endLocation').value.trim();
    
    if (!startLocation || !endLocation) {
        alert('Please enter both start and end locations');
        return;
    }
    
    // Get all stops
    const stops = [];
    const stopInputs = document.querySelectorAll('.stop-input');
    stopInputs.forEach(input => {
        if (input.value.trim()) {
            stops.push(input.value.trim());
        }
    });
    
    // Show loading
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = '<div class="loading">📍 Calculating route...</div>';
    
    try {
        // Build waypoints
        const waypoints = stops.map(stop => ({
            location: stop,
            stopover: true
        }));
        
        // Request directions
        const request = {
            origin: startLocation,
            destination: endLocation,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        };
        
        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                displayResults(result);
                displayMap(result);
            } else {
                resultsDiv.innerHTML = `<div class="loading" style="color: #f44336;">❌ Error: ${status}. Please check your addresses and try again.</div>`;
            }
        });
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="loading" style="color: #f44336;">❌ Error: ${error.message}</div>`;
    }
}

// Display results
function displayResults(result) {
    const route = result.routes[0];
    let totalDistance = 0;
    let breakdownHTML = '';
    
    // Process each leg of the journey
    route.legs.forEach((leg, index) => {
        const distance = leg.distance.value / 1000; // Convert to km
        totalDistance += distance;
        
        let fromLabel, toLabel;
        
        if (index === 0) {
            fromLabel = 'Start';
        } else {
            fromLabel = `Stop ${index}`;
        }
        
        if (index === route.legs.length - 1) {
            toLabel = 'End';
        } else {
            toLabel = `Stop ${index + 1}`;
        }
        
        breakdownHTML += `
            <div class="route-segment">
                <strong>${fromLabel} → ${toLabel}</strong>
                <span>${distance.toFixed(2)} km (${leg.duration.text})</span>
            </div>
        `;
    });
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h3>Distance Breakdown</h3>
        <div id="routeBreakdown">${breakdownHTML}</div>
        <div class="total-distance">
            <strong>Total Distance:</strong>
            <span>${totalDistance.toFixed(2)} km</span>
        </div>
    `;
    resultsDiv.classList.remove('hidden');
}

// Display map
function displayMap(result) {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.classList.remove('hidden');
    
    // Initialize map if not already done
    if (!map) {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: result.routes[0].legs[0].start_location
        });
        directionsRenderer.setMap(map);
    }
    
    // Display route on map
    directionsRenderer.setDirections(result);
    
    // Display turn-by-turn directions
    const directionsDiv = document.getElementById('directions');
    let directionsHTML = '<h4 style="margin-bottom: 10px; color: #667eea;">Turn-by-Turn Directions</h4>';
    
    result.routes[0].legs.forEach((leg, legIndex) => {
        leg.steps.forEach((step, stepIndex) => {
            directionsHTML += `
                <div class="direction-step">
                    <strong>Step ${stepIndex + 1}:</strong> ${step.instructions} (${step.distance.text})
                </div>
            `;
        });
    });
    
    directionsDiv.innerHTML = directionsHTML;
}
