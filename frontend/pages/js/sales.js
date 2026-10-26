// ============================================
// SHOPFLOW - SALES ANALYTICS JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // CHECK LOGIN
    // ============================================
    if (localStorage.getItem('shopflow_logged_in') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // ============================================
    // SIDEBAR FUNCTIONS (FULL IMPLEMENTATION)
    // ============================================
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const collapseBtn = document.getElementById('collapseBtn');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const expandBtn = document.getElementById('expandBtn');
        const mainContent = document.querySelector('.main-content');
        const menuToggle = document.getElementById('menuToggle');
        const closeSidebar = document.getElementById('closeSidebar');

        function toggleSidebarCollapse(expand = null) {
            const shouldCollapse = expand !== null ? !expand : !sidebar.classList.contains('collapsed');
            
            if (shouldCollapse) {
                sidebar.classList.add('collapsed');
                if (collapseBtn) collapseBtn.textContent = '▶';
                localStorage.setItem('sidebar_collapsed', 'true');
            } else {
                sidebar.classList.remove('collapsed');
                if (collapseBtn) collapseBtn.textContent = '◀';
                localStorage.setItem('sidebar_collapsed', 'false');
            }
            
            updateMainContentMargin();
            updateExpandButton();
        }

        function updateExpandButton() {
            if (expandBtn) {
                const isCollapsed = sidebar.classList.contains('collapsed');
                const isDesktop = window.innerWidth > 768;
                expandBtn.style.display = (isCollapsed && isDesktop) ? 'flex' : 'none';
            }
        }

        function updateMainContentMargin() {
            if (window.innerWidth > 768) {
                const isCollapsed = sidebar.classList.contains('collapsed');
                if (isCollapsed) {
                    mainContent.style.marginLeft = 'var(--sidebar-collapsed)';
                    mainContent.style.width = 'calc(100% - var(--sidebar-collapsed))';
                } else {
                    mainContent.style.marginLeft = 'var(--sidebar-width)';
                    mainContent.style.width = 'calc(100% - var(--sidebar-width))';
                }
            } else {
                mainContent.style.marginLeft = '0';
                mainContent.style.width = '100%';
            }
        }

        // ===== EVENT LISTENERS =====
        
        // Collapse button (◀/▶)
        collapseBtn?.addEventListener('click', function() {
            toggleSidebarCollapse();
        });

        // Desktop sidebar toggle (hamburger in topbar)
        sidebarToggle?.addEventListener('click', function() {
            toggleSidebarCollapse();
        });

        // Floating expand button (☰ when collapsed)
        expandBtn?.addEventListener('click', function() {
            toggleSidebarCollapse(true); // Expand
        });

        // Mobile sidebar
        function toggleMobileSidebar(open) {
            sidebar.classList.toggle('open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        }

        menuToggle?.addEventListener('click', () => toggleMobileSidebar(true));
        closeSidebar?.addEventListener('click', () => toggleMobileSidebar(false));

        // Close sidebar when clicking a nav link on mobile
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMobileSidebar(false);
                }
            });
        });

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('open');
                    document.body.style.overflow = '';
                    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
                    if (isCollapsed) {
                        sidebar.classList.add('collapsed');
                        if (collapseBtn) collapseBtn.textContent = '▶';
                    } else {
                        sidebar.classList.remove('collapsed');
                        if (collapseBtn) collapseBtn.textContent = '◀';
                    }
                    updateMainContentMargin();
                    updateExpandButton();
                } else {
                    mainContent.style.marginLeft = '0';
                    mainContent.style.width = '100%';
                    if (sidebar.classList.contains('open')) {
                        sidebar.classList.remove('collapsed');
                    }
                    if (expandBtn) {
                        expandBtn.style.display = 'none';
                    }
                }
            }, 300);
        });

        // Keyboard shortcut: Ctrl + B
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleSidebarCollapse();
            }
        });

        // Load saved state
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed && window.innerWidth > 768) {
            sidebar.classList.add('collapsed');
            if (collapseBtn) collapseBtn.textContent = '▶';
        } else if (window.innerWidth > 768) {
            sidebar.classList.remove('collapsed');
            if (collapseBtn) collapseBtn.textContent = '◀';
        }

        updateMainContentMargin();
        updateExpandButton();
    }

    // ============================================
    // LOAD SHOP DATA
    // ============================================
    function loadShopData() {
        const shopData = JSON.parse(localStorage.getItem('shopflow_shop') || '{}');
        document.getElementById('shopNameDisplay').textContent = shopData.shopName || 'My Shop';
        document.getElementById('shopOwnerDisplay').textContent = shopData.ownerName || 'Owner';
        document.getElementById('shopAvatar').textContent = (shopData.shopName || 'M').charAt(0).toUpperCase();
    }

    // ============================================
    // TRIAL COUNTDOWN
    // ============================================
    function updateTrial() {
        const endDate = localStorage.getItem('shopflow_trial_end');
        const trialDaysEl = document.getElementById('trialDays');
        if (endDate) {
            const end = new Date(endDate);
            const now = new Date();
            const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            trialDaysEl.textContent = days > 0 ? days + ' days left' : 'Trial ended';
            if (days <= 0) {
                document.querySelector('.trial-banner-sidebar').style.background = 'var(--red)';
            }
        } else {
            const end = new Date();
            end.setDate(end.getDate() + 14);
            localStorage.setItem('shopflow_trial_end', end.toISOString());
            trialDaysEl.textContent = '14 days left';
        }
    }

    // ============================================
    // THEME TOGGLE
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    if (localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', () => {
        const isDark = body.getAttribute('data-theme') === 'dark';
        body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // ============================================
    // MODALS
    // ============================================
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ============================================
    // TOAST
    // ============================================
    let toastTimeout;

    window.showToast = function(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toastIcon');
        const msg = document.getElementById('toastMessage');

        if (!toast) return;

        toast.className = 'toast ' + type;
        icon.textContent = type === 'success' ? '✅' : '❌';
        msg.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // ============================================
    // GET DATA
    // ============================================
    function getSales() {
        return JSON.parse(localStorage.getItem('shopflow_sales') || '[]');
    }

    function getProducts() {
        return JSON.parse(localStorage.getItem('shopflow_products') || '[]');
    }

    // ============================================
    // STATE
    // ============================================
    let currentPeriod = 'week';
    let startDate = null;
    let endDate = null;

    // ============================================
    // PERIOD SELECTOR
    // ============================================
    window.setPeriod = function(period) {
        currentPeriod = period;
        startDate = null;
        endDate = null;

        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });

        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';

        refreshData();
    };

    window.setCustomPeriod = function() {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;

        if (!start || !end) {
            showToast('Please select both start and end dates.', 'error');
            return;
        }

        startDate = new Date(start);
        endDate = new Date(end);
        endDate.setHours(23, 59, 59);

        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        refreshData();
    };

    // ============================================
    // FILTER SALES BY PERIOD
    // ============================================
    function filterSalesByPeriod(sales) {
        const now = new Date();

        if (startDate && endDate) {
            return sales.filter(s => {
                const date = new Date(s.date);
                return date >= startDate && date <= endDate;
            });
        }

        if (currentPeriod === 'today') {
            const today = now.toDateString();
            return sales.filter(s => new Date(s.date).toDateString() === today);
        } else if (currentPeriod === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sales.filter(s => new Date(s.date) >= weekAgo);
        } else if (currentPeriod === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return sales.filter(s => new Date(s.date) >= monthAgo);
        } else if (currentPeriod === 'year') {
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return sales.filter(s => new Date(s.date) >= yearAgo);
        }

        return sales;
    }

    // ============================================
    // REFRESH ALL DATA
    // ============================================
    window.refreshData = function() {
        const allSales = getSales();
        const filteredSales = filterSalesByPeriod(allSales);
        
        updateMetrics(filteredSales);
        updatePaymentBreakdown(filteredSales);
        updateStaffPerformance(filteredSales);
        updateProductPerformance(allSales);
        updateProfitability(filteredSales);
        updateWarnings(allSales);
        updateSalesTable(filteredSales);
        updateAlertBadge(allSales);
    };

    // ============================================
    // UPDATE METRICS
    // ============================================
    function updateMetrics(sales) {
        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalOrders = sales.length;
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const mpesaSales = sales.filter(s => s.paymentMethod === 'mpesa').reduce((sum, s) => sum + s.totalAmount, 0);
        const cashSales = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
        const grossProfit = totalRevenue * 0.35;

        document.getElementById('totalRevenue').textContent = 'KSh ' + totalRevenue.toLocaleString();
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('avgOrder').textContent = 'KSh ' + avgOrder.toFixed(0);
        document.getElementById('mpesaSales').textContent = 'KSh ' + mpesaSales.toLocaleString();
        document.getElementById('cashSales').textContent = 'KSh ' + cashSales.toLocaleString();
        document.getElementById('grossProfit').textContent = 'KSh ' + grossProfit.toFixed(0);

        const prevPeriodSales = getPreviousPeriodSales();
        const prevRevenue = prevPeriodSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const prevOrders = prevPeriodSales.length;

        const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
        const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders * 100) : 0;

        document.getElementById('revenueChange').textContent = (revenueChange >= 0 ? '+' : '') + revenueChange.toFixed(1) + '%';
        document.getElementById('revenueChange').className = 'metric-change ' + (revenueChange >= 0 ? 'positive' : 'negative');

        document.getElementById('ordersChange').textContent = (ordersChange >= 0 ? '+' : '') + ordersChange.toFixed(1) + '%';
        document.getElementById('ordersChange').className = 'metric-change ' + (ordersChange >= 0 ? 'positive' : 'negative');
    }

    // ============================================
    // GET PREVIOUS PERIOD SALES
    // ============================================
    function getPreviousPeriodSales() {
        const allSales = getSales();
        const now = new Date();

        if (currentPeriod === 'today') {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toDateString();
            return allSales.filter(s => new Date(s.date).toDateString() === yStr);
        } else if (currentPeriod === 'week') {
            const prevWeekStart = new Date(now);
            prevWeekStart.setDate(prevWeekStart.getDate() - 14);
            const prevWeekEnd = new Date(now);
            prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
            return allSales.filter(s => {
                const date = new Date(s.date);
                return date >= prevWeekStart && date < prevWeekEnd;
            });
        } else if (currentPeriod === 'month') {
            const prevMonthStart = new Date(now);
            prevMonthStart.setMonth(prevMonthStart.getMonth() - 2);
            const prevMonthEnd = new Date(now);
            prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
            return allSales.filter(s => {
                const date = new Date(s.date);
                return date >= prevMonthStart && date < prevMonthEnd;
            });
        }

        return [];
    }

    // ============================================
    // UPDATE PAYMENT BREAKDOWN
    // ============================================
    function updatePaymentBreakdown(sales) {
        const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const mpesaTotal = sales.filter(s => s.paymentMethod === 'mpesa').reduce((sum, s) => sum + s.totalAmount, 0);
        const cashTotal = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
        const cardTotal = sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.totalAmount, 0);

        const mpesaPct = total > 0 ? (mpesaTotal / total * 100) : 0;
        const cashPct = total > 0 ? (cashTotal / total * 100) : 0;
        const cardPct = total > 0 ? (cardTotal / total * 100) : 0;

        document.getElementById('mpesaBar').style.width = mpesaPct + '%';
        document.getElementById('cashBar').style.width = cashPct + '%';
        document.getElementById('cardBar').style.width = cardPct + '%';

        document.getElementById('mpesaPercent').textContent = mpesaPct.toFixed(1) + '%';
        document.getElementById('cashPercent').textContent = cashPct.toFixed(1) + '%';
        document.getElementById('cardPercent').textContent = cardPct.toFixed(1) + '%';
    }

    // ============================================
    // UPDATE STAFF PERFORMANCE
    // ============================================
    function updateStaffPerformance(sales) {
        const staffSales = {};
        sales.forEach(s => {
            const staff = s.staff || 'Unknown';
            staffSales[staff] = (staffSales[staff] || 0) + s.totalAmount;
        });

        const container = document.getElementById('staffPerformance');
        const sorted = Object.entries(staffSales).sort((a, b) => b[1] - a[1]);

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="staff-item">
                    <span class="staff-name">No sales data</span>
                    <span class="staff-sales">KSh 0</span>
                </div>
            `;
            return;
        }

        container.innerHTML = sorted.map(([name, amount]) => `
            <div class="staff-item">
                <span class="staff-name">👤 ${name}</span>
                <span class="staff-sales">KSh ${amount.toLocaleString()}</span>
            </div>
        `).join('');
    }

    // ============================================
    // UPDATE PRODUCT PERFORMANCE
    // ============================================
    function updateProductPerformance(allSales) {
        const productSales = {};
        allSales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });

        const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
        const fast = sorted.slice(0, 5);
        const slow = sorted.slice(-5).reverse();

        const fastContainer = document.getElementById('fastMovingProducts');
        if (fast.length === 0) {
            fastContainer.innerHTML = `
                <div class="product-item">
                    <span class="product-name">No sales data yet</span>
                    <span class="product-sales">0 sold</span>
                </div>
            `;
        } else {
            fastContainer.innerHTML = fast.map(([name, qty]) => `
                <div class="product-item">
                    <span class="product-name">🚀 ${name}</span>
                    <span class="product-sales high">${qty} sold</span>
                </div>
            `).join('');
        }

        const slowContainer = document.getElementById('slowMovingProducts');
        if (slow.length === 0 || slow.every(([_, qty]) => qty === 0)) {
            slowContainer.innerHTML = `
                <div class="product-item">
                    <span class="product-name">No slow moving products</span>
                    <span class="product-sales">✓</span>
                </div>
            `;
        } else {
            slowContainer.innerHTML = slow.map(([name, qty]) => `
                <div class="product-item">
                    <span class="product-name">🐢 ${name}</span>
                    <span class="product-sales low">${qty} sold</span>
                </div>
            `).join('');
        }

        const fastInsight = document.getElementById('fastInsight');
        if (fast.length > 0) {
            fastInsight.textContent = `💡 ${fast[0][0]} is your best seller with ${fast[0][1]} units sold. Consider ordering more.`;
        }

        const slowInsight = document.getElementById('slowInsight');
        if (slow.length > 0 && slow.some(([_, qty]) => qty > 0)) {
            slowInsight.textContent = `⚠️ ${slow[0][0]} has only sold ${slow[0][1]} units. Consider reducing price or removing.`;
        }
    }

    // ============================================
    // UPDATE PROFITABILITY
    // ============================================
    function updateProfitability(sales) {
        const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const estimatedCost = revenue * 0.65;
        const grossProfit = revenue - estimatedCost;
        const margin = revenue > 0 ? (grossProfit / revenue * 100) : 0;

        document.getElementById('profitRevenue').textContent = 'KSh ' + revenue.toLocaleString();
        document.getElementById('profitCost').textContent = 'KSh ' + estimatedCost.toFixed(0);
        document.getElementById('profitGross').textContent = 'KSh ' + grossProfit.toFixed(0);
        document.getElementById('profitMargin').textContent = margin.toFixed(1) + '%';
    }

    // ============================================
    // UPDATE WARNINGS
    // ============================================
    function updateWarnings(allSales) {
        const products = getProducts();
        const warnings = [];

        products.forEach(p => {
            if (p.stock <= 0) {
                warnings.push(`❌ ${p.name} is OUT OF STOCK!`);
            } else if (p.stock < 5) {
                warnings.push(`⚠️ ${p.name} has only ${p.stock} units left (CRITICAL)`);
            } else if (p.stock < 10) {
                warnings.push(`⚠️ ${p.name} has only ${p.stock} units left (LOW)`);
            }
        });

        const productSales = {};
        allSales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });

        products.forEach(p => {
            const sold = productSales[p.name] || 0;
            if (sold === 0 && p.stock > 20) {
                warnings.push(`🐢 ${p.name} has ${p.stock} units in stock but 0 units sold! Consider removing.`);
            } else if (sold < 2 && p.stock > 10) {
                warnings.push(`🐢 ${p.name} has only sold ${sold} unit(s). Consider reducing stock.`);
            }
        });

        const container = document.getElementById('warningsList');
        const badge = document.getElementById('alertBadge');

        if (warnings.length === 0) {
            container.innerHTML = `
                <div class="warning-item">
                    <span class="warning-icon">✅</span>
                    <span class="warning-text">No warnings. Your shop is healthy!</span>
                </div>
            `;
            badge.textContent = '0';
            document.getElementById('alertBanner').classList.remove('show');
        } else {
            container.innerHTML = warnings.slice(0, 10).map(w => {
                const isCritical = w.includes('OUT OF STOCK') || w.includes('CRITICAL');
                return `
                    <div class="warning-item" style="${isCritical ? 'border-left: 3px solid var(--red);' : ''}">
                        <span class="warning-icon">${isCritical ? '🔴' : '⚠️'}</span>
                        <span class="warning-text">${w}</span>
                    </div>
                `;
            }).join('');

            badge.textContent = warnings.length;

            const criticalWarnings = warnings.filter(w => w.includes('OUT OF STOCK') || w.includes('CRITICAL'));
            if (criticalWarnings.length > 0) {
                const banner = document.getElementById('alertBanner');
                document.getElementById('alertMessage').textContent = `⚠️ ${criticalWarnings.length} critical alerts! Check warnings below.`;
                banner.classList.add('show');
            }
        }
    }

    window.closeAlert = function() {
        document.getElementById('alertBanner').classList.remove('show');
    };

    function updateAlertBadge(allSales) {
        const products = getProducts();
        const critical = products.filter(p => p.stock <= 5);
        document.getElementById('alertBadge').textContent = critical.length;
    }

    // ============================================
    // UPDATE SALES TABLE
    // ============================================
    function updateSalesTable(sales) {
        const tbody = document.getElementById('salesTableBody');

        if (sales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;color:var(--text-soft);">
                        No sales records found for this period.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = sales.slice().reverse().slice(0, 50).map((s, index) => {
            const actualIndex = getSales().indexOf(s);
            return `
                <tr>
                    <td><strong>${s.receiptNumber || 'N/A'}</strong></td>
                    <td>${new Date(s.date).toLocaleDateString()}</td>
                    <td>${s.customerName || '—'}</td>
                    <td>${s.items?.length || 0}</td>
                    <td><strong>KSh ${s.totalAmount.toLocaleString()}</strong></td>
                    <td><span class="badge ${s.paymentMethod}">${(s.paymentMethod || 'cash').toUpperCase()}</span></td>
                    <td>${s.staff || '—'}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="viewReceipt(${actualIndex})">🧾</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ============================================
    // VIEW RECEIPT
    // ============================================
    window.viewReceipt = function(index) {
        const sales = getSales();
        const sale = sales[index];
        if (!sale) {
            showToast('Sale not found.', 'error');
            return;
        }

        const content = document.getElementById('receiptContent');
        const shopData = JSON.parse(localStorage.getItem('shopflow_shop') || '{}');

        content.innerHTML = `
            <div class="receipt-header">
                <h2>${shopData.shopName || 'ShopFlow'}</h2>
                <p>${shopData.location || 'Nairobi, Kenya'}</p>
                <p>Tel: ${shopData.shopPhone || 'N/A'}</p>
                <p><strong>Receipt #${sale.receiptNumber || 'N/A'}</strong></p>
                <p>${new Date(sale.date).toLocaleString()}</p>
            </div>

            <div class="receipt-items">
                ${(sale.items || []).map(item => `
                    <div class="receipt-item">
                        <span>${item.name}</span>
                        <span><span class="qty">${item.quantity} × KSh ${item.price.toLocaleString()}</span> = KSh ${item.total.toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>

            <div class="receipt-totals">
                <div class="row"><span>Subtotal</span><span>KSh ${sale.subtotal.toLocaleString()}</span></div>
                ${sale.discount > 0 ? `<div class="row"><span>Discount</span><span>-KSh ${sale.discount.toLocaleString()}</span></div>` : ''}
                <div class="row total"><span>Total</span><span>KSh ${sale.totalAmount.toLocaleString()}</span></div>
                <div class="row"><span>Payment</span><span>${(sale.paymentMethod || 'cash').toUpperCase()}</span></div>
                ${sale.customerName ? `<div class="row"><span>Customer</span><span>${sale.customerName}</span></div>` : ''}
                ${sale.customerPhone ? `<div class="row"><span>Phone</span><span>${sale.customerPhone}</span></div>` : ''}
                ${sale.staff ? `<div class="row"><span>Staff</span><span>${sale.staff}</span></div>` : ''}
            </div>

            <div class="receipt-footer">
                <p>Thank you for your purchase!</p>
                <p style="margin-top:4px;">🎉 Powered by ShopFlow</p>
            </div>
        `;

        openModal('receiptModal');
    };

    // ============================================
    // PRINT RECEIPT
    // ============================================
    window.printReceipt = function() {
        const content = document.getElementById('receiptContent');
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt</title>
                        <style>
                            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
                            .receipt-header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 12px; margin-bottom: 12px; }
                            .receipt-header h2 { margin: 0; }
                            .receipt-item { display: flex; justify-content: space-between; padding: 4px 0; }
                            .receipt-totals { border-top: 2px dashed #ccc; padding-top: 12px; margin-top: 8px; }
                            .receipt-totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
                            .receipt-totals .row.total { font-weight: bold; font-size: 16px; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 4px; }
                            .receipt-footer { text-align: center; border-top: 2px dashed #ccc; padding-top: 12px; margin-top: 12px; }
                            .qty { color: #666; }
                        </style>
                    </head>
                    <body>
                        ${content.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // ============================================
    // EXPORT SALES
    // ============================================
    window.exportSales = function() {
        const sales = getSales();
        if (sales.length === 0) {
            showToast('No sales to export.', 'error');
            return;
        }

        const csv = 'Receipt,Date,Customer,Items,Total,Payment,Staff\n' +
            sales.map(s => `${s.receiptNumber},${new Date(s.date).toLocaleDateString()},${s.customerName || '—'},${s.items?.length || 0},${s.totalAmount},${s.paymentMethod || 'cash'},${s.staff || '—'}`).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Sales exported successfully!');
    };

    // ============================================
    // LOGOUT
    // ============================================
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('shopflow_logged_in');
            window.location.href = '../index.html';
        }
    });

    // ============================================
    // INIT
    // ============================================
    initSidebar();
    loadShopData();
    updateTrial();
    refreshData();

    console.log('🚀 ShopFlow Sales Analytics loaded successfully!');
    console.log('💡 Press Ctrl+B to toggle sidebar');
});