// ========================
// CHECKOUT.JS - Modern Checkout System
// ========================
// This file handles the complete checkout flow:
// 1. Load cart from localStorage
// 2. Display order summary
// 3. Collect shipping & payment info
// 4. Create temporary order (in-memory only, NO localStorage save)
// 5. Clear cart and redirect to order summary page
// 6. Order details passed via sessionStorage (survives refresh)
// ========================

// NOTE: cart variable is declared in main.js
// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    initCheckoutPage();
});

// ========================
// INITIALIZATION
// ========================
function initCheckoutPage() {
    console.log('🔧 Checkout page initializing...');
    
    // Load and render cart summary
    renderCheckoutSummary();
    updateCheckoutTotals();
    updateCartCount();
    
    // Setup payment method toggle
    setupPaymentMethodToggle();
    
    // Setup shipping method change listener
    setupShippingChangeListener();
    
    // Setup form submission
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', handleCheckoutSubmit);
        // Clear field errors as user types
        form.addEventListener('input', (e) => {
            if (e.target) clearFieldError(e.target);
        });
    }
    
    console.log('✅ Checkout page initialized. Cart items:', cart.length);
}

// ========================
// RENDER FUNCTIONS
// ========================
function renderCheckoutSummary() {
    const container = document.getElementById('cart-items-summary');
    if (!container) {
        console.error('❌ #cart-items-summary not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
        return;
    }
    
    // Render each item
    cart.forEach((ci, index) => {
        const product = getProductById(ci.id);
        if (!product) return;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item-summary';
        itemDiv.innerHTML = `
            <div class="item-name-qty">
                <span class="item-name">${product.name}</span>
                <span class="item-qty">x${ci.quantity}</span>
            </div>
            <span class="item-price">${formatPrice(product.price * ci.quantity)}</span>
        `;
        container.appendChild(itemDiv);
    });
}

function updateCheckoutTotals() {
    if (cart.length === 0) {
        // Set all to $0.00 if cart empty
        setTotalElements('0.00', '0.00', '0.00', '0.00');
        return;
    }
    
    // Get shipping cost from selected radio
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    const shippingCost = shippingRadio ? parseFloat(shippingRadio.value) : 5;
    
    // Calculate totals
    const subtotal = cart.reduce((sum, ci) => {
        const p = getProductById(ci.id);
        return sum + (p ? p.price * ci.quantity : 0);
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingCost + tax;
    
    // Update UI
    setTotalElements(
        subtotal.toFixed(2),
        shippingCost.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2)
    );
}

function setTotalElements(subtotal, shipping, tax, total) {
    const elements = {
        'subtotal': formatPrice(parseFloat(subtotal)),
        'shipping-total': formatPrice(parseFloat(shipping)),
        'tax-total': formatPrice(parseFloat(tax)),
        'grand-total': formatPrice(parseFloat(total))
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

// ------------------------
// Validation helpers
// ------------------------
function markFieldError(el, message) {
    if (!el) return;
    el.classList.add('input-error');
    // attach or update sibling error message
    let err = el.parentElement.querySelector('.field-error');
    if (!err) {
        err = document.createElement('div');
        err.className = 'field-error';
        el.parentElement.appendChild(err);
    }
    err.textContent = message || 'Invalid value';
}

function clearFieldError(el) {
    if (!el) return;
    el.classList.remove('input-error');
    const err = el.parentElement.querySelector('.field-error');
    if (err) err.remove();
}

function clearAllFieldErrors(form) {
    if (!form) return;
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach(el => el.remove());
}

function validateEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s()-]/g, '');
    return /^\+?\d{7,15}$/.test(cleaned);
}

function luhnCheck(num) {
    const digits = num.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
}

function validateExpiry(exp) {
    if (!exp) return false;
    // Accept MM/YY or MM/YYYY
    const m = exp.split('/');
    if (m.length !== 2) return false;
    let month = parseInt(m[0], 10);
    let year = parseInt(m[1], 10);
    if (isNaN(month) || isNaN(year)) return false;
    if (year < 100) year += 2000;
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month - 1, 1);
    // Set to end of month
    expDate.setMonth(expDate.getMonth() + 1);
    return expDate > now;
}

function validateCvv(cvv) {
    return /^\d{3,4}$/.test((cvv||'').trim());
}


function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = `(${totalItems})`;
    }
}

// ========================
// EVENT LISTENERS
// ========================
function setupPaymentMethodToggle() {
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardSection = document.getElementById('card-section');
    
    if (!cardSection) {
        console.warn('⚠️ #card-section not found');
        return;
    }
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'card') {
                // Show card fields
                cardSection.style.display = 'block';
                cardSection.querySelectorAll('input').forEach(input => {
                    input.required = true;
                });
                console.log('💳 Card payment selected - showing card fields');
            } else {
                // Hide card fields
                cardSection.style.display = 'none';
                cardSection.querySelectorAll('input').forEach(input => {
                    input.required = false;
                    input.value = ''; // Clear card fields
                });
                console.log('🚚 Cash on Delivery selected - hiding card fields');
            }
        });
    });
}

function setupShippingChangeListener() {
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log(`📦 Shipping method changed to: $${this.value}`);
            updateCheckoutTotals();
        });
    });
}

// ========================
// FORM SUBMISSION & CHECKOUT
// ========================
function handleCheckoutSubmit(event) {
    event.preventDefault();
    console.log('🛒 Checkout form submitted');
    
    // Validate cart
    if (cart.length === 0) {
        alert('❌ Your cart is empty');
        return;
    }
    
    // Get form data
    const formData = collectCheckoutFormData();
    if (!formData) {
        // Error already alerted in collectCheckoutFormData
        return;
    }
    
    console.log('✅ Form data validated:', formData);
    
    // Create order object (in-memory only)
    const order = createOrder(formData);
    console.log('📋 Order created:', order.id);
    
    // Store order in sessionStorage (survives page refresh, cleared on tab close)
    sessionStorage.setItem('lastOrder', JSON.stringify(order));
    console.log('💾 Order stored in sessionStorage (NOT localStorage)');
    
    // Clear cart from localStorage
    clearCart();
    console.log('🗑️ Cart cleared');
    
    // Redirect to order summary page
    console.log('🔄 Redirecting to order summary...');
    setTimeout(() => {
        window.location.href = 'ordersummary.html';
    }, 100);
}

function collectCheckoutFormData() {
    const form = document.getElementById('checkout-form');
    clearAllFieldErrors(form);

    // Shipping fields
    const fnameEl = document.getElementById('fname');
    const lnameEl = document.getElementById('lname');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const addressEl = document.getElementById('address');
    const cityEl = document.getElementById('city');
    const stateEl = document.getElementById('state');
    const zipEl = document.getElementById('zip');

    const fname = fnameEl?.value.trim();
    const lname = lnameEl?.value.trim();
    const email = emailEl?.value.trim();
    const phone = phoneEl?.value.trim();
    const address = addressEl?.value.trim();
    const city = cityEl?.value.trim();
    const state = stateEl?.value.trim();
    const zip = zipEl?.value.trim();

    // Required fields
    const requiredFields = [
        { el: fnameEl, val: fname, msg: 'First name required' },
        { el: lnameEl, val: lname, msg: 'Last name required' },
        { el: emailEl, val: email, msg: 'Email required' },
        { el: phoneEl, val: phone, msg: 'Phone required' },
        { el: addressEl, val: address, msg: 'Address required' },
        { el: cityEl, val: city, msg: 'City required' },
        { el: stateEl, val: state, msg: 'State required' },
        { el: zipEl, val: zip, msg: 'Zip required' }
    ];

    for (const f of requiredFields) {
        if (!f.val) {
            markFieldError(f.el, f.msg);
            f.el?.focus();
            return null;
        }
    }

    // Email format
    if (!validateEmail(email)) {
        markFieldError(emailEl, 'Enter a valid email');
        emailEl.focus();
        return null;
    }

    // Phone format
    if (!validatePhone(phone)) {
        markFieldError(phoneEl, 'Enter a valid phone number');
        phoneEl.focus();
        return null;
    }

    // Shipping method
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    if (!shippingRadio) {
        alert('❌ Please select a shipping method');
        return null;
    }
    const shippingCost = parseFloat(shippingRadio.value);

    // Payment method
    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    if (!paymentRadio) {
        alert('❌ Please select a payment method');
        return null;
    }
    const paymentMethod = paymentRadio.value;

    // Card details (if paying by card)
    let cardDetails = null;
    if (paymentMethod === 'card') {
        const cardNameEl = document.getElementById('card-name');
        const cardNumberEl = document.getElementById('card-number');
        const cardExpiryEl = document.getElementById('card-expiry');
        const cardCvvEl = document.getElementById('card-cvv');

        const cardName = cardNameEl?.value.trim();
        const cardNumber = cardNumberEl?.value.trim();
        const cardExpiry = cardExpiryEl?.value.trim();
        const cardCvv = cardCvvEl?.value.trim();

        if (!cardName) { markFieldError(cardNameEl, 'Cardholder name required'); cardNameEl.focus(); return null; }
        if (!cardNumber || !/^[\d\s]+$/.test(cardNumber) || !luhnCheck(cardNumber)) { markFieldError(cardNumberEl, 'Enter a valid card number'); cardNumberEl.focus(); return null; }
        if (!cardExpiry || !validateExpiry(cardExpiry)) { markFieldError(cardExpiryEl, 'Enter a valid expiry (MM/YY)'); cardExpiryEl.focus(); return null; }
        if (!cardCvv || !validateCvv(cardCvv)) { markFieldError(cardCvvEl, 'Enter a valid CVV'); cardCvvEl.focus(); return null; }

        cardDetails = {
            name: cardName,
            number: cardNumber.replace(/\s+/g, ''),
            expiry: cardExpiry,
            cvv: cardCvv
        };
    }

    // Terms & conditions
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox?.checked) {
        alert('❌ Please agree to terms and conditions');
        return null;
    }

    return {
        shipping: {
            firstName: fname,
            lastName: lname,
            email: email,
            phone: phone,
            address: address,
            city: city,
            state: state,
            zip: zip
        },
        shippingMethod: {
            cost: shippingCost
        },
        paymentMethod: paymentMethod,
        cardDetails: cardDetails
    };
}

function createOrder(formData) {
    // Build order items from current cart by looking up products
    const itemsDetailed = cart.map(ci => {
        const p = getProductById(ci.id);
        return p ? { id: p.id, name: p.name, price: p.price, quantity: ci.quantity } : null;
    }).filter(i => i);
    const subtotal = itemsDetailed.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const shippingCost = formData.shippingMethod.cost;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;
    
    return {
        id: 'ORD-' + Date.now(),
        date: new Date().toLocaleString(),
        customer: formData.shipping,
        items: itemsDetailed,
        subtotal: subtotal,
        shipping: shippingCost,
        tax: tax,
        total: total,
        paymentMethod: formData.paymentMethod
    };
}

function clearCart() {
    // Remove from localStorage
    localStorage.removeItem('cart');
    
    // Reset cart array
    cart = [];
    
    // Update UI
    updateCartCount();
    renderCheckoutSummary();
}

// ========================
// CART MANAGEMENT (Secondary)
// These are used when adding/removing items from checkout
// ========================
function addToCart(product) {
    // Lightweight add: store only id & quantity
    const existing = cart.find(ci => ci.id == product.id);
    if (existing) {
        existing.quantity = Number(existing.quantity) + 1;
    } else {
        cart.push({ id: product.id, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCheckoutSummary();
    updateCheckoutTotals();
    console.log(`✅ Added "${product.name}" to cart`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCheckoutSummary();
    updateCheckoutTotals();
    console.log(`✅ Removed item from cart`);
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = Number(newQuantity);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCheckoutSummary();
            updateCheckoutTotals();
            console.log(`✅ Updated quantity for item`);
        }
    }
}

function renderCart() {
    renderCheckoutSummary();
    updateCheckoutTotals();
    updateCartCount();
}
