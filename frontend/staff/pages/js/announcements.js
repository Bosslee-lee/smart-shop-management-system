// ============================================
// ANNOUNCEMENTS - COMPLETE JAVASCRIPT
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
    // GET ANNOUNCEMENTS
    // ============================================
    function getAnnouncements() {
        return JSON.parse(localStorage.getItem('shopflow_announcements') || '[]');
    }

    function saveAnnouncements(announcements) {
        localStorage.setItem('shopflow_announcements', JSON.stringify(announcements));
    }

    // ============================================
    // GET READ STATUS (per staff)
    // ============================================
    function getReadStatus() {
        var user = JSON.parse(localStorage.getItem('shopflow_user') || '{}');
        var key = 'shopflow_read_announcements_' + (user.name || 'staff');
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function saveReadStatus(readList) {
        var user = JSON.parse(localStorage.getItem('shopflow_user') || '{}');
        var key = 'shopflow_read_announcements_' + (user.name || 'staff');
        localStorage.setItem(key, JSON.stringify(readList));
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

    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ============================================
    // RENDER ANNOUNCEMENTS
    // ============================================
    function renderAnnouncements() {
        var announcements = getAnnouncements();
        var readList = getReadStatus();
        var filter = document.getElementById('priorityFilter').value;
        var search = document.getElementById('searchAnnouncements').value.toLowerCase();

        var filtered = announcements;

        // Filter by priority
        if (filter !== 'all') {
            filtered = filtered.filter(function(a) {
                return a.priority === filter;
            });
        }

        // Filter by search
        if (search) {
            filtered = filtered.filter(function(a) {
                return a.title.toLowerCase().indexOf(search) !== -1 ||
                    a.message.toLowerCase().indexOf(search) !== -1;
            });
        }

        // Sort by date (newest first)
        filtered.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Update stats
        updateStats(announcements, readList);

        // Update badge in sidebar
        var unreadCount = announcements.filter(function(a) {
            return readList.indexOf(a.id) === -1;
        }).length;
        document.getElementById('announceBadge').textContent = unreadCount;
        document.getElementById('alertBadge').textContent = unreadCount;

        var container = document.getElementById('announcementsList');

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span>📢</span>
                    <h3>${announcements.length === 0 ? 'No announcements yet' : 'No matching announcements'}</h3>
                    <p>${announcements.length === 0 ? 'Check back later for updates from the owner.' : 'Try adjusting your search or filter.'}</p>
                </div>
            `;
            return;
        }

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var a = filtered[i];
            var isRead = readList.indexOf(a.id) !== -1;
            var priorityClass = a.priority || 'normal';
            var priorityLabel = priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1);

            html += `
                <div class="announcement-card ${isRead ? '' : 'unread'}" onclick="viewAnnouncement('${a.id}')">
                    ${!isRead ? '<div class="unread-dot"></div>' : ''}
                    <div class="announcement-header">
                        <div class="announcement-title">${a.title}</div>
                        <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
                    </div>
                    <div class="announcement-message">${a.message}</div>
                    <div class="announcement-footer">
                        <span class="announcement-date">📅 ${new Date(a.createdAt).toLocaleDateString()} • ${new Date(a.createdAt).toLocaleTimeString()}</span>
                        <span class="read-status ${isRead ? 'read' : 'unread'}">${isRead ? '✅ Read' : '📨 Unread'}</span>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    // ============================================
    // VIEW ANNOUNCEMENT (Mark as read)
    // ============================================
    function viewAnnouncement(id) {
        var announcements = getAnnouncements();
        var readList = getReadStatus();

        // Find announcement
        var announcement = null;
        for (var i = 0; i < announcements.length; i++) {
            if (announcements[i].id === id) {
                announcement = announcements[i];
                break;
            }
        }

        if (!announcement) {
            showToast('Announcement not found.', 'error');
            return;
        }

        // Mark as read if not already
        if (readList.indexOf(id) === -1) {
            readList.push(id);
            saveReadStatus(readList);
            renderAnnouncements();
        }

        // Show in modal
        var priorityClass = announcement.priority || 'normal';
        var priorityLabel = priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1);

        document.getElementById('modalTitle').textContent = announcement.title;

        document.getElementById('announcementDetail').innerHTML = `
            <span class="detail-priority ${priorityClass}">${priorityLabel}</span>
            <div class="detail-title">${announcement.title}</div>
            <div class="detail-date">📅 ${new Date(announcement.createdAt).toLocaleString()}</div>
            <div class="detail-message">${announcement.message}</div>
        `;

        openModal('announcementModal');
    }
    window.viewAnnouncement = viewAnnouncement;

    // ============================================
    // UPDATE STATS
    // ============================================
    function updateStats(announcements, readList) {
        var total = announcements.length;
        var unread = 0;
        var read = 0;
        var urgent = 0;

        for (var i = 0; i < announcements.length; i++) {
            var a = announcements[i];
            if (readList.indexOf(a.id) === -1) {
                unread++;
            } else {
                read++;
            }
            if (a.priority === 'urgent') {
                urgent++;
            }
        }

        document.getElementById('totalAnnouncements').textContent = total;
        document.getElementById('unreadCount').textContent = unread;
        document.getElementById('readCount').textContent = read;
        document.getElementById('urgentCount').textContent = urgent;

        // Highlight unread count
        var unreadEl = document.getElementById('unreadCount');
        if (unread > 0) {
            unreadEl.classList.add('unread');
        } else {
            unreadEl.classList.remove('unread');
        }
    }

    // ============================================
    // SEARCH & FILTER
    // ============================================
    document.getElementById('priorityFilter').addEventListener('change', renderAnnouncements);
    document.getElementById('searchAnnouncements').addEventListener('input', renderAnnouncements);

    // ============================================
    // MARK ALL AS READ
    // ============================================
    function markAllAsRead() {
        var announcements = getAnnouncements();
        var readList = getReadStatus();

        var allIds = announcements.map(function(a) { return a.id; });
        var newReadList = readList.concat(allIds.filter(function(id) {
            return readList.indexOf(id) === -1;
        }));

        saveReadStatus(newReadList);
        renderAnnouncements();
        showToast('✅ All announcements marked as read', 'success');
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
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(function(modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        // Ctrl+M = Mark all as read
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            markAllAsRead();
        }
    });

    // ============================================
    // INIT
    // ============================================
    loadStaffData();
    renderAnnouncements();

    console.log('🚀 Announcements page loaded successfully!');
    console.log('📢 ' + getAnnouncements().length + ' announcements available');
    console.log('📨 ' + getReadStatus().length + ' announcements read');
    console.log('💡 Click on an announcement to mark it as read');
    console.log('💡 Ctrl+M to mark all as read');
});