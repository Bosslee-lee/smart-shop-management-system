// ============================================
// MARKETPLACE - COMPLETE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // SAMPLE PRODUCTS (10 Products)
    // ============================================
    var sampleProducts = [
        { id: 1, name: 'Chanel No. 5 (30ml)', price: 8500, stock: 15, category: 'Perfume', image: '🌸', color: '#f8d7e0', imageUrl: null },
        { id: 2, name: 'Dior Sauvage (50ml)', price: 7200, stock: 8, category: 'Perfume', image: '🌊', color: '#d4e9f7', imageUrl: null },
        { id: 3, name: 'Black Opium (30ml)', price: 6900, stock: 3, category: 'Perfume', image: '🌙', color: '#e8d5e8', imageUrl: null },
        { id: 4, name: 'Samsung A15 128GB', price: 18500, stock: 5, category: 'Electronics', image: '📱', color: '#d4edda', imageUrl: null },
        { id: 5, name: 'JBL Bluetooth Speaker', price: 3200, stock: 12, category: 'Electronics', image: '🔊', color: '#fff3cd', imageUrl: null },
        { id: 6, name: 'Pembe Maize Flour 2kg', price: 220, stock: 45, category: 'Groceries', image: '🌾', color: '#f5e6d3', imageUrl: null },
        { id: 7, name: 'Cooking Oil 2L', price: 480, stock: 20, category: 'Groceries', image: '🫒', color: '#d4e9d4', imageUrl: null },
        { id: 8, name: 'Weetabix Cereal 430g', price: 390, stock: 0, category: 'Groceries', image: '🥣', color: '#f0e6d3', imageUrl: null },
        { id: 9, name: 'Coco Mademoiselle (30ml)', price: 8100, stock: 2, category: 'Perfume', image: '🌹', color: '#fce4ec', imageUrl: null },
        { id: 10, name: 'Anker Power Bank 10000mAh', price: 2400, stock: 7, category: 'Electronics', image: '🔋', color: '#e3f2fd', imageUrl: null }
    ];

    // ============================================
    // PRODUCT IMAGE DATABASE (for visual search)
    // ============================================
    var productImageDB = {
        'chanel': { color: '#f8d7e0', icon: '🌸', keywords: ['perfume', 'chanel', 'floral'] },
        'dior': { color: '#d4e9f7', icon: '🌊', keywords: ['perfume', 'dior', 'fresh'] },
        'black opium': { color: '#e8d5e8', icon: '🌙', keywords: ['perfume', 'opium', 'dark'] },
        'samsung': { color: '#d4edda', icon: '📱', keywords: ['phone', 'samsung', 'electronics'] },
        'jbl': { color: '#fff3cd', icon: '🔊', keywords: ['speaker', 'jbl', 'audio'] },
        'pembe': { color: '#f5e6d3', icon: '🌾', keywords: ['flour', 'maize', 'food'] },
        'cooking oil': { color: '#d4e9d4', icon: '🫒', keywords: ['oil', 'cooking', 'food'] },
        'weetabix': { color: '#f0e6d3', icon: '🥣', keywords: ['cereal', 'breakfast', 'food'] },
        'coco mademoiselle': { color: '#fce4ec', icon: '🌹', keywords: ['perfume', 'coco', 'floral'] },
        'anker': { color: '#e3f2fd', icon: '🔋', keywords: ['power bank', 'anker', 'electronics'] }
    };

    // ============================================
    // CART
    // ============================================
    var cart = [];
    var cartCount = 0;

    // ============================================
    // CHECK LOGIN
    // ============================================
    if (!localStorage.getItem('shopflow_logged_in')) {
        window.location.href = '../../pages/login.html';
        return;
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
    window.openModal = openModal;
    window.closeModal = closeModal;

    // ============================================
    // GET PRODUCTS
    // ============================================
    function getProducts() {
        var stored = localStorage.getItem('shopflow_products');
        if (stored) {
            var products = JSON.parse(stored);
            if (products.length > 0) return products;
        }
        localStorage.setItem('shopflow_products', JSON.stringify(sampleProducts));
        return sampleProducts;
    }

    // ============================================
    // POPULATE CATEGORY FILTER
    // ============================================
    function populateCategoryFilter() {
        var products = getProducts();
        var categories = [];
        for (var i = 0; i < products.length; i++) {
            var cat = products[i].category;
            if (cat && categories.indexOf(cat) === -1) {
                categories.push(cat);
            }
        }
        var select = document.getElementById('categoryFilter');
        var currentVal = select.value;
        select.innerHTML = '<option value="all">All Categories</option>';
        for (var j = 0; j < categories.length; j++) {
            select.innerHTML += '<option value="' + categories[j] + '">' + categories[j] + '</option>';
        }
        select.value = currentVal;
    }

    // ============================================
    // EXTRACT COLORS FROM IMAGE (Simulated)
    // ============================================
    function extractColorsFromImage(imageData) {
        var colors = ['#f8d7e0', '#d4e9f7', '#e8d5e8', '#d4edda', '#fff3cd', '#f5e6d3', '#d4e9d4', '#f0e6d3', '#fce4ec', '#e3f2fd'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // ============================================
    // VISUAL SEARCH - Match by color & keywords
    // ============================================
    function visualSearch(imageData, fileName) {
        var products = getProducts();
        var matches = [];
        var searchText = fileName ? fileName.toLowerCase() : '';

        var dominantColor = extractColorsFromImage(imageData);

        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            var score = 0;

            if (p.color && dominantColor) {
                var colorDist = getColorDistance(p.color, dominantColor);
                if (colorDist < 200) {
                    score += 10;
                }
            }

            if (searchText) {
                var name = p.name.toLowerCase();
                var keywords = productImageDB[p.name.toLowerCase()]?.keywords || [];
                for (var k = 0; k < keywords.length; k++) {
                    if (searchText.indexOf(keywords[k]) !== -1) {
                        score += 5;
                    }
                }
                if (name.indexOf(searchText) !== -1) {
                    score += 8;
                }
            }

            if (score > 2) {
                matches.push({
                    product: p,
                    score: score + Math.random() * 2
                });
            }
        }

        matches.sort(function(a, b) { return b.score - a.score; });
        return matches.slice(0, 5);
    }

    // ============================================
    // GET COLOR DISTANCE
    // ============================================
    function getColorDistance(color1, color2) {
        var c1 = hexToRgb(color1);
        var c2 = hexToRgb(color2);
        if (!c1 || !c2) return 999;
        var r = c1.r - c2.r;
        var g = c1.g - c2.g;
        var b = c1.b - c2.b;
        return Math.sqrt(r*r + g*g + b*b);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // ============================================
    // SCAN FUNCTIONS
    // ============================================
    var video = null;
    var canvas = null;
    var stream = null;
    var isCameraRunning = false;

    function openScanModal() {
        openModal('scanModal');
        document.getElementById('scanResult').style.display = 'none';
        document.getElementById('scanMatches').innerHTML = '';
        document.getElementById('scanMatchCount').textContent = '0';
    }
    window.openScanModal = openScanModal;

    // Start Camera
    document.getElementById('startCameraBtn').addEventListener('click', function() {
        startCamera();
    });

    function startCamera() {
        var videoEl = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            })
            .then(function(mediaStream) {
                stream = mediaStream;
                videoEl.srcObject = mediaStream;
                videoEl.play();
                isCameraRunning = true;
                document.getElementById('startCameraBtn').textContent = '📷 Camera Running';
                document.getElementById('startCameraBtn').disabled = true;
                document.getElementById('stopCameraBtn').style.display = 'inline-block';
                showToast('📷 Camera started! Position product in frame.', 'info');
            })
            .catch(function(err) {
                showToast('Camera access denied. Please allow camera access.', 'error');
                console.error('Camera error:', err);
            });
        } else {
            showToast('Camera not supported on this device.', 'error');
        }
    }

    // Stop Camera
    document.getElementById('stopCameraBtn').addEventListener('click', function() {
        stopCamera();
    });

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(function(track) { track.stop(); });
            stream = null;
        }
        var videoEl = document.getElementById('video');
        videoEl.srcObject = null;
        isCameraRunning = false;
        document.getElementById('startCameraBtn').textContent = '📷 Start Camera';
        document.getElementById('startCameraBtn').disabled = false;
        document.getElementById('stopCameraBtn').style.display = 'none';
    }

    // Capture Photo
    document.getElementById('captureBtn').addEventListener('click', function() {
        if (!isCameraRunning) {
            showToast('Please start camera first.', 'error');
            return;
        }
        capturePhoto();
    });

    function capturePhoto() {
        var videoEl = document.getElementById('video');
        var canvasEl = document.getElementById('canvas');
        var context = canvasEl.getContext('2d');

        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

        var imageData = canvasEl.toDataURL('image/png');
        processImageSearch(imageData, 'captured_image');
    }

    // Upload Image
    document.getElementById('uploadBtn').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                processImageSearch(event.target.result, file.name);
            };
            reader.readAsDataURL(file);
        }
    });

    // ============================================
    // PROCESS IMAGE SEARCH
    // ============================================
    function processImageSearch(imageData, fileName) {
        var matches = visualSearch(imageData, fileName);

        var resultDiv = document.getElementById('scanResult');
        var matchesDiv = document.getElementById('scanMatches');
        var countSpan = document.getElementById('scanMatchCount');

        if (matches.length === 0) {
            countSpan.textContent = '0';
            matchesDiv.innerHTML = '<p style="color:var(--text-soft);">No matching products found. Try a different image.</p>';
            resultDiv.style.display = 'block';
            showToast('No matching products found.', 'error');
            return;
        }

        countSpan.textContent = matches.length;

        var html = '';
        for (var i = 0; i < matches.length; i++) {
            var p = matches[i].product;
            var stockStatus = p.stock > 0 ? '✅ In Stock' : '❌ Out of Stock';
            var stockColor = p.stock > 0 ? 'var(--green)' : 'var(--red)';

            html += '<div class="scan-match-item" onclick="selectMatch(' + p.id + ')">';
            html += '<span class="match-icon">' + (p.image || '📦') + '</span>';
            html += '<div class="match-info">';
            html += '<div class="match-name">' + p.name + '</div>';
            html += '<div class="match-price">KSh ' + p.price.toLocaleString() + '</div>';
            html += '<div class="match-stock" style="color:' + stockColor + ';">' + stockStatus + ' (' + p.stock + ' units)</div>';
            html += '</div>';
            html += '</div>';
        }
        matchesDiv.innerHTML = html;
        resultDiv.style.display = 'block';

        var banner = document.getElementById('scanResultsBanner');
        banner.style.display = 'flex';
        banner.style.justifyContent = 'space-between';
        banner.style.alignItems = 'center';

        showToast('🔍 Found ' + matches.length + ' matching products!', 'success');

        if (isCameraRunning) {
            stopCamera();
        }
    }

    // ============================================
    // SELECT MATCH FROM SCAN
    // ============================================
    function selectMatch(productId) {
        var products = getProducts();
        var product = null;
        for (var i = 0; i < products.length; i++) {
            if (products[i].id === productId) {
                product = products[i];
                break;
            }
        }
        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }

        var existing = null;
        for (var j = 0; j < cart.length; j++) {
            if (cart[j].id === product.id) {
                existing = cart[j];
                break;
            }
        }
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            });
        }

        updateCartCount();
        closeModal('scanModal');
        showToast('➕ Added ' + product.name + ' to cart from scan!', 'success');

        clearScanResults();
    }
    window.selectMatch = selectMatch;

    // ============================================
    // CLEAR SCAN RESULTS
    // ============================================
    function clearScanResults() {
        document.getElementById('scanResult').style.display = 'none';
        document.getElementById('scanMatches').innerHTML = '';
        document.getElementById('scanMatchCount').textContent = '0';
        document.getElementById('scanResultsBanner').style.display = 'none';
        document.getElementById('searchProducts').value = '';
        renderProducts();
    }
    window.clearScanResults = clearScanResults;

    // Close scan modal and stop camera
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('scanModal').classList.contains('active')) {
            if (isCameraRunning) {
                stopCamera();
            }
            closeModal('scanModal');
        }
    });

    // ============================================
    // RENDER PRODUCTS
    // ============================================
    function renderProducts() {
        var products = getProducts();
        var search = document.getElementById('searchProducts').value.toLowerCase();
        var category = document.getElementById('categoryFilter').value;
        var stockFilter = document.getElementById('stockFilter').value;
        var grid = document.getElementById('productsGrid');

        var filtered = products;
        if (search) {
            filtered = filtered.filter(function(p) {
                return p.name.toLowerCase().indexOf(search) !== -1;
            });
        }
        if (category !== 'all') {
            filtered = filtered.filter(function(p) { return p.category === category; });
        }
        if (stockFilter === 'instock') {
            filtered = filtered.filter(function(p) { return p.stock > 0; });
        } else if (stockFilter === 'low') {
            filtered = filtered.filter(function(p) { return p.stock > 0 && p.stock < 5; });
        } else if (stockFilter === 'out') {
            filtered = filtered.filter(function(p) { return p.stock === 0; });
        }

        document.getElementById('productBadge').textContent = products.length;

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-products"><p style="text-align:center;padding:40px;color:var(--text-soft);">No products found</p></div>';
            return;
        }

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var p = filtered[i];
            var stockStatus = 'in-stock';
            var stockLabel = 'In Stock';
            if (p.stock === 0) {
                stockStatus = 'out-of-stock';
                stockLabel = 'Out of Stock';
            } else if (p.stock < 5) {
                stockStatus = 'low-stock';
                stockLabel = '⚠️ Low Stock';
            }

            html += '<div class="product-card" data-id="' + p.id + '">';
            html += '<div class="product-image" style="background:' + (p.color || '#f0f0f0') + ';">' + (p.image || '📦') + '</div>';
            html += '<div class="product-body">';
            html += '<div class="product-name">' + p.name + '</div>';
            html += '<div class="product-price">KSh ' + p.price.toLocaleString() + '</div>';
            html += '<div class="product-stock">' + p.stock + ' units left</div>';
            html += '<span class="stock-badge ' + stockStatus + '">' + stockLabel + '</span>';
            html += '<div class="product-actions">';
            html += '<div class="qty-selector">';
            html += '<button onclick="updateQty(' + i + ',-1)">−</button>';
            html += '<span id="qty_' + i + '">1</span>';
            html += '<button onclick="updateQty(' + i + ',1)">+</button>';
            html += '</div>';
            html += '<button class="btn btn-primary btn-add-cart" onclick="addToCart(' + i + ')">➕ Add</button>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    }

    // ============================================
    // UPDATE QUANTITY
    // ============================================
    function updateQty(index, change) {
        var products = getProducts();
        var p = products[index];
        if (!p) return;
        var el = document.getElementById('qty_' + index);
        if (!el) return;
        var current = parseInt(el.textContent) || 1;
        var newQty = current + change;
        if (newQty < 1) newQty = 1;
        if (newQty > p.stock && p.stock > 0) {
            showToast('Not enough stock available.', 'error');
            return;
        }
        el.textContent = newQty;
    }
    window.updateQty = updateQty;

    // ============================================
    // ADD TO CART
    // ============================================
    function addToCart(index) {
        var products = getProducts();
        var p = products[index];
        if (!p) {
            showToast('Product not found.', 'error');
            return;
        }
        if (p.stock <= 0) {
            showToast('Product is out of stock!', 'error');
            return;
        }
        var qtyEl = document.getElementById('qty_' + index);
        var qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;
        if (qty > p.stock) {
            showToast('Not enough stock available.', 'error');
            return;
        }

        var existing = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === p.id) {
                existing = cart[i];
                break;
            }
        }
        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: qty,
                maxStock: p.stock
            });
        }

        updateCartCount();
        showToast('➕ Added ' + qty + ' x ' + p.name + ' to cart', 'success');
    }
    window.addToCart = addToCart;

    // ============================================
    // UPDATE CART COUNT
    // ============================================
    function updateCartCount() {
        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].quantity;
        }
        cartCount = total;
        document.getElementById('cartCount').textContent = total;
    }

    // ============================================
    // VIEW CART
    // ============================================
    function viewCart() {
        var list = document.getElementById('cartItemsList');
        var total = 0;

        if (cart.length === 0) {
            list.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
            document.getElementById('cartTotalPrice').textContent = '0';
            openModal('cartModal');
            return;
        }

        var html = '';
        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            var itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += '<div class="cart-item-modal">';
            html += '<div><div class="item-name">' + item.name + '</div>';
            html += '<div class="item-details">KSh ' + item.price.toLocaleString() + ' × ' + item.quantity + '</div></div>';
            html += '<div><strong>KSh ' + itemTotal.toLocaleString() + '</strong></div>';
            html += '</div>';
        }
        list.innerHTML = html;
        document.getElementById('cartTotalPrice').textContent = total.toLocaleString();
        openModal('cartModal');
    }
    window.viewCart = viewCart;

    // ============================================
    // CLEAR CART
    // ============================================
    function clearCart() {
        if (cart.length === 0) return;
        if (confirm('Clear all items from cart?')) {
            cart = [];
            updateCartCount();
            viewCart();
            showToast('Cart cleared.', 'info');
        }
    }
    window.clearCart = clearCart;

    // ============================================
    // PROCEED TO ORDER
    // ============================================
    function proceedToOrder() {
        if (cart.length === 0) {
            showToast('Cart is empty. Add products first.', 'error');
            return;
        }
        localStorage.setItem('shopflow_cart', JSON.stringify(cart));
        window.location.href = 'orders.html';
    }
    window.proceedToOrder = proceedToOrder;

    // ============================================
    // CLOSE MODAL ON OVERLAY CLICK
    // ============================================
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ============================================
    // SEARCH & FILTER EVENTS
    // ============================================
    document.getElementById('searchProducts').addEventListener('input', renderProducts);
    document.getElementById('categoryFilter').addEventListener('change', renderProducts);
    document.getElementById('stockFilter').addEventListener('change', renderProducts);

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
    populateCategoryFilter();
    renderProducts();
    updateCartCount();

    console.log('🚀 Marketplace loaded successfully!');
    console.log('📦 ' + getProducts().length + ' products available');
    console.log('📸 Scan feature: Click "Scan Product Image" to search by photo');
});