// ============================================
// SHOPFLOW - LOGIN PAGE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== THEME TOGGLE =====
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
    // ROLE TOGGLE
    // ============================================
    const ownerRoleBtn = document.getElementById('ownerRoleBtn');
    const staffRoleBtn = document.getElementById('staffRoleBtn');
    const ownerForm = document.getElementById('ownerLoginForm');
    const staffForm = document.getElementById('staffLoginForm');

    function setRole(role) {
        // Update buttons
        ownerRoleBtn.classList.toggle('active', role === 'owner');
        staffRoleBtn.classList.toggle('active', role === 'staff');
        
        // Update forms
        ownerForm.classList.toggle('active', role === 'owner');
        staffForm.classList.toggle('active', role === 'staff');
        
        // Store selected role
        localStorage.setItem('selectedRole', role);
    }

    // Load saved role preference
    const savedRole = localStorage.getItem('selectedRole') || 'owner';
    setRole(savedRole);

    ownerRoleBtn.addEventListener('click', () => setRole('owner'));
    staffRoleBtn.addEventListener('click', () => setRole('staff'));

    // ============================================
    // PASSWORD TOGGLE
    // ============================================
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.textContent = isPassword ? '🙈' : '👁️';
        });
    });

    // ============================================
    // OWNER LOGIN
    // ============================================
    document.getElementById('ownerLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const shopName = document.getElementById('ownerShopName').value.trim();
        const phone = document.getElementById('ownerPhone').value.trim();
        const password = document.getElementById('ownerPassword').value.trim();
        
        // Validation
        if (!shopName || !phone || !password) {
            showError('ownerLoginForm', 'Please fill in all fields');
            return;
        }
        
        // Simulate login
        simulateLogin('owner', { shopName, phone, password });
    });

    // ============================================
    // STAFF LOGIN
    // ============================================
    document.getElementById('staffLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const shopName = document.getElementById('staffShopName').value.trim();
        const staffId = document.getElementById('staffId').value.trim();
        const password = document.getElementById('staffPassword').value.trim();
        
        // Validation
        if (!shopName || !staffId || !password) {
            showError('staffLoginForm', 'Please fill in all fields');
            return;
        }
        
        // Simulate login
        simulateLogin('staff', { shopName, staffId, password });
    });

    // ============================================
    // SIMULATE LOGIN
    // ============================================
    function simulateLogin(role, credentials) {
        // Show loading state
        const btn = document.querySelector(`#${role}LoginForm .btn`);
        const originalText = btn.textContent;
        btn.textContent = '⏳ Logging in...';
        btn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Store login info
            const loginData = {
                role: role,
                shopName: credentials.shopName,
                loggedInAt: new Date().toISOString(),
                // For demo, we store the user info
                user: role === 'owner' ? {
                    phone: credentials.phone,
                    name: 'Shop Owner'
                } : {
                    staffId: credentials.staffId,
                    name: 'Staff Member'
                }
            };
            
            localStorage.setItem('shopflow_login', JSON.stringify(loginData));
            localStorage.setItem('shopflow_logged_in', 'true');
            
            // Show success
            btn.textContent = '✅ Success!';
            btn.style.background = 'var(--green)';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '../pages/dashboard.html';
            }, 800);
            
        }, 1500);
    }

    // ============================================
    // ERROR HANDLING
    // ============================================
    function showError(formId, message) {
        const form = document.getElementById(formId);
        const existingError = form.querySelector('.error-message');
        
        // Remove existing error
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message show';
        errorEl.textContent = '⚠️ ' + message;
        
        // Find the submit button container or append at end
        const submitBtn = form.querySelector('.btn');
        submitBtn.parentNode.insertBefore(errorEl, submitBtn);
        
        // Add error class to inputs
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.add('error');
        });
        
        // Remove error after 5 seconds
        setTimeout(() => {
            errorEl.remove();
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
            });
        }, 5000);
    }

    // ============================================
    // CHECK IF ALREADY LOGGED IN
    // ============================================
    if (localStorage.getItem('shopflow_logged_in') === 'true') {
        // Redirect to dashboard
        window.location.href = '../pages/dashboard.html';
    }

    // ============================================
    // REMEMBER ME FUNCTIONALITY
    // ============================================
    const rememberCheckbox = document.getElementById('rememberMe');
    
    // Load saved credentials if "Remember me" was checked
    const savedCredentials = localStorage.getItem('shopflow_remembered');
    if (savedCredentials) {
        try {
            const data = JSON.parse(savedCredentials);
            if (data.shopName && data.phone) {
                document.getElementById('ownerShopName').value = data.shopName;
                document.getElementById('ownerPhone').value = data.phone;
                rememberCheckbox.checked = true;
            }
        } catch (e) {}
    }
    
    // Save credentials when form is submitted and remember me is checked
    document.getElementById('ownerLoginForm').addEventListener('submit', function() {
        if (rememberCheckbox.checked) {
            const shopName = document.getElementById('ownerShopName').value.trim();
            const phone = document.getElementById('ownerPhone').value.trim();
            if (shopName && phone) {
                localStorage.setItem('shopflow_remembered', JSON.stringify({
                    shopName,
                    phone
                }));
            }
        } else {
            localStorage.removeItem('shopflow_remembered');
        }
    });

    console.log('ShopFlow Login loaded successfully!');
});