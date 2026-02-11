// ========================
// MAIN.JS - Core Functionality
// ========================

// Products will be loaded from admin/localStorage - start with empty array
// ========================
// MAIN.JS - Core Functionality
// ========================

// Products will be loaded from admin/localStorage - start with empty array
let products = [];

// Initialize cart from localStorage (lightweight: {id, quantity})
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Normalize cart entries to lightweight structure
function normalizeCart() {
    cart = (cart || []).map(item => {
        // If item already lightweight ({id,quantity}) keep it
        if (item && item.id !== undefined && item.quantity !== undefined) {
            return { id: item.id, quantity: Number(item.quantity) || 1 };
        }
        // Backwards compat: if full product saved, extract id and quantity
        if (item && item.id !== undefined) {
            return { id: item.id, quantity: Number(item.quantity) || 1 };
        }
        return null;
    }).filter(i => i && i.id !== undefined);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Helper: get product by id (from loaded products)
function getProductById(id) {
    return products.find(p => p.id == id) || null;
}

// Single initialization on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
    normalizeCart();
    updateCartCount();
    loadFeaturedProducts();

    // If on shop page render product grid
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    }
});

// Load all products (from admin only)
function loadAllProducts() {
    // Try both storage keys for compatibility
    const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
    const defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    const allAdminProducts = [...customProducts, ...adminProducts, ...defaultProducts];
    
    // Use only admin products
    if (allAdminProducts.length > 0) {
        // Create proper product objects from admin products
        const adminProductsFormatted = allAdminProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Other',
            price: parseFloat(p.price) || 0,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0,
            image: (function(img){
                if (!img) return 'assets/img/products/placeholder.jpg';
                if (typeof img === 'string') return img;
                if (typeof img === 'object') {
                    if (img.path && typeof img.path === 'string') return img.path;
                    if (img.filename && typeof img.filename === 'string') return `assets/img/products/${img.filename}`;
                }
                return 'assets/img/products/placeholder.jpg';
            })(p.image),
            description: p.description || '',
            sizes: (Array.isArray(p.sizes) ? p.sizes : []).filter(s => s),
            colors: (Array.isArray(p.colors) ? p.colors : []).filter(c => c),
            sku: p.sku || '',
            stock: p.stock || 0,
            discount: p.discount || 0
        }));

        // Deduplicate by id to prevent repeated merging
        const uniqueMap = new Map();
        adminProductsFormatted.forEach(p => {
            if (!uniqueMap.has(p.id)) uniqueMap.set(p.id, p);
        });
        products = Array.from(uniqueMap.values());
    } else {
        products = [];
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = `(${totalItems})`;
    }
}

// Load featured products
function loadFeaturedProducts() {
    const featured = document.getElementById('featured-products');
    if (featured) {
        featured.innerHTML = products.slice(0, 3).map(product => createProductCard(product)).join('');
    }
}

// Create product card HTML
function createProductCard(product) {
    const rating = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    // Ensure image path is valid, fallback to placeholder
    const imageUrl = (product.image && typeof product.image === 'string') 
        ? product.image 
        : 'assets/img/products/placeholder.jpg';
    
    return `
        <div class="product-card">
            <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='assets/img/products/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">${rating} (${product.reviews})</div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="viewProduct(${product.id})">View</button>
                    <button class="btn btn-secondary" onclick="addToCartQuick(${product.id})">Cart</button>
                </div>
            </div>
        </div>
    `;
}

// Navigate to product details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Quick add to cart
function addToCartQuick(productId) {
    try {
        const product = getProductById(productId);
        if (!product) {
            console.error('Product not found with ID:', productId);
            showNotification('Product not found!');
            return;
        }

        // Ensure price is a valid number
        const price = product.price ? parseFloat(product.price) : 0;
        if (isNaN(price) || price === 0) {
            console.error('Invalid price for product:', product.name, 'Price:', product.price);
            showNotification('Unable to add product - invalid price!');
            return;
        }

        // Only store lightweight cart entries: { id, quantity }
        const existing = cart.find(ci => ci.id == product.id);
        if (existing) {
            existing.quantity = Number(existing.quantity) + 1;
        } else {
            cart.push({ id: product.id, quantity: 1 });
        }

        // Save cart once per update
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showNotification('Error adding product to cart!');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Sort products
function sortProducts() {
    const sortValue = document.getElementById('sort-select')?.value;
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    let sortedProducts = [...products];
    
    switch(sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            sortedProducts.sort((a, b) => b.id - a.id);
    }
    
    productsGrid.innerHTML = sortedProducts.map(product => createProductCard(product)).join('');
}

// Filter products
function applyFilters() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    let filtered = products;
    
    // Filter by category
    const categoryCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    
    // Filter by price
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
        filtered = filtered.filter(p => p.price <= parseInt(priceRange.value));
    }
    
    productsGrid.innerHTML = filtered.map(product => createProductCard(product)).join('');
}

// Initialize products grid on shop page
document.addEventListener('DOMContentLoaded', function() {
    // First load all products (including admin products)
    loadAllProducts();
    
    // Then render them
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    }
});

// Fallback for dynamic loading
// Fallback for dynamic loading
window.addEventListener('load', function() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid && !productsGrid.innerHTML) {
        loadAllProducts();
        productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    }
});
