// ============================================
// SHOPFLOW - THEME SERVICE (Simple & Working)
// ============================================

(function() {
    'use strict';

    // ============================================
    // THEME FUNCTIONS
    // ============================================
    function getTheme() {
        try {
            const saved = localStorage.getItem('shopflow_theme');
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'light';
        } catch (e) {
            return 'light';
        }
    }

    function applyTheme(theme) {
        const body = document.body;
        const html = document.documentElement;
        
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            html.style.colorScheme = 'dark';
        } else {
            body.removeAttribute('data-theme');
            html.style.colorScheme = 'light';
        }
        
        // Update all toggle buttons
        document.querySelectorAll('.theme-toggle, #themeToggle').forEach(btn => {
            if (theme === 'dark') {
                btn.textContent = '☀️';
                btn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                btn.textContent = '🌙';
                btn.setAttribute('aria-label', 'Switch to dark mode');
            }
        });
        
        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.content = theme === 'dark' ? '#111827' : '#1E3A8A';
        }
        
        // Save
        try {
            localStorage.setItem('shopflow_theme', theme);
        } catch (e) {}
    }

    function toggleTheme() {
        const current = getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        return newTheme;
    }

    // ============================================
    // INIT THEME
    // ============================================
    function initTheme() {
        const theme = getTheme();
        applyTheme(theme);
        console.log('🎨 Theme initialized:', theme);
    }

    // ============================================
    // SETUP TOGGLE BUTTONS
    // ============================================
    function setupToggleButtons() {
        const buttons = document.querySelectorAll('.theme-toggle, #themeToggle');
        
        buttons.forEach(btn => {
            // Remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add click listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const newTheme = toggleTheme();
                console.log('Theme toggled to:', newTheme);
            });
        });
    }

    // ============================================
    // WATCH FOR NEW BUTTONS
    // ============================================
    function watchForButtons() {
        const observer = new MutationObserver(() => {
            const buttons = document.querySelectorAll('.theme-toggle, #themeToggle');
            if (buttons.length > 0) {
                setupToggleButtons();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ============================================
    // LISTEN FOR STORAGE CHANGES (Other tabs)
    // ============================================
    window.addEventListener('storage', function(e) {
        if (e.key === 'shopflow_theme' && e.newValue) {
            const theme = e.newValue;
            if (theme === 'light' || theme === 'dark') {
                applyTheme(theme);
            }
        }
    });

    // ============================================
    // LISTEN FOR SYSTEM THEME CHANGES
    // ============================================
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function(e) {
            // Only change if user hasn't manually set
            if (!localStorage.getItem('shopflow_theme')) {
                const theme = e.matches ? 'dark' : 'light';
                applyTheme(theme);
            }
        });
    }

    // ============================================
    // EXPOSE GLOBALLY
    // ============================================
    window.themeService = {
        getTheme: getTheme,
        applyTheme: applyTheme,
        toggleTheme: toggleTheme,
        init: initTheme,
        setupButtons: setupToggleButtons
    };

    // ============================================
    // INIT WHEN READY
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTheme();
            setupToggleButtons();
            watchForButtons();
        });
    } else {
        initTheme();
        setupToggleButtons();
        watchForButtons();
    }

    console.log('🎨 Theme Service Ready!');
})();