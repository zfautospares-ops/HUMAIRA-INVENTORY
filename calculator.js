// Location coordinates
let fromCoords = null;
let toCoords = null;
let fromAutocomplete, toAutocomplete;

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
                calculateAll();
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
                calculateAll();
            }
        });

        console.log('Google Maps autocomplete initialized!');
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
    }
}

window.initAutocomplete = initAutocomplete;

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
            
            calculateAll();
            
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

// Calculate distance using Haversine formula
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
            calculateAll();
        }
    });
    
    document.getElementById('toLocation').addEventListener('change', function() {
        const coords = parseCoordinates(this.value);
        if (coords) {
            toCoords = coords;
            calculateAll();
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
