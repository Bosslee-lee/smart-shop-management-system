// ============================================
// SHOPFLOW - AUTHENTICATION SERVICE
// ============================================

class AuthService {
    constructor() {
        this.token = localStorage.getItem('shopflow_token');
        this.user = JSON.parse(localStorage.getItem('shopflow_user') || 'null');
        this.shop = JSON.parse(localStorage.getItem('shopflow_shop') || 'null');
        this.isAuthenticated = !!this.token;
        this.role = localStorage.getItem('shopflow_role') || null;
    }

    // ============================================
    // OWNER REGISTER
    // ============================================
    async register(data) {
        try {
            const result = await API.auth.register(data);
            
            if (result.success) {
                this.setSession(result.token, result.user, result.shop, 'owner');
                return result;
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    // ============================================
    // OWNER LOGIN
    // ============================================
    async login(email, password) {
        try {
            const result = await API.auth.login(email, password);
            
            if (result.success) {
                this.setSession(result.token, result.user, result.shop, 'owner');
                return result;
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // ============================================
    // STAFF LOGIN
    // ============================================
    async staffLogin(shopName, staffId, pin) {
        try {
            const result = await API.auth.staffLogin(shopName, staffId, pin);
            
            if (result.success) {
                this.setSession(result.token, result.staff, result.shop, 'staff');
                return result;
            } else {
                throw new Error(result.message || 'Staff login failed');
            }
        } catch (error) {
            console.error('Staff login error:', error);
            throw error;
        }
    }

    // ============================================
    // SET SESSION
    // ============================================
    setSession(token, user, shop, role) {
        this.token = token;
        this.user = user;
        this.shop = shop;
        this.role = role;
        this.isAuthenticated = true;

        localStorage.setItem('shopflow_token', token);
        localStorage.setItem('shopflow_user', JSON.stringify(user));
        localStorage.setItem('shopflow_shop', JSON.stringify(shop));
        localStorage.setItem('shopflow_role', role);
        localStorage.setItem('shopflow_logged_in', 'true');

        // Connect to real-time if owner
        if (role === 'owner' && shop?.shopId) {
            connectRealtime(shop.shopId, token);
        }
    }

    // ============================================
    // GET CURRENT USER
    // ============================================
    getCurrentUser() {
        return this.user;
    }

    // ============================================
    // GET CURRENT SHOP
    // ============================================
    getCurrentShop() {
        return this.shop;
    }

    // ============================================
    // GET ROLE
    // ============================================
    getRole() {
        return this.role;
    }

    // ============================================
    // GET TOKEN
    // ============================================
    getToken() {
        return this.token;
    }

    // ============================================
    // VERIFY TOKEN
    // ============================================
    async verifyToken() {
        try {
            const result = await API.auth.verify();
            return result.success;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    // ============================================
    // CHANGE PASSWORD
    // ============================================
    async changePassword(currentPassword, newPassword) {
        try {
            const result = await API.auth.changePassword(currentPassword, newPassword);
            return result;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    // ============================================
    // LOGOUT
    // ============================================
    logout() {
        this.token = null;
        this.user = null;
        this.shop = null;
        this.role = null;
        this.isAuthenticated = false;

        localStorage.removeItem('shopflow_token');
        localStorage.removeItem('shopflow_user');
        localStorage.removeItem('shopflow_shop');
        localStorage.removeItem('shopflow_role');
        localStorage.removeItem('shopflow_logged_in');

        // Disconnect real-time
        disconnectRealtime();

        // Redirect to login
        window.location.href = '/pages/login.html';
    }

    // ============================================
    // CHECK IF AUTHENTICATED
    // ============================================
    isLoggedIn() {
        return this.isAuthenticated && !!this.token;
    }

    // ============================================
    // CHECK IF OWNER
    // ============================================
    isOwner() {
        return this.role === 'owner';
    }

    // ============================================
    // CHECK IF STAFF
    // ============================================
    isStaff() {
        return this.role === 'staff';
    }
}

// Create instance
const authService = new AuthService();

// Make globally available
window.authService = authService;