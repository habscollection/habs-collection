const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

// MongoDB connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Stock Manager with MongoDB integration
const StockManager = {
    async getStock(productId, size) {
        try {
            const product = await Product.findOne({ id: productId });
            return product ? product.stock[size] : 0;
        } catch (error) {
            console.error('Error getting stock:', error);
            return 0;
        }
    },

    async isOutOfStock(productId, size) {
        const stock = await this.getStock(productId, size);
        return stock <= 0;
    },

    async isLowStock(productId, size) {
        const stock = await this.getStock(productId, size);
        return stock > 0 && stock <= 3;
    }
};

// Function to generate HTML for a product
async function generateProductHTML(product) {
    try {
        // Get 4 random products excluding the current product
        const relatedProducts = await Product.aggregate([
            { $match: { _id: { $ne: product._id } } }, // Exclude current product
            { $sample: { size: 4 } } // Get 4 random products
        ]);

        // Create the related products HTML
        const relatedProductsHTML = relatedProducts.map(relatedProduct => `
            <a href="/products/${relatedProduct.slug}.html" class="product-card">
                <div class="product-image">
                    <img src="${relatedProduct.images.main}" alt="${relatedProduct.name}" class="main-image">
                    <img src="${relatedProduct.images.hover || relatedProduct.images.gallery[0] || relatedProduct.images.main}" alt="${relatedProduct.name} Hover" class="hover-image">
                </div>
                <div class="product-info">
                    <h3>${relatedProduct.name}</h3>
                    <p class="price">£${relatedProduct.price.toFixed(2)}</p>
                </div>
            </a>
        `).join('');
        // Create the HTML template
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} - Habs Collection</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@200;300;400&display=swap" rel="stylesheet">
    <!-- Load API and Cart scripts early with defer attribute -->
    <script src="../scripts/api.js" defer></script>
    <script src="../scripts/cart.js" defer></script>
</head>
<body>
    <!-- Announcement Bar -->
    <div class="announcement-bar">
        <p>ORDER BEFORE THURSDAY 27TH MARCH FOR EID-AL FITR</p>
    </div>

  <nav class="navbar">
       <div class="nav-left">
          <!-- <a href="#shop">SHOP</a> -->
          <!-- <a href="#new">NEW IN</a> -->
           <a href="/products.html">EID-AL FITR COLLECTION - Limited Edition</a>
       </div>
       <div class="nav-center">
           <a href="/index.html" class="brand-logo">HABS COLLECTION</a>
       </div>
       <div class="nav-right">
           <a href="#search" class="nav-icon">Search</a>
           <a href="#account" class="nav-icon">Account</a>
           <a href="/cart.html" class="nav-icon">Cart (<span class="cart-count">0</span>)</a>
       </div>

       <div class="mobile-nav-right">
           <a href="#search" class="nav-icon">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="11" cy="11" r="8"></circle>
                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
           </a>
           <a href="#account" class="nav-icon">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
               </svg>
           </a>
           <a href="/cart.html" class="nav-icon">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="9" cy="21" r="1"></circle>
                   <circle cx="20" cy="21" r="1"></circle>
                   <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
               </svg>
               <span class="cart-count">0</span>
           </a>
       </div>

       <button class="mobile-menu-toggle" aria-label="Toggle Menu">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <line x1="3" y1="12" x2="21" y2="12"></line>
               <line x1="3" y1="6" x2="21" y2="6"></line>
               <line x1="3" y1="18" x2="21" y2="18"></line>
           </svg>
       </button>
   </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu-overlay"></div>
    <div class="mobile-menu">
        <button class="mobile-menu-close">&times;</button>
        <!-- <a href="#shop">SHOP</a> -->
        <!-- <a href="#new">NEW IN</a> -->
        <a href="/products.html">EID-AL FITR COLLECTION - Limited Edition</a>
        <a href="#search">Search</a>
        <a href="#account">Account</a>
        <a href="/cart.html">Cart (<span class="mobile-cart-count">0</span>)</a>
        <a href="/index.html" class="mobile-home-link">Home</a>
    </div>

    <main class="product-detail">
        <div class="product-container">
            <!-- Left side - Product Images -->
            <div class="product-images">
                <!-- Desktop Gallery -->
                <div class="main-image">
                    <img src="${product.images.main}" alt="${product.name}" id="mainImage">
                </div>
                <div class="thumbnail-gallery">
                    <img src="${product.images.main}" alt="${product.name}" onclick="updateMainImage(this.src)" class="active">
                    ${product.images.gallery.map(img => `
                        <img src="${img}" alt="${product.name}" onclick="updateMainImage(this.src)">
                    `).join('')}
                </div>

                <!-- Mobile Carousel -->
                <div class="mobile-carousel">
                    <div class="carousel-container">
                        <div class="carousel-slide">
                            <img src="${product.images.main}" alt="${product.name}">
                        </div>
                        ${product.images.gallery.map(img => `
                            <div class="carousel-slide">
                                <img src="${img}" alt="${product.name}">
                            </div>
                        `).join('')}
                    </div>
                    <div class="carousel-dots">
                        <button class="carousel-dot active"></button>
                        ${Array.from({ length: product.images.gallery.length }).map(() => `
                            <button class="carousel-dot"></button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Right side - Product Info -->
            <div class="product-info">
                <h1 class="product-title">${product.name}</h1>
                <p class="product-subtitle">${product.description}</p>
                <p class="reference">Reference: ${product.reference}</p>

                <!-- Size Selection -->
                <div class="size-section">
                    <div class="size-header">
                        <label for="size">Select your size</label>
                    </div>
                    <select name="size" id="size" class="size-select">
                        <option value="">Select a size</option>
                        ${product.sizes.map(size => {
                            // Using .get() method to access Map values
                            const stockLevel = product.stock.get ? product.stock.get(size) || 0 : (product.stock[size] || 0);
                            const isOutOfStock = stockLevel <= 0;
                            return `
                                <option value="${size}" ${isOutOfStock ? 'disabled' : ''}>
                                    ${size} ${isOutOfStock ? '- Out of Stock' : ''}
                                </option>
                            `;
                        }).join('')}
                    </select>
                </div>

                <!-- Add to Cart Section -->
                <div class="purchase-section">
                    <button class="add-to-cart">Add to cart<span class="price">£${product.price.toFixed(2)}</span></button>
                    <button class="express-checkout">Express checkout</button>
                </div>

                <!-- Product Details Tabs -->
                <div class="product-tabs">
                    <div class="tab-headers">
                        <button class="tab-btn active" data-tab="description">Description</button>
                    </div>
                    <div class="tab-content active" id="description">
                        <p class="description-text">${product.description}</p>
                        <ul class="product-features">
                            ${product.features ? product.features.map(feature => `<li>${feature}</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- You May Also Like Section -->
        <section class="related-products">
            <h2>You may also like</h2>
            <div class="product-grid">
                ${relatedProductsHTML}
            </div>
        </section>

        <!-- Features Section -->
<section class="features-section">
    <div class="features-grid">
        <div class="feature-item">
            <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M7 8h10M7 12h10M7 16h10"/>
                </svg>
            </div>
            <h3>ON TIME DELIVERY</h3>
            <p>NEXT DAY DELIVERY AVAILABLE ON ALL PRODUCTS</p>
        </div>
        
        <div class="feature-item">
            <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <h3>HANDCRAFTED EXCELLENCE</h3>
            <p>Each item is handcrafted in London, ensuring exceptional quality and attention to detail.</p>
        </div>
        
        <div class="feature-item">
            <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
            </div>
            <h3>SECURE PAYMENT</h3>
            <p>Ensuring Your Safety and Security: A Trustworthy Payment Experience</p>
        </div>
    </div>
</section>

<!-- Updated Footer -->
<footer class="site-footer">
    <div class="footer-container">
        <div class="footer-grid">
            <div class="footer-section">
                <h4>LATEST COLLECTION</h4>
                <ul>
                    <li><a href="#abayas">ABAYAS</a></li>
                    <li><a href="#dresses">DRESSES</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>CUSTOMER SERVICE</h4>
                <ul>
                    <li><a href="#contact">Contact Us</a></li>
                    <li><a href="#shipping">Shipping Information</a></li>
                    <li><a href="#returns">Returns & Exchanges</a></li>
                    <li><a href="#size-guide">Size Guide</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>ABOUT</h4>
                <ul>
                    <li><a href="#story">Our Story</a></li>
                    <li><a href="#sustainability">Sustainability</a></li>
                    <li><a href="#stores">Stores</a></li>
                </ul>
            </div>

            <div class="footer-section newsletter">
                <h4>NEWSLETTER</h4>
                <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
                <form class="newsletter-form">
                    <div class="input-group">
                        <input type="email" placeholder="Enter your email address" required>
                        <button type="submit">Subscribe</button>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-left">
                <p>© 2024 - HABS COLLECTION</p>
            </div>
            <div class="footer-right">
                <div class="payment-methods">
                    <img src="assets/images/payment/visa.png" alt="Visa">
                    <img src="assets/images/payment/mastercard.png" alt="Mastercard">
                    <img src="assets/images/payment/amex.png" alt="American Express">
                    <img src="assets/images/payment/paypal.png" alt="PayPal">
                    <img src="assets/images/payment/apple-pay.png" alt="Apple Pay">
                    <img src="assets/images/payment/google-pay.png" alt="Google Pay">
                </div>
            </div>
        </div>
    </div>
</footer>

</main>

    <script src="/scripts/carousel.js"></script>
    <script>
        // Image gallery functionality
        function updateMainImage(src) {
            document.getElementById('mainImage').src = src;
            // Update active state of thumbnails
            document.querySelectorAll('.thumbnail-gallery img').forEach(img => {
                img.classList.toggle('active', img.src === src);
            });
        }

        // Set initial active state
        document.addEventListener('DOMContentLoaded', () => {
            const mainImage = document.getElementById('mainImage');
            if (mainImage) {
                updateMainImage(mainImage.src);
            }

            // Add current product to window.products for cart.js to access
            if (!window.products) {
                window.products = [];
            }
            
            // Create product object that matches the format expected by cart.js
            const currentProduct = {
                id: "${product.id || product._id.toString()}",
                name: "${product.name}",
                price: ${product.price},
                images: {
                    main: "${product.images.main}"
                },
                sizes: JSON.parse('${JSON.stringify(product.sizes || [])}'),
                stock: JSON.parse('${JSON.stringify(product.stock || {})}')
            };
            
            // Add to global products array if not already there
            if (!window.products.find(p => p.id === currentProduct.id)) {
                window.products.push(currentProduct);
            }

            // Initialize cart lightbox functionality
            const cartLightbox = document.querySelector('.cart-lightbox');
            const addToCartButton = document.querySelector('.add-to-cart');
            const cartCloseButton = document.querySelector('.cart-close');
            const continueShoppingButton = document.querySelector('.continue-shopping');
            const proceedToCheckoutButton = document.querySelector('.proceed-to-checkout');
            const viewCartButton = document.querySelector('.view-cart-btn');

            // Add to cart functionality
            if (addToCartButton) {
                addToCartButton.addEventListener('click', async function() {
                    const size = document.getElementById('size').value;
                    if (!size) {
                        alert('Please select a size');
                        return;
                    }

                    // Update selected size in cart lightbox
                    const selectedSizeSpan = document.querySelector('.selected-size');
                    if (selectedSizeSpan) {
                        selectedSizeSpan.textContent = size;
                    }

                    try {
                        console.log('[DEBUG] Add to cart button clicked for:', {
                            product: currentProduct.name,
                            id: currentProduct.id,
                            size: size
                        });
                        
                        // Ensure cart instance exists
                        if (!window.cart) {
                            console.error('[DEBUG] Cart instance not found, creating new instance');
                            window.cart = new Cart();
                            await window.cart.init();
                        }
                        
                        // Use the cart.js addToCart function
                        const success = await window.cart.addItem(currentProduct, size);
                        
                        if (success) {
                            console.log('[DEBUG] Item successfully added to cart');
                            // Show cart lightbox - moved inside success to ensure only shown on success
                            if (cartLightbox) {
                                cartLightbox.classList.add('active');
                                document.body.classList.add('cart-open');
                            } else {
                                console.error('[DEBUG] Cart lightbox element not found');
                            }
                        } else {
                            console.error('[DEBUG] Failed to add item to cart');
                            alert('Could not add item to cart. Please try again.');
                        }
                    } catch (error) {
                        console.error('[DEBUG] Error in add to cart process:', error);
                        alert('An error occurred while adding to cart: ' + (error.message || 'Unknown error'));
                    }
                });
            }

            // Close cart lightbox
            if (cartCloseButton) {
                cartCloseButton.addEventListener('click', function(e) {
                    console.log('[DEBUG] Cart close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartLightbox) {
                        cartLightbox.classList.remove('active');
                        document.body.classList.remove('cart-open');
                    } else {
                        console.error('[DEBUG] Cart lightbox not found when trying to close');
                    }
                });
            }

            // Continue shopping button
            if (continueShoppingButton) {
                continueShoppingButton.addEventListener('click', function() {
                    cartLightbox.classList.remove('active');
                    document.body.classList.remove('cart-open');
                    window.location.href = '/products.html';
                });
            }

            // Proceed to checkout button
            if (proceedToCheckoutButton) {
                proceedToCheckoutButton.addEventListener('click', function() {
                    window.location.href = '/checkout.html';
                });
            }
            
            // Express checkout button
            const expressCheckoutButton = document.querySelector('.express-checkout');
            if (expressCheckoutButton) {
                expressCheckoutButton.addEventListener('click', async function() {
                    const size = document.getElementById('size').value;
                    if (!size) {
                        alert('Please select a size');
                        return;
                    }
                    
                    try {
                        // Add to cart first
                        const success = await cart.addItem(currentProduct, size);
                        
                        if (success) {
                            // Redirect to checkout
                            window.location.href = '/checkout.html';
                        } else {
                            alert('Could not add item to cart. Please try again.');
                        }
                    } catch (error) {
                        console.error('Error with express checkout:', error);
                        alert('An error occurred. Please try again.');
                    }
                });
            }
            
            // View cart button
            if (viewCartButton) {
                viewCartButton.addEventListener('click', function() {
                    cartLightbox.classList.remove('active');
                    document.body.classList.remove('cart-open');
                    // Navigation will happen automatically via the href
                });
            }
            
            // Close cart lightbox when clicking outside
            if (cartLightbox) {
                cartLightbox.addEventListener('click', function(e) {
                    if (e.target === cartLightbox) {
                        cartLightbox.classList.remove('active');
                        document.body.classList.remove('cart-open');
                    }
                });
            }
        });

        // Tab functionality
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(button.dataset.tab).classList.add('active');
            });
        });

        // Mobile Menu Toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                mobileMenuOverlay.classList.add('active');
                document.body.classList.add('menu-open');
            });
        }
        
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }

        // Lightbox Elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';

        // Instead of using template literals directly in innerHTML
        const lightboxHTML = 
            '<div class="lightbox-content">' +
            '    <button class="lightbox-close">' +
            '        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
            '    </button>' +
            '    <div class="lightbox-nav">' +
            '        <button class="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' +
            '        <button class="next"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>' +
            '    </div>' +
            '    <img src="" class="lightbox-image" alt="">' +
            '    <div class="lightbox-thumbnails"></div>' +
            '    <div class="zoom-controls"><span class="zoom-percentage">100%</span></div>' +
            '</div>';

        lightbox.innerHTML = lightboxHTML;
        document.body.appendChild(lightbox);

        // Lightbox functionality
        class ProductLightbox {
            constructor() {
                this.lightbox = document.querySelector('.lightbox');
                this.lightboxImage = this.lightbox.querySelector('.lightbox-image');
                this.thumbnailsContainer = this.lightbox.querySelector('.lightbox-thumbnails');
                this.closeButton = this.lightbox.querySelector('.lightbox-close');
                this.prevButton = this.lightbox.querySelector('.prev');
                this.nextButton = this.lightbox.querySelector('.next');
                this.zoomPercentage = this.lightbox.querySelector('.zoom-percentage');
                this.currentImageIndex = 0;
                this.images = [];
                this.isZoomed = false;
                this.scale = 1;

                this.initializeEvents();
            }

            initializeEvents() {
                // Main product image click
                const mainImage = document.querySelector('.main-image img');
                if (mainImage) {
                    mainImage.style.cursor = 'zoom-in';
                    mainImage.addEventListener('click', () => this.openLightbox(mainImage.src));
                }

                // Thumbnail gallery clicks
                document.querySelectorAll('.thumbnail-gallery img').forEach(img => {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', (e) => {
                        e.preventDefault(); // Prevent the updateMainImage function from firing
                        this.openLightbox(img.src);
                    });
                });
                
                // Mobile carousel image clicks
                document.querySelectorAll('.mobile-carousel .carousel-slide img').forEach(img => {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', () => this.openLightbox(img.src));
                });

                // Close button
                this.closeButton.addEventListener('click', () => this.closeLightbox());

                // Navigation buttons
                this.prevButton.addEventListener('click', () => this.showPrevImage());
                this.nextButton.addEventListener('click', () => this.showNextImage());

                // Zoom functionality
                this.lightboxImage.addEventListener('click', (e) => this.handleZoom(e));

                // Keyboard navigation
                document.addEventListener('keydown', (e) => this.handleKeyboard(e));

                // Close on background click
                this.lightbox.addEventListener('click', (e) => {
                    if (e.target === this.lightbox) this.closeLightbox();
                });
            }

            openLightbox(imageSrc) {
                // Collect all product images
                const mainImage = document.querySelector('.main-image img');
                const thumbnailImages = Array.from(document.querySelectorAll('.thumbnail-gallery img'));
                this.images = [mainImage.src, ...thumbnailImages.slice(1).map(img => img.src)];
                
                // Set current image index
                this.currentImageIndex = this.images.indexOf(imageSrc);
                if (this.currentImageIndex === -1) this.currentImageIndex = 0;
                
                // Show lightbox
                this.lightbox.classList.add('active');
                document.body.classList.add('lightbox-active');
                
                // Update image
                this.updateImage();
                
                // Generate thumbnails
                this.generateThumbnails();
            }

            closeLightbox() {
                this.lightbox.classList.remove('active');
                document.body.classList.remove('lightbox-active');
                this.resetZoom();
            }

            updateImage() {
                this.lightboxImage.src = this.images[this.currentImageIndex];
                this.updateThumbnailsState();
                this.resetZoom();
                
                // Update main product image as well
                const mainImage = document.querySelector('.main-image img');
                if (mainImage) {
                    mainImage.src = this.images[this.currentImageIndex];
                }
                
                // Update thumbnail active state
                document.querySelectorAll('.thumbnail-gallery img').forEach((img, index) => {
                    img.classList.toggle('active', index === this.currentImageIndex);
                });
            }

            showPrevImage() {
                this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
                this.updateImage();
            }

            showNextImage() {
                this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
                this.updateImage();
            }

            generateThumbnails() {
                this.thumbnailsContainer.innerHTML = this.images
                    .map((src, index) => 
                        '<button class="lightbox-thumbnail ' + 
                        (index === this.currentImageIndex ? 'active' : '') + 
                        '" data-index="' + index + '">' +
                        '<img src="' + src + '" alt="Thumbnail ' + (index + 1) + '" />' +
                        '</button>'
                    ).join('');

                // Add click events to thumbnails
                this.thumbnailsContainer.querySelectorAll('.lightbox-thumbnail').forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        this.currentImageIndex = parseInt(thumb.dataset.index);
                        this.updateImage();
                    });
                });
            }

            updateThumbnailsState() {
                this.thumbnailsContainer.querySelectorAll('.lightbox-thumbnail').forEach((thumb, index) => {
                    thumb.classList.toggle('active', index === this.currentImageIndex);
                });
            }

            handleZoom(e) {
                if (!this.isZoomed) {
                    this.scale = 2;
                    this.lightboxImage.style.transform = 'scale(' + this.scale + ')';
                    this.lightboxImage.style.cursor = 'zoom-out';
                    this.zoomPercentage.textContent = '200%';
                } else {
                    this.resetZoom();
                }
                this.isZoomed = !this.isZoomed;
            }

            resetZoom() {
                this.scale = 1;
                this.lightboxImage.style.transform = '';
                this.lightboxImage.style.cursor = 'zoom-in';
                this.zoomPercentage.textContent = '100%';
                this.isZoomed = false;
            }

            handleKeyboard(e) {
                if (!this.lightbox.classList.contains('active')) return;

                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.showPrevImage();
                        break;
                    case 'ArrowRight':
                        this.showNextImage();
                        break;
                }
            }
        }

        // Initialize lightbox
        document.addEventListener('DOMContentLoaded', () => {
            new ProductLightbox();
        });

        // Modify the existing updateMainImage function to work with the lightbox
        const originalUpdateMainImage = window.updateMainImage;
        window.updateMainImage = function(src) {
            if (originalUpdateMainImage) {
                originalUpdateMainImage(src);
            }
            // Don't do anything else - clicking will trigger the lightbox instead
        };

        document.addEventListener('DOMContentLoaded', function() {
            console.log('[DEBUG] Product page DOM loaded');
            
            // Log if API and cart are available
            if (window.api) {
                console.log('[DEBUG] API object is available on window');
            } else {
                console.error('[DEBUG] API object is NOT available on window');
            }
            
            if (window.cart) {
                console.log('[DEBUG] Cart object is available on window');
            } else {
                console.error('[DEBUG] Cart object is NOT available on window');
                
                // Attempt to create cart if not available
                console.log('[DEBUG] Attempting to create Cart instance');
                try {
                    window.cart = new Cart();
                    console.log('[DEBUG] Cart instance created');
                } catch (error) {
                    console.error('[DEBUG] Failed to create Cart instance:', error);
                }
            }
        });
    </script>

    <!-- Cart Lightbox HTML -->
    <div class="cart-lightbox">
        <div class="cart-content">
            <button class="cart-close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="cart-added-notification">
                <h3>Added to Cart</h3>
                <div class="cart-product-preview">
                    <img src="${product.images.main}" alt="${product.name}">
                    <div class="cart-product-details">
                        <h4 class="cart-product-name">${product.name}</h4>
                        <p class="cart-product-info">Size: <span class="selected-size"></span></p>
                        <p class="cart-product-price">£${product.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="cart-items-container">
                <!-- Cart items will be dynamically inserted here by cart.js -->
            </div>
            <div class="cart-actions">
                <button class="proceed-to-checkout">Proceed to Checkout</button>
                <a href="/cart.html" class="btn-primary view-cart-btn">View Cart</a>
                <button class="continue-shopping">Continue Shopping</button>
                <div class="free-shipping-message">Free shipping on orders over £300</div>
                <div class="secure-checkout">
                    <p>Secure checkout</p>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        /* Additional cart styles for consistency */
        .cart-product-name {
            font-weight: 500;
            margin-bottom: 5px;
            font-size: 15px;
        }
        
        .cart-product-info {
            color: #666;
            font-size: 13px;
            margin-bottom: 3px;
        }
        
        .view-cart-btn {
            display: inline-block;
            width: 100%;
            padding: 12px 15px;
            background-color: var(--secondary-color);
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            text-align: center;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
            margin: 8px 0;
            transition: all 0.3s ease;
        }
        
        .view-cart-btn:hover {
            background-color: #f5f5f5;
        }
    </style>
</body>
</html>`;

        return html;
    } catch (error) {
        console.error('Error generating HTML for product:', error);
        throw error;
    }
}

async function generateProductPages() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        // Create products directory if it doesn't exist
        const productsDir = path.join(__dirname, '..', 'products');
        if (!fs.existsSync(productsDir)) {
            fs.mkdirSync(productsDir, { recursive: true });
        }

        // Generate HTML for each product
        for (const product of products) {
            const html = await generateProductHTML(product);
            const filePath = path.join(productsDir, `${product.slug}.html`);
            fs.writeFileSync(filePath, html);
            console.log(`Generated page for ${product.name}`);
        }

        console.log('All product pages generated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error generating product pages:', error);
        process.exit(1);
    }
}

module.exports = {
    generateProductHTML
};

// Run the generator
generateProductPages(); 