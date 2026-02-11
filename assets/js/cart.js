// ========================
// CART.JS - Shopping Cart Page Functionality
// ========================
// Handles: displaying cart items, calculating totals, quantity updates, removals
// Note: cart variable is already declared in main.js
// This file is only for cart page display and totals
// ========================

// Initialize cart page on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Cart page initializing...');
    
    // Reload cart from localStorage to get latest updates
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Normalize if needed
    cart = (cart || []).map(item => ({ id: item.id, quantity: Number(item.quantity) || 1 }));
    console.log('Cart items found:', cart.length);
    
    // Check if this is the cart page
    if (document.getElementById('cart-items')) {
        loadCartItems();
        calculateCartTotals();
    }
    
    updateCartCount();
    console.log('✅ Cart page initialized with', cart.length, 'items');
});

// ========================
// CART PAGE DISPLAY
// ========================
function loadCartItems() {
    const cartContainer = document.getElementById('cart-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartTable = document.getElementById('cart-table');
    
    if (!cartContainer) return;

    // Remove any entries that no longer have a product
    cart = cart.filter(ci => getProductById(ci.id));
    if (cart.length === 0) {
        // Show empty message
        if (cartTable) cartTable.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'block';
        console.log('📭 Cart is empty');
        return;
    }

    // Show cart table
    if (cartTable) cartTable.style.display = 'table';
    if (emptyMessage) emptyMessage.style.display = 'none';

    // Clear existing items
    cartContainer.innerHTML = '';

    // Render each cart item using product data lookup
    cart.forEach((ci, index) => {
        const product = getProductById(ci.id);
        if (!product) return; // skip if product missing
        const itemTotal = product.price * ci.quantity;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="cart-item-info">
                    <img src="${product.image || 'assets/img/placeholder.jpg'}" 
                         alt="${product.name}" 
                         class="cart-item-image"
                         onerror="this.src='assets/img/placeholder.jpg'">
                    <div class="cart-item-details">
                        <h4>${product.name}</h4>
                        ${product.sizes && product.sizes[0] ? `<p>Size: ${product.sizes[0]}</p>` : ''}
                        ${product.colors && product.colors[0] ? `<p>Color: ${product.colors[0]}</p>` : ''}
                    </div>
                </div>
            </td>
            <td>${formatPrice(product.price)}</td>
            <td>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="decrementQuantity(${index})">−</button>
                    <input type="number" 
                           value="${ci.quantity}" 
                           min="1" 
                           max="99"
                           class="qty-input"
                           onchange="updateQuantityFromInput(${index}, this.value)">
                    <button class="qty-btn" onclick="incrementQuantity(${index})">+</button>
                </div>
            </td>
            <td>${formatPrice(itemTotal)}</td>
            <td>
                <button class="remove-btn" onclick="removeItemFromCart(${index})">
                    🗑️ Remove
                </button>
            </td>
        `;
        
        cartContainer.appendChild(row);
    });

    console.log(`✅ Displayed ${cart.length} cart items`);
}

function calculateCartTotals() {
    if (cart.length === 0) {
        setCartTotals('0.00', '0.00', '0.00', '0.00');
        return;
    }
    const subtotal = cart.reduce((sum, ci) => {
        const p = getProductById(ci.id);
        return sum + (p ? (p.price * ci.quantity) : 0);
    }, 0);
    const shipping = subtotal > 0 ? 5.00 : 0;
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + shipping + tax;

    setCartTotals(
        subtotal.toFixed(2),
        shipping.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2)
    );

    console.log('✅ Cart totals updated');
}

function setCartTotals(subtotal, shipping, tax, total) {
    const elements = {
        'subtotal': formatPrice(parseFloat(subtotal)),
        'shipping': formatPrice(parseFloat(shipping)),
        'tax': formatPrice(parseFloat(tax)),
        'total': formatPrice(parseFloat(total))
    };

    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

// ========================
// CART ITEM MANAGEMENT
// ========================
function incrementQuantity(index) {
    if (cart[index]) {
        cart[index].quantity += 1;
        saveAndRefresh();
    }
}

function decrementQuantity(index) {
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            saveAndRefresh();
        } else {
            removeItemFromCart(index);
        }
    }
}

function updateQuantityFromInput(index, newValue) {
    const quantity = parseInt(newValue);
    
    if (isNaN(quantity) || quantity < 1) {
        // Invalid input - reload to reset
        loadCartItems();
        return;
    }

    if (cart[index]) {
        if (quantity <= 0) {
            removeItemFromCart(index);
        } else {
            cart[index].quantity = quantity;
            saveAndRefresh();
        }
    }
}

function removeItemFromCart(index) {
    if (cart[index]) {
        const item = cart[index];
        const itemName = getProductById(item.id)?.name || 'Item';
        cart.splice(index, 1);
        saveAndRefresh();
        showNotification(`${itemName} removed from cart`);
        console.log(`✅ Removed item at index ${index}`);
    }
}

function saveAndRefresh() {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    loadCartItems();
    calculateCartTotals();
    updateCartCount();
    
    console.log('💾 Cart saved');
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = `(${totalItems})`;
    }
}

// ========================
// PROMO CODE (Optional)
// ========================
function applyPromo() {
    const promoInput = document.getElementById('promo-input');
    if (!promoInput) return;

    const code = promoInput.value.toUpperCase().trim();
    
    // Valid promo codes
    const promoCodes = {
        'SAVE10': 0.10,  // 10% discount
        'SAVE20': 0.20,  // 20% discount
        'WELCOME': 0.15  // 15% discount
    };

    if (promoCodes[code]) {
        const subtotal = cart.reduce((sum, ci) => {
            const p = getProductById(ci.id);
            return sum + (p ? p.price * ci.quantity : 0);
        }, 0);
        const discount = subtotal * promoCodes[code];
        
        showNotification(`✅ Promo code applied! You saved $${discount.toFixed(2)}`);
        promoInput.value = '';
        
        console.log(`✅ Promo code "${code}" applied - discount: $${discount.toFixed(2)}`);
    } else if (code === '') {
        showNotification('Please enter a promo code', 'error');
    } else {
        showNotification('Invalid promo code', 'error');
        console.warn(`❌ Invalid promo code: ${code}`);
    }
}

// ========================
// NOTIFICATIONS
// ========================
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    console.log(`ℹ️  ${type.toUpperCase()}: ${message}`);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
