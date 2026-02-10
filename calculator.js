// Location coordinates
let fromCoords = null;
let toCoords = null;
let fromAutocomplete, toAutocomplete;
let map, directionsService, directionsRenderer;
let currentRoutes = [];
let isManualDistance = false;

// Initialize Google Maps
function initMap() {
    if (typeof google === 'undefined' || !google.maps) {
        console.log('Google Maps not loaded.');
        return;
    }

    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: -29.6, lng: 31.0 } // KZN center
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false
    });

    // Initialize autocomplete
    initAutocomplete();
}

window.initMap = initMap;

// Initialize Google Maps Autocomplete
function initAutocomplete() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.log('Google Maps not loaded. GPS and manual entry still work!');
        return;
    }

    try {
        const options = {
            componentRestrictions: { country: 'za' },
            fields: ['formatted_address', 'geometry', 'name']
        };

        const fromInput = document.getElementById('fromLocation');
        const toInput = document.getElementById('toLocation');

        fromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
        toAutocomplete = new google.maps.places.Autocomplete(toInput, options);

        fromAutocomplete.addListener('place_changed', function() {
            const place = fromAutocomplete.getPlace();
            if (place.geometry) {
                fromCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                fromInput.value = place.formatted_address || place.name;
                calculateRoutes();
            }
        });

        toAutocomplete.addListener('place_changed', function() {
            const place = toAutocomplete.getPlace();
            if (place.geometry) {
                toCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                toInput.value = place.formatted_address || place.name;
                calculateRoutes();
            }
        });

        console.log('Google Maps initialized!');
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
    }
}

// Get GPS location
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
            
            if (type === 'from') {
                document.getElementById('fromLocation').value = locationString;
                fromCoords = { lat, lon };
            } else {
                document.getElementById('toLocation').value = locationString;
                toCoords = { lat, lon };
            }
            
            calculateRoutes();
            
            button.textContent = '📍 Use GPS';
            button.disabled = false;
        },
        (error) => {
            alert('Unable to get location: ' + error.message);
            button.textContent = '📍 Use GPS';
            button.disabled = false;
        }
    );
}

// Calculate routes using Google Directions API
function calculateRoutes() {
    if (!fromCoords || !toCoords || isManualDistance) {
        // Fallback to Haversine if no Google Maps or manual mode
        const distance = calculateDistance();
        updateDistanceDisplay(distance);
        calculateAll();
        return;
    }

    if (!directionsService) {
        // Fallback to Haversine
        const distance = calculateDistance();
        updateDistanceDisplay(distance);
        calculateAll();
        return;
    }

    const origin = new google.maps.LatLng(fromCoords.lat, fromCoords.lon);
    const destination = new google.maps.LatLng(toCoords.lat, toCoords.lon);

    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            currentRoutes = result.routes;
            displayRouteOptions(result.routes);
            // Show first route by default
            selectRoute(0);
        } else {
            console.error('Directions request failed:', status);
            // Fallback to straight-line distance
            const distance = calculateDistance();
            updateDistanceDisplay(distance);
            calculateAll();
        }
    });
}

// Display route options
function displayRouteOptions(routes) {
    const routeSection = document.getElementById('routeSection');
    const routeOptions = document.getElementById('routeOptions');
    
    if (routes.length === 0) {
        routeSection.style.display = 'none';
        return;
    }
    
    routeSection.style.display = 'block';
    routeOptions.innerHTML = '';
    
    routes.forEach((route, index) => {
        const leg = route.legs[0];
        const distance = (leg.distance.value / 1000).toFixed(2);
        const duration = leg.duration.text;
        const summary = route.summary || `Route ${index + 1}`;
        
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        routeCard.innerHTML = `
            <input type="radio" name="route" id="route${index}" value="${index}" ${index === 0 ? 'checked' : ''} onchange="selectRoute(${index})">
            <label for="route${index}">
                <div class="route-name">${summary}</div>
                <div class="route-details">
                    <span>📏 ${distance} km</span>
                    <span>⏱️ ${duration}</span>
                </div>
            </label>
        `;
        routeOptions.appendChild(routeCard);
    });
}

// Select a route
function selectRoute(index) {
    if (!currentRoutes[index]) return;
    
    const route = currentRoutes[index];
    const distance = route.legs[0].distance.value / 1000;
    
    // Display route on map
    directionsRenderer.setDirections({
        routes: [route],
        request: {
            origin: route.legs[0].start_location,
            destination: route.legs[0].end_location,
            travelMode: google.maps.TravelMode.DRIVING
        }
    });
    
    updateDistanceDisplay(distance);
    calculateAll();
}

// Update distance display
function updateDistanceDisplay(distance) {
    document.getElementById('distanceValue').textContent = distance.toFixed(2);
}

// Toggle manual distance input
function toggleManualDistance() {
    isManualDistance = document.getElementById('manualDistanceToggle').checked;
    const manualInput = document.getElementById('manualDistanceInput');
    const routeSection = document.getElementById('routeSection');
    
    if (isManualDistance) {
        manualInput.style.display = 'block';
        routeSection.style.display = 'none';
        document.getElementById('manualDistance').focus();
    } else {
        manualInput.style.display = 'none';
        if (fromCoords && toCoords) {
            calculateRoutes();
        }
    }
}

// Update manual distance
function updateManualDistance() {
    if (!isManualDistance) return;
    
    const distance = parseFloat(document.getElementById('manualDistance').value) || 0;
    updateDistanceDisplay(distance);
    calculateAll();
}

// Calculate distance using Haversine formula (fallback)
function calculateDistance() {
    if (!fromCoords || !toCoords) {
        return 0;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(toCoords.lat - fromCoords.lat);
    const dLon = toRad(toCoords.lon - fromCoords.lon);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(fromCoords.lat)) * Math.cos(toRad(toCoords.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Calculate pricing
function calculatePricing(distance) {
    const baseRate = parseFloat(document.getElementById('baseRate').value) || 0;
    const perKmRate = parseFloat(document.getElementById('perKmRate').value) || 0;
    const serviceMultiplier = parseFloat(document.getElementById('serviceType').value) || 1;
    
    const distanceCost = distance * perKmRate;
    const subtotal = baseRate + distanceCost;
    const total = subtotal * serviceMultiplier;
    
    return {
        baseRate,
        perKmRate,
        distanceCost,
        serviceMultiplier,
        total
    };
}

// Update all displays
function calculateAll() {
    const distance = calculateDistance();
    const pricing = calculatePricing(distance);
    
    // Update distance display
    document.getElementById('distanceValue').textContent = distance.toFixed(2);
    
    // Update pricing breakdown
    document.getElementById('baseRateDisplay').textContent = `R ${pricing.baseRate.toFixed(2)}`;
    document.getElementById('kmDisplay').textContent = distance.toFixed(2);
    document.getElementById('rateDisplay').textContent = pricing.perKmRate.toFixed(0);
    document.getElementById('distanceCostDisplay').textContent = `R ${pricing.distanceCost.toFixed(2)}`;
    document.getElementById('multiplierDisplay').textContent = `×${pricing.serviceMultiplier.toFixed(1)}`;
    document.getElementById('totalPrice').textContent = `R ${pricing.total.toFixed(2)}`;
}

// Update pricing when rates change
function updatePricing() {
    calculateAll();
}

// Listen to pricing input changes
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('baseRate').addEventListener('input', updatePricing);
    document.getElementById('perKmRate').addEventListener('input', updatePricing);
    document.getElementById('serviceType').addEventListener('change', updatePricing);
    
    // Parse manual coordinate entry
    document.getElementById('fromLocation').addEventListener('change', function() {
        const coords = parseCoordinates(this.value);
        if (coords) {
            fromCoords = coords;
            calculateRoutes();
        }
    });
    
    document.getElementById('toLocation').addEventListener('change', function() {
        const coords = parseCoordinates(this.value);
        if (coords) {
            toCoords = coords;
            calculateRoutes();
        }
    });
});

// Parse coordinates from string
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

// Share quote
function shareQuote() {
    const distance = parseFloat(document.getElementById('distanceValue').textContent);
    const total = document.getElementById('totalPrice').textContent;
    const from = document.getElementById('fromLocation').value;
    const to = document.getElementById('toLocation').value;
    
    const message = `MH TOWING - Quote\n\nFrom: ${from}\nTo: ${to}\nDistance: ${distance.toFixed(2)} km\n\nTotal Price: ${total}\n\nContact: 061 453 2160`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MH Towing Quote',
            text: message
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            alert('Quote copied to clipboard!');
        }).catch(() => {
            alert(message);
        });
    }
}

// Reset calculator
function resetCalculator() {
    document.getElementById('fromLocation').value = '';
    document.getElementById('toLocation').value = '';
    fromCoords = null;
    toCoords = null;
    
    document.getElementById('distanceValue').textContent = '0.00';
    document.getElementById('baseRateDisplay').textContent = 'R 350.00';
    document.getElementById('kmDisplay').textContent = '0.00';
    document.getElementById('distanceCostDisplay').textContent = 'R 0.00';
    document.getElementById('multiplierDisplay').textContent = '×1.0';
    document.getElementById('totalPrice').textContent = 'R 350.00';
}
