// Location coordinates
let fromCoords = null;
let toCoords = null;
let workshopCoords = null;
let fromAutocomplete, toAutocomplete, workshopAutocomplete;
let map, directionsService, directionsRenderer;
let currentRoutes = [];
let isManualDistance = false;
let isWorkshopRoute = false;

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

    // Initialize autocomplete after a short delay
    setTimeout(() => {
        initAutocomplete();
    }, 500);
}

window.initMap = initMap;

// Initialize Google Maps Autocomplete
function initAutocomplete() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.log('Google Maps Places not loaded. GPS and manual entry still work!');
        return;
    }

    try {
        const options = {
            componentRestrictions: { country: 'za' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id']
        };

        const fromInput = document.getElementById('fromLocation');
        const toInput = document.getElementById('toLocation');
        const workshopInput = document.getElementById('workshopLocation');

        // Clear any existing autocomplete
        if (fromAutocomplete) {
            google.maps.event.clearInstanceListeners(fromInput);
        }
        if (toAutocomplete) {
            google.maps.event.clearInstanceListeners(toInput);
        }
        if (workshopAutocomplete) {
            google.maps.event.clearInstanceListeners(workshopInput);
        }

        fromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
        toAutocomplete = new google.maps.places.Autocomplete(toInput, options);
        workshopAutocomplete = new google.maps.places.Autocomplete(workshopInput, options);

        fromAutocomplete.addListener('place_changed', function() {
            const place = fromAutocomplete.getPlace();
            console.log('From place selected:', place);
            if (place.geometry) {
                fromCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                fromInput.value = place.formatted_address || place.name;
                console.log('From coords:', fromCoords);
                calculateRoutes();
            } else if (place.name) {
                // Fallback: geocode the address
                geocodeAddress(place.name, 'from');
            }
        });

        toAutocomplete.addListener('place_changed', function() {
            const place = toAutocomplete.getPlace();
            console.log('To place selected:', place);
            if (place.geometry) {
                toCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                toInput.value = place.formatted_address || place.name;
                console.log('To coords:', toCoords);
                calculateRoutes();
            } else if (place.name) {
                // Fallback: geocode the address
                geocodeAddress(place.name, 'to');
            }
        });

        workshopAutocomplete.addListener('place_changed', function() {
            const place = workshopAutocomplete.getPlace();
            console.log('Workshop place selected:', place);
            if (place.geometry) {
                workshopCoords = {
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                };
                workshopInput.value = place.formatted_address || place.name;
                console.log('Workshop coords:', workshopCoords);
                calculateRoutes();
            } else if (place.name) {
                // Fallback: geocode the address
                geocodeAddress(place.name, 'workshop');
            }
        });

        // Geocode existing addresses on load
        if (workshopInput.value) {
            geocodeAddress(workshopInput.value, 'workshop');
        }

        console.log('Google Maps autocomplete initialized successfully!');
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
    }
}

// Manual calculate button
function manualCalculate() {
    console.log('Manual calculate clicked');
    
    // Try to geocode all addresses
    const workshopAddr = document.getElementById('workshopLocation').value;
    const fromAddr = document.getElementById('fromLocation').value;
    const toAddr = document.getElementById('toLocation').value;
    
    console.log('Addresses:', { workshop: workshopAddr, from: fromAddr, to: toAddr });
    console.log('Route type:', isWorkshopRoute ? 'workshop' : 'simple');
    
    let geocodeCount = 0;
    let geocodeNeeded = 0;
    
    if (isWorkshopRoute && workshopAddr && !workshopCoords) {
        geocodeNeeded++;
        geocodeAddress(workshopAddr, 'workshop').then(() => {
            geocodeCount++;
            if (geocodeCount === geocodeNeeded) calculateRoutes();
        });
    }
    if (fromAddr && !fromCoords) {
        geocodeNeeded++;
        geocodeAddress(fromAddr, 'from').then(() => {
            geocodeCount++;
            if (geocodeCount === geocodeNeeded) calculateRoutes();
        });
    }
    if (toAddr && !toCoords) {
        geocodeNeeded++;
        geocodeAddress(toAddr, 'to').then(() => {
            geocodeCount++;
            if (geocodeCount === geocodeNeeded) calculateRoutes();
        });
    }
    
    // If all coords already exist, calculate immediately
    if (geocodeNeeded === 0) {
        console.log('All coords exist, calculating...');
        calculateRoutes();
    }
}

// Geocode address to get coordinates
function geocodeAddress(address, type) {
    return new Promise((resolve, reject) => {
        if (!google || !google.maps || !google.maps.Geocoder) {
            console.error('Google Maps Geocoder not available');
            reject('Geocoder not available');
            return;
        }
        
        console.log(`Geocoding ${type}: ${address}`);
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: address, region: 'za' }, function(results, status) {
            console.log(`Geocode ${type} status:`, status);
            
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const coords = {
                    lat: location.lat(),
                    lon: location.lng()
                };
                
                console.log(`Geocoded ${type}:`, coords);
                
                if (type === 'from') {
                    fromCoords = coords;
                } else if (type === 'to') {
                    toCoords = coords;
                } else if (type === 'workshop') {
                    workshopCoords = coords;
                }
                
                resolve(coords);
            } else {
                console.error(`Geocoding ${type} failed:`, status);
                if (status === 'REQUEST_DENIED') {
                    alert('Geocoding API not enabled. Please enable "Geocoding API" in Google Cloud Console.');
                }
                reject(status);
            }
        });
    });
}

// Toggle route type
function toggleRouteType() {
    const routeType = document.querySelector('input[name="routeType"]:checked').value;
    isWorkshopRoute = (routeType === 'workshop');
    
    const workshopSection = document.getElementById('workshopSection');
    const simpleDistance = document.getElementById('simpleDistance');
    const workshopDistance = document.getElementById('workshopDistance');
    
    if (isWorkshopRoute) {
        workshopSection.style.display = 'block';
        simpleDistance.style.display = 'none';
        workshopDistance.style.display = 'block';
    } else {
        workshopSection.style.display = 'none';
        simpleDistance.style.display = 'block';
        workshopDistance.style.display = 'none';
    }
    
    calculateRoutes();
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
            } else if (type === 'to') {
                document.getElementById('toLocation').value = locationString;
                toCoords = { lat, lon };
            } else if (type === 'workshop') {
                document.getElementById('workshopLocation').value = locationString;
                workshopCoords = { lat, lon };
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
    if (isManualDistance) {
        return; // Skip if manual mode
    }

    if (isWorkshopRoute) {
        calculateWorkshopRoute();
    } else {
        calculateSimpleRoute();
    }
}

// Calculate simple route (pickup to delivery)
function calculateSimpleRoute() {
    if (!fromCoords || !toCoords) {
        return;
    }

    if (!directionsService) {
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
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            currentRoutes = result.routes;
            displayRouteOptions(result.routes);
            selectRoute(0);
        } else {
            const distance = calculateDistance();
            updateDistanceDisplay(distance);
            calculateAll();
        }
    });
}

// Calculate workshop route (workshop → pickup → delivery → workshop)
function calculateWorkshopRoute() {
    if (!workshopCoords || !fromCoords || !toCoords) {
        return;
    }

    if (!directionsService) {
        // Fallback to straight-line calculations
        const dist1 = calculateDistanceBetween(workshopCoords, fromCoords);
        const dist2 = calculateDistanceBetween(fromCoords, toCoords);
        const dist3 = calculateDistanceBetween(toCoords, workshopCoords);
        const total = dist1 + dist2 + dist3;
        
        updateWorkshopDistanceDisplay(dist1, dist2, dist3, total);
        calculateAll();
        return;
    }

    // Calculate workshop to pickup
    const workshop = new google.maps.LatLng(workshopCoords.lat, workshopCoords.lon);
    const pickup = new google.maps.LatLng(fromCoords.lat, fromCoords.lon);
    const delivery = new google.maps.LatLng(toCoords.lat, toCoords.lon);

    // Multi-leg route
    const request = {
        origin: workshop,
        destination: workshop,
        waypoints: [
            { location: pickup, stopover: true },
            { location: delivery, stopover: true }
        ],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            const route = result.routes[0];
            const legs = route.legs;
            
            const dist1 = legs[0].distance.value / 1000; // Workshop to pickup
            const dist2 = legs[1].distance.value / 1000; // Pickup to delivery
            const dist3 = legs[2].distance.value / 1000; // Delivery to workshop
            const total = dist1 + dist2 + dist3;
            
            updateWorkshopDistanceDisplay(dist1, dist2, dist3, total);
            
            // Display route on map
            directionsRenderer.setDirections(result);
            
            calculateAll();
        } else {
            console.error('Workshop route failed:', status);
            const dist1 = calculateDistanceBetween(workshopCoords, fromCoords);
            const dist2 = calculateDistanceBetween(fromCoords, toCoords);
            const dist3 = calculateDistanceBetween(toCoords, workshopCoords);
            const total = dist1 + dist2 + dist3;
            
            updateWorkshopDistanceDisplay(dist1, dist2, dist3, total);
            calculateAll();
        }
    });
}

// Calculate distance between two points
function calculateDistanceBetween(coords1, coords2) {
    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Update workshop distance display
function updateWorkshopDistanceDisplay(dist1, dist2, dist3, total) {
    document.getElementById('workshopToPickup').textContent = `${dist1.toFixed(2)} km`;
    document.getElementById('pickupToDelivery').textContent = `${dist2.toFixed(2)} km`;
    document.getElementById('returnToWorkshop').textContent = `${dist3.toFixed(2)} km`;
    document.getElementById('totalDistance').textContent = `${total.toFixed(2)} km`;
    document.getElementById('distanceValue').textContent = total.toFixed(2);
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
        
        // Better route naming
        let routeName = route.summary || `Route ${index + 1}`;
        if (routes.length === 1) {
            routeName = '🛣️ Recommended Route';
        } else if (index === 0) {
            routeName = '⚡ Fastest Route';
        } else if (route.summary.includes('avoid')) {
            routeName = '🌳 Alternative Route (No Highways)';
        }
        
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        routeCard.innerHTML = `
            <input type="radio" name="route" id="route${index}" value="${index}" ${index === 0 ? 'checked' : ''} onchange="selectRoute(${index})">
            <label for="route${index}">
                <div class="route-name">${routeName}</div>
                <div class="route-summary">${route.summary}</div>
                <div class="route-details">
                    <span>📏 ${distance} km</span>
                    <span>⏱️ ${duration}</span>
                </div>
            </label>
        `;
        routeOptions.appendChild(routeCard);
    });
    
    // Add helpful message if only one route
    if (routes.length === 1) {
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 6px; font-size: 13px; color: #856404;';
        infoDiv.innerHTML = '💡 Only one practical route available for this journey.';
        routeOptions.appendChild(infoDiv);
    }
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
    if (isWorkshopRoute && workshopCoords && fromCoords && toCoords) {
        // Calculate total workshop route distance
        const dist1 = calculateDistanceBetween(workshopCoords, fromCoords);
        const dist2 = calculateDistanceBetween(fromCoords, toCoords);
        const dist3 = calculateDistanceBetween(toCoords, workshopCoords);
        return dist1 + dist2 + dist3;
    } else if (fromCoords && toCoords) {
        // Simple route
        return calculateDistanceBetween(fromCoords, toCoords);
    }
    return 0;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Toggle fuel calculation method
function toggleFuelMethod() {
    const method = document.getElementById('fuelMethod').value;
    
    // Hide all method sections
    document.getElementById('consumptionMethod').style.display = 'none';
    document.getElementById('fixedMethod').style.display = 'none';
    document.getElementById('percentageMethod').style.display = 'none';
    document.getElementById('manualMethod').style.display = 'none';
    
    // Show selected method
    if (method === 'consumption') {
        document.getElementById('consumptionMethod').style.display = 'block';
    } else if (method === 'fixed') {
        document.getElementById('fixedMethod').style.display = 'block';
    } else if (method === 'percentage') {
        document.getElementById('percentageMethod').style.display = 'block';
    } else if (method === 'manual') {
        document.getElementById('manualMethod').style.display = 'block';
    }
    
    updatePricing();
}

// Update vehicle consumption based on type
function updateVehicleConsumption() {
    const vehicleType = document.getElementById('vehicleType').value;
    const consumptionInput = document.getElementById('fuelConsumption');
    
    const consumptionRates = {
        'light-truck': 12,
        'medium-truck': 15,
        'heavy-truck': 20,
        'flatbed': 18,
        'recovery': 22,
        'super-heavy': 28
    };
    
    if (vehicleType !== 'custom' && consumptionRates[vehicleType]) {
        consumptionInput.value = consumptionRates[vehicleType];
        // Keep it editable but highlight it's a preset
        consumptionInput.readOnly = false;
        consumptionInput.style.background = '#fff9e6';
        consumptionInput.style.borderColor = '#ffc107';
    } else {
        consumptionInput.readOnly = false;
        consumptionInput.style.background = '#fafafa';
        consumptionInput.style.borderColor = '#e0e0e0';
    }
    
    updatePricing();
}

// Calculate pricing
function calculatePricing(distance) {
    const baseRate = parseFloat(document.getElementById('baseRate').value) || 0;
    const perKmRate = parseFloat(document.getElementById('perKmRate').value) || 0;
    const serviceMultiplier = parseFloat(document.getElementById('serviceType').value) || 1;
    
    // Calculate customer price
    const distanceCost = distance * perKmRate;
    const subtotal = baseRate + distanceCost;
    const total = subtotal * serviceMultiplier;
    
    // Calculate fuel cost based on selected method
    let fuelCost = 0;
    const method = document.getElementById('fuelMethod').value;
    
    switch(method) {
        case 'consumption':
            // Detailed consumption method
            const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 0;
            const baseConsumption = parseFloat(document.getElementById('fuelConsumption').value) || 0;
            const loadFactor = parseFloat(document.getElementById('loadFactor').value) || 1;
            const terrainFactor = parseFloat(document.getElementById('terrainFactor').value) || 1;
            const includeIdling = document.getElementById('includeIdling').checked;
            
            // Calculate base fuel cost
            const baseFuel = (distance * baseConsumption / 100) * fuelPrice;
            
            // Apply load factor
            const withLoad = baseFuel * loadFactor;
            const loadAdj = withLoad - baseFuel;
            
            // Apply terrain factor
            const withTerrain = withLoad * terrainFactor;
            const terrainAdj = withTerrain - withLoad;
            
            // Apply idling if checked
            let idlingCost = 0;
            if (includeIdling) {
                idlingCost = withTerrain * 0.10;
                document.getElementById('idlingCostRow').style.display = 'flex';
            } else {
                document.getElementById('idlingCostRow').style.display = 'none';
            }
            
            fuelCost = withTerrain + idlingCost;
            
            // Update breakdown
            document.getElementById('baseFuelCost').textContent = `R ${baseFuel.toFixed(2)}`;
            document.getElementById('loadAdjustment').textContent = `R ${loadAdj.toFixed(2)}`;
            document.getElementById('terrainAdjustment').textContent = `R ${terrainAdj.toFixed(2)}`;
            document.getElementById('idlingCost').textContent = `R ${idlingCost.toFixed(2)}`;
            break;
            
        case 'fixed':
            // Fixed cost per km with return trip option
            const fixedCostPerKm = parseFloat(document.getElementById('fixedCostPerKm').value) || 0;
            const returnTrip = parseFloat(document.getElementById('returnTrip').value) || 1;
            fuelCost = distance * fixedCostPerKm * returnTrip;
            break;
            
        case 'percentage':
            // Percentage of revenue with other costs
            const fuelPercentage = parseFloat(document.getElementById('fuelPercentage').value) || 0;
            const otherCostsPercent = parseFloat(document.getElementById('otherCosts').value) || 0;
            
            const fuelOnly = total * (fuelPercentage / 100);
            const otherCostsAmount = total * (otherCostsPercent / 100);
            fuelCost = fuelOnly + otherCostsAmount;
            
            // Update breakdown
            document.getElementById('percentageFuelCost').textContent = `R ${fuelOnly.toFixed(2)}`;
            if (otherCostsPercent > 0) {
                document.getElementById('otherCostsRow').style.display = 'flex';
                document.getElementById('otherCostsAmount').textContent = `R ${otherCostsAmount.toFixed(2)}`;
            } else {
                document.getElementById('otherCostsRow').style.display = 'none';
            }
            break;
            
        case 'manual':
            // Manual entry with buffer
            const manualCost = parseFloat(document.getElementById('manualFuelCost').value) || 0;
            const buffer = parseFloat(document.getElementById('fuelBuffer').value) || 0;
            fuelCost = manualCost * (1 + buffer / 100);
            break;
    }
    
    // Calculate profit
    const profit = total - fuelCost;
    
    return {
        baseRate,
        perKmRate,
        distanceCost,
        serviceMultiplier,
        total,
        fuelCost,
        profit
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
    
    // Update fuel cost
    document.getElementById('fuelCost').textContent = `R ${pricing.fuelCost.toFixed(2)}`;
    document.getElementById('fuelCostDisplay').textContent = `R ${pricing.fuelCost.toFixed(2)}`;
    
    // Update profit
    document.getElementById('profitDisplay').textContent = `R ${pricing.profit.toFixed(2)}`;
    
    // Color code profit
    const profitElement = document.getElementById('profitDisplay');
    if (pricing.profit < 0) {
        profitElement.style.color = '#dc3545';
    } else if (pricing.profit < 100) {
        profitElement.style.color = '#ffc107';
    } else {
        profitElement.style.color = '#28a745';
    }
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
    document.getElementById('vehicleType').addEventListener('change', updateVehicleConsumption);
    document.getElementById('fuelPrice').addEventListener('input', updatePricing);
    document.getElementById('fuelConsumption').addEventListener('input', updatePricing);
    document.getElementById('loadFactor').addEventListener('change', updatePricing);
    document.getElementById('terrainFactor').addEventListener('change', updatePricing);
    document.getElementById('includeIdling').addEventListener('change', updatePricing);
    document.getElementById('fixedCostPerKm').addEventListener('input', updatePricing);
    document.getElementById('returnTrip').addEventListener('change', updatePricing);
    document.getElementById('fuelPercentage').addEventListener('input', updatePricing);
    document.getElementById('otherCosts').addEventListener('change', updatePricing);
    document.getElementById('manualFuelCost').addEventListener('input', updatePricing);
    document.getElementById('fuelBuffer').addEventListener('change', updatePricing);
    
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
    
    document.getElementById('workshopLocation').addEventListener('change', function() {
        const coords = parseCoordinates(this.value);
        if (coords) {
            workshopCoords = coords;
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
    const fuelCost = document.getElementById('fuelCostDisplay').textContent;
    const profit = document.getElementById('profitDisplay').textContent;
    const from = document.getElementById('fromLocation').value;
    const to = document.getElementById('toLocation').value;
    
    const message = `MH TOWING - Quote\n\nFrom: ${from}\nTo: ${to}\nDistance: ${distance.toFixed(2)} km\n\nCustomer Price: ${total}\nFuel Cost: ${fuelCost}\nProfit: ${profit}\n\nContact: 061 453 2160`;
    
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
