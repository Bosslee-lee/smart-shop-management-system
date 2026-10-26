// ============================================
// SHOPFLOW - ANNOUNCEMENTS JAVASCRIPT
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
    function getAnnouncements() {
        return JSON.parse(localStorage.getItem('shopflow_announcements') || '[]');
    }

    function saveAnnouncements(announcements) {
        localStorage.setItem('shopflow_announcements', JSON.stringify(announcements));
    }

    function getStaff() {
        return JSON.parse(localStorage.getItem('shopflow_staff') || '[]');
    }

    // ============================================
    // POPULATE STAFF DROPDOWN
    // ============================================
    function populateStaffDropdown() {
        const staff = getStaff();
        const select = document.getElementById('announcementStaff');
        const activeStaff = staff.filter(s => s.status !== 'blocked');
        
        select.innerHTML = activeStaff.map(s => 
            `<option value="${s.id}">${s.name} (${s.phone})</option>`
        ).join('');
    }

    // ============================================
    // TARGET AUDIENCE TOGGLE
    // ============================================
    document.getElementById('announcementTarget')?.addEventListener('change', function() {
        const specificGroup = document.getElementById('specificStaffGroup');
        if (this.value === 'specific') {
            specificGroup.style.display = 'block';
        } else {
            specificGroup.style.display = 'none';
        }
    });

    // ============================================
    // RENDER ANNOUNCEMENTS
    // ============================================
    function renderAnnouncements() {
        const announcements = getAnnouncements();
        const filter = document.getElementById('announcementFilter')?.value || 'all';
        const search = document.getElementById('announcementSearch')?.value?.toLowerCase() || '';
        const container = document.getElementById('announcementsList');

        let filtered = announcements;

        if (filter !== 'all') {
            filtered = filtered.filter(a => a.priority === filter);
        }

        if (search) {
            filtered = filtered.filter(a => 
                a.title.toLowerCase().includes(search) || 
                a.message.toLowerCase().includes(search)
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Update stats
        updateStats(announcements);

        // Render
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-announcements">
                    <span class="icon">📢</span>
                    <h3>${announcements.length === 0 ? 'No announcements yet' : 'No matching announcements'}</h3>
                    <p>${announcements.length === 0 ? 'Click "New Announcement" to communicate with your staff.' : 'Try adjusting your search or filter.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map((announcement, index) => {
            const actualIndex = announcements.indexOf(announcement);
            const priorityLabel = announcement.priority || 'normal';
            const priorityIcons = {
                normal: '📌',
                important: '⭐',
                urgent: '🚨'
            };
            
            const staff = getStaff();
            const totalStaff = staff.filter(s => s.status !== 'blocked').length;
            const readCount = announcement.readBy ? announcement.readBy.length : 0;
            const ackCount = announcement.acknowledgedBy ? announcement.acknowledgedBy.length : 0;
            const unreadCount = totalStaff - readCount;

            const isUrgent = priorityLabel === 'urgent';

            return `
                <div class="announcement-card ${isUrgent ? 'urgent' : ''}" onclick="viewAnnouncement(${actualIndex})">
                    ${unreadCount > 0 ? '<div class="unread-indicator"></div>' : ''}
                    <div class="announcement-header">
                        <div class="announcement-title">${priorityIcons[priorityLabel] || '📌'} ${announcement.title}</div>
                        <div class="announcement-meta">
                            <span class="priority-badge ${priorityLabel}">${priorityLabel}</span>
                            <span class="date-badge">${new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="announcement-preview">${announcement.message.substring(0, 120)}${announcement.message.length > 120 ? '...' : ''}</div>
                    <div class="announcement-footer">
                        <div class="staff-status">
                            <span class="${readCount > 0 ? 'read' : ''}">👁️ ${readCount} read</span>
                            <span class="${unreadCount > 0 ? 'unread' : ''}">📨 ${unreadCount} unread</span>
                            ${announcement.requireAck ? `<span>✅ ${ackCount} acknowledged</span>` : ''}
                            <span>💬 ${announcement.responses ? announcement.responses.length : 0} responses</span>
                        </div>
                        <div class="actions">
                            ${!announcement.archived ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();archiveAnnouncement(${actualIndex})">📁 Archive</button>` : ''}
                            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteAnnouncement(${actualIndex})">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update badge
        const unreadTotal = announcements.reduce((sum, a) => {
            const staff = getStaff();
            const totalStaff = staff.filter(s => s.status !== 'blocked').length;
            const readCount = a.readBy ? a.readBy.length : 0;
            return sum + (totalStaff - readCount);
        }, 0);
        document.getElementById('alertBadge').textContent = unreadTotal;
    }

    // ============================================
    // UPDATE STATS
    // ============================================
    function updateStats(announcements) {
        const total = announcements.length;
        const staff = getStaff();
        const totalStaff = staff.filter(s => s.status !== 'blocked').length;
        
        let unreadCount = 0;
        let readCount = 0;
        let responseCount = 0;

        announcements.forEach(a => {
            const readBy = a.readBy ? a.readBy.length : 0;
            unreadCount += totalStaff - readBy;
            readCount += readBy;
            responseCount += a.responses ? a.responses.length : 0;
        });

        document.getElementById('totalAnnouncements').textContent = total;
        document.getElementById('unreadCount').textContent = unreadCount;
        document.getElementById('readCount').textContent = readCount;
        document.getElementById('responseCount').textContent = responseCount;
    }

    // ============================================
    // ADD ANNOUNCEMENT
    // ============================================
    document.getElementById('addAnnouncementForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('announcementTitle').value.trim();
        const message = document.getElementById('announcementMessage').value.trim();
        const priority = document.getElementById('announcementPriority').value;
        const target = document.getElementById('announcementTarget').value;
        const requireAck = document.getElementById('announcementRequireAck').checked;

        if (!title || !message) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const announcements = getAnnouncements();
        const staff = getStaff();
        let targetStaff = [];

        if (target === 'all') {
            targetStaff = staff.filter(s => s.status !== 'blocked').map(s => s.id);
        } else if (target === 'active') {
            targetStaff = staff.filter(s => s.status === 'active').map(s => s.id);
        } else if (target === 'specific') {
            const select = document.getElementById('announcementStaff');
            targetStaff = Array.from(select.selectedOptions).map(opt => opt.value);
        }

        const announcement = {
            id: 'ANN-' + Date.now().toString().slice(-6),
            title: title,
            message: message,
            priority: priority,
            target: target,
            targetStaff: targetStaff,
            requireAck: requireAck,
            createdAt: new Date().toISOString(),
            createdBy: 'Owner',
            readBy: [],
            acknowledgedBy: [],
            responses: [],
            archived: false
        };

        announcements.push(announcement);
        saveAnnouncements(announcements);

        closeModal('addAnnouncementModal');
        this.reset();
        document.getElementById('specificStaffGroup').style.display = 'none';
        renderAnnouncements();
        showToast('📢 Announcement posted successfully!');
    });

    // ============================================
    // VIEW ANNOUNCEMENT
    // ============================================
    window.viewAnnouncement = function(index) {
        const announcements = getAnnouncements();
        const announcement = announcements[index];
        if (!announcement) {
            showToast('Announcement not found.', 'error');
            return;
        }

        // Mark as read by owner (for stats)
        if (!announcement.readBy.includes('Owner')) {
            announcement.readBy.push('Owner');
            saveAnnouncements(announcements);
        }

        const priorityIcons = {
            normal: '📌',
            important: '⭐',
            urgent: '🚨'
        };

        const staff = getStaff();
        const totalStaff = staff.filter(s => s.status !== 'blocked').length;
        const readCount = announcement.readBy ? announcement.readBy.length : 0;
        const ackCount = announcement.acknowledgedBy ? announcement.acknowledgedBy.length : 0;
        const unreadCount = totalStaff - readCount;

        document.getElementById('viewAnnouncementTitle').textContent = announcement.title;

        const content = document.getElementById('viewAnnouncementContent');
        content.innerHTML = `
            <div class="view-header">
                <div class="view-title">${priorityIcons[announcement.priority] || '📌'} ${announcement.title}</div>
                <span class="view-priority ${announcement.priority || 'normal'}">${(announcement.priority || 'normal').toUpperCase()}</span>
            </div>
            <div style="font-size:13px;color:var(--text-soft);margin-bottom:8px;">
                Posted: ${new Date(announcement.createdAt).toLocaleString()}
            </div>
            <div class="view-message">${announcement.message}</div>
            <div class="view-footer">
                <div><span class="label">Target:</span> <span class="value">${announcement.target || 'All Staff'}</span></div>
                <div><span class="label">Status:</span> <span class="value">${announcement.archived ? '📁 Archived' : '📤 Active'}</span></div>
                <div><span class="label">👁️ Read:</span> <span class="value">${readCount} of ${totalStaff} staff</span></div>
                <div><span class="label">📨 Unread:</span> <span class="value">${unreadCount} staff</span></div>
                ${announcement.requireAck ? `
                <div><span class="label">✅ Acknowledged:</span> <span class="value">${ackCount} of ${totalStaff} staff</span></div>
                ` : ''}
                <div><span class="label">💬 Responses:</span> <span class="value">${announcement.responses ? announcement.responses.length : 0}</span></div>
            </div>
            ${announcement.responses && announcement.responses.length > 0 ? `
            <div class="view-acknowledge">
                <span class="ack-status">💬 Staff Responses</span>
                <button class="btn btn-ghost btn-sm" onclick="closeModal('viewAnnouncementModal');openResponseModal(${index})">View Responses</button>
            </div>
            ` : ''}
            ${announcement.requireAck ? `
            <div class="view-acknowledge">
                <span class="ack-status">✅ ${ackCount} staff have acknowledged this announcement</span>
                <button class="btn btn-ghost btn-sm" onclick="closeModal('viewAnnouncementModal');viewAcknowledgements(${index})">View Acknowledgements</button>
            </div>
            ` : ''}
        `;

        openModal('viewAnnouncementModal');
    };

    // ============================================
    // VIEW ACKNOWLEDGEMENTS
    // ============================================
    window.viewAcknowledgements = function(index) {
        const announcements = getAnnouncements();
        const announcement = announcements[index];
        if (!announcement) {
            showToast('Announcement not found.', 'error');
            return;
        }

        const staff = getStaff();
        const acknowledged = announcement.acknowledgedBy || [];
        const pending = staff.filter(s => 
            s.status !== 'blocked' && !acknowledged.includes(s.id)
        );

        const content = document.getElementById('responseContent');
        content.innerHTML = `
            <div style="margin-bottom:12px;">
                <strong>✅ Acknowledged (${acknowledged.length})</strong>
                ${acknowledged.map(id => {
                    const s = staff.find(st => st.id === id);
                    return s ? `<div class="response-item"><span class="staff-name">${s.name}</span><span class="response-status acknowledged">✅ Acknowledged</span></div>` : '';
                }).join('')}
            </div>
            ${pending.length > 0 ? `
            <div>
                <strong>⏳ Pending (${pending.length})</strong>
                ${pending.map(s => `
                    <div class="response-item"><span class="staff-name">${s.name}</span><span class="response-status pending">⏳ Pending</span></div>
                `).join('')}
            </div>
            ` : ''}
        `;

        openModal('responseModal');
    };

    // ============================================
    // OPEN RESPONSE MODAL
    // ============================================
    window.openResponseModal = function(index) {
        const announcements = getAnnouncements();
        const announcement = announcements[index];
        if (!announcement) {
            showToast('Announcement not found.', 'error');
            return;
        }

        const staff = getStaff();
        const responses = announcement.responses || [];

        const content = document.getElementById('responseContent');
        if (responses.length === 0) {
            content.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-soft);">
                    <p>No responses yet.</p>
                </div>
            `;
        } else {
            content.innerHTML = responses.map(r => {
                const s = staff.find(st => st.id === r.staffId);
                return `
                    <div class="response-item">
                        <span class="staff-name">${s ? s.name : 'Unknown'}</span>
                        <span style="color:var(--text-soft);font-size:13px;">${new Date(r.createdAt).toLocaleString()}</span>
                        <span style="font-size:13px;">${r.message}</span>
                    </div>
                `;
            }).join('');
        }

        openModal('responseModal');
    };

    // ============================================
    // ARCHIVE ANNOUNCEMENT
    // ============================================
    window.archiveAnnouncement = function(index) {
        const announcements = getAnnouncements();
        if (index < 0 || index >= announcements.length) {
            showToast('Announcement not found.', 'error');
            return;
        }

        announcements[index].archived = true;
        saveAnnouncements(announcements);
        renderAnnouncements();
        showToast('📁 Announcement archived.');
    };

    // ============================================
    // DELETE ANNOUNCEMENT
    // ============================================
    window.deleteAnnouncement = function(index) {
        const announcements = getAnnouncements();
        if (index < 0 || index >= announcements.length) {
            showToast('Announcement not found.', 'error');
            return;
        }

        if (confirm('Delete this announcement permanently? This cannot be undone.')) {
            announcements.splice(index, 1);
            saveAnnouncements(announcements);
            renderAnnouncements();
            showToast('🗑️ Announcement deleted.');
        }
    };

    // ============================================
    // SEARCH & FILTER
    // ============================================
    document.getElementById('announcementFilter')?.addEventListener('change', renderAnnouncements);
    document.getElementById('announcementSearch')?.addEventListener('input', renderAnnouncements);

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
    populateStaffDropdown();
    renderAnnouncements();

    console.log('🚀 ShopFlow Announcements loaded successfully!');
    console.log('📢 Communication hub for owner and staff');
});