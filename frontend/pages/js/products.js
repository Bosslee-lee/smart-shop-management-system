// ============================================
// SHOPFLOW - PRODUCTS PAGE JAVASCRIPT
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

        // Event listeners
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
        const shopName = shopData.shopName || 'My Shop';
        const ownerName = shopData.ownerName || 'Shop Owner';

        document.getElementById('shopNameDisplay').textContent = shopName;
        document.getElementById('shopOwnerDisplay').textContent = ownerName;
        document.getElementById('shopAvatar').textContent = shopName.charAt(0).toUpperCase();
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
            if (id === 'scanModal') {
                stopScanner();
            }
        }
    };

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                if (modal.id === 'scanModal') stopScanner();
            }
        });
    });

    // ============================================
    // TOAST NOTIFICATION
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
    // GET SHOP CATEGORIES
    // ============================================
    function getShopCategories() {
        const categories = JSON.parse(localStorage.getItem('shopflow_categories') || '[]');
        return categories.length > 0 ? categories : ['Perfumes', 'Cosmetics', 'Accessories'];
    }

    // ============================================
    // POPULATE CATEGORY DROPDOWNS
    // ============================================
    function populateCategoryDropdowns() {
        const categories = getShopCategories();
        const selects = document.querySelectorAll('#productCategory, #editProductCategory, #batchCategory');
        const filterSelect = document.getElementById('categoryFilter');

        selects.forEach(select => {
            if (!select) return;
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select category...</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            if (categories.includes(currentValue)) {
                select.value = currentValue;
            } else if (categories.length > 0 && !currentValue) {
                select.value = categories[0];
            }
        });

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">All Categories</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    }

    // ============================================
    // PRODUCT CRUD OPERATIONS
    // ============================================
    function getProducts() {
        return JSON.parse(localStorage.getItem('shopflow_products') || '[]');
    }

    function saveProducts(products) {
        localStorage.setItem('shopflow_products', JSON.stringify(products));
    }

    // ============================================
    // UPDATE STATS
    // ============================================
    function updateStats(products) {
        const total = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
        const outOfStock = products.filter(p => p.stock === 0).length;

        document.getElementById('totalProductsStat').textContent = total;
        document.getElementById('totalStockStat').textContent = totalStock;
        document.getElementById('lowStockStat').textContent = lowStock;
        document.getElementById('outOfStockStat').textContent = outOfStock;
    }

    // ============================================
    // RENDER PRODUCTS
    // ============================================
    function renderProducts() {
        const products = getProducts();
        const search = document.getElementById('productSearch')?.value?.toLowerCase() || '';
        const filter = document.getElementById('productFilter')?.value || 'all';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const grid = document.getElementById('productGrid');

        if (!grid) return;

        let filtered = products;

        if (search) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
        }

        if (filter === 'low') {
            filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
        } else if (filter === 'out') {
            filtered = filtered.filter(p => p.stock === 0);
        } else if (filter === 'instock') {
            filtered = filtered.filter(p => p.stock > 0);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        updateStats(products);

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📦</div>
                    <h3>No products found</h3>
                    <p>${products.length === 0 ? 'Use the Quick Add bar or click "Add Product" to get started.' : 'Try adjusting your search or filter.'}</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map((product, index) => {
            const actualIndex = products.indexOf(product);
            
            let stockStatus = 'in-stock';
            let stockLabel = '✅ In Stock';
            
            if (product.stock === 0) {
                stockStatus = 'out-of-stock';
                stockLabel = '❌ Out of Stock';
            } else if (product.stock < 10) {
                stockStatus = 'low-stock';
                stockLabel = '⚠️ Low Stock (' + product.stock + ' left)';
            }

            return `
                <div class="product-card">
                    <div class="product-image">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" />` : `<span class="no-image">📷</span>`}
                    </div>
                    <div class="product-body">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">KSh ${product.price.toLocaleString()}</div>
                        <div class="product-category">${product.category || 'Other'}</div>
                        <div class="product-stock">
                            Stock: ${product.stock} units
                            <span class="stock-badge ${stockStatus}">${stockLabel}</span>
                        </div>
                        ${product.barcode ? `<div class="product-barcode">📱 ${product.barcode}</div>` : ''}
                        <div class="product-actions">
                            <button class="btn btn-primary btn-sm" onclick="editProduct(${actualIndex})">✏️ Edit</button>
                            <button class="btn btn-green btn-sm" onclick="openStockIn(${actualIndex})">📥 Stock In</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${actualIndex})">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================
    // QUICK ADD PRODUCT
    // ============================================
    document.getElementById('quickAddBtn')?.addEventListener('click', function() {
        const name = document.getElementById('quickProductName')?.value?.trim();
        const price = parseFloat(document.getElementById('quickProductPrice')?.value);
        const stock = parseInt(document.getElementById('quickProductStock')?.value);

        if (!name) {
            showToast('Please enter a product name.', 'error');
            return;
        }
        if (!price || price <= 0) {
            showToast('Please enter a valid price.', 'error');
            return;
        }
        if (!stock || stock < 0) {
            showToast('Please enter valid stock.', 'error');
            return;
        }

        const products = getProducts();
        const categories = getShopCategories();
        const product = {
            name: name,
            price: price,
            stock: stock,
            category: categories[0] || 'Other',
            description: '',
            image: null,
            barcode: '',
            date: new Date().toISOString()
        };

        products.push(product);
        saveProducts(products);

        if (document.getElementById('quickProductName')) document.getElementById('quickProductName').value = '';
        if (document.getElementById('quickProductPrice')) document.getElementById('quickProductPrice').value = '';
        if (document.getElementById('quickProductStock')) document.getElementById('quickProductStock').value = '';
        if (document.getElementById('quickProductName')) document.getElementById('quickProductName').focus();

        renderProducts();
        showToast('✅ Added: ' + product.name);
    });

    document.getElementById('quickProductStock')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('quickAddBtn')?.click();
        }
    });

    // ============================================
    // IMAGE UPLOAD
    // ============================================
    const imagePreview = document.getElementById('imagePreview');
    const productImage = document.getElementById('productImage');

    imagePreview?.addEventListener('click', function() {
        productImage?.click();
    });

    productImage?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                if (imagePreview) {
                    imagePreview.innerHTML = `<img src="${ev.target.result}" alt="Product image" />`;
                    imagePreview.dataset.image = ev.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    });

    const editImagePreview = document.getElementById('editImagePreview');
    const editProductImage = document.getElementById('editProductImage');

    editImagePreview?.addEventListener('click', function() {
        editProductImage?.click();
    });

    editProductImage?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                if (editImagePreview) {
                    editImagePreview.innerHTML = `<img src="${ev.target.result}" alt="Product image" />`;
                    editImagePreview.dataset.image = ev.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // ============================================
    // ADD PRODUCT (Full Form)
    // ============================================
    document.getElementById('addProductForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const products = getProducts();
        const categories = getShopCategories();
        const imagePreviewEl = document.getElementById('imagePreview');

        const product = {
            name: document.getElementById('productName')?.value?.trim() || '',
            price: parseFloat(document.getElementById('productPrice')?.value) || 0,
            stock: parseInt(document.getElementById('productStock')?.value) || 0,
            category: document.getElementById('productCategory')?.value || categories[0] || 'Other',
            description: document.getElementById('productDesc')?.value?.trim() || '',
            image: imagePreviewEl?.dataset?.image || null,
            barcode: document.getElementById('productBarcode')?.value?.trim() || '',
            date: new Date().toISOString()
        };

        if (!product.name || !product.price || product.stock === undefined) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        products.push(product);
        saveProducts(products);

        closeModal('addProductModal');
        if (document.getElementById('addProductForm')) document.getElementById('addProductForm').reset();
        if (imagePreviewEl) {
            imagePreviewEl.innerHTML = `<span>📷</span><p>Click to upload</p>`;
            delete imagePreviewEl.dataset.image;
        }

        renderProducts();
        showToast('✅ Product "' + product.name + '" added successfully!');
    });

    // ============================================
    // EDIT PRODUCT
    // ============================================
    window.editProduct = function(index) {
        const products = getProducts();
        const product = products[index];

        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }

        document.getElementById('editProductIndex').value = index;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stock;
        document.getElementById('editProductCategory').value = product.category || getShopCategories()[0] || 'Other';
        document.getElementById('editProductDesc').value = product.description || '';
        document.getElementById('editProductBarcode').value = product.barcode || '';

        const preview = document.getElementById('editImagePreview');
        if (product.image) {
            preview.innerHTML = `<img src="${product.image}" alt="${product.name}" />`;
            preview.dataset.image = product.image;
        } else {
            preview.innerHTML = `<span>📷</span><p>Click to change</p>`;
            delete preview.dataset.image;
        }

        openModal('editProductModal');
    };

    document.getElementById('editProductForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const products = getProducts();
        const index = parseInt(document.getElementById('editProductIndex')?.value);
        const preview = document.getElementById('editImagePreview');

        if (index < 0 || index >= products.length) {
            showToast('Product not found.', 'error');
            return;
        }

        const categories = getShopCategories();
        products[index] = {
            ...products[index],
            name: document.getElementById('editProductName')?.value?.trim() || products[index].name,
            price: parseFloat(document.getElementById('editProductPrice')?.value) || products[index].price,
            stock: parseInt(document.getElementById('editProductStock')?.value) || 0,
            category: document.getElementById('editProductCategory')?.value || categories[0] || 'Other',
            description: document.getElementById('editProductDesc')?.value?.trim() || '',
            barcode: document.getElementById('editProductBarcode')?.value?.trim() || '',
            image: preview?.dataset?.image || products[index].image || null,
            updated: new Date().toISOString()
        };

        saveProducts(products);
        closeModal('editProductModal');
        renderProducts();
        showToast('✅ Product updated successfully!');
    });

    // ============================================
    // DELETE PRODUCT
    // ============================================
    window.deleteProduct = function(index) {
        const products = getProducts();

        if (index < 0 || index >= products.length) {
            showToast('Product not found.', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete "' + products[index].name + '"?')) {
            const deleted = products[index].name;
            products.splice(index, 1);
            saveProducts(products);
            renderProducts();
            showToast('🗑️ "' + deleted + '" deleted.');
        }
    };

    // ============================================
    // STOCK IN
    // ============================================
    window.openStockIn = function(index) {
        const products = getProducts();
        const product = products[index];

        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }

        document.getElementById('stockInProductIndex').value = index;
        document.getElementById('stockInProductName').textContent = product.name;
        document.getElementById('stockInCurrentStock').textContent = product.stock + ' units';
        document.getElementById('stockInNewTotal').textContent = product.stock;
        document.getElementById('stockInQuantity').value = '';
        document.getElementById('stockInQuantity').focus();

        openModal('stockInModal');
    };

    document.getElementById('stockInQuantity')?.addEventListener('input', function() {
        const products = getProducts();
        const index = parseInt(document.getElementById('stockInProductIndex')?.value);
        const product = products[index];
        const quantity = parseInt(this.value) || 0;
        const newTotal = (product?.stock || 0) + quantity;
        document.getElementById('stockInNewTotal').textContent = newTotal;
    });

    document.getElementById('stockInForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const products = getProducts();
        const index = parseInt(document.getElementById('stockInProductIndex')?.value);
        const quantity = parseInt(document.getElementById('stockInQuantity')?.value);

        if (index < 0 || index >= products.length) {
            showToast('Product not found.', 'error');
            return;
        }

        if (!quantity || quantity < 1) {
            showToast('Please enter a valid quantity.', 'error');
            return;
        }

        const product = products[index];
        product.stock += quantity;
        product.lastStockIn = new Date().toISOString();

        saveProducts(products);
        closeModal('stockInModal');
        renderProducts();
        showToast('📥 Added ' + quantity + ' units to "' + product.name + '". New stock: ' + product.stock);
    });

    // ============================================
    // SCANNER (Barcode/Camera)
    // ============================================
    let scannerActive = false;
    let stream = null;
    let scannedData = null;

    document.getElementById('startScanBtn')?.addEventListener('click', function() {
        startScanner();
    });

    document.getElementById('stopScanBtn')?.addEventListener('click', function() {
        stopScanner();
    });

    document.getElementById('capturePhotoBtn')?.addEventListener('click', function() {
        capturePhoto();
    });

    function startScanner() {
        const video = document.getElementById('scannerVideo');
        if (!video) return;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(function(mediaStream) {
                    stream = mediaStream;
                    video.srcObject = mediaStream;
                    video.play();
                    scannerActive = true;
                    document.getElementById('startScanBtn').textContent = '📷 Scanning...';
                    document.getElementById('startScanBtn').disabled = true;
                    document.getElementById('stopScanBtn').style.display = 'inline-block';
                    
                    setTimeout(() => {
                        if (scannerActive) {
                            simulateBarcodeScan();
                        }
                    }, 3000);
                })
                .catch(function(err) {
                    showToast('Camera access denied. Please allow camera access.', 'error');
                    console.error('Camera error:', err);
                });
        } else {
            showToast('Camera not supported on this device.', 'error');
        }
    }

    function stopScanner() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        scannerActive = false;
        const video = document.getElementById('scannerVideo');
        if (video) video.srcObject = null;
        document.getElementById('startScanBtn').textContent = '📷 Start Camera';
        document.getElementById('startScanBtn').disabled = false;
        document.getElementById('stopScanBtn').style.display = 'none';
    }

    function capturePhoto() {
        const video = document.getElementById('scannerVideo');
        const canvas = document.getElementById('scannerCanvas');
        if (!video || !canvas) return;
        
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        simulateBarcodeScan();
    }

    function simulateBarcodeScan() {
        const demoProducts = [
            { name: 'Chanel No. 5 (30ml)', price: 8500, barcode: '1234567890' },
            { name: 'Dior Sauvage (50ml)', price: 7200, barcode: '0987654321' },
            { name: 'Black Opium (30ml)', price: 6900, barcode: '1122334455' },
            { name: 'Coco Mademoiselle', price: 8100, barcode: '5544332211' },
        ];

        const random = demoProducts[Math.floor(Math.random() * demoProducts.length)];
        scannedData = random;
        
        document.getElementById('scannedName').textContent = random.name;
        document.getElementById('scannedPrice').textContent = 'KSh ' + random.price.toLocaleString();
        document.getElementById('scannedBarcode').textContent = random.barcode;
        document.getElementById('scanResult').style.display = 'block';
        
        showToast('📸 Product detected: ' + random.name);
    }

    document.getElementById('addScannedProduct')?.addEventListener('click', function() {
        if (!scannedData) return;
        
        const products = getProducts();
        const categories = getShopCategories();
        const product = {
            name: scannedData.name,
            price: scannedData.price,
            stock: 10,
            category: categories[0] || 'Other',
            description: '',
            image: null,
            barcode: scannedData.barcode,
            date: new Date().toISOString()
        };

        products.push(product);
        saveProducts(products);
        renderProducts();
        
        document.getElementById('scanResult').style.display = 'none';
        scannedData = null;
        closeModal('scanModal');
        showToast('✅ Added: ' + product.name);
    });

    document.getElementById('editScannedProduct')?.addEventListener('click', function() {
        if (!scannedData) return;
        
        document.getElementById('productName').value = scannedData.name;
        document.getElementById('productPrice').value = scannedData.price;
        document.getElementById('productBarcode').value = scannedData.barcode;
        
        document.getElementById('scanResult').style.display = 'none';
        scannedData = null;
        closeModal('scanModal');
        openModal('addProductModal');
    });

    // ============================================
    // BATCH ADD
    // ============================================
    document.getElementById('batchInput')?.addEventListener('input', function() {
        const text = this.value;
        const lines = text.split('\n').filter(line => line.trim());
        const preview = document.getElementById('batchPreview');
        
        if (!preview) return;
        
        if (lines.length === 0) {
            preview.innerHTML = '';
            return;
        }
        
        let html = '<p style="font-weight:600;margin-bottom:4px;">📋 ' + lines.length + ' products detected:</p>';
        let valid = 0;
        
        lines.forEach(line => {
            const parts = line.split(',').map(s => s.trim());
            if (parts.length >= 2) {
                const name = parts[0];
                const price = parseFloat(parts[1]);
                const stock = parseInt(parts[2]) || 10;
                if (name && !isNaN(price)) {
                    valid++;
                    html += `<div class="batch-item"><span>${name}</span><span class="batch-success">KSh ${price} × ${stock}</span></div>`;
                }
            }
        });
        
        if (valid === 0) {
            html += '<div class="batch-item"><span class="batch-error">⚠️ No valid products found. Format: Name, Price, Stock</span></div>';
        }
        
        preview.innerHTML = html;
    });

    document.getElementById('batchAddBtn')?.addEventListener('click', function() {
        const text = document.getElementById('batchInput')?.value;
        if (!text) {
            showToast('Please paste some products first.', 'error');
            return;
        }
        
        const lines = text.split('\n').filter(line => line.trim());
        const category = document.getElementById('batchCategory')?.value || getShopCategories()[0] || 'Other';
        const products = getProducts();
        let added = 0;
        
        lines.forEach(line => {
            const parts = line.split(',').map(s => s.trim());
            if (parts.length >= 2) {
                const name = parts[0];
                const price = parseFloat(parts[1]);
                const stock = parseInt(parts[2]) || 10;
                if (name && !isNaN(price) && price > 0) {
                    products.push({
                        name: name,
                        price: price,
                        stock: stock,
                        category: category,
                        description: '',
                        image: null,
                        barcode: '',
                        date: new Date().toISOString()
                    });
                    added++;
                }
            }
        });
        
        if (added === 0) {
            showToast('No valid products to add.', 'error');
            return;
        }
        
        saveProducts(products);
        closeModal('batchModal');
        if (document.getElementById('batchInput')) document.getElementById('batchInput').value = '';
        if (document.getElementById('batchPreview')) document.getElementById('batchPreview').innerHTML = '';
        renderProducts();
        showToast('✅ Added ' + added + ' products via batch!');
    });

    // ============================================
    // SEARCH & FILTER
    // ============================================
    document.getElementById('productSearch')?.addEventListener('input', renderProducts);
    document.getElementById('productFilter')?.addEventListener('change', renderProducts);
    document.getElementById('categoryFilter')?.addEventListener('change', renderProducts);

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
    populateCategoryDropdowns();
    renderProducts();

    console.log('🚀 ShopFlow Products page loaded successfully!');
    console.log('💡 Press Ctrl+B to toggle sidebar');
});