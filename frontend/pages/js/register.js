// ============================================
// SHOPFLOW - REGISTER PAGE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // CHECK IF ALREADY LOGGED IN
    // ============================================
    if (typeof authService !== 'undefined' && authService.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // ============================================
    // STATE
    // ============================================
    let currentStep = 1;
    const totalSteps = 5;
    let categories = [];
    let selectedPlan = 'business';
    let isOtpVerified = false;
    let logoData = null;
    let selectedRole = null;

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // ============================================
    // THEME TOGGLE
    // ============================================
    if (localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', function() {
        const isDark = body.getAttribute('data-theme') === 'dark';
        body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // ============================================
    // TOAST
    // ============================================
    let toastTimeout;

    function showToast(message, type) {
        type = type || 'success';
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toastIcon');
        const msg = document.getElementById('toastMessage');
        toast.className = 'toast ' + type;
        icon.textContent = type === 'success' ? '✅' : '❌';
        msg.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }
    window.showToast = showToast;

    // ============================================
    // STEP NAVIGATION
    // ============================================
    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        currentStep = step;

        steps.forEach(function(el) {
            el.classList.toggle('active', parseInt(el.dataset.step) === step);
        });

        progressSteps.forEach(function(el) {
            const stepNum = parseInt(el.dataset.step);
            el.classList.remove('active', 'completed');
            if (stepNum === step) el.classList.add('active');
            else if (stepNum < step) el.classList.add('completed');
        });

        document.querySelector('.register-wrapper').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    window.goToStep = goToStep;

    // ============================================
    // ROLE SELECTION
    // ============================================
    window.selectRole = function(role) {
        // Staff cannot register - show message
        if (role === 'staff') {
            document.getElementById('staffInfoMessage').style.display = 'block';
            document.querySelectorAll('.role-card').forEach(function(card) {
                card.classList.toggle('selected', card.dataset.role === role);
            });
            document.getElementById('step1Btn').disabled = true;
            document.getElementById('step1Btn').textContent = 'Staff registration not available';
            return;
        }

        // Hide staff message
        document.getElementById('staffInfoMessage').style.display = 'none';

        selectedRole = role;
        document.querySelectorAll('.role-card').forEach(function(card) {
            card.classList.toggle('selected', card.dataset.role === role);
        });

        document.getElementById('step1Btn').disabled = false;
        document.getElementById('step1Btn').textContent = 'Continue →';

        // Update plan selection info
        updatePlanInfo(role);
    };

    // ============================================
    // UPDATE PLAN INFO BASED ON ROLE
    // ============================================
    function updatePlanInfo(role) {
        const planInfo = document.getElementById('planSelectionInfo');
        const roleLabel = document.getElementById('planRoleLabel');

        if (role === 'solo') {
            roleLabel.textContent = '👩‍💼 Solo Owner';
            planInfo.innerHTML = `
                <p style="font-size:14px;color:var(--text);">
                    <span id="planRoleLabel">👩‍💼 Solo Owner</span> — <strong>KSh 3,500/month</strong> (Best for solo owners)
                </p>
                <p style="font-size:13px;color:var(--text-soft);margin-top:4px;">
                    ✅ All Business plan features included • No staff management needed
                </p>
            `;
            // Auto-select Business plan for solo
            selectedPlan = 'business';
            document.querySelectorAll('.plan-card').forEach(function(card) {
                card.classList.toggle('selected', card.dataset.plan === 'business');
            });
            document.querySelectorAll('.plan-card .plan-btn').forEach(function(btn) {
                const card = btn.closest('.plan-card');
                if (card.dataset.plan === 'business') {
                    btn.textContent = 'Selected';
                    btn.className = 'btn btn-primary plan-btn';
                } else {
                    btn.textContent = 'Select';
                    btn.className = 'btn btn-ghost plan-btn';
                }
            });
        } else if (role === 'owner') {
            roleLabel.textContent = '👔 Shop Owner with Staff';
            planInfo.innerHTML = `
                <p style="font-size:14px;color:var(--text);">
                    <span id="planRoleLabel">👔 Shop Owner with Staff</span> — Choose your plan below
                </p>
                <p style="font-size:13px;color:var(--text-soft);margin-top:4px;">
                    ✅ Pick a plan that fits your team size
                </p>
            `;
            // Reset to default selection (Business)
            selectedPlan = 'business';
            document.querySelectorAll('.plan-card').forEach(function(card) {
                card.classList.toggle('selected', card.dataset.plan === 'business');
            });
            document.querySelectorAll('.plan-card .plan-btn').forEach(function(btn) {
                const card = btn.closest('.plan-card');
                if (card.dataset.plan === 'business') {
                    btn.textContent = 'Selected';
                    btn.className = 'btn btn-primary plan-btn';
                } else {
                    btn.textContent = 'Select';
                    btn.className = 'btn btn-ghost plan-btn';
                }
            });
        }
    }

    // Role card click
    document.querySelectorAll('.role-card').forEach(function(card) {
        card.addEventListener('click', function() {
            selectRole(this.dataset.role);
        });
    });

    // ============================================
    // STEP 1: CONTINUE
    // ============================================
    document.getElementById('step1Btn').addEventListener('click', function() {
        if (!selectedRole) {
            showToast('Please select who you are.', 'error');
            return;
        }
        goToStep(2);
    });

    // ============================================
    // STEP 2: BACK & CONTINUE
    // ============================================
    document.getElementById('step2Back').addEventListener('click', function() {
        goToStep(1);
    });

    document.getElementById('step2Btn').addEventListener('click', function() {
        const name = document.getElementById('shopName').value.trim();
        const location = document.getElementById('shopLocation').value.trim();
        const phone = document.getElementById('shopPhone').value.trim();
        const type = document.getElementById('shopType').value;

        if (!name || !location || !phone || !type) {
            showToast('Please fill in all required shop details.', 'error');
            return;
        }
        goToStep(3);
    });

    // ============================================
    // STEP 3: BACK & CONTINUE
    // ============================================
    document.getElementById('step3Back').addEventListener('click', function() {
        goToStep(2);
    });

    document.getElementById('step3Btn').addEventListener('click', function() {
        const name = document.getElementById('ownerName').value.trim();
        const email = document.getElementById('ownerEmail').value.trim();
        const phone = document.getElementById('otpPhone').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !phone || !password) {
            showToast('Please fill in all owner details.', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            return;
        }
        if (!isOtpVerified) {
            showToast('Please verify your phone number with OTP.', 'error');
            return;
        }
        goToStep(4);
    });

    // ============================================
    // LOGO UPLOAD
    // ============================================
    const uploadBtn = document.getElementById('uploadBtn');
    const logoInput = document.getElementById('logoInput');
    const logoPreview = document.getElementById('logoPreview');

    uploadBtn.addEventListener('click', function() {
        logoInput.click();
    });

    logoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                logoData = ev.target.result;
                logoPreview.innerHTML = '<img src="' + ev.target.result + '" alt="Shop logo" />';
                logoPreview.style.borderColor = 'var(--green)';
            };
            reader.readAsDataURL(file);
        }
    });

    // ============================================
    // OTP VERIFICATION
    // ============================================
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpCodeInput = document.getElementById('otpCode');
    const otpPhoneInput = document.getElementById('otpPhone');
    const otpVerifiedEl = document.getElementById('otpVerified');
    let generatedOtp = '';
    let otpSent = false;

    sendOtpBtn.addEventListener('click', function() {
        const phone = otpPhoneInput.value.trim();
        if (!phone || phone.length < 8) {
            showToast('Please enter a valid phone number.', 'error');
            return;
        }

        generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        alert('📱 OTP sent to ' + phone + ': ' + generatedOtp + ' (Demo)');
        otpSent = true;
        this.textContent = 'Resend OTP';
        otpVerifiedEl.classList.remove('show');
        otpCodeInput.style.borderColor = '';
    });

    verifyOtpBtn.addEventListener('click', function() {
        const entered = otpCodeInput.value.trim();
        if (!otpSent) {
            showToast('Please request an OTP first.', 'error');
            return;
        }
        if (entered === generatedOtp) {
            isOtpVerified = true;
            otpVerifiedEl.classList.add('show');
            otpCodeInput.style.borderColor = 'var(--green)';
            showToast('✅ Phone verified successfully!', 'success');
        } else {
            isOtpVerified = false;
            showToast('❌ Invalid OTP. Please try again.', 'error');
            otpCodeInput.style.borderColor = 'var(--red)';
        }
    });

    // ============================================
    // CATEGORIES
    // ============================================
    const categoryInput = document.getElementById('categoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoriesList = document.getElementById('categoriesList');

    function renderCategories() {
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="category-empty">
                    <span>📂</span>
                    <p>No categories added yet. Add your first category above.</p>
                </div>
            `;
            return;
        }

        categoriesList.innerHTML = categories.map(function(cat, index) {
            return `
                <div class="category-tag">
                    📁 ${cat}
                    <button class="remove" onclick="removeCategory(${index})">×</button>
                </div>
            `;
        }).join('');
    }

    window.removeCategory = function(index) {
        categories.splice(index, 1);
        renderCategories();
    };

    addCategoryBtn.addEventListener('click', function() {
        const cat = categoryInput.value.trim();
        if (!cat) {
            showToast('Please enter a category name.', 'error');
            return;
        }
        if (categories.indexOf(cat) !== -1) {
            showToast('Category already exists!', 'error');
            return;
        }
        categories.push(cat);
        renderCategories();
        categoryInput.value = '';
        categoryInput.focus();
    });

    categoryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCategoryBtn.click();
        }
    });

    // ============================================
    // SUGGESTED CATEGORIES
    // ============================================
    function updateSuggestedCategories() {
        const shopType = document.getElementById('shopType').value;
        const tagsContainer = document.getElementById('suggestedTags');

        const suggestions = {
            'Perfume Shop': ['Perfumes', 'Cosmetics', 'Skincare', 'Accessories', 'Gift Sets'],
            'Electronics Store': ['Phones', 'Laptops', 'Accessories', 'Audio', 'Gadgets'],
            'Grocery Store': ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages'],
            'Clothing Store': ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'],
            'Pharmacy': ['Medicine', 'Vitamins', 'First Aid', 'Health Supplements'],
            'Hardware Store': ['Tools', 'Building Materials', 'Plumbing', 'Electrical'],
            'Restaurant': ['Appetizers', 'Main Dishes', 'Desserts', 'Beverages'],
            'Bookstore': ['Fiction', 'Non-Fiction', 'Textbooks', "Children's"],
            'Furniture Store': ['Sofas', 'Tables', 'Chairs', 'Beds', 'Storage'],
            'Other': ['Category 1', 'Category 2', 'Category 3']
        };

        const cats = suggestions[shopType] || ['Category 1', 'Category 2', 'Category 3'];
        tagsContainer.innerHTML = cats.map(function(cat) {
            return '<span class="suggested-tag" onclick="addSuggestedCategory(\'' + cat + '\')">+ ' + cat + '</span>';
        }).join('');
    }

    window.addSuggestedCategory = function(category) {
        if (categories.indexOf(category) === -1) {
            categories.push(category);
            renderCategories();
            categoryInput.value = '';
            categoryInput.focus();
        }
    };

    document.getElementById('shopType').addEventListener('change', updateSuggestedCategories);

    // ============================================
    // STEP 4: BACK & CONTINUE
    // ============================================
    document.getElementById('step4Back').addEventListener('click', function() {
        goToStep(3);
    });

    document.getElementById('step4Btn').addEventListener('click', function() {
        if (categories.length === 0) {
            showToast('Please add at least one product category.', 'error');
            return;
        }
        goToStep(5);
    });

    // ============================================
    // STEP 5: BACK
    // ============================================
    document.getElementById('step5Back').addEventListener('click', function() {
        goToStep(4);
    });

    // ============================================
    // PLAN SELECTION
    // ============================================
    document.querySelectorAll('.plan-card').forEach(function(card) {
        card.addEventListener('click', function() {
            // Solo owner can only select Business plan
            if (selectedRole === 'solo' && this.dataset.plan !== 'business') {
                showToast('Solo owners can only select the Business plan (KSh 3,500/mo).', 'error');
                return;
            }

            document.querySelectorAll('.plan-card').forEach(function(c) {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedPlan = this.dataset.plan;

            document.querySelectorAll('.plan-card .plan-btn').forEach(function(btn) {
                btn.textContent = 'Select';
                btn.className = 'btn btn-ghost plan-btn';
            });
            const btn = this.querySelector('.plan-btn');
            btn.textContent = 'Selected';
            btn.className = 'btn btn-primary plan-btn';
        });
    });

    // ============================================
    // COMPLETE REGISTRATION
    // ============================================
    document.getElementById('completeBtn').addEventListener('click', function() {
        const btn = this;

        // Gather data
        const role = selectedRole;
        const shopName = document.getElementById('shopName').value.trim();
        const shopType = document.getElementById('shopType').value;
        const shopLocation = document.getElementById('shopLocation').value.trim();
        const shopPhone = document.getElementById('shopPhone').value.trim();
        const shopDesc = document.getElementById('shopDesc').value.trim();
        const ownerName = document.getElementById('ownerName').value.trim();
        const ownerEmail = document.getElementById('ownerEmail').value.trim();
        const ownerPhone = document.getElementById('otpPhone').value.trim();
        const password = document.getElementById('registerPassword').value;

        // Validate
        if (!role) {
            showToast('⚠️ Please select your role.', 'error');
            return;
        }

        // Staff cannot register - already blocked
        if (role === 'staff') {
            showToast('⚠️ Staff cannot register. Please ask your employer for an invitation.', 'error');
            return;
        }

        if (!shopName || !shopType || !shopLocation || !shopPhone) {
            showToast('⚠️ Please fill in all shop details.', 'error');
            return;
        }

        if (!ownerName || !ownerEmail || !ownerPhone || !password) {
            showToast('⚠️ Please fill in all owner details.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('⚠️ Password must be at least 6 characters.', 'error');
            return;
        }

        if (categories.length === 0) {
            showToast('⚠️ Please add at least one product category.', 'error');
            return;
        }

        if (!isOtpVerified) {
            showToast('⚠️ Please verify your phone number with OTP.', 'error');
            return;
        }

        // Show loading
        btn.disabled = true;
        btn.textContent = '⏳ Registering...';

        // Simulate registration
        setTimeout(function() {
            const roleLabels = {
                'solo': '👩‍💼 Solo Owner',
                'owner': '👔 Shop Owner with Staff'
            };

            const shopData = {
                shopName: shopName,
                shopType: shopType,
                location: shopLocation,
                phone: shopPhone,
                description: shopDesc || '',
                ownerName: ownerName,
                ownerEmail: ownerEmail,
                ownerPhone: ownerPhone,
                categories: categories,
                plan: selectedPlan,
                role: role,
                logo: logoData || null,
                registeredAt: new Date().toISOString(),
                trialEnds: new Date(Date.now() + 14 * 86400000).toISOString()
            };

            localStorage.setItem('shopflow_shop', JSON.stringify(shopData));
            localStorage.setItem('shopflow_user', JSON.stringify({
                name: ownerName,
                email: ownerEmail,
                phone: ownerPhone,
                role: role
            }));
            localStorage.setItem('shopflow_plan', selectedPlan);
            localStorage.setItem('shopflow_categories', JSON.stringify(categories));
            localStorage.setItem('shopflow_logged_in', 'true');

            btn.textContent = '✅ Success!';

            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 1500);

        }, 1500);
    });

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeStep = document.querySelector('.form-step.active');
            if (activeStep) {
                const step = parseInt(activeStep.dataset.step);
                if (step === 1) document.getElementById('step1Btn').click();
                else if (step === 2) document.getElementById('step2Btn').click();
                else if (step === 3) document.getElementById('step3Btn').click();
                else if (step === 4) document.getElementById('step4Btn').click();
            }
        }
    });

    // ============================================
    // INIT
    // ============================================
    updateSuggestedCategories();
    goToStep(1);

    console.log('🚀 ShopFlow Register page loaded');
    console.log('📌 Solo Owner: KSh 3,500/month');
    console.log('👔 Shop Owner: Choose your plan');
    console.log('👤 Staff: Cannot register (invitation only)');
});