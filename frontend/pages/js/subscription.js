// ============================================
// SHOPFLOW - SUBSCRIPTION JAVASCRIPT
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
        const trialDaysRemainingEl = document.getElementById('trialDaysRemaining');
        
        if (endDate) {
            const end = new Date(endDate);
            const now = new Date();
            const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            const daysLeft = days > 0 ? days : 0;
            
            trialDaysEl.textContent = daysLeft + ' days left';
            if (trialDaysRemainingEl) trialDaysRemainingEl.textContent = daysLeft;
            
            if (daysLeft <= 0) {
                document.querySelector('.trial-banner-sidebar').style.background = 'var(--red)';
                document.querySelector('.trial-info').style.color = 'var(--red)';
            }
        } else {
            const end = new Date();
            end.setDate(end.getDate() + 14);
            localStorage.setItem('shopflow_trial_end', end.toISOString());
            trialDaysEl.textContent = '14 days left';
            if (trialDaysRemainingEl) trialDaysRemainingEl.textContent = '14';
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
    // PLAN DATA
    // ============================================
    const PLANS = {
        starter: {
            name: 'Starter',
            icon: '🌱',
            price: 2500,
            staff: 3,
            products: 500,
            features: [
                '3 staff accounts',
                '500 products',
                'Basic sales reports',
                'M-Pesa & Cash tracking',
                'Receipt generation',
                'Announcements',
                'Email support'
            ]
        },
        business: {
            name: 'Business',
            icon: '⭐',
            price: 3500,
            staff: 5,
            products: 2000,
            features: [
                '5 staff accounts',
                '2,000 products',
                'Advanced analytics',
                'M-Pesa & Cash tracking',
                'Receipt generation',
                'Announcements + Push',
                'Flash sales',
                'Profit/Loss reports',
                'Priority support'
            ]
        },
        premium: {
            name: 'Premium',
            icon: '💎',
            price: 5500,
            staff: 10,
            products: 5000,
            features: [
                '10 staff accounts',
                '5,000 products',
                'Advanced analytics',
                'M-Pesa & Cash tracking',
                'Receipt generation',
                'Announcements + Push',
                'Flash sales',
                'Profit/Loss reports',
                'Bulk product import',
                'Staff performance tracking',
                'Priority support',
                'Mobile app access'
            ]
        },
        enterprise: {
            name: 'Enterprise',
            icon: '🏢',
            price: 7500,
            staff: 'Unlimited',
            products: 'Unlimited',
            features: [
                'Unlimited staff accounts',
                'Unlimited products',
                'Advanced analytics',
                'M-Pesa & Cash tracking',
                'Receipt generation',
                'Announcements + Push',
                'Flash sales',
                'Profit/Loss reports',
                'Bulk product import',
                'Staff performance tracking',
                'Mobile app access',
                'Multi-branch support',
                'Dedicated account manager',
                'Custom integrations'
            ]
        }
    };

    // ============================================
    // GET CURRENT PLAN
    // ============================================
    function getCurrentPlan() {
        return localStorage.getItem('shopflow_plan') || 'starter';
    }

    // ============================================
    // UPDATE CURRENT PLAN DISPLAY
    // ============================================
    function updateCurrentPlan() {
        const planKey = getCurrentPlan();
        const plan = PLANS[planKey];
        if (!plan) return;

        document.getElementById('currentPlanIcon').textContent = plan.icon;
        document.getElementById('currentPlanName').textContent = plan.name;
        document.getElementById('currentStaffLimit').textContent = plan.staff;
        document.getElementById('currentProductLimit').textContent = plan.products;
        document.getElementById('planPrice').textContent = 'KSh ' + plan.price.toLocaleString();

        // Highlight current plan in grid
        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.toggle('current', card.dataset.plan === planKey);
            const btn = card.querySelector('.plan-btn');
            if (card.dataset.plan === planKey) {
                btn.textContent = '✅ Current Plan';
                btn.className = 'btn btn-green plan-btn';
                btn.disabled = true;
            } else {
                const planName = PLANS[card.dataset.plan]?.name || 'Plan';
                btn.textContent = 'Choose ' + planName;
                btn.className = 'btn btn-primary plan-btn';
                btn.disabled = false;
            }
        });
    }

    // ============================================
    // SELECT PLAN
    // ============================================
    let selectedPlan = null;
    let selectedPayment = null;

    window.selectPlan = function(planKey) {
        const currentPlan = getCurrentPlan();
        if (planKey === currentPlan) {
            showToast('You are already on this plan.', 'info');
            return;
        }

        const plan = PLANS[planKey];
        if (!plan) {
            showToast('Plan not found.', 'error');
            return;
        }

        selectedPlan = planKey;

        // Show upgrade modal
        const current = PLANS[currentPlan];
        document.getElementById('upgradeCurrentPlan').textContent = current.name + ' (KSh ' + current.price.toLocaleString() + ')';
        document.getElementById('upgradeNewPlan').textContent = plan.name + ' (KSh ' + plan.price.toLocaleString() + ')';
        document.getElementById('upgradePrice').textContent = 'KSh ' + plan.price.toLocaleString() + '/month';

        // Show what changes
        let changes = '';
        if (plan.staff !== current.staff) {
            changes += `👥 Staff: ${current.staff} → ${plan.staff}<br>`;
        }
        if (plan.products !== current.products) {
            changes += `📦 Products: ${current.products} → ${plan.products}<br>`;
        }
        if (!changes) {
            changes = 'No major changes. Same great features!';
        }
        document.getElementById('upgradeChanges').innerHTML = changes;

        openModal('upgradeModal');
    };

    // ============================================
    // SELECT PAYMENT METHOD
    // ============================================
    window.selectPaymentMethod = function(method) {
        selectedPayment = method;
        document.querySelectorAll('.payment-option').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent.includes(method.toUpperCase()) || 
                (method === 'mpesa' && btn.textContent.includes('M-Pesa')) ||
                (method === 'card' && btn.textContent.includes('Card')) ||
                (method === 'bank' && btn.textContent.includes('Bank')));
        });
    };

    // ============================================
    // CONFIRM UPGRADE
    // ============================================
    window.confirmUpgrade = function() {
        if (!selectedPlan) {
            showToast('Please select a plan.', 'error');
            return;
        }

        if (!selectedPayment) {
            showToast('Please select a payment method.', 'error');
            return;
        }

        // Save new plan
        localStorage.setItem('shopflow_plan', selectedPlan);

        // Update staff limit in staff page
        const staffLimit = PLANS[selectedPlan].staff;
        // Update any other settings

        closeModal('upgradeModal');
        updateCurrentPlan();
        showToast('✅ Successfully upgraded to ' + PLANS[selectedPlan].name + ' plan!', 'success');

        // Reset selection
        selectedPlan = null;
        selectedPayment = null;
        document.querySelectorAll('.payment-option').forEach(btn => {
            btn.classList.remove('selected');
        });
    };

    // ============================================
    // FAQ TOGGLE
    // ============================================
    window.toggleFaq = function(element) {
        const item = element.closest('.faq-item');
        item.classList.toggle('active');
        const toggle = element.querySelector('.faq-toggle');
        toggle.textContent = item.classList.contains('active') ? '−' : '+';
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
    updateCurrentPlan();

    console.log('🚀 ShopFlow Subscription loaded successfully!');
    console.log('📊 Plans: Starter (KSh 2,500), Business (KSh 3,500), Premium (KSh 5,500), Enterprise (KSh 7,500)');
});