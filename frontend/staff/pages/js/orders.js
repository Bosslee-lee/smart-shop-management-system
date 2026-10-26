// ============================================
// ORDERS - COMPLETE JAVASCRIPT
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
    // GET CART FROM LOCALSTORAGE
    // ============================================
    function getCart() {
        var cartData = localStorage.getItem('shopflow_cart');
        if (cartData) {
            try {
                return JSON.parse(cartData);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    function clearCart() {
        localStorage.removeItem('shopflow_cart');
    }

    // ============================================
    // GET PRODUCTS FOR STOCK UPDATE
    // ============================================
    function getProducts() {
        return JSON.parse(localStorage.getItem('shopflow_products') || '[]');
    }

    function saveProducts(products) {
        localStorage.setItem('shopflow_products', JSON.stringify(products));
    }

    // ============================================
    // GET SALES
    // ============================================
    function getSales() {
        return JSON.parse(localStorage.getItem('shopflow_sales') || '[]');
    }

    function saveSales(sales) {
        localStorage.setItem('shopflow_sales', JSON.stringify(sales));
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
    // MODALS
    // ============================================
    function openModal(id) {
        document.getElementById(id).classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = '';
    }
    window.closeModal = closeModal;

    // ============================================
    // VARIABLES
    // ============================================
    var cart = [];
    var selectedPayment = 'cash';
    var currentSale = null;

    // ============================================
    // LOAD CART
    // ============================================
    function loadCart() {
        cart = getCart();
        var container = document.getElementById('orderItems');
        var totals = document.getElementById('orderTotals');

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart-msg">
                    <span>🛒</span>
                    <p>Your cart is empty</p>
                    <a href="marketplace.html" class="btn btn-primary">Go to Marketplace</a>
                </div>
            `;
            totals.style.display = 'none';
            return;
        }

        totals.style.display = 'block';
        var html = '';
        var subtotal = 0;

        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            var total = item.price * item.quantity;
            subtotal += total;

            html += `
                <div class="order-item">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-details">KSh ${item.price.toLocaleString()} × ${item.quantity}</div>
                    </div>
                    <div class="item-total">KSh ${total.toLocaleString()}</div>
                </div>
            `;
        }
        container.innerHTML = html;

        document.getElementById('orderSubtotal').textContent = 'KSh ' + subtotal.toLocaleString();
        updateTotal();
    }

    // ============================================
    // UPDATE TOTAL
    // ============================================
    function updateTotal() {
        var items = document.querySelectorAll('.order-item');
        var subtotal = 0;
        for (var i = 0; i < items.length; i++) {
            var totalText = items[i].querySelector('.item-total')?.textContent || '0';
            var totalNum = parseInt(totalText.replace(/[^0-9]/g, '')) || 0;
            subtotal += totalNum;
        }

        var discount = parseFloat(document.getElementById('orderDiscount').value) || 0;
        var total = Math.max(0, subtotal - discount);

        document.getElementById('orderSubtotal').textContent = 'KSh ' + subtotal.toLocaleString();
        document.getElementById('orderTotal').textContent = 'KSh ' + total.toLocaleString();

        // Update change
        updateChange();
    }

    document.getElementById('orderDiscount').addEventListener('input', updateTotal);

    // ============================================
    // UPDATE CHANGE
    // ============================================
    function updateChange() {
        var totalText = document.getElementById('orderTotal').textContent || 'KSh 0';
        var total = parseInt(totalText.replace(/[^0-9]/g, '')) || 0;
        var received = parseFloat(document.getElementById('cashReceived').value) || 0;
        var change = received - total;
        document.getElementById('cashChange').textContent = change >= 0 ? 'KSh ' + change.toLocaleString() : '⚠️ Insufficient';
    }

    document.getElementById('cashReceived').addEventListener('input', updateChange);

    // ============================================
    // SELECT PAYMENT
    // ============================================
    function selectPayment(method) {
        selectedPayment = method;
        var btns = document.querySelectorAll('.payment-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].dataset.method === method);
        }

        document.getElementById('cashPayment').style.display = method === 'cash' ? 'block' : 'none';
        document.getElementById('mpesaPayment').style.display = method === 'mpesa' ? 'block' : 'none';
    }
    window.selectPayment = selectPayment;

    // ============================================
    // COMPLETE ORDER
    // ============================================
    function completeOrder() {
        if (cart.length === 0) {
            showToast('Cart is empty. Add products first.', 'error');
            return;
        }

        var subtotal = 0;
        for (var i = 0; i < cart.length; i++) {
            subtotal += cart[i].price * cart[i].quantity;
        }
        var discount = parseFloat(document.getElementById('orderDiscount').value) || 0;
        var total = Math.max(0, subtotal - discount);

        // Validate payment
        if (selectedPayment === 'cash') {
            var received = parseFloat(document.getElementById('cashReceived').value) || 0;
            if (received < total) {
                showToast('Insufficient cash received.', 'error');
                return;
            }
        } else if (selectedPayment === 'mpesa') {
            var code = document.getElementById('mpesaCode').value.trim();
            var phone = document.getElementById('mpesaPhone').value.trim();
            if (!code || !phone) {
                showToast('Please enter M-Pesa transaction code and phone.', 'error');
                return;
            }
        }

        // Get customer details
        var customerName = document.getElementById('customerName').value.trim() || '';
        var customerPhone = document.getElementById('customerPhone').value.trim() || '';

        // Get user
        var user = JSON.parse(localStorage.getItem('shopflow_user') || '{}');

        // Create sale record
        var sale = {
            receiptNumber: 'RCP-' + Date.now().toString().slice(-8),
            items: cart.map(function(item) {
                return {
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity
                };
            }),
            subtotal: subtotal,
            discount: discount,
            totalAmount: total,
            paymentMethod: selectedPayment,
            staff: user.name || 'Staff',
            customerName: customerName,
            customerPhone: customerPhone,
            date: new Date().toISOString()
        };

        // Save sale
        var sales = getSales();
        sales.push(sale);
        saveSales(sales);

        // Update product stock
        var products = getProducts();
        for (var j = 0; j < cart.length; j++) {
            var cartItem = cart[j];
            for (var k = 0; k < products.length; k++) {
                if (products[k].name === cartItem.name) {
                    products[k].stock -= cartItem.quantity;
                    break;
                }
            }
        }
        saveProducts(products);

        // Store current sale for receipt
        currentSale = sale;

        // Clear cart
        clearCart();

        // Show success modal
        showSuccessModal(sale);

        // Update stats
        updateStats();
    }
    window.completeOrder = completeOrder;

    // ============================================
    // SHOW SUCCESS MODAL
    // ============================================
    function showSuccessModal(sale) {
        var receipt = document.getElementById('orderReceipt');

        var itemsHtml = '';
        for (var i = 0; i < sale.items.length; i++) {
            var item = sale.items[i];
            itemsHtml += `
                <div class="receipt-row">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>KSh ${item.total.toLocaleString()}</span>
                </div>
            `;
        }

        receipt.innerHTML = `
            <div style="text-align:center;border-bottom:1px solid var(--border);padding-bottom:8px;margin-bottom:8px;">
                <strong>🧾 Receipt #${sale.receiptNumber}</strong>
                <div style="font-size:12px;color:var(--text-soft);">${new Date(sale.date).toLocaleString()}</div>
                <div style="font-size:12px;">Staff: ${sale.staff}</div>
            </div>
            ${itemsHtml}
            <div class="receipt-row">
                <span>Subtotal</span>
                <span>KSh ${sale.subtotal.toLocaleString()}</span>
            </div>
            ${sale.discount > 0 ? `
            <div class="receipt-row">
                <span>Discount</span>
                <span>-KSh ${sale.discount.toLocaleString()}</span>
            </div>` : ''}
            <div class="receipt-row total">
                <span>Total</span>
                <span>KSh ${sale.totalAmount.toLocaleString()}</span>
            </div>
            <div class="receipt-row">
                <span>Payment</span>
                <span>${sale.paymentMethod.toUpperCase()}</span>
            </div>
            ${sale.customerName ? `
            <div class="receipt-row">
                <span>Customer</span>
                <span>${sale.customerName}</span>
            </div>` : ''}
            <div style="text-align:center;border-top:1px solid var(--border);padding-top:8px;margin-top:8px;font-size:12px;color:var(--text-soft);">
                🎉 Order completed successfully!
            </div>
        `;

        openModal('successModal');
    }

    // ============================================
    // PRINT RECEIPT
    // ============================================
    function printReceipt() {
        var content = document.getElementById('orderReceipt');
        var w = window.open('', '_blank', 'width=400,height=600');
        if (w) {
            w.document.write('<html><head><title>Receipt</title>');
            w.document.write('<style>body{font-family:"Courier New",monospace;padding:20px;max-width:350px;margin:0 auto;}</style>');
            w.document.write('</head><body>' + content.innerHTML + '</body></html>');
            w.document.close();
            w.print();
        }
    }
    window.printReceipt = printReceipt;

    // ============================================
    // UPDATE STATS (for sidebar badges)
    // ============================================
    function updateStats() {
        var products = getProducts();
        var activeProducts = products.filter(function(p) { return p.isActive !== false; });
        document.getElementById('productBadge').textContent = activeProducts.length;
        document.getElementById('announceBadge').textContent = JSON.parse(localStorage.getItem('shopflow_announcements') || '[]').length;
    }

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
    loadCart();
    updateStats();

    console.log('🚀 Orders page loaded successfully!');
    console.log('📋 ' + cart.length + ' items in cart');
    console.log('💳 Complete your order to record the sale');
});