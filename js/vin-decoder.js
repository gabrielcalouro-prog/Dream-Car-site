/**
 * VIN Decoder using NHTSA API
 * Free VIN decoding service from the National Highway Traffic Safety Administration
 */

class VINDecoder {
    constructor() {
        this.apiBase = 'https://vpic.nhtsa.dot.gov/api/vehicles';
        this.vinInput = null;
        this.decodeButton = null;
        this.resultContainer = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.vinInput = document.getElementById('vin-input');
        this.decodeButton = document.getElementById('decode-vin');
        
        if (!this.vinInput || !this.decodeButton) {
            console.warn('VIN elements not found on this page');
            return;
        }

        // Create result container if it doesn't exist
        this.createResultContainer();

        // VIN input validation
        this.vinInput.addEventListener('input', (e) => this.handleVinInput(e));
        
        // Decode button click
        this.decodeButton.addEventListener('click', (e) => this.handleDecode(e));
        
        // Enter key support
        this.vinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.isValidVin(this.vinInput.value)) {
                this.handleDecode(e);
            }
        });
    }

    createResultContainer() {
        const existingContainer = document.getElementById('vin-results');
        if (existingContainer) {
            this.resultContainer = existingContainer;
            return;
        }

        // Create new result container
        this.resultContainer = document.createElement('div');
        this.resultContainer.id = 'vin-results';
        this.resultContainer.className = 'vin-results';
        
        // Insert after the decode button
        this.decodeButton.parentNode.insertBefore(this.resultContainer, this.decodeButton.nextSibling);
    }

    handleVinInput(e) {
        const vin = e.target.value.toUpperCase();
        e.target.value = vin;
        
        // Update character counter
        const counter = document.getElementById('vin-counter');
        if (counter) {
            counter.textContent = vin.length;
        }
        
        // Enable/disable decode button
        const isValid = this.isValidVin(vin);
        this.decodeButton.disabled = !isValid;
        this.decodeButton.classList.toggle('btn-primary', isValid);
        this.decodeButton.classList.toggle('btn-secondary', !isValid);
        
        // Clear previous results
        if (this.resultContainer) {
            this.resultContainer.innerHTML = '';
        }
    }

    isValidVin(vin) {
        // Basic VIN validation
        if (vin.length !== 17) return false;
        
        // Check for invalid characters (I, O, Q not allowed)
        if (/[IOQ]/.test(vin)) return false;
        
        // Check for valid characters (alphanumeric minus I, O, Q)
        if (!/^[0-9A-HJ-NPR-Z]{17}$/.test(vin)) return false;
        
        return this.validateVinChecksum(vin);
    }

    validateVinChecksum(vin) {
        // VIN check digit validation (position 9)
        const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
        const values = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
            'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
        };
        
        let sum = 0;
        for (let i = 0; i < 17; i++) {
            const char = vin[i];
            const value = isNaN(char) ? values[char] : parseInt(char);
            sum += value * weights[i];
        }
        
        const checkDigit = sum % 11;
        const expectedCheck = checkDigit === 10 ? 'X' : checkDigit.toString();
        
        return vin[8] === expectedCheck;
    }

    async handleDecode(e) {
        e.preventDefault();
        
        const vin = this.vinInput.value.trim().toUpperCase();
        
        if (!this.isValidVin(vin)) {
            this.showError('Please enter a valid 17-character VIN');
            return;
        }

        try {
            this.showLoading();
            const vehicleInfo = await this.decodeVin(vin);
            this.displayResults(vehicleInfo);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async decodeVin(vin) {
        const url = `${this.apiBase}/DecodeVin/${vin}?format=json`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.Message && data.Message.includes('error')) {
                throw new Error('Invalid VIN or API error');
            }
            
            return this.parseVehicleData(data.Results);
            
        } catch (error) {
            console.error('VIN API Error:', error);
            throw new Error('Unable to decode VIN. Please try again.');
        }
    }

    parseVehicleData(results) {
        const vehicleInfo = {};
        
        // Map NHTSA result fields to our format
        const fieldMap = {
            'Make': 'make',
            'Model': 'model',
            'Model Year': 'year',
            'Vehicle Type': 'type',
            'Body Class': 'bodyStyle',
            'Engine Number of Cylinders': 'cylinders',
            'Displacement (L)': 'displacement',
            'Fuel Type - Primary': 'fuelType',
            'Drive Type': 'driveType',
            'Transmission Style': 'transmission',
            'Plant City': 'plantCity',
            'Plant Country': 'plantCountry',
            'Series': 'series',
            'Trim': 'trim',
            'Engine Configuration': 'engineConfig',
            'Engine HP (From)': 'horsepowerFrom',
            'Engine HP (To)': 'horsepowerTo'
        };
        
        results.forEach(result => {
            const field = fieldMap[result.Variable];
            if (field && result.Value && result.Value !== 'Not Applicable' && result.Value !== '') {
                vehicleInfo[field] = result.Value;
            }
        });
        
        return vehicleInfo;
    }

    showLoading() {
        this.resultContainer.innerHTML = `
            <div class="vin-loading">
                <div class="loading-spinner"></div>
                <p>Decoding VIN...</p>
            </div>
        `;
    }

    showError(message) {
        this.resultContainer.innerHTML = `
            <div class="vin-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    displayResults(vehicleInfo) {
        // Store for later use
        this.lastDecodedData = vehicleInfo;
        
        const displayName = this.getDisplayName(vehicleInfo);
        
        this.resultContainer.innerHTML = `
            <div class="vin-success">
                <div class="vehicle-header">
                    <i class="fas fa-car"></i>
                    <h3>${displayName}</h3>
                </div>
                
                <div class="vehicle-details">
                    ${this.renderDetailRows(vehicleInfo)}
                </div>
                
                <div class="vin-actions">
                    <button class="btn btn-primary btn-continue" onclick="vinDecoder.continueWithVehicle()">
                        <i class="fas fa-arrow-right"></i>
                        Continue with this vehicle
                    </button>
                </div>
            </div>
        `;
    }

    getDisplayName(vehicleInfo) {
        const { year, make, model, trim } = vehicleInfo;
        let name = '';
        
        if (year) name += year + ' ';
        if (make) name += make + ' ';
        if (model) name += model;
        if (trim) name += ' ' + trim;
        
        return name || 'Vehicle Information';
    }

    renderDetailRows(vehicleInfo) {
        const importantFields = [
            { key: 'bodyStyle', label: 'Body Style', icon: 'fas fa-car-side' },
            { key: 'type', label: 'Vehicle Type', icon: 'fas fa-tag' },
            { key: 'cylinders', label: 'Cylinders', icon: 'fas fa-cogs' },
            { key: 'displacement', label: 'Engine Size', icon: 'fas fa-tachometer-alt', suffix: 'L' },
            { key: 'fuelType', label: 'Fuel Type', icon: 'fas fa-gas-pump' },
            { key: 'driveType', label: 'Drive Type', icon: 'fas fa-road' },
            { key: 'transmission', label: 'Transmission', icon: 'fas fa-exchange-alt' }
        ];
        
        return importantFields
            .filter(field => vehicleInfo[field.key])
            .map(field => `
                <div class="detail-row">
                    <i class="${field.icon}"></i>
                    <span class="label">${field.label}:</span>
                    <span class="value">${vehicleInfo[field.key]}${field.suffix || ''}</span>
                </div>
            `).join('');
    }

    continueWithVehicle() {
        // Get the current vehicle info
        const vehicleName = this.resultContainer.querySelector('.vehicle-header h3').textContent;
        
        // Store complete vehicle data in car builder if available
        if (window.carBuilder) {
            const vehicleData = {
                displayName: vehicleName,
                vin: this.vinInput.value.toUpperCase(),
                decodedData: this.lastDecodedData || {}
            };
            window.carBuilder.setVehicleFromVin(vehicleData);
        }
        
        // Update the manual input field
        const manualInput = document.getElementById('manual-input');
        if (manualInput) {
            manualInput.value = vehicleName;
        }
        
        // Proceed to next step
        this.goToNextStep();
    }

    goToNextStep() {
        // Trigger step navigation (assumes main.js has step navigation)
        const nextButton = document.querySelector('[data-step="2"]');
        if (nextButton) {
            nextButton.click();
        } else {
            // Alternative: manually trigger step change
            const currentStep = document.querySelector('.build-step.active');
            const nextStep = document.querySelector('#step-2');
            
            if (currentStep && nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                // Update progress indicator
                const progressSteps = document.querySelectorAll('.step-indicator .step');
                progressSteps.forEach((step, index) => {
                    if (index < 2) {
                        step.classList.add('completed');
                    }
                    if (index === 1) {
                        step.classList.add('active');
                    }
                });
            }
        }
    }
}

// Initialize VIN Decoder
const vinDecoder = new VINDecoder();