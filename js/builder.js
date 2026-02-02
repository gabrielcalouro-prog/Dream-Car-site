/**
 * Dream Car Builder - Main Builder Logic
 * Handles step navigation and build configuration
 */

class CarBuilder {
    constructor() {
        this.currentStep = 1;
        this.maxStep = 4;
        this.buildData = {
            vehicle: null,
            buildType: null,
            parts: [],
            totalCost: 0
        };
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        // Step navigation buttons
        document.querySelectorAll('[data-step]').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetStep = parseInt(e.target.getAttribute('data-step'));
                this.goToStep(targetStep);
            });
        });

        // Build type selection
        document.querySelectorAll('.build-type-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectBuildType(e));
        });

        // Manual vehicle entry
        const manualInput = document.getElementById('manual-input');
        if (manualInput) {
            manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.setVehicleManually(e.target.value.trim());
                    this.goToStep(2);
                }
            });
        }

        // Initialize progress indicators
        this.updateProgressIndicator();
    }

    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.maxStep) return;
        if (stepNumber > this.currentStep + 1) return; // Can't skip steps

        // Hide current step
        const currentStepEl = document.querySelector(`.build-step.active`);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }

        // Show target step
        const targetStepEl = document.querySelector(`#step-${stepNumber}`);
        if (targetStepEl) {
            targetStepEl.classList.add('active');
        }

        this.currentStep = stepNumber;
        this.updateProgressIndicator();
        
        // Scroll to top of builder
        document.querySelector('.builder-content').scrollIntoView({ behavior: 'smooth' });
    }

    updateProgressIndicator() {
        const progressSteps = document.querySelectorAll('.step-indicator .step');
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    setVehicleFromVin(vehicleData) {
        this.buildData.vehicle = {
            source: 'vin',
            data: vehicleData
        };
        console.log('Vehicle set from VIN:', this.buildData.vehicle);
    }

    setVehicleManually(vehicleString) {
        this.buildData.vehicle = {
            source: 'manual',
            data: { description: vehicleString }
        };
        console.log('Vehicle set manually:', this.buildData.vehicle);
    }

    selectBuildType(e) {
        // Remove previous selection
        document.querySelectorAll('.build-type-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select current card
        const card = e.currentTarget;
        card.classList.add('selected');

        // Get build type data
        const buildType = {
            type: card.getAttribute('data-build-type') || card.querySelector('h3').textContent,
            description: card.querySelector('p').textContent,
            categories: Array.from(card.querySelectorAll('.categories span')).map(span => span.textContent)
        };

        this.buildData.buildType = buildType;
        console.log('Build type selected:', buildType);

        // Auto-advance after short delay
        setTimeout(() => {
            this.goToStep(3);
        }, 800);
    }

    updateBuildCost() {
        const total = this.buildData.parts.reduce((sum, part) => sum + (part.price || 0), 0);
        this.buildData.totalCost = total;
        
        const costDisplay = document.querySelector('.estimated-total');
        if (costDisplay) {
            costDisplay.textContent = `$${total.toLocaleString()}`;
        }
    }

    addPart(part) {
        this.buildData.parts.push(part);
        this.updateBuildCost();
        console.log('Part added:', part);
    }

    removePart(partId) {
        this.buildData.parts = this.buildData.parts.filter(part => part.id !== partId);
        this.updateBuildCost();
        console.log('Part removed:', partId);
    }

    getBuildSummary() {
        return {
            vehicle: this.buildData.vehicle,
            buildType: this.buildData.buildType,
            parts: this.buildData.parts,
            totalCost: this.buildData.totalCost,
            generatedAt: new Date().toISOString()
        };
    }

    exportBuild() {
        const summary = this.getBuildSummary();
        const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dream-car-build-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    shareBuild() {
        if (navigator.share) {
            const summary = this.getBuildSummary();
            navigator.share({
                title: 'My Dream Car Build',
                text: `Check out my dream car build: ${summary.vehicle?.data?.description || 'Custom Vehicle'}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            const summary = this.getBuildSummary();
            const text = `My Dream Car Build:\nVehicle: ${summary.vehicle?.data?.description || 'Custom Vehicle'}\nBuild Type: ${summary.buildType?.type || 'Custom'}\nTotal Cost: $${summary.totalCost.toLocaleString()}`;
            navigator.clipboard.writeText(text).then(() => {
                alert('Build summary copied to clipboard!');
            });
        }
    }
}

// Initialize Car Builder
const carBuilder = new CarBuilder();

// Make it globally available for VIN decoder integration
window.carBuilder = carBuilder;