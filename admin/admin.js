// ========================
// ADMIN.JS - Admin Panel Functionality
// ========================

// Load products from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdmin');
    // Allow admin access for demo purposes
    
    // Display admin user name
    const user = getCurrentUser();
    if (user && document.getElementById('admin-user-name')) {
        document.getElementById('admin-user-name').textContent = 
            user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User';
    }
    
    // Load admin products if on manage products page
    if (document.getElementById('products-list')) {
        loadAdminProducts();
    }
});

// Preview product image before upload
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (!preview) return;
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="preview-image-wrapper">
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" onclick="clearImage()" class="btn btn-secondary btn-small">Remove</button>
                </div>
            `;
            // Store image data
            window.selectedImageData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Clear image preview
function clearImage() {
    document.getElementById('product-image').value = '';
    document.getElementById('image-preview').innerHTML = '';
    window.selectedImageData = null;
}

// Handle add product form
function handleAddProduct(event) {
    event.preventDefault();
    
    // Check if image is provided
    if (!window.selectedImageData) {
        showNotification('Please upload a product image', 'error');
        return;
    }
    
    // Get form values
    const productName = document.getElementById('product-name').value.trim();
    const productSKU = document.getElementById('product-sku').value.trim();
    const productDescription = document.getElementById('product-description').value.trim();
    const productCategory = document.getElementById('product-category').value;
    const productBrand = document.getElementById('product-brand').value.trim() || 'Generic';
    const productPrice = parseFloat(document.getElementById('product-price').value);
    const productStock = parseInt(document.getElementById('product-stock').value);
    
    // Get sizes
    const sizes = Array.from(document.querySelectorAll('input[name="size"]:checked'))
        .map(cb => cb.value);
    
    // Get colors
    const colorsInput = document.getElementById('product-colors').value;
    const colors = colorsInput.split(',').map(c => c.trim()).filter(c => c) || ['No Color'];
    
    // Validate
    if (!productName || !productSKU || !productDescription || !productCategory || !productPrice || productStock === '' ) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (productPrice <= 0) {
        showNotification('Price must be greater than 0', 'error');
        return;
    }
    
    if (productStock < 0) {
        showNotification('Stock cannot be negative', 'error');
        return;
    }
    
    if (sizes.length === 0) {
        sizes.push('One Size');
    }
    
    // Load existing products from localStorage
    let adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
    
    // Create product ID
    const productId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1;
    
    // Create product object with image data
    const newProduct = {
        id: productId,
        name: productName,
        sku: productSKU,
        description: productDescription,
        category: productCategory,
        brand: productBrand,
        price: productPrice,
        stock: productStock,
        sizes: sizes,
        colors: colors,
        image: window.selectedImageData, // Store base64 image data
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString()
    };
    
    // Add to products array
    adminProducts.push(newProduct);
    
    // Save to localStorage
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    
    showNotification('Product added successfully!');
    
    // Reset form
    document.getElementById('add-product-form').reset();
    clearImage();
    
    // Redirect to admin page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1500);
}

// Load and display admin products
function loadAdminProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
    
    if (adminProducts.length === 0) {
        productsList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No products added yet. <a href="add-product.html">Add a product</a></td></tr>';
        return;
    }
    
    productsList.innerHTML = adminProducts.map(product => `
        <tr>
            <td>
                <img src="${(typeof product.image === 'string' ? product.image : 'assets/img/products/placeholder.jpg')}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='assets/img/products/placeholder.jpg'">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <div class="admin-actions">
                    <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteProduct(${product.id})" style="background-color: #e74c3c; color: white;">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
        adminProducts = adminProducts.filter(p => p.id !== productId);
        localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
        showNotification('Product deleted successfully!');
        loadAdminProducts();
    }
}

// Edit product
function editProduct(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
}

// Delete product from admin function
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const index = products.findIndex(p => p.id === productId);
        if (index > -1) {
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            showNotification('Product deleted successfully!');
            location.reload();
        }
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    // Get orders from localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Find and update order
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('Order status updated!');
        location.reload();
    }
}

// Export data (orders, products, etc.)
function exportData(dataType) {
    let data = [];
    let filename = '';
    
    switch(dataType) {
        case 'orders':
            data = JSON.parse(localStorage.getItem('orders')) || [];
            filename = 'orders.json';
            break;
        case 'products':
            data = JSON.parse(localStorage.getItem('adminProducts')) || [];
            filename = 'products.json';
            break;
        case 'customers':
            data = JSON.parse(localStorage.getItem('customers')) || [];
            filename = 'customers.json';
            break;
    }
    
    if (data.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    // Convert to JSON and download
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    showNotification(`${dataType} exported successfully!`);
}

// Get dashboard statistics
function getDashboardStats() {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
    const stats = {
        totalProducts: adminProducts.length,
        totalSales: 12450,
        totalOrders: 342,
        totalCustomers: 1205,
    };
    
    return stats;
}

// Generate sales report
function generateReport(period) {
    const reports = {
        'daily': 'Daily Report',
        'weekly': 'Weekly Report',
        'monthly': 'Monthly Report',
        'yearly': 'Yearly Report'
    };
    
    showNotification(`${reports[period]} generated successfully!`);
}

// Admin logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        showNotification('Logged out successfully');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1000);
    }
}
