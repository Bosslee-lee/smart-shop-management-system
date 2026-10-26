// ============================================
// MY SALES - COMPLETE JAVASCRIPT
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
    // GET SALES
    // ============================================
    function getSales() {
        return JSON.parse(localStorage.getItem('shopflow_sales') || '[]');
    }

    // ============================================
    // GET STAFF NAME
    // ============================================
    function getStaffName() {
        var user = JSON.parse(localStorage.getItem('shopflow_user') || '{}');
        return user.name || 'Staff';
    }

    // ============================================
    // STATE
    // ============================================
    var currentPage = 1;
    var itemsPerPage = 10;
    var filteredSales = [];

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

    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ============================================
    // GET STAFF SALES
    // ============================================
    function getStaffSales() {
        var allSales = getSales();
        var staffName = getStaffName();
        return allSales.filter(function(s) {
            return s.staff === staffName;
        });
    }

    // ============================================
    // FILTER SALES
    // ============================================
    function filterSales(sales) {
        var period = document.getElementById('periodFilter').value;
        var payment = document.getElementById('paymentFilter').value;
        var now = new Date();

        var filtered = sales;

        // Period filter
        if (period === 'today') {
            var today = now.toDateString();
            filtered = filtered.filter(function(s) {
                return new Date(s.date).toDateString() === today;
            });
        } else if (period === 'week') {
            var weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(function(s) {
                return new Date(s.date) >= weekAgo;
            });
        } else if (period === 'month') {
            var monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(function(s) {
                return new Date(s.date) >= monthAgo;
            });
        }

        // Payment filter
        if (payment !== 'all') {
            filtered = filtered.filter(function(s) {
                return s.paymentMethod === payment;
            });
        }

        return filtered;
    }

    // ============================================
    // UPDATE REPORTS
    // ============================================
    function updateReports(sales) {
        var now = new Date();
        var today = now.toDateString();

        // Today
        var todaySales = sales.filter(function(s) {
            return new Date(s.date).toDateString() === today;
        });
        var todayTotal = todaySales.reduce(function(sum, s) { return sum + s.totalAmount; }, 0);

        // Week
        var weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        var weekSales = sales.filter(function(s) {
            return new Date(s.date) >= weekAgo;
        });
        var weekTotal = weekSales.reduce(function(sum, s) { return sum + s.totalAmount; }, 0);

        // Month
        var monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        var monthSales = sales.filter(function(s) {
            return new Date(s.date) >= monthAgo;
        });
        var monthTotal = monthSales.reduce(function(sum, s) { return sum + s.totalAmount; }, 0);

        // All time
        var totalAll = sales.reduce(function(sum, s) { return sum + s.totalAmount; }, 0);

        document.getElementById('todaySales').textContent = 'KSh ' + todayTotal.toLocaleString();
        document.getElementById('todayOrders').textContent = todaySales.length + ' orders';

        document.getElementById('weekSales').textContent = 'KSh ' + weekTotal.toLocaleString();
        document.getElementById('weekOrders').textContent = weekSales.length + ' orders';

        document.getElementById('monthSales').textContent = 'KSh ' + monthTotal.toLocaleString();
        document.getElementById('monthOrders').textContent = monthSales.length + ' orders';

        document.getElementById('totalSales').textContent = 'KSh ' + totalAll.toLocaleString();
        document.getElementById('totalOrders').textContent = sales.length + ' orders';
    }

    // ============================================
    // RENDER TABLE
    // ============================================
    function renderTable() {
        var allSales = getStaffSales();
        filteredSales = filterSales(allSales);

        // Update reports with filtered data
        updateReports(allSales);

        // Pagination
        var totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        var start = (currentPage - 1) * itemsPerPage;
        var end = Math.min(start + itemsPerPage, filteredSales.length);
        var pageSales = filteredSales.slice(start, end);

        var tbody = document.getElementById('salesTableBody');

        if (pageSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <span>📋</span>
                        <p>No sales recorded yet</p>
                    </td>
                </tr>
            `;
        } else {
            var html = '';
            for (var i = 0; i < pageSales.length; i++) {
                var s = pageSales[i];
                var items = s.items || [];
                var productNames = items.map(function(item) { return item.name; }).join(', ');

                html += `
                    <tr>
                        <td><strong>${s.receiptNumber || 'N/A'}</strong></td>
                        <td>${productNames || '—'}</td>
                        <td>KSh ${(items[0]?.price || 0).toLocaleString()}</td>
                        <td>${items.reduce(function(sum, item) { return sum + item.quantity; }, 0)}</td>
                        <td><strong>KSh ${s.totalAmount.toLocaleString()}</strong></td>
                        <td><span class="badge ${s.paymentMethod}">${(s.paymentMethod || 'cash').toUpperCase()}</span></td>
                        <td>${s.customerName || '—'}</td>
                        <td>${new Date(s.date).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-ghost btn-sm" onclick="viewReceipt(${getSales().indexOf(s)})">🧾</button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
        }

        // Update footer
        document.getElementById('salesCount').textContent = 'Showing ' + filteredSales.length + ' sales';
        document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + totalPages;
        document.getElementById('prevPage').disabled = currentPage <= 1;
        document.getElementById('nextPage').disabled = currentPage >= totalPages;
    }

    // ============================================
    // CHANGE PAGE
    // ============================================
    function changePage(direction) {
        var totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
        var newPage = currentPage + direction;
        if (newPage < 1 || newPage > totalPages) return;
        currentPage = newPage;
        renderTable();
        document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.changePage = changePage;

    // ============================================
    // VIEW RECEIPT
    // ============================================
    function viewReceipt(index) {
        var sales = getSales();
        var sale = sales[index];
        if (!sale) {
            showToast('Sale not found.', 'error');
            return;
        }

        var shop = JSON.parse(localStorage.getItem('shopflow_shop') || '{}');
        var content = document.getElementById('receiptContent');

        var itemsHtml = '';
        for (var i = 0; i < sale.items.length; i++) {
            var item = sale.items[i];
            itemsHtml += `
                <div class="receipt-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>KSh ${item.total.toLocaleString()}</span>
                </div>
            `;
        }

        content.innerHTML = `
            <div class="receipt-header">
                <h2>${shop.shopName || 'ShopFlow'}</h2>
                <p>${shop.location || 'Nairobi, Kenya'}</p>
                <p>Tel: ${shop.phone || 'N/A'}</p>
                <p><strong>Receipt #${sale.receiptNumber}</strong></p>
                <p>${new Date(sale.date).toLocaleString()}</p>
                <p>Staff: ${sale.staff}</p>
                ${sale.customerName ? '<p>Customer: ' + sale.customerName + '</p>' : ''}
            </div>
            ${itemsHtml}
            <div class="receipt-totals">
                <div class="row"><span>Subtotal</span><span>KSh ${sale.subtotal.toLocaleString()}</span></div>
                ${sale.discount > 0 ? `<div class="row"><span>Discount</span><span>-KSh ${sale.discount.toLocaleString()}</span></div>` : ''}
                <div class="row total"><span>Total</span><span>KSh ${sale.totalAmount.toLocaleString()}</span></div>
                <div class="row"><span>Payment</span><span>${sale.paymentMethod.toUpperCase()}</span></div>
            </div>
            <div class="receipt-footer">
                <p>Thank you for your purchase!</p>
                <p>🎉 Powered by ShopFlow</p>
            </div>
        `;

        openModal('receiptModal');
    }
    window.viewReceipt = viewReceipt;

    // ============================================
    // PRINT RECEIPT
    // ============================================
    function printReceipt() {
        var content = document.getElementById('receiptContent');
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
    // EXPORT SALES
    // ============================================
    function exportSales() {
        var sales = getStaffSales();
        if (sales.length === 0) {
            showToast('No sales to export.', 'error');
            return;
        }

        var csv = 'Receipt,Date,Product,Quantity,Price,Total,Payment,Customer\n';
        for (var i = 0; i < sales.length; i++) {
            var s = sales[i];
            var items = s.items || [];
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                csv += s.receiptNumber + ',';
                csv += new Date(s.date).toLocaleDateString() + ',';
                csv += item.name + ',';
                csv += item.quantity + ',';
                csv += item.price + ',';
                csv += item.total + ',';
                csv += s.paymentMethod + ',';
                csv += (s.customerName || '—') + '\n';
            }
        }

        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'my_sales_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Sales exported successfully!', 'success');
    }
    window.exportSales = exportSales;

    // ============================================
    // REFRESH SALES
    // ============================================
    function refreshSales() {
        currentPage = 1;
        renderTable();
        showToast('🔄 Sales refreshed!', 'success');
    }
    window.refreshSales = refreshSales;

    // ============================================
    // AUTO REFRESH EVERY 60 SECONDS
    // ============================================
    setInterval(function() {
        renderTable();
    }, 60000);

    // ============================================
    // FILTER EVENTS
    // ============================================
    document.getElementById('periodFilter').addEventListener('change', function() {
        currentPage = 1;
        renderTable();
    });

    document.getElementById('paymentFilter').addEventListener('change', function() {
        currentPage = 1;
        renderTable();
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
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(function(modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshSales();
        }
    });

    // ============================================
    // INIT
    // ============================================
    loadStaffData();
    renderTable();

    console.log('🚀 My Sales page loaded successfully!');
    console.log('📊 ' + getStaffSales().length + ' sales recorded');
    console.log('💡 Use filters to view different periods');
    console.log('💡 Ctrl+R to refresh');
});