/**
 * Amazon Affiliate Integration System
 * Generates affiliate links and product recommendations for car enthusiasts
 */

class AmazonAffiliate {
    constructor(config = {}) {
        this.config = {
            associateTag: config.associateTag || 'dreamcar-20', // Replace with your actual tag
            trackingId: config.trackingId || 'dreamcar-20',
            region: config.region || 'US',
            baseUrl: config.baseUrl || 'https://www.amazon.com',
            imageSize: config.imageSize || '_SX300_',
            ...config
        };
        
        this.productDatabase = this.initializeProductDatabase();
        this.performanceTracking = {
            clicks: 0,
            impressions: 0,
            conversions: 0,
            revenue: 0
        };
        
        this.init();
    }

    init() {
        this.loadPerformanceData();
        this.bindEvents();
        this.initializeObserver();
    }

    initializeProductDatabase() {
        return {
            // Engine & Performance
            engine: [
                {
                    id: 'B075ZQVQZ1',
                    name: 'K&N Cold Air Intake Kit',
                    category: 'Engine',
                    price: '$329.99',
                    rating: 4.5,
                    description: 'High-Performance Cold Air Intake System',
                    keywords: ['intake', 'cold air', 'performance', 'horsepower'],
                    compatibleVehicles: ['Honda Civic', 'Subaru WRX', 'Ford Mustang']
                },
                {
                    id: 'B00JGZM6G8',
                    name: 'Borla ATAK Cat-Back Exhaust',
                    category: 'Exhaust',
                    price: '$899.99',
                    rating: 4.7,
                    description: 'Aggressive Sound Cat-Back Exhaust System',
                    keywords: ['exhaust', 'borla', 'catback', 'performance', 'sound'],
                    compatibleVehicles: ['Ford Mustang', 'Chevrolet Camaro', 'Dodge Charger']
                },
                {
                    id: 'B08K4X7QRY',
                    name: 'NGK Iridium IX Spark Plugs',
                    category: 'Engine',
                    price: '$89.99',
                    rating: 4.8,
                    description: 'High-Performance Iridium Spark Plugs Set',
                    keywords: ['spark plugs', 'ngk', 'iridium', 'performance'],
                    compatibleVehicles: ['universal']
                }
            ],
            
            // Suspension & Handling
            suspension: [
                {
                    id: 'B01N4QZ8ZX',
                    name: 'Coilover Suspension Kit',
                    category: 'Suspension',
                    price: '$1299.99',
                    rating: 4.6,
                    description: 'Adjustable Height Coilover Suspension',
                    keywords: ['coilovers', 'suspension', 'adjustable', 'lowering'],
                    compatibleVehicles: ['Honda Civic', 'Subaru WRX', 'BMW 3 Series']
                },
                {
                    id: 'B07YD8MXTG',
                    name: 'Sway Bar Links Set',
                    category: 'Suspension',
                    price: '$129.99',
                    rating: 4.4,
                    description: 'Heavy Duty Sway Bar End Links',
                    keywords: ['sway bar', 'links', 'handling', 'stability'],
                    compatibleVehicles: ['universal']
                }
            ],
            
            // Exterior & Aero
            exterior: [
                {
                    id: 'B08XYZHMT4',
                    name: 'Carbon Fiber Front Splitter',
                    category: 'Aerodynamics',
                    price: '$599.99',
                    rating: 4.3,
                    description: 'Real Carbon Fiber Front Lip Splitter',
                    keywords: ['carbon fiber', 'splitter', 'aero', 'front lip'],
                    compatibleVehicles: ['BMW M3', 'Audi S4', 'Mercedes C63']
                },
                {
                    id: 'B07MNKQS5Z',
                    name: 'LED Headlight Conversion Kit',
                    category: 'Lighting',
                    price: '$199.99',
                    rating: 4.5,
                    description: 'Plug-and-Play LED Headlight Bulbs',
                    keywords: ['led', 'headlights', 'lighting', 'conversion'],
                    compatibleVehicles: ['universal']
                }
            ],
            
            // Interior & Electronics
            interior: [
                {
                    id: 'B08GY2J4QN',
                    name: 'Racing Bucket Seats',
                    category: 'Interior',
                    price: '$899.99',
                    rating: 4.6,
                    description: 'Carbon Fiber Racing Bucket Seats Pair',
                    keywords: ['racing seats', 'bucket seats', 'carbon fiber'],
                    compatibleVehicles: ['universal']
                },
                {
                    id: 'B07Q2R8KPJ',
                    name: 'Performance Steering Wheel',
                    category: 'Interior',
                    price: '$299.99',
                    rating: 4.4,
                    description: 'Suede Racing Steering Wheel',
                    keywords: ['steering wheel', 'racing', 'suede', 'performance'],
                    compatibleVehicles: ['universal']
                }
            ],
            
            // Tools & Maintenance
            tools: [
                {
                    id: 'B07NNFM8JY',
                    name: 'OBD2 Scanner Tool',
                    category: 'Diagnostics',
                    price: '$129.99',
                    rating: 4.7,
                    description: 'Professional OBD2 Diagnostic Scanner',
                    keywords: ['obd2', 'scanner', 'diagnostic', 'tool'],
                    compatibleVehicles: ['universal']
                },
                {
                    id: 'B08X1BK3YZ',
                    name: 'Torque Wrench Set',
                    category: 'Tools',
                    price: '$199.99',
                    rating: 4.8,
                    description: 'Professional Torque Wrench Set 1/4" 3/8" 1/2"',
                    keywords: ['torque wrench', 'tools', 'professional', 'set'],
                    compatibleVehicles: ['universal']
                }
            ]
        };
    }

    generateAffiliateUrl(productId, customParams = {}) {
        const baseParams = {
            tag: this.config.associateTag,
            linkCode: 'as2',
            camp: '1789',
            creative: '9325'
        };
        
        const params = { ...baseParams, ...customParams };
        const paramString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        
        return `${this.config.baseUrl}/dp/${productId}?${paramString}`;
    }

    generateImageUrl(productId, size = null) {
        const imageSize = size || this.config.imageSize;
        return `https://images-na.ssl-images-amazon.com/images/P/${productId}.01${imageSize}.jpg`;
    }

    getRecommendations(context = {}) {
        const { buildType, vehicle, category, keywords } = context;
        let recommendations = [];
        
        // Get products from all categories
        const allProducts = Object.values(this.productDatabase).flat();
        
        // Filter by category if specified
        if (category) {
            recommendations = allProducts.filter(product => 
                product.category.toLowerCase().includes(category.toLowerCase())
            );
        } else {
            recommendations = allProducts;
        }
        
        // Filter by build type
        if (buildType) {
            recommendations = this.filterByBuildType(recommendations, buildType);
        }
        
        // Filter by vehicle compatibility
        if (vehicle) {
            recommendations = this.filterByVehicle(recommendations, vehicle);
        }
        
        // Filter by keywords
        if (keywords && keywords.length > 0) {
            recommendations = this.filterByKeywords(recommendations, keywords);
        }
        
        // Sort by rating and return top results
        return recommendations
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6)
            .map(product => this.enhanceProduct(product));
    }

    filterByBuildType(products, buildType) {
        const buildTypeMap = {
            'track': ['suspension', 'brakes', 'aero', 'engine', 'racing'],
            'drift': ['suspension', 'tires', 'differential', 'angle kit'],
            'drag': ['engine', 'transmission', 'tires', 'nitrous'],
            'street': ['intake', 'exhaust', 'wheels', 'lighting'],
            'show': ['exterior', 'interior', 'lighting', 'wheels'],
            'autocross': ['suspension', 'tires', 'brakes', 'sway bar']
        };
        
        const relevantKeywords = buildTypeMap[buildType.toLowerCase()] || [];
        
        return products.filter(product => {
            return relevantKeywords.some(keyword => 
                product.keywords.some(productKeyword => 
                    productKeyword.toLowerCase().includes(keyword)
                )
            );
        });
    }

    filterByVehicle(products, vehicle) {
        const vehicleString = typeof vehicle === 'string' ? vehicle : 
                             vehicle.displayName || vehicle.description || '';
        
        return products.filter(product => {
            return product.compatibleVehicles.includes('universal') ||
                   product.compatibleVehicles.some(compatible => 
                       vehicleString.toLowerCase().includes(compatible.toLowerCase())
                   );
        });
    }

    filterByKeywords(products, keywords) {
        return products.filter(product => {
            return keywords.some(keyword => 
                product.keywords.some(productKeyword => 
                    productKeyword.toLowerCase().includes(keyword.toLowerCase())
                )
            );
        });
    }

    enhanceProduct(product) {
        return {
            ...product,
            affiliateUrl: this.generateAffiliateUrl(product.id),
            imageUrl: this.generateImageUrl(product.id),
            priceNumeric: this.parsePriceString(product.price)
        };
    }

    parsePriceString(priceString) {
        return parseFloat(priceString.replace(/[$,]/g, ''));
    }

    renderProductCard(product) {
        return `
            <div class="affiliate-product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.imageUrl}" 
                         alt="${product.name}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x300?text=Product+Image'">
                    <div class="product-rating">
                        ${this.renderStars(product.rating)}
                        <span class="rating-value">${product.rating}</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-category">${product.category}</span>
                        <span class="product-price">${product.price}</span>
                    </div>
                    <a href="${product.affiliateUrl}" 
                       class="affiliate-btn btn-primary"
                       target="_blank" 
                       rel="noopener sponsored"
                       data-action="click"
                       data-product="${product.id}">
                        <i class="fab fa-amazon"></i>
                        View on Amazon
                    </a>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return `<div class="product-stars">${stars}</div>`;
    }

    displayRecommendations(container, context = {}) {
        const recommendations = this.getRecommendations(context);
        
        if (!container) {
            console.error('Container element not found for affiliate recommendations');
            return;
        }
        
        if (recommendations.length === 0) {
            container.innerHTML = '<p class="no-recommendations">No product recommendations available.</p>';
            return;
        }
        
        const html = `
            <div class="affiliate-section">
                <div class="affiliate-header">
                    <h2><i class="fas fa-shopping-cart"></i> Recommended Products</h2>
                    <p class="affiliate-disclaimer">
                        <small>As an Amazon Associate, we earn from qualifying purchases. 
                        Products recommended based on your build configuration.</small>
                    </p>
                </div>
                <div class="affiliate-products-grid">
                    ${recommendations.map(product => this.renderProductCard(product)).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        this.trackImpressions(recommendations.length);
        this.bindProductEvents(container);
    }

    bindProductEvents(container) {
        const affiliateLinks = container.querySelectorAll('.affiliate-btn[data-action="click"]');
        
        affiliateLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const productId = e.target.closest('.affiliate-btn').getAttribute('data-product');
                this.trackClick(productId);
                
                // Add visual feedback
                e.target.innerHTML = '<i class="fas fa-external-link-alt"></i> Opening Amazon...';
                e.target.style.background = '#28a745';
            });
        });
    }

    bindEvents() {
        // Listen for builder state changes to update recommendations
        document.addEventListener('builderStateChange', (e) => {
            this.updateRecommendations(e.detail);
        });
        
        // Listen for vehicle selection to update recommendations
        document.addEventListener('vehicleSelected', (e) => {
            this.updateRecommendations({ vehicle: e.detail.vehicle });
        });
        
        // Listen for build type selection
        document.addEventListener('buildTypeSelected', (e) => {
            this.updateRecommendations({ buildType: e.detail.buildType });
        });
    }

    updateRecommendations(context) {
        const containers = document.querySelectorAll('.affiliate-recommendations-container');
        containers.forEach(container => {
            this.displayRecommendations(container, context);
        });
    }

    initializeObserver() {
        // Intersection Observer for impression tracking
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const productId = entry.target.getAttribute('data-product-id');
                        if (productId) {
                            this.trackProductView(productId);
                        }
                    }
                });
            }, { threshold: 0.5 });
        }
    }

    trackClick(productId) {
        this.performanceTracking.clicks++;
        this.savePerformanceData();
        
        // Send analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_click', {
                event_category: 'Amazon Affiliate',
                event_label: productId,
                value: 1
            });
        }
        
        console.log(`Amazon affiliate click tracked: ${productId}`);
    }

    trackImpressions(count) {
        this.performanceTracking.impressions += count;
        this.savePerformanceData();
    }

    trackProductView(productId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_impression', {
                event_category: 'Amazon Affiliate',
                event_label: productId
            });
        }
    }

    trackConversion(productId, amount) {
        this.performanceTracking.conversions++;
        this.performanceTracking.revenue += amount;
        this.savePerformanceData();
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: `amazon_${Date.now()}`,
                value: amount,
                currency: 'USD',
                event_category: 'Amazon Affiliate'
            });
        }
    }

    getPerformanceData() {
        return {
            ...this.performanceTracking,
            ctr: this.performanceTracking.clicks / (this.performanceTracking.impressions || 1),
            conversionRate: this.performanceTracking.conversions / (this.performanceTracking.clicks || 1),
            revenuePerClick: this.performanceTracking.revenue / (this.performanceTracking.clicks || 1)
        };
    }

    savePerformanceData() {
        try {
            localStorage.setItem('amazonAffiliatePerformance', JSON.stringify(this.performanceTracking));
        } catch (e) {
            console.warn('Could not save affiliate performance data', e);
        }
    }

    loadPerformanceData() {
        try {
            const saved = localStorage.getItem('amazonAffiliatePerformance');
            if (saved) {
                this.performanceTracking = { ...this.performanceTracking, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load affiliate performance data', e);
        }
    }

    // Integration with Car Builder
    integrateWithBuilder() {
        if (window.carBuilder) {
            // Hook into builder events
            const originalSetVehicle = window.carBuilder.setVehicleFromVin;
            window.carBuilder.setVehicleFromVin = (vehicleData) => {
                originalSetVehicle.call(window.carBuilder, vehicleData);
                this.updateRecommendations({ vehicle: vehicleData });
            };
            
            const originalSelectBuildType = window.carBuilder.selectBuildType;
            if (originalSelectBuildType) {
                window.carBuilder.selectBuildType = (buildType) => {
                    originalSelectBuildType.call(window.carBuilder, buildType);
                    this.updateRecommendations({ buildType: buildType });
                };
            }
        }
    }

    // Create affiliate recommendation containers
    createRecommendationContainer(targetSelector) {
        const target = document.querySelector(targetSelector);
        if (target) {
            const container = document.createElement('div');
            container.className = 'affiliate-recommendations-container';
            target.appendChild(container);
            return container;
        }
        return null;
    }
}

// Initialize Amazon Affiliate System
const amazonAffiliate = new AmazonAffiliate({
    associateTag: 'dreamcar-20', // Replace with your actual Amazon Associate tag
    trackingId: 'dreamcar-20'
});

// Make globally available
window.amazonAffiliate = amazonAffiliate;

// Auto-initialize on pages with car builder
document.addEventListener('DOMContentLoaded', () => {
    amazonAffiliate.integrateWithBuilder();
    
    // Add recommendation containers to appropriate pages
    if (document.querySelector('.builder-app')) {
        // On builder page, add recommendations after each step
        amazonAffiliate.createRecommendationContainer('.builder-content');
    }
    
    if (document.querySelector('.gallery-grid')) {
        // On gallery page, add general recommendations
        amazonAffiliate.createRecommendationContainer('.gallery-section');
    }
});