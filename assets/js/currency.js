// ========================
// CURRENCY.JS - Currency Conversion System
// ========================
// Handles currency selection, conversion, and display across the website

// Exchange rates (PKR to USD)
// 1 USD = 278 PKR (you can update this rate)
const EXCHANGE_RATES = {
    USD: 1,
    PKR: 278  // 1 USD = 278 PKR
};

// Currency symbols
const CURRENCY_SYMBOLS = {
    USD: '$',
    PKR: '₨'
};

// Get current selected currency (default: USD)
function getCurrentCurrency() {
    return localStorage.getItem('selectedCurrency') || 'USD';
}

// Set selected currency
function setSelectedCurrency(currency) {
    if (currency === 'USD' || currency === 'PKR') {
        localStorage.setItem('selectedCurrency', currency);
        // Reload page to apply currency to all prices
        location.reload();
    }
}

// Convert price from USD to selected currency
function convertPrice(priceInUSD, targetCurrency = null) {
    const currency = targetCurrency || getCurrentCurrency();
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedPrice = (priceInUSD || 0) * rate;
    return convertedPrice;
}

// Format price with currency symbol
function formatPrice(priceInUSD, currency = null) {
    const selectedCurrency = currency || getCurrentCurrency();
    const convertedPrice = convertPrice(priceInUSD, selectedCurrency);
    const symbol = CURRENCY_SYMBOLS[selectedCurrency];
    return `${symbol}${convertedPrice.toFixed(2)}`;
}

// Get currency symbol
function getCurrencySymbol(currency = null) {
    const selectedCurrency = currency || getCurrentCurrency();
    return CURRENCY_SYMBOLS[selectedCurrency] || '$';
}

// Initialize currency selector in navbar
function initializeCurrencySelector() {
    const navMenu = document.querySelector('.nav-menu ul');
    if (!navMenu) return;

    const currentCurrency = getCurrentCurrency();
    
    // Create currency selector if it doesn't exist
    let currencySelector = document.getElementById('currency-selector');
    if (!currencySelector) {
        currencySelector = document.createElement('li');
        currencySelector.id = 'currency-selector';
        currencySelector.className = 'currency-selector';
        currencySelector.innerHTML = `
            <div class="currency-dropdown">
                <button class="currency-btn" id="currency-toggle">
                    <span id="currency-display">${currentCurrency}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="currency-options">
                    <button class="currency-option" data-currency="USD">
                        <span class="currency-code">USD</span>
                        <span class="currency-symbol">$</span>
                    </button>
                    <button class="currency-option" data-currency="PKR">
                        <span class="currency-code">PKR</span>
                        <span class="currency-symbol">₨</span>
                    </button>
                </div>
            </div>
        `;
        
        // Insert currency selector before the last item (Login/Admin)
        navMenu.insertBefore(currencySelector, navMenu.lastElementChild);
    }

    // Update display to show current currency
    const currencyDisplay = document.getElementById('currency-display');
    if (currencyDisplay) {
        currencyDisplay.textContent = currentCurrency;
    }

    // Add event listeners
    const currencyToggle = document.getElementById('currency-toggle');
    const currencyOptions = document.querySelectorAll('.currency-option');
    const currencyDropdown = document.querySelector('.currency-dropdown');

    if (currencyToggle) {
        currencyToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            currencyDropdown.classList.toggle('active');
        });
    }

    currencyOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedCurrency = this.dataset.currency;
            setSelectedCurrency(selectedCurrency);
        });

        // Highlight current currency
        if (option.dataset.currency === currentCurrency) {
            option.classList.add('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== currencyToggle && !currencyToggle.contains(e.target)) {
            if (currencyDropdown) {
                currencyDropdown.classList.remove('active');
            }
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeCurrencySelector();
});

// Fallback initialization on window load
window.addEventListener('load', function() {
    if (!document.getElementById('currency-selector')) {
        initializeCurrencySelector();
    }
});
