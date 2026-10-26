// ============================================
// SHOPFLOW - DASHBOARD JAVASCRIPT (FULL INTEGRATION)
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
    // LOAD SHOP DATA
    // ============================================
    function loadShopData() {
        const shopData = JSON.parse(localStorage.getItem('shopflow_shop') || '{}');
        const shopName = shopData.shopName || 'My Shop';
        const ownerName = shopData.ownerName || 'Shop Owner';

        document.getElementById('shopNameDisplay').textContent = shopName;
        document.getElementById('shopOwnerDisplay').textContent = ownerName;
        document.querySelector('.page-title').textContent = '📊 ' + shopName;

        const avatar = document.getElementById('shopAvatar');
        if (shopData.logo) {
            avatar.innerHTML = `<img src="${shopData.logo}" alt="Shop logo" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
        } else {
            avatar.textContent = shopName.charAt(0).toUpperCase();
        }
    }

    // ============================================
    // GET CURRENT PLAN
    // ============================================
    function getCurrentPlan() {
        return localStorage.getItem('shopflow_plan') || 'starter';
    }

    function getPlanDetails() {
        const plans = {
            starter: { name: 'Starter', staff: 3, price: 2500, icon: '🌱' },
            business: { name: 'Business', staff: 5, price: 3500, icon: '⭐' },
            premium: { name: 'Premium', staff: 10, price: 5500, icon: '💎' },
            enterprise: { name: 'Enterprise', staff: 'Unlimited', price: 7500, icon: '🏢' }
        };
        return plans[getCurrentPlan()] || plans.starter;
    }

    // ============================================
    // UPDATE TRIAL
    // ============================================
    function updateTrial() {
        const endDate = localStorage.getItem('shopflow_trial_end');
        const trialDaysEl = document.getElementById('trialDays');
        
        if (endDate) {
            const end = new Date(endDate);
            const now = new Date();
            const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            const daysLeft = days > 0 ? days : 0;
            
            trialDaysEl.textContent = daysLeft + ' days left';
            
            if (daysLeft <= 0) {
                document.querySelector('.trial-banner-sidebar').style.background = 'var(--red)';
                document.querySelector('.trial-banner-sidebar .trial-days').textContent = 'Trial Ended';
            }
        } else {
            const end = new Date();
            end.setDate(end.getDate() + 14);
            localStorage.setItem('shopflow_trial_end', end.toISOString());
            trialDaysEl.textContent = '14 days left';
        }
    }

    // ============================================
    // THEME
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
    // SIDEBAR COLLAPSE - FIXED
    // ============================================
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const expandBtn = document.getElementById('expandBtn');
    const mainContent = document.querySelector('.main-content');

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
            // Show expand button only when sidebar is collapsed AND on desktop
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

    // Collapse button (◀/▶)
    collapseBtn?.addEventListener('click', function() {
        toggleSidebarCollapse();
    });

    // Desktop sidebar toggle (hamburger in topbar)
    sidebarToggle?.addEventListener('click', function() {
        toggleSidebarCollapse();
    });

    // Floating expand button (☰ when collapsed) - FIXED
    expandBtn?.addEventListener('click', function() {
        toggleSidebarCollapse(true); // true = expand
    });

    // ============================================
    // MOBILE SIDEBAR
    // ============================================
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');

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

    // ============================================
    // HANDLE RESIZE
    // ============================================
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

    // ============================================
    // KEYBOARD SHORTCUT: Ctrl+B
    // ============================================
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleSidebarCollapse();
        }
    });

    // ============================================
    // LOAD OVERVIEW DATA (UPDATED)
    // ============================================
    function loadOverview() {
        // Get all data
        const products = JSON.parse(localStorage.getItem('shopflow_products') || '[]');
        const staff = JSON.parse(localStorage.getItem('shopflow_staff') || '[]');
        const sales = JSON.parse(localStorage.getItem('shopflow_sales') || '[]');
        const announcements = JSON.parse(localStorage.getItem('shopflow_announcements') || '[]');
        const flashSales = JSON.parse(localStorage.getItem('shopflow_flashsales') || '[]');
        const plan = getPlanDetails();

        // TODAY'S SALES
        const today = new Date().toDateString();
        const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
        const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
        document.getElementById('todaySales').textContent = 'KSh ' + todayTotal.toLocaleString();

        // TOTAL PRODUCTS
        document.getElementById('totalProducts').textContent = products.length;

        // STAFF
        const activeStaff = staff.filter(s => s.status !== 'blocked').length;
        const staffLimit = typeof plan.staff === 'number' ? plan.staff : '∞';
        document.getElementById('totalStaff').textContent = activeStaff;
        document.getElementById('staffLimit').textContent = 'Limit: ' + staffLimit;

        // PROFIT/LOSS
        const profit = todayTotal * 0.35;
        document.getElementById('profitLoss').textContent = '+KSh ' + profit.toFixed(0);

        // UPDATE SIDEBAR WITH PLAN INFO
        updateSidebarPlan(plan);

        // UPDATE RECENT ACTIVITY
        updateRecentActivity(sales, staff, products, announcements, flashSales);

        // UPDATE NOTIFICATION BADGE
        updateNotificationBadge(announcements, flashSales, products);
    }

    // ============================================
    // UPDATE SIDEBAR PLAN INFO
    // ============================================
    function updateSidebarPlan(plan) {
        const trialBanner = document.querySelector('.trial-banner-sidebar');
        
        // Remove existing plan indicator
        const existingPlan = document.querySelector('.plan-indicator');
        if (existingPlan) {
            existingPlan.remove();
        }
        
        // Create new plan indicator
        const planIndicator = document.createElement('div');
        planIndicator.className = 'plan-indicator';
        
        const endDate = localStorage.getItem('shopflow_trial_end');
        const isTrialActive = endDate ? new Date(endDate) > new Date() : true;
        
        planIndicator.innerHTML = `
            <div class="plan-badge">
                <span class="plan-name">${plan.icon} ${plan.name}</span>
                <span class="plan-status ${isTrialActive ? 'trial' : 'active'}">${isTrialActive ? '⏳ Trial' : '✅ Active'}</span>
            </div>
        `;
        
        // Insert after trial banner
        if (trialBanner) {
            trialBanner.parentNode.insertBefore(planIndicator, trialBanner.nextSibling);
        }
    }

    // ============================================
    // UPDATE RECENT ACTIVITY
    // ============================================
    function updateRecentActivity(sales, staff, products, announcements, flashSales) {
        const activityList = document.getElementById('activityList');
        const activities = [];

        // Recent sales (last 5)
        sales.slice(-5).reverse().forEach(s => {
            activities.push({
                icon: '💰',
                text: `Sale: ${s.items?.[0]?.name || 'Product'} - KSh ${s.totalAmount.toLocaleString()}`,
                time: timeAgo(new Date(s.date))
            });
        });

        // New staff
        staff.slice(-3).reverse().forEach(s => {
            activities.push({
                icon: '👥',
                text: `New staff: ${s.name} joined`,
                time: timeAgo(new Date(s.createdAt))
            });
        });

        // New products
        products.slice(-3).reverse().forEach(p => {
            activities.push({
                icon: '📦',
                text: `New product: ${p.name} added`,
                time: timeAgo(new Date(p.date))
            });
        });

        // Announcements
        announcements.slice(-2).reverse().forEach(a => {
            activities.push({
                icon: '📢',
                text: `Announcement: ${a.title}`,
                time: timeAgo(new Date(a.createdAt))
            });
        });

        // Flash sales
        flashSales.filter(fs => fs.status === 'active').slice(-2).forEach(fs => {
            activities.push({
                icon: '⚡',
                text: `Flash sale: ${fs.productName} at ${fs.discount}% off`,
                time: timeAgo(new Date(fs.createdAt))
            });
        });

        // Sort by time (newest first)
        activities.sort((a, b) => {
            const timeA = parseInt(a.time);
            const timeB = parseInt(b.time);
            return timeB - timeA;
        });

        // Take top 8
        const topActivities = activities.slice(0, 8);

        if (topActivities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <span class="activity-icon">📋</span>
                    <div>
                        <p class="activity-text">No recent activity</p>
                        <span class="activity-time">Start adding products and making sales!</span>
                    </div>
                </div>
            `;
            return;
        }

        activityList.innerHTML = topActivities.map(a => `
            <div class="activity-item">
                <span class="activity-icon">${a.icon}</span>
                <div>
                    <p class="activity-text">${a.text}</p>
                    <span class="activity-time">${a.time}</span>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // TIME AGO HELPER
    // ============================================
    function timeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return minutes + 'm ago';
        if (hours < 24) return hours + 'h ago';
        if (days < 7) return days + 'd ago';
        return date.toLocaleDateString();
    }

    // ============================================
    // UPDATE NOTIFICATION BADGE
    // ============================================
    function updateNotificationBadge(announcements, flashSales, products) {
        let count = 0;

        // Unread announcements
        const staff = JSON.parse(localStorage.getItem('shopflow_staff') || '[]');
        const totalStaff = staff.filter(s => s.status !== 'blocked').length;
        announcements.forEach(a => {
            const readCount = a.readBy ? a.readBy.length : 0;
            count += totalStaff - readCount;
        });

        // Active flash sales
        const activeFlash = flashSales.filter(fs => fs.status === 'active').length;
        count += activeFlash;

        // Low stock products
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;
        count += lowStock;

        // Out of stock
        const outOfStock = products.filter(p => p.stock === 0).length;
        count += outOfStock;

        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count > 0 ? count : '0';
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

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
    setInterval(loadOverview, 60000);

    // ============================================
    // SET ACTIVE NAV
    // ============================================
    function setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ============================================
    // INIT
    // ============================================
    // Load saved state
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        if (collapseBtn) collapseBtn.textContent = '▶';
    } else if (window.innerWidth > 768) {
        sidebar.classList.remove('collapsed');
        if (collapseBtn) collapseBtn.textContent = '◀';
    }

    loadShopData();
    updateTrial();
    loadOverview();
    setActiveNav();
    updateMainContentMargin();
    updateExpandButton();

    console.log('🚀 ShopFlow Dashboard loaded successfully!');
    console.log('💡 Press Ctrl+B to toggle sidebar');
    console.log('📊 All systems integrated: Products, Staff, Sales, Announcements, Flash Sales, Subscription');
});