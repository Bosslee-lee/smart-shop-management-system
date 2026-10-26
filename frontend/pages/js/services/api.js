// ============================================
// SHOPFLOW - API SERVICE
// ============================================

const API = {
    // Base URL - change to your production URL when deployed
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://api.shopflow.co.ke' 
        : 'http://localhost:5000',

    // ============================================
    // GET AUTH HEADERS
    // ============================================
    getHeaders() {
        const token = localStorage.getItem('shopflow_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },

    // ============================================
    // AUTH ENDPOINTS
    // ============================================
    auth: {
        // Owner Register
        register: async (data) => {
            const response = await fetch(`${API.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.json();
        },

        // Owner Login
        login: async (email, password) => {
            const response = await fetch(`${API.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return response.json();
        },

        // Staff Login
        staffLogin: async (shopName, staffId, pin) => {
            const response = await fetch(`${API.baseURL}/api/auth/staff-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopName, staffId, pin })
            });
            return response.json();
        },

        // Verify Token
        verify: async () => {
            const response = await fetch(`${API.baseURL}/api/auth/verify`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Change Password
        changePassword: async (currentPassword, newPassword) => {
            const response = await fetch(`${API.baseURL}/api/auth/change-password`, {
                method: 'PUT',
                headers: API.getHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });
            return response.json();
        }
    },

    // ============================================
    // PRODUCT ENDPOINTS
    // ============================================
    products: {
        // Get all products
        getAll: async (params = {}) => {
            const query = new URLSearchParams(params).toString();
            const url = query ? `${API.baseURL}/api/products?${query}` : `${API.baseURL}/api/products`;
            const response = await fetch(url, { headers: API.getHeaders() });
            return response.json();
        },

        // Get single product
        getOne: async (productId) => {
            const response = await fetch(`${API.baseURL}/api/products/${productId}`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Add product
        add: async (product) => {
            const response = await fetch(`${API.baseURL}/api/products`, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify(product)
            });
            return response.json();
        },

        // Update product
        update: async (productId, product) => {
            const response = await fetch(`${API.baseURL}/api/products/${productId}`, {
                method: 'PUT',
                headers: API.getHeaders(),
                body: JSON.stringify(product)
            });
            return response.json();
        },

        // Delete product
        delete: async (productId) => {
            const response = await fetch(`${API.baseURL}/api/products/${productId}`, {
                method: 'DELETE',
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Stock In
        stockIn: async (productId, quantity) => {
            const response = await fetch(`${API.baseURL}/api/products/${productId}/stock-in`, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify({ quantity })
            });
            return response.json();
        }
    },

    // ============================================
    // STAFF ENDPOINTS
    // ============================================
    staff: {
        // Get all staff
        getAll: async () => {
            const response = await fetch(`${API.baseURL}/api/staff`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Add staff
        add: async (staff) => {
            const response = await fetch(`${API.baseURL}/api/staff`, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify(staff)
            });
            return response.json();
        },

        // Update staff
        update: async (staffId, staff) => {
            const response = await fetch(`${API.baseURL}/api/staff/${staffId}`, {
                method: 'PUT',
                headers: API.getHeaders(),
                body: JSON.stringify(staff)
            });
            return response.json();
        },

        // Block staff
        block: async (staffId) => {
            const response = await fetch(`${API.baseURL}/api/staff/${staffId}/block`, {
                method: 'PUT',
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Unblock staff
        unblock: async (staffId) => {
            const response = await fetch(`${API.baseURL}/api/staff/${staffId}/unblock`, {
                method: 'PUT',
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Delete staff
        delete: async (staffId) => {
            const response = await fetch(`${API.baseURL}/api/staff/${staffId}`, {
                method: 'DELETE',
                headers: API.getHeaders()
            });
            return response.json();
        }
    },

    // ============================================
    // SALES ENDPOINTS
    // ============================================
    sales: {
        // Record sale
        record: async (sale) => {
            const response = await fetch(`${API.baseURL}/api/sales`, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify(sale)
            });
            return response.json();
        },

        // Get sales
        get: async (params = {}) => {
            const query = new URLSearchParams(params).toString();
            const url = query ? `${API.baseURL}/api/sales?${query}` : `${API.baseURL}/api/sales`;
            const response = await fetch(url, { headers: API.getHeaders() });
            return response.json();
        }
    },

    // ============================================
    // SHOP ENDPOINTS
    // ============================================
    shop: {
        // Get shop details
        get: async () => {
            const response = await fetch(`${API.baseURL}/api/shop`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Update shop
        update: async (shop) => {
            const response = await fetch(`${API.baseURL}/api/shop`, {
                method: 'PUT',
                headers: API.getHeaders(),
                body: JSON.stringify(shop)
            });
            return response.json();
        }
    },

    // ============================================
    // ANNOUNCEMENT ENDPOINTS
    // ============================================
    announcements: {
        // Get all announcements
        getAll: async () => {
            const response = await fetch(`${API.baseURL}/api/announcements`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Add announcement
        add: async (announcement) => {
            const response = await fetch(`${API.baseURL}/api/announcements`, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify(announcement)
            });
            return response.json();
        },

        // Delete announcement
        delete: async (announcementId) => {
            const response = await fetch(`${API.baseURL}/api/announcements/${announcementId}`, {
                method: 'DELETE',
                headers: API.getHeaders()
            });
            return response.json();
        }
    },

    // ============================================
    // FLASH SALE ENDPOINTS
    // ============================================
    flashsales: {
        // Get all flash sales
        getAll: async () => {
            const response = await fetch(`${API.baseURL}/api/flashsales`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Add flash sale
        add: async (flashSale) => {
            const response = await fetch(`${API.baseURL}/api/flashsales`, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify(flashSale)
            });
            return response.json();
        },

        // Update flash sale
        update: async (flashSaleId, flashSale) => {
            const response = await fetch(`${API.baseURL}/api/flashsales/${flashSaleId}`, {
                method: 'PUT',
                headers: API.getHeaders(),
                body: JSON.stringify(flashSale)
            });
            return response.json();
        },

        // Delete flash sale
        delete: async (flashSaleId) => {
            const response = await fetch(`${API.baseURL}/api/flashsales/${flashSaleId}`, {
                method: 'DELETE',
                headers: API.getHeaders()
            });
            return response.json();
        }
    },

    // ============================================
    // SUBSCRIPTION ENDPOINTS
    // ============================================
    subscription: {
        // Get current subscription
        get: async () => {
            const response = await fetch(`${API.baseURL}/api/subscription`, {
                headers: API.getHeaders()
            });
            return response.json();
        },

        // Upgrade subscription
        upgrade: async (plan) => {
            const response = await fetch(`${API.baseURL}/api/subscription/upgrade`, {
                method: 'PUT',
                headers: API.getHeaders(),
                body: JSON.stringify({ plan })
            });
            return response.json();
        }
    }
};

// Make API globally available
window.API = API;