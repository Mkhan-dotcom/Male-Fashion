// ========================
// ORDER SUMMARY PAGE - JavaScript
// ========================

let currentOrder = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Order summary page loaded');
    loadOrderSummary();
    updateCartCount();
});

function loadOrderSummary() {
    // Get order from sessionStorage
    const orderJSON = sessionStorage.getItem('lastOrder');
    
    if (!orderJSON) {
        showEmptyState();
        console.warn('⚠️ No order found in sessionStorage');
        return;
    }
    
    try {
        currentOrder = JSON.parse(orderJSON);
        console.log('✅ Order loaded:', currentOrder.id);
        displayOrderSummary();
    } catch (error) {
        console.error('❌ Error parsing order:', error);
        showEmptyState();
    }
}

function displayOrderSummary() {
    const container = document.getElementById('order-details');
    
    if (!container || !currentOrder) return;

    const order = currentOrder;
    const paymentMethodText = order.paymentMethod === 'card' ? 
        '💳 Credit/Debit Card' : 
        '🚚 Cash on Delivery';

    let html = `
        <!-- Order ID & Date -->
        <div class="detail-section">
            <h3>📋 Order Information</h3>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${order.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${order.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${paymentMethodText}</span>
            </div>
        </div>

        <!-- Customer Info -->
        <div class="detail-section">
            <h3>👤 Delivery Address</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${order.customer.firstName} ${order.customer.lastName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${order.customer.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${order.customer.phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${order.customer.address}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">City, State, Zip:</span>
                <span class="detail-value">${order.customer.city}, ${order.customer.state} ${order.customer.zip}</span>
            </div>
        </div>

        <!-- Items -->
        <div class="detail-section">
            <h3>📦 Order Items</h3>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-details">
                            <p class="item-name">${item.name}</p>
                            <p class="item-qty">Quantity: ${item.quantity}</p>
                        </div>
                        <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Totals -->
        <div class="totals-section">
            <div class="total-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">${formatPrice(order.subtotal)}</span>
            </div>
            <div class="total-row">
                <span class="detail-label">Shipping:</span>
                <span class="detail-value">${formatPrice(order.shipping)}</span>
            </div>
            <div class="total-row">
                <span class="detail-label">Tax (10%):</span>
                <span class="detail-value">${formatPrice(order.tax)}</span>
            </div>
            <div class="total-row grand">
                <span>Total:</span>
                <span>${formatPrice(order.total)}</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function showEmptyState() {
    const container = document.getElementById('order-details');
    container.innerHTML = `
        <div class="empty-state">
            <h2>❌ No Order Found</h2>
            <p>It looks like you don't have an active order to display.</p>
            <a href="shop.html" class="btn btn-primary">Return to Shop</a>
        </div>
    `;
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        // Get cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = `(${totalItems})`;
    }
}

function printOrderSummary() {
    if (!currentOrder) {
        alert('❌ No order to print');
        return;
    }
    console.log('🖨️ Printing order summary...');
    window.print();
}

function downloadOrderSummary() {
    if (!currentOrder) {
        alert('❌ No order to download');
        return;
    }

    console.log('📥 Generating text file download...');

    const order = currentOrder;
    const paymentMethod = order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery';

    let textContent = `
╔════════════════════════════════════════════════════════════════╗
║                     ORDER CONFIRMATION                          ║
║                    Male Fashion Store                           ║
╚════════════════════════════════════════════════════════════════╝

ORDER INFORMATION
─────────────────────────────────────────────────────────────────
Order ID: ${order.id}
Date: ${order.date}
Payment Method: ${paymentMethod}

DELIVERY ADDRESS
─────────────────────────────────────────────────────────────────
Name: ${order.customer.firstName} ${order.customer.lastName}
Email: ${order.customer.email}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
City: ${order.customer.city}, ${order.customer.state} ${order.customer.zip}

ORDER ITEMS
─────────────────────────────────────────────────────────────────
${order.items.map(item => 
    `${item.name.padEnd(40)} x${item.quantity.toString().padStart(2)} | $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

ORDER SUMMARY
─────────────────────────────────────────────────────────────────
Subtotal: $${order.subtotal.toFixed(2)}
Shipping: $${order.shipping.toFixed(2)}
Tax (10%): $${order.tax.toFixed(2)}
─────────────────────────────────────────────────────────────────
TOTAL: $${order.total.toFixed(2)}

Thank you for your order!

═══════════════════════════════════════════════════════════════════
            `;

    // Create blob and download
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Order downloaded');
}
