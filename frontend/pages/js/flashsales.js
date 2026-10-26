// ============================================
// SHOPFLOW - FLASH SALES JAVASCRIPT
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
    // SIDEBAR FUNCTIONS
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

        collapseBtn?.addEventListener('click', function() {
            toggleSidebarCollapse();
        });

        sidebarToggle?.addEventListener('click', function() {
            toggleSidebarCollapse();
        });

        expandBtn?.addEventListener('click', function() {
            toggleSidebarCollapse(true);
        });

        function toggleMobileSidebar(open) {
            sidebar.classList.toggle('open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        }

        menuToggle?.addEventListener('click', () => toggleMobileSidebar(true));
        closeSidebar?.addEventListener('click', () => toggleMobileSidebar(false));

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMobileSidebar(false);
                }
            });
        });

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

        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleSidebarCollapse();
            }
        });

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
    function getFlashSales() {
        return JSON.parse(localStorage.getItem('shopflow_flashsales') || '[]');
    }

    function saveFlashSales(flashSales) {
        localStorage.setItem('shopflow_flashsales', JSON.stringify(flashSales));
    }

    function getProducts() {
        return JSON.parse(localStorage.getItem('shopflow_products') || '[]');
    }

    function getSales() {
        return JSON.parse(localStorage.getItem('shopflow_sales') || '[]');
    }

    // ============================================
    // POPULATE PRODUCT DROPDOWN
    // ============================================
    function populateProductDropdown() {
        const products = getProducts();
        const sales = getSales();
        const select = document.getElementById('flashProduct');
        
        // Calculate product sales
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });

        select.innerHTML = '<option value="">Select a product...</option>' + 
            products.map(p => {
                const sold = productSales[p.name] || 0;
                const isSlow = sold === 0 && p.stock > 10;
                const isLowStock = p.stock < 5;
                let label = p.name;
                if (isSlow) label += ' 🐢 (Slow)';
                if (isLowStock) label += ' ⚠️ (Low Stock)';
                return `<option value="${p.name}" data-price="${p.price}" data-stock="${p.stock}" ${isSlow || isLowStock ? 'class="highlight"' : ''}>${label} - KSh ${p.price} (${p.stock} left)</option>`;
            }).join('');
    }

    // ============================================
    // PRODUCT SELECTION HANDLER
    // ============================================
    document.getElementById('flashProduct')?.addEventListener('change', function() {
        const selected = this.options[this.selectedIndex];
        const price = selected.dataset.price;
        const stock = selected.dataset.stock;
        
        document.getElementById('flashOriginalPrice').value = price ? 'KSh ' + parseInt(price).toLocaleString() : '';
        document.getElementById('flashCurrentStock').value = stock || '';
        
        calculateSalePrice();
    });

    document.getElementById('flashDiscount')?.addEventListener('input', calculateSalePrice);

    function calculateSalePrice() {
        const price = parseInt(document.getElementById('flashOriginalPrice').value.replace(/[^0-9]/g, ''));
        const discount = parseInt(document.getElementById('flashDiscount').value) || 0;
        
        if (price && discount > 0 && discount <= 90) {
            const salePrice = price - (price * discount / 100);
            document.getElementById('flashSalePrice').value = 'KSh ' + salePrice.toFixed(0);
            
            // Show preview
            const preview = document.getElementById('flashPreview');
            preview.style.display = 'block';
            document.getElementById('previewProduct').textContent = document.getElementById('flashProduct').value || '—';
            document.getElementById('previewOriginal').textContent = 'KSh ' + price.toLocaleString();
            document.getElementById('previewDiscount').textContent = discount + '%';
            document.getElementById('previewSalePrice').textContent = 'KSh ' + salePrice.toFixed(0);
            
            // Calculate duration
            const start = document.getElementById('flashStartDate').value;
            const end = document.getElementById('flashEndDate').value;
            if (start && end) {
                const duration = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
                document.getElementById('previewDuration').textContent = duration.toFixed(1) + ' hours';
            }
        } else {
            document.getElementById('flashSalePrice').value = '';
            document.getElementById('flashPreview').style.display = 'none';
        }
    }

    document.getElementById('flashStartDate')?.addEventListener('change', calculateSalePrice);
    document.getElementById('flashEndDate')?.addEventListener('change', calculateSalePrice);

    // ============================================
    // RENDER FLASH SALES
    // ============================================
    function renderFlashSales() {
        const flashSales = getFlashSales();
        const filter = document.getElementById('flashFilter')?.value || 'all';
        const search = document.getElementById('flashSearch')?.value?.toLowerCase() || '';
        const grid = document.getElementById('flashSalesGrid');

        let filtered = flashSales;

        const now = new Date();
        // Update statuses
        flashSales.forEach(fs => {
            const start = new Date(fs.startDate);
            const end = new Date(fs.endDate);
            if (fs.status === 'paused') return;
            if (now < start) fs.status = 'upcoming';
            else if (now > end) fs.status = 'ended';
            else fs.status = 'active';
        });
        saveFlashSales(flashSales);

        if (filter !== 'all') {
            filtered = filtered.filter(fs => fs.status === filter);
        }

        if (search) {
            filtered = filtered.filter(fs => 
                fs.productName.toLowerCase().includes(search) ||
                fs.notes?.toLowerCase().includes(search)
            );
        }

        // Update stats
        updateStats(flashSales);

        // Render
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-flash">
                    <span class="icon">⚡</span>
                    <h3>${flashSales.length === 0 ? 'No flash sales yet' : 'No matching flash sales'}</h3>
                    <p>${flashSales.length === 0 ? 'Click "New Flash Sale" to start boosting your sales.' : 'Try adjusting your search or filter.'}</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map((fs, index) => {
            const actualIndex = flashSales.indexOf(fs);
            const statusIcons = {
                active: '🟢',
                upcoming: '🟡',
                ended: '🔴',
                paused: '⚪'
            };
            const statusLabels = {
                active: 'Active',
                upcoming: 'Upcoming',
                ended: 'Ended',
                paused: 'Paused'
            };

            const now = new Date();
            const end = new Date(fs.endDate);
            const timeLeft = end - now;
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            let timerText = '';
            if (fs.status === 'active') {
                timerText = `⏳ ${hoursLeft}h ${minsLeft}m left`;
            } else if (fs.status === 'upcoming') {
                const start = new Date(fs.startDate);
                const startsIn = start - now;
                const hours = Math.floor(startsIn / (1000 * 60 * 60));
                const mins = Math.floor((startsIn % (1000 * 60 * 60)) / (1000 * 60));
                timerText = `⏰ Starts in ${hours}h ${mins}m`;
            } else if (fs.status === 'ended') {
                timerText = '⏱️ Ended';
            } else {
                timerText = '⏸️ Paused';
            }

            return `
                <div class="flash-card ${fs.status}" onclick="viewFlashSale(${actualIndex})">
                    <div class="flash-header">
                        <span class="product-name">${fs.productName}</span>
                        <span class="status-badge ${fs.status}">${statusIcons[fs.status]} ${statusLabels[fs.status]}</span>
                    </div>
                    <div class="flash-body">
                        <div class="price-row">
                            <span class="original-price">KSh ${fs.originalPrice.toLocaleString()}</span>
                            <span class="sale-price">KSh ${fs.salePrice.toLocaleString()}</span>
                            <span class="discount-badge">-${fs.discount}%</span>
                        </div>
                        <div class="stock-info">
                            🏷️ <span class="remaining">${fs.sold || 0}</span> sold of ${fs.stockLimit || 'Unlimited'}
                        </div>
                        <div class="reason">
                            📌 ${fs.reason ? fs.reason.replace('_', ' ').toUpperCase() : 'PROMOTION'}
                        </div>
                    </div>
                    <div class="flash-footer">
                        <span class="timer ${fs.status}">${timerText}</span>
                        <div class="actions">
                            ${fs.status !== 'ended' ? `<button class="btn ${fs.status === 'paused' ? 'btn-green' : 'btn-amber'} btn-sm" onclick="event.stopPropagation();toggleFlashSale(${actualIndex})">${fs.status === 'paused' ? '▶️ Resume' : '⏸️ Pause'}</button>` : ''}
                            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteFlashSale(${actualIndex})">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================
    // UPDATE STATS
    // ============================================
    function updateStats(flashSales) {
        const now = new Date();
        const active = flashSales.filter(fs => {
            const start = new Date(fs.startDate);
            const end = new Date(fs.endDate);
            return fs.status !== 'paused' && now >= start && now <= end;
        }).length;
        
        const total = flashSales.length;
        const productsOnSale = flashSales.filter(fs => fs.status === 'active').length;
        const avgDiscount = flashSales.length > 0 ? 
            Math.round(flashSales.reduce((sum, fs) => sum + (fs.discount || 0), 0) / flashSales.length) : 0;

        document.getElementById('activeFlashSales').textContent = active;
        document.getElementById('totalFlashSales').textContent = total;
        document.getElementById('productsOnSale').textContent = productsOnSale;
        document.getElementById('totalDiscount').textContent = avgDiscount + '%';
    }

    // ============================================
    // ADD FLASH SALE
    // ============================================
    document.getElementById('addFlashSaleForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const productSelect = document.getElementById('flashProduct');
        const productName = productSelect.value;
        const originalPrice = parseInt(productSelect.options[productSelect.selectedIndex]?.dataset?.price);
        const currentStock = parseInt(productSelect.options[productSelect.selectedIndex]?.dataset?.stock);
        const discount = parseInt(document.getElementById('flashDiscount').value);
        const salePrice = parseInt(document.getElementById('flashSalePrice').value.replace(/[^0-9]/g, ''));
        const startDate = document.getElementById('flashStartDate').value;
        const endDate = document.getElementById('flashEndDate').value;
        const reason = document.getElementById('flashReason').value;
        const notes = document.getElementById('flashNotes').value.trim();

        if (!productName || !originalPrice) {
            showToast('Please select a product.', 'error');
            return;
        }

        if (!discount || discount < 1 || discount > 90) {
            showToast('Please enter a valid discount (1-90%).', 'error');
            return;
        }

        if (!startDate || !endDate) {
            showToast('Please set start and end dates.', 'error');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            showToast('End date must be after start date.', 'error');
            return;
        }

        const flashSales = getFlashSales();
        const now = new Date();
        let status = 'upcoming';
        if (now >= start && now <= end) status = 'active';
        else if (now > end) status = 'ended';

        const flashSale = {
            id: 'FS-' + Date.now().toString().slice(-6),
            productName: productName,
            originalPrice: originalPrice,
            salePrice: salePrice,
            discount: discount,
            stockLimit: currentStock || 999,
            sold: 0,
            startDate: startDate,
            endDate: endDate,
            status: status,
            reason: reason,
            notes: notes,
            createdAt: new Date().toISOString(),
            createdBy: 'Owner'
        };

        flashSales.push(flashSale);
        saveFlashSales(flashSales);

        closeModal('addFlashSaleModal');
        this.reset();
        document.getElementById('flashPreview').style.display = 'none';
        document.getElementById('flashOriginalPrice').value = '';
        document.getElementById('flashCurrentStock').value = '';
        document.getElementById('flashSalePrice').value = '';
        renderFlashSales();
        showToast(`⚡ Flash sale launched for ${productName}!`);
    });

    // ============================================
    // VIEW FLASH SALE
    // ============================================
    window.viewFlashSale = function(index) {
        const flashSales = getFlashSales();
        const fs = flashSales[index];
        if (!fs) {
            showToast('Flash sale not found.', 'error');
            return;
        }

        document.getElementById('viewFlashTitle').textContent = '⚡ ' + fs.productName;

        const content = document.getElementById('viewFlashContent');
        const now = new Date();
        const end = new Date(fs.endDate);
        const timeLeft = end - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        content.innerHTML = `
            <div class="detail-row">
                <span class="label">Product</span>
                <span class="value">${fs.productName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Original Price</span>
                <span class="value">KSh ${fs.originalPrice.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Sale Price</span>
                <span class="value sale">KSh ${fs.salePrice.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Discount</span>
                <span class="value discount">${fs.discount}% OFF</span>
            </div>
            <div class="detail-row">
                <span class="label">Status</span>
                <span class="value" style="color:${fs.status === 'active' ? 'var(--green)' : fs.status === 'upcoming' ? 'var(--amber)' : 'var(--red)'}">${fs.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Sold</span>
                <span class="value">${fs.sold || 0} units</span>
            </div>
            <div class="detail-row">
                <span class="label">Stock Limit</span>
                <span class="value">${fs.stockLimit || 'Unlimited'}</span>
            </div>
            <div class="detail-row">
                <span class="label">Start Date</span>
                <span class="value">${new Date(fs.startDate).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">End Date</span>
                <span class="value">${new Date(fs.endDate).toLocaleString()}</span>
            </div>
            ${fs.status === 'active' ? `
            <div class="detail-row">
                <span class="label">Time Remaining</span>
                <span class="value" style="color:var(--green);">${hoursLeft}h ${minsLeft}m</span>
            </div>` : ''}
            <div class="detail-row">
                <span class="label">Reason</span>
                <span class="value">${fs.reason ? fs.reason.replace('_', ' ').toUpperCase() : 'PROMOTION'}</span>
            </div>
            ${fs.notes ? `
            <div class="detail-row">
                <span class="label">Notes</span>
                <span class="value" style="font-weight:400;color:var(--text-soft);">${fs.notes}</span>
            </div>` : ''}
            <div class="detail-row">
                <span class="label">Created</span>
                <span class="value">${new Date(fs.createdAt).toLocaleString()}</span>
            </div>
        `;

        openModal('viewFlashSaleModal');
    };

    // ============================================
    // TOGGLE FLASH SALE (Pause/Resume)
    // ============================================
    window.toggleFlashSale = function(index) {
        const flashSales = getFlashSales();
        const fs = flashSales[index];
        if (!fs) {
            showToast('Flash sale not found.', 'error');
            return;
        }

        if (fs.status === 'paused') {
            fs.status = 'active';
            showToast('▶️ Flash sale resumed.');
        } else {
            fs.status = 'paused';
            showToast('⏸️ Flash sale paused.');
        }

        saveFlashSales(flashSales);
        renderFlashSales();
    };

    // ============================================
    // DELETE FLASH SALE
    // ============================================
    window.deleteFlashSale = function(index) {
        const flashSales = getFlashSales();
        if (index < 0 || index >= flashSales.length) {
            showToast('Flash sale not found.', 'error');
            return;
        }

        if (confirm('Delete this flash sale permanently? This cannot be undone.')) {
            const deleted = flashSales[index].productName;
            flashSales.splice(index, 1);
            saveFlashSales(flashSales);
            renderFlashSales();
            showToast('🗑️ Flash sale for "' + deleted + '" deleted.');
        }
    };

    // ============================================
    // CLEAR SLOW STOCK
    // ============================================
    function renderSlowProducts() {
        const products = getProducts();
        const sales = getSales();
        const container = document.getElementById('slowProductsList');

        // Calculate product sales
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });

        // Find slow moving products (0 sales or very low sales)
        const slowProducts = products.filter(p => {
            const sold = productSales[p.name] || 0;
            return (sold === 0 && p.stock > 5) || (sold < 2 && p.stock > 10);
        });

        if (slowProducts.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-soft);">
                    <p>🎉 No slow moving products found. Your inventory is healthy!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = slowProducts.map(p => {
            const sold = productSales[p.name] || 0;
            return `
                <div class="slow-product-item">
                    <div class="product-info">
                        <div class="name">${p.name}</div>
                        <div class="details">Stock: ${p.stock} | Sold: ${sold} units | Price: KSh ${p.price.toLocaleString()}</div>
                    </div>
                    <div class="product-actions">
                        <input type="number" class="discount-input" value="30" min="10" max="70" data-product="${p.name}" data-price="${p.price}" />
                        <button class="btn btn-primary btn-sm" onclick="applySingleDiscount(this)">Apply</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.applySingleDiscount = function(btn) {
        const row = btn.closest('.slow-product-item');
        const input = row.querySelector('.discount-input');
        const productName = input.dataset.product;
        const originalPrice = parseInt(input.dataset.price);
        const discount = parseInt(input.value);

        if (!discount || discount < 1 || discount > 90) {
            showToast('Please enter a valid discount (1-90%).', 'error');
            return;
        }

        // Create flash sale for this product
        const flashSales = getFlashSales();
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 3); // 3 days sale

        const salePrice = originalPrice - (originalPrice * discount / 100);

        const flashSale = {
            id: 'FS-' + Date.now().toString().slice(-6),
            productName: productName,
            originalPrice: originalPrice,
            salePrice: Math.round(salePrice),
            discount: discount,
            stockLimit: 999,
            sold: 0,
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
            reason: 'clear_stock',
            notes: 'Auto-generated from slow stock clearance',
            createdAt: new Date().toISOString(),
            createdBy: 'Owner'
        };

        flashSales.push(flashSale);
        saveFlashSales(flashSales);
        renderFlashSales();
        renderSlowProducts();
        showToast(`⚡ Flash sale created for ${productName} at ${discount}% off!`);
    };

    document.getElementById('clearSlowStockBtn')?.addEventListener('click', function() {
        renderSlowProducts();
        openModal('clearStockModal');
    });

    document.getElementById('applyBulkDiscounts')?.addEventListener('click', function() {
        const inputs = document.querySelectorAll('.discount-input');
        let count = 0;
        inputs.forEach(input => {
            const productName = input.dataset.product;
            const originalPrice = parseInt(input.dataset.price);
            const discount = parseInt(input.value);

            if (discount && discount >= 1 && discount <= 90) {
                const flashSales = getFlashSales();
                const now = new Date();
                const endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 3);

                const salePrice = originalPrice - (originalPrice * discount / 100);

                const flashSale = {
                    id: 'FS-' + Date.now().toString().slice(-6),
                    productName: productName,
                    originalPrice: originalPrice,
                    salePrice: Math.round(salePrice),
                    discount: discount,
                    stockLimit: 999,
                    sold: 0,
                    startDate: now.toISOString(),
                    endDate: endDate.toISOString(),
                    status: 'active',
                    reason: 'clear_stock',
                    notes: 'Auto-generated from bulk stock clearance',
                    createdAt: new Date().toISOString(),
                    createdBy: 'Owner'
                };

                flashSales.push(flashSale);
                saveFlashSales(flashSales);
                count++;
            }
        });

        if (count > 0) {
            closeModal('clearStockModal');
            renderFlashSales();
            showToast(`✅ ${count} flash sales created from slow stock!`);
        } else {
            showToast('No valid discounts applied.', 'error');
        }
    });

    // ============================================
    // SEARCH & FILTER
    // ============================================
    document.getElementById('flashFilter')?.addEventListener('change', renderFlashSales);
    document.getElementById('flashSearch')?.addEventListener('input', renderFlashSales);

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
    // AUTO-REFRESH EVERY 60 SECONDS
    // ============================================
    setInterval(renderFlashSales, 60000);

    // ============================================
    // INIT
    // ============================================
    initSidebar();
    loadShopData();
    updateTrial();
    populateProductDropdown();
    renderFlashSales();

    console.log('🚀 ShopFlow Flash Sales loaded successfully!');
    console.log('⚡ Boost sales with time-limited discounts');
});