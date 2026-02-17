// Enhanced Results Display with Editable Base Cost

function displayResultsEnhanced(result, isYardRoute = false) {
    let distance = 0;
    let duration = '';
    let yardRouteLegs = [];
    
    if (isYardRoute) {
        // Sum all legs for yard route: Yard → Pickup → Drop-off → Yard
        result.routes[0].legs.forEach((leg, index) => {
            const legDistance = leg.distance.value / 1000; // km
            distance += legDistance;
            
            // Store leg details for breakdown display
            yardRouteLegs.push({
                from: leg.start_address,
                to: leg.end_address,
                distance: legDistance,
                duration: leg.duration.text
            });
        });
        duration = result.routes[0].legs.reduce((total, leg) => {
            return total + leg.duration.value;
        }, 0);
        duration = Math.round(duration / 60) + ' mins';
    } else {
        const route = result.routes[0].legs[0];
        distance = route.distance.value / 1000; // km
        duration = route.duration.text;
        
        const includeReturn = document.getElementById('returnTrip').checked;
        if (includeReturn) {
            distance *= 2;
        }
    }
    
    const oneWayDistance = distance / (isYardRoute ? 1 : (document.getElementById('returnTrip').checked ? 2 : 1));
    
    // Get vehicle details
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const ratePerKm = vehicle.rate;
    const vehicleName = vehicle.name;
    const vehicleConsumption = vehicle.consumption || 10;
    const callOutFee = vehicle.callOutFee || 0;
    
    // Base cost (editable)
    let baseCost = distance * ratePerKm;
    
    // Call-out fee
    const callOutCost = callOutFee;
    
    // Time surcharge
    const timeSurcharge = parseInt(document.getElementById('timeSurcharge').value);
    const surchargeAmount = (baseCost * timeSurcharge) / 100;
    
    // Winching
    let winchingCost = 0;
    let winchingDetails = '';
    if (document.getElementById('winchingEnabled').checked) {
        winchingCost = calculateWinchingCost();
        const hours = parseFloat(document.getElementById('winchDuration').value);
        const rate = parseFloat(document.getElementById('winchRate').value);
        const difficulty = parseFloat(document.getElementById('winchDifficulty').value);
        const difficultyText = difficulty === 1 ? 'Easy' : difficulty === 1.5 ? 'Medium' : difficulty === 2 ? 'Hard' : 'Extreme';
        winchingDetails = `${hours} hr × R${rate}/hr × ${difficultyText}`;
    }
    
    // Prep to Tow
    let prepToTowCost = 0;
    let prepToTowDetails = [];
    if (document.getElementById('prepToTowEnabled').checked) {
        prepToTowCost = calculatePrepToTowCost();
        if (document.getElementById('useUnderlift').checked) {
            const fee = parseFloat(document.getElementById('underliftFee').value);
            prepToTowDetails.push(`Underlift: R${fee}`);
        }
        if (document.getElementById('removePropshaft').checked) {
            const fee = parseFloat(document.getElementById('propshaftFee').value);
            prepToTowDetails.push(`Propshaft Removal: R${fee}`);
        }
        if (document.getElementById('releaseBrakes').checked) {
            const fee = parseFloat(document.getElementById('brakesFee').value);
            prepToTowDetails.push(`Brake Release: R${fee}`);
        }
    }
    
    // Additional charges
    let additionalTotal = 0;
    let additionalChargesHTML = '';
    document.querySelectorAll('.charge-item').forEach(item => {
        const desc = item.querySelector('.charge-desc').value;
        const amount = parseFloat(item.querySelector('.charge-amount').value) || 0;
        additionalTotal += amount;
        if (desc && amount > 0) {
            additionalChargesHTML += `
                <div class="result-sub-item">
                    <span>• ${desc}</span>
                    <span>R ${amount.toFixed(2)}</span>
                </div>
            `;
        }
    });
    
    // Subtotal
    let subtotal = baseCost + callOutCost + surchargeAmount + winchingCost + prepToTowCost + additionalTotal;
    
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
    
    // Fuel calculations
    const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 24.50;
    const fuelUsed = (vehicleConsumption * distance) / 100;
    const fuelCost = fuelUsed * fuelPrice;
    const profit = total - fuelCost;
    const profitMargin = total > 0 ? ((profit / total) * 100).toFixed(1) : 0;
    
    // Build enhanced HTML
    const includeReturn = document.getElementById('returnTrip').checked;
    
    // Build yard route breakdown HTML if applicable
    let yardRouteBreakdownHTML = '';
    if (isYardRoute && yardRouteLegs.length > 0) {
        yardRouteBreakdownHTML = `
            <div class="results-section yard-route-breakdown">
                <h4 class="section-title">🏠 Yard Route Breakdown</h4>
                ${yardRouteLegs.map((leg, index) => {
                    const legNumber = index + 1;
                    const legLabel = index === 0 ? 'Yard to Pickup' : 
                                    index === 1 ? 'Pickup to Drop-off' : 
                                    'Drop-off to Yard';
                    return `
                        <div class="result-item">
                            <span><strong>Leg ${legNumber}:</strong> ${legLabel}</span>
                            <span class="result-value">${leg.distance.toFixed(2)} km</span>
                        </div>
                        <div class="result-sub-item">
                            <span style="font-size: 0.85em; color: var(--text-secondary);">📍 ${leg.from.length > 50 ? leg.from.substring(0, 50) + '...' : leg.from}</span>
                            <span></span>
                        </div>
                        <div class="result-sub-item">
                            <span style="font-size: 0.85em; color: var(--text-secondary);">📍 ${leg.to.length > 50 ? leg.to.substring(0, 50) + '...' : leg.to}</span>
                            <span style="font-size: 0.85em; color: var(--text-secondary);">${leg.duration}</span>
                        </div>
                    `;
                }).join('')}
                <div class="result-divider"></div>
                <div class="result-item highlight">
                    <span><strong>Total Route Distance</strong></span>
                    <span class="result-value"><strong>${distance.toFixed(2)} km</strong></span>
                </div>
            </div>
        `;
    }
    
    let html = `
        <div class="results-header">
            <h3>📊 Detailed Calculation Summary</h3>
            <button class="icon-btn" onclick="toggleResultsEdit()" title="Edit Base Cost">
                <span>✏️</span>
            </button>
        </div>
        
        ${yardRouteBreakdownHTML}
        
        <!-- Trip Details -->
        <div class="results-section">
            <h4 class="section-title">🚗 Trip Details</h4>
            <div class="result-item">
                <span>Vehicle</span>
                <span class="result-value">${vehicleName}</span>
            </div>
            ${!isYardRoute ? `
            <div class="result-item">
                <span>One-Way Distance</span>
                <span class="result-value">${oneWayDistance.toFixed(2)} km</span>
            </div>
            ${includeReturn ? `
            <div class="result-item">
                <span>Return Trip</span>
                <span class="result-value">${oneWayDistance.toFixed(2)} km</span>
            </div>
            ` : ''}
            ` : ''}
            <div class="result-item highlight">
                <span><strong>Total Distance</strong></span>
                <span class="result-value" id="totalDistanceValue" data-distance="${distance.toFixed(2)}"><strong>${distance.toFixed(2)} km</strong></span>
            </div>
            <div class="result-item">
                <span>Estimated Duration</span>
                <span class="result-value">${duration}</span>
            </div>
        </div>
        
        <!-- Cost Breakdown -->
        <div class="results-section">
            <h4 class="section-title">💰 Cost Breakdown</h4>
            <div class="result-item editable-item">
                <span>Base Towing Cost</span>
                <div class="editable-value">
                    <span class="display-value">R ${baseCost.toFixed(2)}</span>
                    <input type="number" class="edit-value" id="editBaseCost" value="${baseCost.toFixed(2)}" step="10" style="display: none;" onchange="recalculateFromBase()">
                </div>
            </div>
            <div class="result-sub-item">
                <span>• ${distance.toFixed(2)} km × R${ratePerKm}/km</span>
                <span></span>
            </div>
            
            ${callOutCost > 0 ? `
            <div class="result-item">
                <span>Call-Out Fee</span>
                <span class="result-value">R ${callOutCost.toFixed(2)}</span>
            </div>
            <div class="result-sub-item">
                <span>• Fixed dispatch fee</span>
                <span></span>
            </div>
            ` : ''}
            
            ${timeSurcharge > 0 ? `
            <div class="result-item">
                <span>Time Surcharge</span>
                <span class="result-value">R ${surchargeAmount.toFixed(2)}</span>
            </div>
            <div class="result-sub-item">
                <span>• +${timeSurcharge}% ${getTimeSurchargeLabel(timeSurcharge)}</span>
                <span></span>
            </div>
            ` : ''}
            
            ${winchingCost > 0 ? `
            <div class="result-item">
                <span>Winching Service</span>
                <span class="result-value">R ${winchingCost.toFixed(2)}</span>
            </div>
            <div class="result-sub-item">
                <span>• ${winchingDetails}</span>
                <span></span>
            </div>
            ` : ''}
            
            ${prepToTowCost > 0 ? `
            <div class="result-item">
                <span>Prep to Tow</span>
                <span class="result-value">R ${prepToTowCost.toFixed(2)}</span>
            </div>
            ${prepToTowDetails.map(detail => `
                <div class="result-sub-item">
                    <span>• ${detail}</span>
                    <span></span>
                </div>
            `).join('')}
            ` : ''}
            
            ${additionalTotal > 0 ? `
            <div class="result-item">
                <span>Additional Charges</span>
                <span class="result-value">R ${additionalTotal.toFixed(2)}</span>
            </div>
            ${additionalChargesHTML}
            ` : ''}
            
            <div class="result-divider"></div>
            
            <div class="result-item highlight">
                <span><strong>Subtotal</strong></span>
                <span class="result-value"><strong>R ${subtotal.toFixed(2)}</strong></span>
            </div>
            
            ${discount > 0 ? `
            <div class="result-item discount">
                <span>Discount</span>
                <span class="result-value">-R ${discount.toFixed(2)}</span>
            </div>
            <div class="result-sub-item">
                <span>• ${discountType === 'percent' ? discountAmount + '%' : 'R' + discountAmount} off</span>
                <span></span>
            </div>
            ` : ''}
        </div>
        
        <!-- Fuel Analysis -->
        <div class="results-section fuel-section">
            <h4 class="section-title">⛽ Fuel Cost Analysis</h4>
            <div class="result-item">
                <span>Vehicle Consumption</span>
                <span class="result-value">${vehicleConsumption} km/L</span>
            </div>
            <div class="result-item">
                <span>Fuel Required</span>
                <span class="result-value">${fuelUsed.toFixed(2)} L</span>
            </div>
            <div class="result-item">
                <span>Fuel Price</span>
                <span class="result-value">R ${fuelPrice.toFixed(2)}/L</span>
            </div>
            <div class="result-item highlight">
                <span><strong>Fuel Cost</strong></span>
                <span class="result-value fuel-cost"><strong>R ${fuelCost.toFixed(2)}</strong></span>
            </div>
        </div>
        
        <!-- Profit Analysis -->
        <div class="results-section profit-section">
            <h4 class="section-title">📈 Profit Analysis</h4>
            <div class="result-item">
                <span>Total Revenue</span>
                <span class="result-value">R ${total.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span>Fuel Cost</span>
                <span class="result-value fuel-cost">-R ${fuelCost.toFixed(2)}</span>
            </div>
            <div class="result-divider"></div>
            <div class="result-item highlight profit-highlight">
                <span><strong>Net Profit</strong></span>
                <span class="result-value profit-value"><strong>R ${profit.toFixed(2)}</strong></span>
            </div>
            <div class="result-item">
                <span>Profit Margin</span>
                <span class="result-value">${profitMargin}%</span>
            </div>
        </div>
        
        <!-- Total -->
        <div class="total-box">
            <h3>Total Amount</h3>
            <div class="total-amount-large">R ${total.toFixed(2)}</div>
            <div class="total-subtitle">Customer Pays</div>
        </div>
    `;
    
    document.getElementById('results').innerHTML = html;
    document.getElementById('results').classList.remove('hidden');
    
    // Update fuel cost display if enabled
    if (document.getElementById('fuelCostEnabled')) {
        updateFuelCost();
    }
    
    // Save to history
    saveToHistory({
        startLocation: document.getElementById('startInput').value,
        endLocation: document.getElementById('endInput').value,
        distance: distance,
        total: total,
        profit: profit,
        vehicle: vehicleName
    });
}

function getTimeSurchargeLabel(percentage) {
    switch(percentage) {
        case 25: return '(After Hours)';
        case 50: return '(Weekend)';
        case 75: return '(Holiday)';
        case 100: return '(Emergency)';
        default: return '';
    }
}

function toggleResultsEdit() {
    const displayValue = document.querySelector('.display-value');
    const editValue = document.querySelector('.edit-value');
    
    if (displayValue.style.display === 'none') {
        displayValue.style.display = 'inline';
        editValue.style.display = 'none';
    } else {
        displayValue.style.display = 'none';
        editValue.style.display = 'inline';
        editValue.focus();
        editValue.select();
    }
}

function recalculateFromBase() {
    const newBaseCost = parseFloat(document.getElementById('editBaseCost').value);
    
    // Get all other values
    const timeSurcharge = parseInt(document.getElementById('timeSurcharge').value);
    const surchargeAmount = (newBaseCost * timeSurcharge) / 100;
    
    let winchingCost = 0;
    if (document.getElementById('winchingEnabled').checked) {
        winchingCost = calculateWinchingCost();
    }
    
    let additionalTotal = 0;
    document.querySelectorAll('.charge-item').forEach(item => {
        const amount = parseFloat(item.querySelector('.charge-amount').value) || 0;
        additionalTotal += amount;
    });
    
    const subtotal = newBaseCost + surchargeAmount + winchingCost + additionalTotal;
    
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    let discount = 0;
    if (discountType === 'percent') {
        discount = (subtotal * discountAmount) / 100;
    } else {
        discount = discountAmount;
    }
    
    const total = subtotal - discount;
    
    // Update display
    document.querySelector('.display-value').textContent = `R ${newBaseCost.toFixed(2)}`;
    document.querySelector('.total-amount-large').textContent = `R ${total.toFixed(2)}`;
    
    // Recalculate profit
    const vehicles = JSON.parse(localStorage.getItem('vehicles')) || defaultVehicles;
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const vehicleConsumption = vehicle.consumption || 10;
    
    const distanceElement = document.querySelector('.result-value');
    let distance = 0;
    if (distanceElement) {
        distance = parseFloat(distanceElement.textContent.replace(' km', '')) || 0;
    }
    
    const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 24.50;
    const fuelUsed = (vehicleConsumption * distance) / 100;
    const fuelCost = fuelUsed * fuelPrice;
    const profit = total - fuelCost;
    const profitMargin = total > 0 ? ((profit / total) * 100).toFixed(1) : 0;
    
    // Update profit display
    document.querySelector('.profit-value strong').textContent = `R ${profit.toFixed(2)}`;
    
    toggleResultsEdit();
}
