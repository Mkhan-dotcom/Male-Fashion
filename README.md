# Male Fashion E-Commerce Website
Authur -> Muhammad Khan    -> email -> "mkhansethar65@gmal.com"
A fully functional e-commerce platform for men's fashion with an integrated admin panel for product management.

## Features

### Customer Features
✅ **Browse Products**
- Shop page with all products
- Product filtering by category
- Sort products (price, popularity, latest)
- Product detail pages with images and descriptions

✅ **Shopping Cart**
- Add products to cart
- Update quantities
- Remove items
- View cart summary
- Apply promo codes

✅ **Checkout**
- Secure checkout process
- Shipping options (Standard, Express, Overnight)
- Payment information form
- Order confirmation

✅ **User Accounts**
- Sign up / Create account
- Login / Logout
- Account management
- Wishlist functionality

✅ **Additional Pages**
- Home page with featured products
- About Us page
- Contact Us with form
- Footer with links

### Admin Features
✅ **Product Management**
- Add new products with images
- Upload images from local storage (converted to base64)
- Edit product details
- Delete products
- Manage product variants (sizes, colors)

✅ **Admin Dashboard**
- View statistics
- See total products added
- Quick access to product management
- Logout functionality

✅ **Automatic Integration**
- Added products instantly appear in shop
- Products available for purchase
- Searchable and filterable
- Full shopping cart integration

## git remote add origin https://github.com/Mkhan-dotcom/Male-Fashion.git
## How to Use

### For Customers
1. Open `index.html` in your browser
2. Browse products in the Shop
3. Click on products to see details
4. Add items to cart
5. Proceed to checkout
6. Complete purchase

### For Admin
1. Go to `/admin/admin.html`
2. Click "Add Product"
3. Fill in product details:
   - Name, SKU, Description
   - Category, Price, Stock
   - **Browse and upload image from your computer**
   - Select sizes and colors
4. Click "Add Product"
5. Product instantly appears in shop!

## Technology Stack
- **HTML5** - Structure
- **CSS3** - Styling & Responsive Design
- **JavaScript (Vanilla)** - Functionality
- **LocalStorage** - Data persistence
- **Base64** - Image encoding for storage

## Key Features Explained

### Image Upload System
- Admin can browse and select images from local storage
- Images are converted to base64 format
- Stored in browser's localStorage
- No backend server required
- Works offline

### Product Data Storage
- All products stored in browser's localStorage
- Data persists between sessions
- Admin products automatically merge with default products
- Maximum storage: ~5-10MB (browser dependent)

### Shopping Cart
- Uses localStorage for persistence
- Add/remove items
- Update quantities
- Calculate totals with tax
- Promo code support

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Desktop, tablet, and mobile support
- Touch-friendly interface

## Browser Compatibility
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera
- Mobile browsers

## Data Persistence
All data is stored in your browser:
- Products (default + admin added)
- Shopping cart
- User accounts (for demo)
- Contact messages

⚠️ **Note**: Clearing browser cache/cookies will delete all stored data.

## Getting Started

1. **Add Your First Product**
   - Go to `/admin/add-product.html`
   - Fill in product details
   - Upload an image from your computer
   - Click "Add Product"

2. **View in Shop**
   - Go to `/shop.html`
   - Your new product appears!
   - Add to cart and checkout

3. **Manage Products**
   - Visit `/admin/manage-products.html`
   - Edit or delete products
   - See all your added products

## Customization

### Colors
Edit `assets/css/style.css` to change:
- Primary color: `#1a1a1a` (black)
- Accent color: `#ff9800` (orange)
- Background: `#f8f9fa`

### Content
- Update store name in navbar
- Modify product categories
- Change shipping options
- Customize footer links

### Features
- Add more product variants
- Implement email notifications
- Add payment gateway integration
- Create customer reviews section

## Support

For detailed admin instructions, see `ADMIN_GUIDE.md`

## License
This project is open source and available for personal and commercial use.

NOTE -> Login Credentials for Admin Panle:
username -> "admin"
pasword->   "admin123"

---

**Enjoy your Male Fashion E-Commerce Store!** 🛍️
