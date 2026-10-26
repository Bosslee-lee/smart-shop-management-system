// ============================================
// SHOPFLOW - STAFF MANAGEMENT JAVASCRIPT
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
        const trialDaysLeftEl = document.getElementById('trialDaysLeft');
        
        if (endDate) {
            const end = new Date(endDate);
            const now = new Date();
            const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            const daysLeft = days > 0 ? days : 0;
            
            trialDaysEl.textContent = daysLeft + ' days left';
            if (trialDaysLeftEl) trialDaysLeftEl.textContent = daysLeft;
            
            if (daysLeft <= 0) {
                document.querySelector('.trial-banner-sidebar').style.background = 'var(--red)';
            }
        } else {
            const end = new Date();
            end.setDate(end.getDate() + 14);
            localStorage.setItem('shopflow_trial_end', end.toISOString());
            trialDaysEl.textContent = '14 days left';
            if (trialDaysLeftEl) trialDaysLeftEl.textContent = '14';
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
    // GET STAFF DATA
    // ============================================
    function getStaff() {
        return JSON.parse(localStorage.getItem('shopflow_staff') || '[]');
    }

    function saveStaff(staff) {
        localStorage.setItem('shopflow_staff', JSON.stringify(staff));
    }

    function getSales() {
        return JSON.parse(localStorage.getItem('shopflow_sales') || '[]');
    }

    // ============================================
    // GENERATE DEVICE FINGERPRINT
    // ============================================
    function generateDeviceId() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            screen.colorDepth,
            navigator.hardwareConcurrency || 0,
            navigator.deviceMemory || 0,
            new Date().getTimezoneOffset(),
            // Canvas fingerprint (simple version)
            getCanvasFingerprint()
        ];
        
        const fingerprint = components.join('|||');
        return btoa(fingerprint).substring(0, 50);
    }

    function getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('ShopFlow', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Secure', 4, 17);
            return canvas.toDataURL();
        } catch (e) {
            return 'canvas-error';
        }
    }

    // ============================================
    // GET STAFF LIMIT
    // ============================================
    function getStaffLimit() {
        const plan = localStorage.getItem('shopflow_plan') || 'starter';
        const trialEnd = localStorage.getItem('shopflow_trial_end');
        const now = new Date();
        const isTrialActive = trialEnd ? new Date(trialEnd) > now : true;
        
        if (isTrialActive) {
            return 1;
        }
        
        const limits = {
            'starter': 2,
            'pro': 5,
            'enterprise': 999
        };
        
        return limits[plan] || 2;
    }

    function isTrialActive() {
        const trialEnd = localStorage.getItem('shopflow_trial_end');
        if (!trialEnd) return true;
        return new Date(trialEnd) > new Date();
    }

    // ============================================
    // RENDER STAFF
    // ============================================
    function renderStaff() {
        const staff = getStaff();
        const filter = document.getElementById('staffFilter')?.value || 'all';
        const search = document.getElementById('staffSearch')?.value?.toLowerCase() || '';
        const grid = document.getElementById('staffGrid');

        let filtered = staff;
        if (filter === 'active') {
            filtered = filtered.filter(s => s.status !== 'blocked');
        } else if (filter === 'blocked') {
            filtered = filtered.filter(s => s.status === 'blocked');
        }

        if (search) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(search) || 
                s.phone?.includes(search)
            );
        }

        updateStaffStats(staff);

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-staff">
                    <span class="icon">👥</span>
                    <h3>${staff.length === 0 ? 'No staff members yet' : 'No matching staff found'}</h3>
                    <p style="color:var(--text-soft);font-size:14px;">
                        ${staff.length === 0 ? 'Click "Add Staff Member" to get started.' : 'Try adjusting your search or filter.'}
                    </p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map((s, index) => {
            const actualIndex = staff.indexOf(s);
            const isBlocked = s.status === 'blocked';
            const avatarInitial = s.name.charAt(0).toUpperCase();
            const hasDevice = s.deviceId && s.deviceId !== '';
            const deviceStatus = hasDevice ? '✅ Device Registered' : '⚠️ No Device';

            return `
                <div class="staff-card">
                    <div class="staff-avatar ${isBlocked ? 'blocked' : ''}">${avatarInitial}</div>
                    <div class="staff-info">
                        <div class="name">${s.name}</div>
                        <div class="phone">📱 ${s.phone}</div>
                        <div class="device-status ${hasDevice ? 'registered' : 'unregistered'}">
                            ${deviceStatus}
                        </div>
                        <span class="staff-status ${isBlocked ? 'blocked' : 'active'}">
                            ${isBlocked ? '🔒 Blocked' : '✅ Active'}
                        </span>
                    </div>
                    <div class="staff-actions">
                        <button class="btn btn-ghost btn-sm" onclick="viewStaffDetails(${actualIndex})">👁️</button>
                        <button class="btn btn-primary btn-sm" onclick="editStaff(${actualIndex})">✏️</button>
                        ${hasDevice ? `<button class="btn btn-amber btn-sm" onclick="openResetDevice(${actualIndex})">🔄</button>` : ''}
                        ${!isBlocked ? 
                            `<button class="btn btn-danger btn-sm" onclick="blockStaff(${actualIndex})">🔒</button>` :
                            `<button class="btn btn-green btn-sm" onclick="unblockStaff(${actualIndex})">🔓</button>`
                        }
                        <button class="btn btn-danger btn-sm" onclick="deleteStaff(${actualIndex})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        updateLimitBanner(staff);
    }

    // ============================================
    // UPDATE STAFF STATS
    // ============================================
    function updateStaffStats(staff) {
        const total = staff.length;
        const active = staff.filter(s => s.status !== 'blocked').length;
        const blocked = staff.filter(s => s.status === 'blocked').length;
        const devices = staff.filter(s => s.deviceId && s.deviceId !== '').length;

        const sales = getSales();
        const staffSales = {};
        sales.forEach(sale => {
            if (sale.staff) {
                staffSales[sale.staff] = (staffSales[sale.staff] || 0) + sale.totalAmount;
            }
        });
        const totalStaffSales = Object.values(staffSales).reduce((sum, val) => sum + val, 0);

        document.getElementById('totalStaff').textContent = total;
        document.getElementById('activeStaff').textContent = active;
        document.getElementById('blockedStaff').textContent = blocked;
        document.getElementById('staffSalesCount').textContent = 'KSh ' + totalStaffSales.toLocaleString();
        document.getElementById('deviceCount').textContent = devices;
    }

    // ============================================
    // UPDATE LIMIT BANNER
    // ============================================
    function updateLimitBanner(staff) {
        const limit = getStaffLimit();
        const activeStaff = staff.filter(s => s.status !== 'blocked').length;
        const isTrial = isTrialActive();

        document.getElementById('currentStaffCount').textContent = activeStaff;
        document.getElementById('maxStaffLimit').textContent = limit;

        const notice = document.getElementById('staffLimitNotice');
        const addBtn = document.getElementById('addStaffBtn');

        if (activeStaff >= limit) {
            notice.textContent = '⚠️ Staff limit reached! Upgrade your plan to add more.';
            notice.className = 'staff-limit-notice danger';
            if (addBtn) addBtn.disabled = true;
        } else if (isTrial && activeStaff >= 1) {
            notice.textContent = `⚠️ Trial limit: 1 staff member. Upgrade to add more.`;
            notice.className = 'staff-limit-notice warning';
            if (addBtn) addBtn.disabled = true;
        } else {
            notice.textContent = isTrial ? `📌 Trial: 1 staff allowed` : `📌 ${limit - activeStaff} slots available`;
            notice.className = 'staff-limit-notice';
            if (addBtn) addBtn.disabled = false;
        }
    }

    // ============================================
    // ADD STAFF
    // ============================================
    document.getElementById('addStaffForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const staff = getStaff();
        const activeStaff = staff.filter(s => s.status !== 'blocked').length;
        const limit = getStaffLimit();

        if (isTrialActive() && activeStaff >= 1) {
            showToast('⚠️ During trial, you can only have 1 staff member. Upgrade to add more.', 'error');
            return;
        }

        if (activeStaff >= limit) {
            showToast('⚠️ Staff limit reached! Upgrade your plan to add more.', 'error');
            return;
        }

        const name = document.getElementById('staffName').value.trim();
        const phone = document.getElementById('staffPhone').value.trim();
        const pin = document.getElementById('staffPin').value;

        if (!name || !phone || !pin) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            showToast('PIN must be exactly 6 digits.', 'error');
            return;
        }

        // Check duplicate phone
        if (staff.some(s => s.phone === phone)) {
            showToast('A staff member with this phone number already exists.', 'error');
            return;
        }

        const newStaff = {
            id: 'STF-' + Date.now().toString().slice(-6),
            name: name,
            phone: phone,
            pin: pin, // In production, this should be hashed
            deviceId: '', // Will be set on first login
            status: 'active',
            role: 'staff',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            otp: null,
            otpExpiry: null,
            isVerified: false
        };

        // Generate OTP for first login
        newStaff.otp = String(Math.floor(100000 + Math.random() * 900000));
        newStaff.otpExpiry = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

        staff.push(newStaff);
        saveStaff(staff);

        closeModal('addStaffModal');
        this.reset();
        renderStaff();
        
        // Show OTP (in production, this would be sent via SMS)
        showToast(`📱 Staff added! OTP: ${newStaff.otp} (sent to ${phone})`, 'success');
    });

    // ============================================
    // VIEW STAFF DETAILS
    // ============================================
    window.viewStaffDetails = function(index) {
        const staff = getStaff();
        const s = staff[index];
        if (!s) {
            showToast('Staff member not found.', 'error');
            return;
        }

        const content = document.getElementById('staffDetailsContent');
        const isBlocked = s.status === 'blocked';
        const hasDevice = s.deviceId && s.deviceId !== '';

        const sales = getSales();
        const staffSales = sales.filter(sale => sale.staff === s.name);
        const totalSales = staffSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const orderCount = staffSales.length;

        content.innerHTML = `
            <div style="text-align:center;margin-bottom:16px;">
                <div style="width:64px;height:64px;border-radius:50%;background:${isBlocked ? 'var(--red)' : 'var(--blue)'};color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto;">
                    ${s.name.charAt(0).toUpperCase()}
                </div>
                <h3 style="margin-top:8px;">${s.name}</h3>
                <span class="staff-status ${isBlocked ? 'blocked' : 'active'}">${isBlocked ? '🔒 Blocked' : '✅ Active'}</span>
            </div>
            <div class="detail-row">
                <span class="label">Phone</span>
                <span class="value">${s.phone}</span>
            </div>
            <div class="detail-row">
                <span class="label">Staff ID</span>
                <span class="value">${s.id}</span>
            </div>
            <div class="detail-row">
                <span class="label">Role</span>
                <span class="value">${s.role || 'Staff'}</span>
            </div>
            <div class="detail-row">
                <span class="label">Device Status</span>
                <span class="value ${hasDevice ? 'device-registered' : 'device-unregistered'}">
                    ${hasDevice ? '✅ Registered' : '⚠️ Not Registered'}
                </span>
            </div>
            ${hasDevice ? `
            <div class="detail-row">
                <span class="label">Device ID</span>
                <span class="value" style="font-size:12px;font-family:monospace;word-break:break-all;">${s.deviceId}</span>
            </div>` : ''}
            <div class="detail-row">
                <span class="label">Total Sales</span>
                <span class="value">KSh ${totalSales.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Orders Processed</span>
                <span class="value">${orderCount}</span>
            </div>
            <div class="detail-row">
                <span class="label">Joined</span>
                <span class="value">${new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
            ${s.lastLogin ? `
            <div class="detail-row">
                <span class="label">Last Login</span>
                <span class="value">${new Date(s.lastLogin).toLocaleString()}</span>
            </div>` : ''}
            ${s.isVerified ? `
            <div class="detail-row">
                <span class="label">Verified</span>
                <span class="value" style="color:var(--green);">✅ Yes</span>
            </div>` : `
            <div class="detail-row">
                <span class="label">Verified</span>
                <span class="value" style="color:var(--amber);">⚠️ Pending OTP</span>
            </div>`}
        `;

        openModal('staffDetailsModal');
    };

    // ============================================
    // EDIT STAFF
    // ============================================
    window.editStaff = function(index) {
        const staff = getStaff();
        const s = staff[index];
        if (!s) {
            showToast('Staff member not found.', 'error');
            return;
        }

        document.getElementById('editStaffIndex').value = index;
        document.getElementById('editStaffName').value = s.name;
        document.getElementById('editStaffPhone').value = s.phone;
        document.getElementById('editStaffDeviceId').value = s.deviceId || 'Not registered yet';
        document.getElementById('editStaffPin').value = '';

        openModal('editStaffModal');
    };

    document.getElementById('editStaffForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const staff = getStaff();
        const index = parseInt(document.getElementById('editStaffIndex').value);

        if (index < 0 || index >= staff.length) {
            showToast('Staff member not found.', 'error');
            return;
        }

        const name = document.getElementById('editStaffName').value.trim();
        const phone = document.getElementById('editStaffPhone').value.trim();
        const newPin = document.getElementById('editStaffPin').value;

        if (!name || !phone) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (staff.some((s, i) => s.phone === phone && i !== index)) {
            showToast('A staff member with this phone already exists.', 'error');
            return;
        }

        staff[index].name = name;
        staff[index].phone = phone;

        if (newPin && newPin.length === 6 && /^\d{6}$/.test(newPin)) {
            staff[index].pin = newPin;
        }

        saveStaff(staff);
        closeModal('editStaffModal');
        renderStaff();
        showToast('✅ Staff updated successfully!');
    });

    // ============================================
    // BLOCK STAFF
    // ============================================
    window.blockStaff = function(index) {
        const staff = getStaff();
        if (index < 0 || index >= staff.length) {
            showToast('Staff member not found.', 'error');
            return;
        }

        if (confirm('Block this staff member? They will not be able to login.')) {
            staff[index].status = 'blocked';
            saveStaff(staff);
            renderStaff();
            showToast('🔒 Staff member blocked.');
        }
    };

    // ============================================
    // UNBLOCK STAFF
    // ============================================
    window.unblockStaff = function(index) {
        const staff = getStaff();
        if (index < 0 || index >= staff.length) {
            showToast('Staff member not found.', 'error');
            return;
        }

        staff[index].status = 'active';
        saveStaff(staff);
        renderStaff();
        showToast('🔓 Staff member unblocked.');
    };

    // ============================================
    // DELETE STAFF
    // ============================================
    window.deleteStaff = function(index) {
        const staff = getStaff();
        if (index < 0 || index >= staff.length) {
            showToast('Staff member not found.', 'error');
            return;
        }

        if (confirm('Remove this staff member permanently? This cannot be undone.')) {
            const deleted = staff[index].name;
            staff.splice(index, 1);
            saveStaff(staff);
            renderStaff();
            showToast('🗑️ "' + deleted + '" removed.');
        }
    };

    // ============================================
    // RESET DEVICE
    // ============================================
    let resetStaffIndex = null;

    window.openResetDevice = function(index) {
        const staff = getStaff();
        const s = staff[index];
        if (!s) {
            showToast('Staff member not found.', 'error');
            return;
        }

        resetStaffIndex = index;
        document.getElementById('resetStaffName').textContent = s.name;
        document.getElementById('resetCurrentDevice').textContent = s.deviceId ? s.deviceId.substring(0, 20) + '...' : 'No device';
        openModal('resetDeviceModal');
    };

    document.getElementById('confirmResetDevice')?.addEventListener('click', function() {
        if (resetStaffIndex === null) {
            showToast('No staff selected.', 'error');
            return;
        }

        const staff = getStaff();
        if (resetStaffIndex < 0 || resetStaffIndex >= staff.length) {
            showToast('Staff member not found.', 'error');
            return;
        }

        staff[resetStaffIndex].deviceId = '';
        staff[resetStaffIndex].isVerified = false;
        // Generate new OTP
        staff[resetStaffIndex].otp = String(Math.floor(100000 + Math.random() * 900000));
        staff[resetStaffIndex].otpExpiry = new Date(Date.now() + 10 * 60000).toISOString();

        saveStaff(staff);
        closeModal('resetDeviceModal');
        renderStaff();
        showToast(`🔄 Device reset. New OTP: ${staff[resetStaffIndex].otp}`, 'success');
        resetStaffIndex = null;
    });

    // ============================================
    // SEARCH & FILTER
    // ============================================
    document.getElementById('staffFilter')?.addEventListener('change', renderStaff);
    document.getElementById('staffSearch')?.addEventListener('input', renderStaff);

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
    renderStaff();

    console.log('🚀 ShopFlow Staff Management loaded successfully!');
    console.log('🔐 Security Features:');
    console.log('  - 6-digit PIN');
    console.log('  - Device binding (one phone per staff)');
    console.log('  - OTP verification on first login');
    console.log('  - Single session per staff');
});