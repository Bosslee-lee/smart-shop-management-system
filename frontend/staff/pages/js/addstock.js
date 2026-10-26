// ============================================
// RESTOCK - COMPLETE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // CHECK LOGIN
    // ============================================
    if (!localStorage.getItem('shopflow_logged_in')) {
        window.location.href = '../../pages/login.html';
        return;
    }

    // ============================================
    // GET DATA
    // ============================================
    function getProducts() {
        return JSON.parse(localStorage.getItem('shopflow_products') || '[]');
    }

    function saveProducts(products) {
        localStorage.setItem('shopflow_products', JSON.stringify(products));
    }

    function getStockHistory() {
        return JSON.parse(localStorage.getItem('shopflow_stock_history') || '[]');
    }

    function saveStockHistory(history) {
        localStorage.setItem('shopflow_stock_history', JSON.stringify(history));
    }

    // ============================================
    // LOAD STAFF DATA
    // ============================================
    function loadStaffData() {
        var user = JSON.parse(localStorage.getItem('shopflow_user') || '{}');
        var shop = JSON.parse(localStorage.getItem('shopflow_shop') || '{}');
        document.getElementById('staffNameDisplay').textContent = user.name || 'Staff';
        document.getElementById('staffShopDisplay').textContent = shop.shopName || 'Shop';
        document.getElementById('staffAvatar').textContent = (user.name || 'S').charAt(0).toUpperCase();
    }

    // ============================================
    // THEME TOGGLE
    // ============================================
    var themeBtn = document.getElementById('themeToggle');
    var body = document.body;
    if (localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeBtn.textContent = '☀️';
    }
    themeBtn.addEventListener('click', function() {
        var dark = body.getAttribute('data-theme') === 'dark';
        body.setAttribute('data-theme', dark ? 'light' : 'dark');
        themeBtn.textContent = dark ? '🌙' : '☀️';
        localStorage.setItem('theme', dark ? 'light' : 'dark');
    });

    // ============================================
    // SIDEBAR
    // ============================================
    var sidebar = document.getElementById('sidebar');
    var menuToggle = document.getElementById('menuToggle');
    var closeSidebar = document.getElementById('closeSidebar');

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('open');
    });

    // ============================================
    // TOAST
    // ============================================
    function showToast(message, type) {
        type = type || 'success';
        var toast = document.getElementById('toast');
        var icon = document.getElementById('toastIcon');
        var msg = document.getElementById('toastMessage');
        toast.className = 'toast ' + type;
        icon.textContent = type === 'success' ? '✅' : '❌';
        msg.textContent = message;
        toast.classList.add('show');
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }
    window.showToast = showToast;

    // ============================================
    // POPULATE PRODUCT SELECT (Only active products)
    // ============================================
    function populateProductSelect() {
        var products = getProducts();
        var select = document.getElementById('stockProduct');

        if (products.length === 0) {
            select.innerHTML = '<option value="">— No products available —</option>';
            return;
        }

        var html = '<option value="">— Select a product to restock —</option>';
        var hasProducts = false;
        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            // Only show active products (added by owner)
            if (p.isActive === false) continue;
            hasProducts = true;
            var stockStatus = p.stock === 0 ? '⚠️ OUT OF STOCK' : p.stock < 5 ? '⚠️ LOW' : '✅ In Stock';
            html += '<option value="' + p.name + '" data-stock="' + p.stock + '">' + p.name + ' - KSh ' + p.price.toLocaleString() + ' (' + p.stock + ' units) ' + stockStatus + '</option>';
        }

        if (!hasProducts) {
            select.innerHTML = '<option value="">— No active products —</option>';
        } else {
            select.innerHTML = html;
        }
    }

    // ============================================
    // UPDATE STOCK DISPLAY
    // ============================================
    document.getElementById('stockProduct').addEventListener('change', function() {
        var stock = this.options[this.selectedIndex]?.dataset?.stock || 0;
        document.getElementById('stockCurrent').value = stock;
        updateNewStock();
    });

    document.getElementById('stockQuantity').addEventListener('input', function() {
        updateNewStock();
    });

    function updateNewStock() {
        var current = parseInt(document.getElementById('stockCurrent').value) || 0;
        var qty = parseInt(document.getElementById('stockQuantity').value) || 0;
        document.getElementById('stockNew').value = current + qty;
    }

    // ============================================
    // UPDATE STATS
    // ============================================
    function updateStats() {
        var products = getProducts();
        var total = 0;
        var totalStock = 0;
        var totalValue = 0;
        var lowStock = 0;

        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            if (p.isActive === false) continue;
            total++;
            totalStock += p.stock;
            totalValue += p.stock * p.price;
            if (p.stock > 0 && p.stock < 5) {
                lowStock++;
            }
        }

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('totalStockUnits').textContent = totalStock.toLocaleString();
        document.getElementById('stockValue').textContent = 'KSh ' + totalValue.toLocaleString();
        document.getElementById('lowStockCount').textContent = lowStock;
        document.getElementById('productBadge').textContent = total;
    }

    // ============================================
    // UPDATE RECENT RESTOCK ACTIVITY
    // ============================================
    function updateRecentStock() {
        var history = getStockHistory();
        var list = document.getElementById('recentStockList');

        if (history.length === 0) {
            list.innerHTML = '<div class="empty-state"><span>📦</span><p>No restock activity yet</p></div>';
            return;
        }

        // Show last 10 entries (newest first)
        var recent = history.slice(-10).reverse();
        var html = '';
        for (var i = 0; i < recent.length; i++) {
            var item = recent[i];
            html += '<div class="recent-stock-item">';
            html += '<div class="item-info">';
            html += '<div class="item-name">' + item.productName + '</div>';
            html += '<div class="item-details">By ' + item.staffName + ' • ' + new Date(item.date).toLocaleString() + '</div>';
            html += '</div>';
            html += '<div class="item-qty">+' + item.quantity + ' units</div>';
            html += '</div>';
        }
        list.innerHTML = html;
    }

    // ============================================
    // RESTOCK FORM SUBMIT
    // ============================================
    document.getElementById('addStockForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var productName = document.getElementById('stockProduct').value;
        var qty = parseInt(document.getElementById('stockQuantity').value);

        if (!productName) {
            showToast('Please select a product to restock.', 'error');
            return;
        }

        if (!qty || qty < 1) {
            showToast('Please enter a valid quantity.', 'error');
            return;
        }

        var products = getProducts();
        var product = null;
        for (var i = 0; i < products.length; i++) {
            if (products[i].name === productName) {
                product = products[i];
                break;
            }
        }

        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }

        // Check if product is active (added by owner)
        if (product.isActive === false) {
            showToast('This product is not active. Please contact the owner.', 'error');
            return;
        }

        var oldStock = product.stock;
        product.stock += qty;

        // Save product
        saveProducts(products);

        // Save to stock history
        var user = JSON.parse(localStorage.getItem('shopflow_user') || '{}');
        var history = getStockHistory();
        history.push({
            productName: product.name,
            quantity: qty,
            oldStock: oldStock,
            newStock: product.stock,
            staffName: user.name || 'Staff',
            date: new Date().toISOString()
        });
        saveStockHistory(history);

        // Reset form
        document.getElementById('stockQuantity').value = '';
        document.getElementById('stockNew').value = '';

        // Show success
        showToast('📦 Added ' + qty + ' units to ' + product.name, 'success');

        // Update everything
        populateProductSelect();
        updateStats();
        updateRecentStock();

        // Reset current stock display
        document.getElementById('stockCurrent').value = product.stock;

        // Update product badge in sidebar
        document.getElementById('productBadge').textContent = getProducts().filter(function(p) {
            return p.isActive !== false;
        }).length;
    });

    // ============================================
    // LOGOUT
    // ============================================
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('shopflow_logged_in');
            window.location.href = '../../pages/login.html';
        }
    });

    // ============================================
    // INIT
    // ============================================
    loadStaffData();
    populateProductSelect();
    updateStats();
    updateRecentStock();

    console.log('🚀 Restock page loaded successfully!');
    console.log('📦 Staff can ONLY restock existing products.');
    console.log('👔 New products must be added by the owner.');
});