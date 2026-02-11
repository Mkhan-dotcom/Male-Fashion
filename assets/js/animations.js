// Wrap in IIFE to catch unexpected runtime errors when running via file://
(function(){
    try {
        // ========================
        // ANIMATIONS.JS - Animations and UI Effects
        // ========================

        // Smooth scroll behavior (safe-guarded)
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    try {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } catch (err) { /* ignore per-anchor errors */ }
                });
            });
        } catch (err) { /* no anchors or other issue */ }

        // Add animation on scroll
        function observeElements() {
            if (!('IntersectionObserver' in window)) return;
            const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            document.querySelectorAll('.product-card, .feature-card, .team-member').forEach(el => {
                observer.observe(el);
            });
        }

        // Initialize animations on page load - only call functions if defined
        document.addEventListener('DOMContentLoaded', () => {
            try { if (typeof loadAllProducts === 'function') loadAllProducts(); } catch(e){}
            try { observeElements(); } catch(e){}
            try { if (typeof initProductPage === 'function') initProductPage(); } catch(e){}
            try { if (typeof setupFormValidation === 'function') setupFormValidation(); } catch(e){}
        });

        // Get product ID from URL parameters
        function getProductIdFromURL() {
            try {
                const params = new URLSearchParams(window.location.search);
                return parseInt(params.get('id'));
            } catch (err) { return null; }
        }

        // Basic product page initializer (keeps behavior local-only)
        function initProductPage() {
            try {
                const productId = getProductIdFromURL();
                if (!productId) return;
                if (!Array.isArray(products)) return;
                const product = products.find(p => p.id === productId);
                if (!product) {
                    const container = document.createElement('div');
                    container.className = 'container';
                    container.style.padding = '50px';
                    container.style.textAlign = 'center';
                    container.innerHTML = '<h2>Product not found</h2>';
                    document.body.appendChild(container);
                    return;
                }
                // Safe DOM writes
                try { document.getElementById('product-name').textContent = product.name; } catch(e){}
                try { const el = document.getElementById('product-price'); if(el) el.textContent = formatPrice(product.price); } catch(e){}
                try { document.getElementById('product-description').textContent = product.description || ''; } catch(e){}
                try { if (document.getElementById('main-product-image')) document.getElementById('main-product-image').src = product.image || ''; } catch(e){}
                // sizes/colors rendering safe
                try {
                    const sizeOptions = document.getElementById('size-options');
                    if (sizeOptions && Array.isArray(product.sizes)) {
                        sizeOptions.innerHTML = product.sizes.map(size => `<button class="size-btn" onclick="selectSize(this)">${size}</button>`).join('');
                        sizeOptions.querySelector('button')?.classList.add('active');
                    }
                } catch(e){}
                try {
                    const colorOptions = document.getElementById('color-options');
                    if (colorOptions && Array.isArray(product.colors)) {
                        colorOptions.innerHTML = product.colors.map(color => `<button class="color-btn" onclick="selectColor(this)">${color}</button>`).join('');
                        colorOptions.querySelector('button')?.classList.add('active');
                    }
                } catch(e){}
                try { if (typeof loadRelatedProducts === 'function') loadRelatedProducts(product.category, product.id); } catch(e){}
            } catch (err) { /* ignore */ }
        }

        // Select size/color helpers (attach globally)
        window.selectSize = function(button){ try{ document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active')); button.classList.add('active'); }catch(e){} };
        window.selectColor = function(button){ try{ document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active')); button.classList.add('active'); }catch(e){} };

        // Setup minimal form validation stub if not present
        if (typeof setupFormValidation !== 'function') {
            window.setupFormValidation = function(){
                document.querySelectorAll('form').forEach(form => {
                    form.addEventListener('submit', (e) => {
                        // default: allow submission, other scripts handle validation
                    });
                });
            };
        }

        // Add focus animations to form inputs
        document.addEventListener('focusin', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 26, 26, 0.1)';
            }
        });
        document.addEventListener('focusout', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                e.target.style.boxShadow = 'none';
            }
        });

        // Add hover animations to buttons (safe-guarded)
        try {
            document.querySelectorAll('.btn').forEach(button => {
                button.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-2px)'; });
                button.addEventListener('mouseleave', function() { this.style.transform = 'translateY(0)'; });
            });
        } catch(e){}

        // Price range slider update
        try {
            const priceRange = document.getElementById('price-range');
            if (priceRange) priceRange.addEventListener('input', (e) => { const pv = document.getElementById('price-value'); if(pv) pv.textContent = e.target.value; });
        } catch(e){}

        // Lazy load images
        try {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            imageObserver.unobserve(img);
                        }
                    });
                });
                document.querySelectorAll('img[data-src]').forEach(img => { imageObserver.observe(img); });
            }
        } catch(e){}

        // Add animation styles dynamically
        try {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-in { animation: slideIn 0.6s ease-out; }
                .product-card, .feature-card, .team-member { opacity: 0; }
                .product-card.animate-in, .feature-card.animate-in, .team-member.animate-in { opacity: 1; }
            `;
            document.head.appendChild(style);
        } catch(e){}

        // Keyboard navigation for shopping
        try {
            document.addEventListener('keydown', (e) => {
                if (e.key && e.key.toLowerCase() === 'c' && e.ctrlKey) { window.location.href = 'cart.html'; }
                if (e.key === '/') { e.preventDefault(); window.location.href = 'shop.html'; }
            });
        } catch(e){}

        // Add CSS class to active navigation links
        function setActiveNavLink() {
            try {
                const current = (window.location.pathname || '').split('/').pop();
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                    try { if (link.href && link.href.includes(current)) link.classList.add('active'); } catch(e){}
                });
            } catch(e){}
        }
        document.addEventListener('DOMContentLoaded', setActiveNavLink);

    } catch (err) {
        console.error('animations.js runtime error:', err);
    }
})();
