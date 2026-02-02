/**
 * Affiliate Integration Helper
 * Automatically integrates Amazon affiliate recommendations into existing pages
 */

class AffiliateIntegration {
    constructor() {
        this.integrationPoints = {
            builder: {
                selector: '.build-step',
                position: 'append',
                context: 'builder'
            },
            gallery: {
                selector: '.gallery-section',
                position: 'append',
                context: 'gallery'
            },
            homepage: {
                selector: '.features-section',
                position: 'after',
                context: 'homepage'
            }
        };
        
        this.currentContext = this.detectPageContext();
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.integrateRecommendations());
        } else {
            this.integrateRecommendations();
        }
        
        this.bindContextualEvents();
    }

    detectPageContext() {
        const path = window.location.pathname;
        const body = document.body;
        
        if (path.includes('builder') || body.classList.contains('builder-page')) {
            return 'builder';
        } else if (path.includes('gallery') || body.classList.contains('gallery-page')) {
            return 'gallery';
        } else if (path === '/' || path.includes('index') || body.classList.contains('homepage')) {
            return 'homepage';
        }
        
        return 'general';
    }

    integrateRecommendations() {
        const integration = this.integrationPoints[this.currentContext];
        
        if (!integration) {
            return this.addGeneralRecommendations();
        }
        
        this.addContextualRecommendations(integration);
    }

    addContextualRecommendations(integration) {
        const targets = document.querySelectorAll(integration.selector);
        
        targets.forEach((target, index) => {
            const container = this.createRecommendationContainer(`${integration.context}-${index}`);
            
            if (integration.position === 'append') {
                target.appendChild(container);
            } else if (integration.position === 'after') {
                target.parentNode.insertBefore(container, target.nextSibling);
            } else if (integration.position === 'before') {
                target.parentNode.insertBefore(container, target);
            }
            
            // Add recommendations based on context
            this.populateRecommendations(container, integration.context);
        });
    }

    addGeneralRecommendations() {
        // Find a suitable container for general recommendations
        const mainContent = document.querySelector('main') || 
                           document.querySelector('.content') || 
                           document.querySelector('.container');
        
        if (mainContent) {
            const container = this.createRecommendationContainer('general');
            mainContent.appendChild(container);
            this.populateRecommendations(container, 'general');
        }
    }

    createRecommendationContainer(id) {
        const container = document.createElement('div');
        container.className = 'affiliate-recommendations-container';
        container.id = `affiliate-recommendations-${id}`;
        return container;
    }

    populateRecommendations(container, context) {
        if (!window.amazonAffiliate) {
            console.warn('Amazon Affiliate system not loaded');
            return;
        }
        
        const contextMap = {
            builder: this.getBuilderContext(),
            gallery: this.getGalleryContext(),
            homepage: this.getHomepageContext(),
            general: this.getGeneralContext()
        };
        
        const recommendationContext = contextMap[context] || contextMap.general;
        window.amazonAffiliate.displayRecommendations(container, recommendationContext);
    }

    getBuilderContext() {
        // Extract context from current builder state
        const builderData = window.carBuilder ? window.carBuilder.buildData : {};
        
        return {
            buildType: builderData.buildType?.type,
            vehicle: builderData.vehicle?.data,
            category: this.getCurrentBuildStep(),
            keywords: this.extractBuildKeywords()
        };
    }

    getCurrentBuildStep() {
        const activeStep = document.querySelector('.build-step.active');
        if (!activeStep) return null;
        
        // Map step IDs to categories
        const stepMap = {
            'step-1': 'tools',
            'step-2': 'general',
            'step-3': 'parts',
            'step-4': 'accessories'
        };
        
        return stepMap[activeStep.id] || 'general';
    }

    extractBuildKeywords() {
        const keywords = [];
        
        // Extract from selected build type
        const selectedBuildType = document.querySelector('.build-type-card.selected');
        if (selectedBuildType) {
            const categories = selectedBuildType.querySelectorAll('.categories span');
            categories.forEach(cat => keywords.push(cat.textContent));
        }
        
        // Extract from VIN data if available
        if (window.carBuilder && window.carBuilder.buildData.vehicle) {
            const vehicle = window.carBuilder.buildData.vehicle.data;
            if (vehicle.make) keywords.push(vehicle.make);
            if (vehicle.model) keywords.push(vehicle.model);
            if (vehicle.bodyStyle) keywords.push(vehicle.bodyStyle);
        }
        
        return keywords;
    }

    getGalleryContext() {
        return {
            category: 'exterior',
            keywords: ['supercar', 'performance', 'luxury', 'sports car'],
            buildType: 'show'
        };
    }

    getHomepageContext() {
        return {
            category: 'general',
            keywords: ['car', 'automotive', 'performance', 'modification'],
            buildType: 'street'
        };
    }

    getGeneralContext() {
        return {
            keywords: ['car', 'automotive', 'performance'],
            category: 'tools'
        };
    }

    bindContextualEvents() {
        // Listen for builder events
        document.addEventListener('builderStateChange', (e) => {
            this.updateAllRecommendations();
        });
        
        // Listen for vehicle selection
        document.addEventListener('vehicleSelected', (e) => {
            this.updateAllRecommendations();
        });
        
        // Listen for build type selection
        document.addEventListener('buildTypeSelected', (e) => {
            this.updateAllRecommendations();
        });
        
        // Listen for step changes
        document.addEventListener('stepChanged', (e) => {
            this.updateAllRecommendations();
        });
    }

    updateAllRecommendations() {
        const containers = document.querySelectorAll('.affiliate-recommendations-container');
        containers.forEach(container => {
            const context = this.getBuilderContext();
            if (window.amazonAffiliate) {
                window.amazonAffiliate.displayRecommendations(container, context);
            }
        });
    }

    // Method to manually trigger recommendation updates
    updateRecommendations(customContext = {}) {
        const context = { ...this.getBuilderContext(), ...customContext };
        this.updateAllRecommendations();
    }

    // Method to add recommendations to custom elements
    addRecommendationsTo(selector, context = {}) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            const container = this.createRecommendationContainer(`custom-${index}`);
            element.appendChild(container);
            
            if (window.amazonAffiliate) {
                window.amazonAffiliate.displayRecommendations(container, context);
            }
        });
    }

    // Performance monitoring
    getIntegrationStats() {
        const containers = document.querySelectorAll('.affiliate-recommendations-container');
        const productCards = document.querySelectorAll('.affiliate-product-card');
        
        return {
            containersCount: containers.length,
            productsDisplayed: productCards.length,
            currentContext: this.currentContext,
            integrationPoints: Object.keys(this.integrationPoints)
        };
    }
}

// Auto-integrate on supported pages
document.addEventListener('DOMContentLoaded', () => {
    // Only integrate if Amazon Affiliate is available
    if (window.amazonAffiliate) {
        window.affiliateIntegration = new AffiliateIntegration();
    }
});