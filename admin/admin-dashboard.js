// Admin Dashboard Functionality

 
// ==================== SECTION NAVIGATION ====================
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');

        // Update page title
        const titleMap = {
            'dashboard': 'Dashboard',
            'products': 'Manage Products',
            'add-product': 'Add New Product',
            'categories': 'Categories',
            'settings': 'Settings'
        };
        document.getElementById('page-title').textContent = titleMap[sectionId] || 'Dashboard';

        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        event.target.closest('.nav-item')?.classList.add('active');

        // Load section-specific data
        if (sectionId === 'products') {
            loadProducts();
        } else if (sectionId === 'categories') {
            loadCategories();
        }
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// ==================== DASHBOARD ====================
function loadDashboard() {
    const products = getAllProducts();
    const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];

    let totalValue = 0;
    products.forEach(p => {
        totalValue += p.price * (p.stock || 0);
    });

    document.getElementById('stat-total').textContent = products.length;
    document.getElementById('stat-custom').textContent = customProducts.length;
    document.getElementById('stat-value').textContent = '$' + totalValue.toFixed(2);
    document.getElementById('stat-avg').textContent = '$' + (products.length > 0 ? (totalValue / products.length).toFixed(2) : 0);

    // Load recent products
    loadRecentProducts();
}

function loadRecentProducts() {
    const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    const recent = customProducts.slice(-5).reverse();

    const container = document.getElementById('recent-products');
    container.innerHTML = '';

    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No products added yet</p>';
        return;
    }

    recent.forEach(product => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
            <div class="recent-item-info">
                <h4>${product.name}</h4>
                <p class="recent-item-price">$${product.price}</p>
            </div>
            <span class="recent-item-date">${new Date(product.createdAt).toLocaleDateString()}</span>
        `;
        container.appendChild(item);
    });
}

// ==================== PRODUCT MANAGEMENT ====================
function getAllProducts() {
    const defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    return [...defaultProducts, ...customProducts];
}


function handleAddProduct(event) {
    event.preventDefault();

    // Accept either an uploaded image (preview) or an image filename (offline)
    const filenameInput = document.getElementById('product-image-filename')?.value.trim();
    if (!filenameInput && !window.selectedImageData) {
        showNotification('❌ Please upload a product image or provide an image filename!', 'error');
        return;
    }

    // Get form data
    const formData = {
        id: Date.now(),
        name: document.getElementById('product-name').value,
        sku: document.getElementById('product-sku').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        discount: parseInt(document.getElementById('product-discount').value) || 0,
        description: document.getElementById('product-description').value,
        image: (function(){
            if (filenameInput) return `assets/img/products/${filenameInput}`;
            if (window.selectedImageData) {
                // prefer base64 data for immediate display
                return window.selectedImageData.data || window.selectedImageData.path || null;
            }
            return null;
        })(),
        sizes: getSelectedSizes(),
        colors: getSelectedColors(),
        createdAt: new Date().toISOString(),
        type: 'custom'
    };

    // Save to localStorage
    const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    customProducts.push(formData);
    localStorage.setItem('customProducts', JSON.stringify(customProducts));

    // Save to default products list for shop display
    const defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    defaultProducts.push(formData);
    localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));

    showNotification('✅ Product added successfully!', 'success');
    document.getElementById('add-product-form').reset();
    const preview = document.getElementById('image-preview-container') || document.getElementById('image-preview');
    if (preview) preview.innerHTML = '';
    window.selectedImageData = null;

    // Reload dashboard
    loadDashboard();
    loadProducts();
}

function getSelectedSizes() {
    // Form uses name="size" for size checkboxes
    const checkboxes = document.querySelectorAll('input[name="size"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedColors() {
    // Read comma-separated colors from #product-colors input (matches add-product.html)
    const colorsField = document.getElementById('product-colors');
    if (!colorsField) return [];
    return colorsField.value.split(',').map(s => s.trim()).filter(s => s);
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) {
        showNotification('No file selected', 'error');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }

    // Store filename, virtual path and base64 data for display and storage
    window.selectedImageData = {
        filename: file.name,
        path: `assets/img/products/${file.name}`,
        data: null // will be filled after FileReader loads
    };

    const reader = new FileReader();
    reader.onload = function(e) {
        // Save base64 data
        window.selectedImageData.data = e.target.result;

        // Show preview to user; support both dashboard and standalone add-product pages
        const container = document.getElementById('image-preview-container') || document.getElementById('image-preview');
        if (container) {
            container.innerHTML = `
                <div class="preview-image-wrapper">
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImage()">✕</button>
                    <p style="text-align: center; font-size: 12px; margin-top: 5px; color: #666;">File: ${file.name}</p>
                </div>
            `;
        }
        showNotification('Image selected successfully!', 'success');
    };
    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    window.selectedImageData = null;
    document.getElementById('product-image').value = '';
    const preview = document.getElementById('image-preview-container') || document.getElementById('image-preview');
    if (preview) preview.innerHTML = '';
}

function loadProducts() {
    const products = getAllProducts();
    const container = document.getElementById('products-list');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No products found</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        const discountClass = product.discount > 0 ? 'has-discount' : '';
        
        row.innerHTML = `
            <td><img src="${(typeof product.image === 'string' ? product.image : 'assets/img/products/placeholder.jpg')}" alt="${product.name}" class="product-thumbnail" onerror="this.src='assets/img/products/placeholder.jpg'"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>
                <span class="${discountClass}">$${product.price}</span>
                ${product.discount > 0 ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
            </td>
            <td>${product.stock}</td>
            <td><span class="type-badge ${product.type}">${product.type}</span></td>
            <td class="actions">
                <button class="btn-edit" onclick="openEditModal(${product.id})">✎</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
            </td>
        `;
        container.appendChild(row);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('filter-search').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;

    const products = getAllProducts().filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const container = document.getElementById('products-list');
    container.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${(typeof product.image === 'string' ? product.image : 'assets/img/products/placeholder.jpg')}" alt="${product.name}" class="product-thumbnail" onerror="this.src='assets/img/products/placeholder.jpg'"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td><span class="type-badge ${product.type}">${product.type}</span></td>
            <td class="actions">
                <button class="btn-edit" onclick="openEditModal(${product.id})">✎</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
            </td>
        `;
        container.appendChild(row);
    });
}

function searchProducts() {
    filterProducts();
}

function openEditModal(productId) {
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    currentEditProduct = product;

    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-stock').value = product.stock;
    document.getElementById('edit-discount').value = product.discount || 0;
    document.getElementById('edit-description').value = product.description;

    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
    currentEditProduct = null;
}

function handleEditProduct(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('edit-product-id').value);
    const updatedData = {
        name: document.getElementById('edit-name').value,
        price: parseFloat(document.getElementById('edit-price').value),
        stock: parseInt(document.getElementById('edit-stock').value),
        discount: parseInt(document.getElementById('edit-discount').value),
        description: document.getElementById('edit-description').value
    };

    // Update in custom products
    let customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    const customIndex = customProducts.findIndex(p => p.id === productId);
    if (customIndex !== -1) {
        customProducts[customIndex] = { ...customProducts[customIndex], ...updatedData };
        localStorage.setItem('customProducts', JSON.stringify(customProducts));
    }

    // Update in default products
    let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    const defaultIndex = defaultProducts.findIndex(p => p.id === productId);
    if (defaultIndex !== -1) {
        defaultProducts[defaultIndex] = { ...defaultProducts[defaultIndex], ...updatedData };
        localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));
    }

    showNotification('Product updated successfully!', 'success');
    closeEditModal();
    loadProducts();
    loadDashboard();
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    // Remove from custom products
    let customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    customProducts = customProducts.filter(p => p.id !== productId);
    localStorage.setItem('customProducts', JSON.stringify(customProducts));

    // Remove from default products
    let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    defaultProducts = defaultProducts.filter(p => p.id !== productId);
    localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));

    showNotification('Product deleted successfully!', 'success');
    loadProducts();
    loadDashboard();
}

// ==================== CATEGORIES ====================
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [
        { id: 1, name: 'Shirts' },
        { id: 2, name: 'Pants' },
        { id: 3, name: 'Jackets' },
        { id: 4, name: 'Accessories' },
        { id: 5, name: 'Shoes' }
    ];

    localStorage.setItem('categories', JSON.stringify(categories));

    const container = document.getElementById('categories-list');
    container.innerHTML = '';

    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <h3>${cat.name}</h3>
            <p>${getAllProducts().filter(p => p.category === cat.name.toLowerCase()).length} products</p>
            <button onclick="deleteCategory(${cat.id})" class="btn-small-delete">Remove</button>
        `;
        container.appendChild(card);
    });
}

function handleAddCategory(event) {
    event.preventDefault();

    const categoryName = document.getElementById('new-category').value;
    const categories = JSON.parse(localStorage.getItem('categories')) || [];

    const newCategory = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        name: categoryName
    };

    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));

    showNotification('Category added successfully!', 'success');
    document.getElementById('new-category').value = '';
    loadCategories();
}

function deleteCategory(categoryId) {
    if (!confirm('Are you sure?')) return;

    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories = categories.filter(c => c.id !== categoryId);
    localStorage.setItem('categories', JSON.stringify(categories));

    showNotification('Category deleted!', 'success');
    loadCategories();
}

// ==================== SETTINGS ====================
function saveSettings() {
    const settings = {
        storeName: document.getElementById('store-name').value,
        storeEmail: document.getElementById('store-email').value
    };

    localStorage.setItem('storeSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;

    if (!currentPassword || !newPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    const adminCreds = JSON.parse(localStorage.getItem('adminCredentials')) || {
        username: 'admin',
        password: 'admin123'
    };

    if (currentPassword !== adminCreds.password) {
        showNotification('Current password is incorrect', 'error');
        return;
    }

    adminCreds.password = newPassword;
    localStorage.setItem('adminCredentials', JSON.stringify(adminCreds));

    showNotification('Password changed successfully!', 'success');
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
}

// ==================== BACKUP & RESTORE ====================
function downloadBackup() {
    const backup = {
        customProducts: JSON.parse(localStorage.getItem('customProducts')) || [],
        defaultProducts: JSON.parse(localStorage.getItem('defaultProducts')) || [],
        categories: JSON.parse(localStorage.getItem('categories')) || [],
        settings: JSON.parse(localStorage.getItem('storeSettings')) || {},
        backupDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `male-fashion-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('Backup downloaded!', 'success');
}

function showRestoreUI() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const backup = JSON.parse(event.target.result);
                localStorage.setItem('customProducts', JSON.stringify(backup.customProducts));
                localStorage.setItem('defaultProducts', JSON.stringify(backup.defaultProducts));
                localStorage.setItem('categories', JSON.stringify(backup.categories));
                localStorage.setItem('storeSettings', JSON.stringify(backup.settings));

                showNotification('Backup restored successfully!', 'success');
                loadDashboard();
                loadProducts();
                loadCategories();
            } catch (err) {
                showNotification('Invalid backup file!', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function confirmClearData() {
    if (confirm('⚠️ Are you sure? This will delete ALL products and data. This cannot be undone!')) {
        if (confirm('⚠️ LAST WARNING: Click OK to permanently delete everything')) {
            localStorage.removeItem('customProducts');
            localStorage.removeItem('defaultProducts');
            localStorage.removeItem('categories');
            showNotification('All data cleared!', 'success');
            loadDashboard();
            loadProducts();
            loadCategories();
        }
    }
}

function showNotification(message, type = 'info') {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = `notification show ${type}`;

    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}
