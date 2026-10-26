// ============================================
// SHOPFLOW BACKEND - COMPLETE SERVER
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    pingTimeout: 60000
});

// ============================================
// MIDDLEWARE
// ============================================
// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting (prevent abuse)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
})
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});

// ============================================
// MODELS (Schemas)
// ============================================

// ----- User Model -----
const UserSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'USR-' + Date.now().toString().slice(-8)
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    shopId: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin'], default: 'owner' },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// ----- Shop Model -----
const ShopSchema = new mongoose.Schema({
    shopId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'SHP-' + Date.now().toString().slice(-8)
    },
    shopName: { type: String, required: true, trim: true },
    shopType: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    logo: { type: String, default: null },
    categories: { type: [String], default: [] },
    ownerId: { type: String, required: true },
    subscriptionPlan: { 
        type: String, 
        enum: ['starter', 'business', 'premium', 'enterprise'], 
        default: 'starter' 
    },
    subscriptionExpiry: { type: Date, default: null },
    trialEnds: { 
        type: Date, 
        default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Shop = mongoose.model('Shop', ShopSchema);

// ----- Product Model -----
const ProductSchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'PROD-' + Date.now().toString().slice(-8)
    },
    shopId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: null },
    barcode: { type: String, default: '' },
    lowStockThreshold: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// ----- Staff Model -----
const StaffSchema = new mongoose.Schema({
    staffId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'STF-' + Date.now().toString().slice(-8)
    },
    shopId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: '', lowercase: true },
    pin: { type: String, required: true },
    deviceId: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['active', 'blocked', 'pending'], 
        default: 'pending' 
    },
    role: { 
        type: String, 
        enum: ['staff', 'supervisor'], 
        default: 'staff' 
    },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null }
});
const Staff = mongoose.model('Staff', StaffSchema);

// ----- Sale Model -----
const SaleSchema = new mongoose.Schema({
    saleId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'SALE-' + Date.now().toString().slice(-8)
    },
    shopId: { type: String, required: true, index: true },
    receiptNumber: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'RCP-' + Date.now().toString().slice(-8)
    },
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { 
        type: String, 
        enum: ['mpesa', 'cash', 'card'], 
        required: true 
    },
    paymentReference: { type: String, default: '' },
    staffId: { type: String, default: null },
    staffName: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'refunded'], 
        default: 'completed' 
    },
    isSynced: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

// ----- Announcement Model -----
const AnnouncementSchema = new mongoose.Schema({
    announcementId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'ANN-' + Date.now().toString().slice(-8)
    },
    shopId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { 
        type: String, 
        enum: ['normal', 'important', 'urgent'], 
        default: 'normal' 
    },
    target: { 
        type: String, 
        enum: ['all', 'active', 'specific'], 
        default: 'all' 
    },
    targetStaff: { type: [String], default: [] },
    requireAck: { type: Boolean, default: false },
    readBy: { type: [String], default: [] },
    acknowledgedBy: { type: [String], default: [] },
    responses: [{
        staffId: { type: String, required: true },
        staffName: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'Owner' }
});
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// ----- Flash Sale Model -----
const FlashSaleSchema = new mongoose.Schema({
    flashSaleId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => 'FS-' + Date.now().toString().slice(-8)
    },
    shopId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    discount: { type: Number, required: true, min: 1, max: 90 },
    stockLimit: { type: Number, default: 999 },
    sold: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['upcoming', 'active', 'ended', 'paused'], 
        default: 'upcoming' 
    },
    reason: { 
        type: String, 
        enum: ['clear_stock', 'promotion', 'seasonal', 'new_product', 'holiday', 'other'],
        default: 'promotion' 
    },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'Owner' }
});
const FlashSale = mongoose.model('FlashSale', FlashSaleSchema);

// ============================================
// AUTHENTICATION HELPERS
// ============================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, shopId, role) => {
    return jwt.sign(
        { userId, shopId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// ============================================
// AUTH MIDDLEWARE
// ============================================
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }

        if (decoded.role === 'owner') {
            const user = await User.findOne({ userId: decoded.userId });
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            req.userId = decoded.userId;
            req.shopId = decoded.shopId;
            req.role = 'owner';
        } else if (decoded.role === 'staff') {
            const staff = await Staff.findOne({ staffId: decoded.userId });
            if (!staff || staff.status === 'blocked') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Staff not found or blocked' 
                });
            }
            req.userId = decoded.userId;
            req.shopId = decoded.shopId;
            req.role = 'staff';
            req.staffName = staff.name;
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid role' 
            });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

// ============================================
// API ROUTES
// ============================================

// ----- Health Check -----
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ----- Test Route -----
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '🚀 ShopFlow Backend is running!',
        version: '1.0.0',
        time: new Date().toISOString()
    });
});

// ============================================
// AUTH ROUTES
// ============================================

// Owner Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { 
            shopName, shopType, location, phone, 
            ownerName, ownerEmail, ownerPhone, 
            password, categories, plan 
        } = req.body;

        // Validate
        if (!shopName || !shopType || !location || !phone || 
            !ownerName || !ownerEmail || !ownerPhone || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check existing
        const existingUser = await User.findOne({ 
            $or: [{ email: ownerEmail }, { phone: ownerPhone }] 
        });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        const existingShop = await Shop.findOne({ phone: phone });
        if (existingShop) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shop already exists' 
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create User
        const user = new User({
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
            password: hashedPassword,
            role: 'owner',
            isVerified: true
        });
        await user.save();

        // Create Shop
        const shop = new Shop({
            shopName: shopName,
            shopType: shopType,
            location: location,
            phone: phone,
            categories: categories || [],
            ownerId: user.userId,
            subscriptionPlan: plan || 'starter',
            trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
        await shop.save();

        // Update user with shopId
        user.shopId = shop.shopId;
        await user.save();

        const token = generateToken(user.userId, shop.shopId, 'owner');

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token: token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            shop: {
                shopId: shop.shopId,
                shopName: shop.shopName,
                shopType: shop.shopType,
                location: shop.location,
                phone: shop.phone,
                categories: shop.categories,
                plan: shop.subscriptionPlan,
                trialEnds: shop.trialEnds
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Owner Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password required' 
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const shop = await Shop.findOne({ shopId: user.shopId });
        if (!shop || !shop.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Shop not found or deactivated' 
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user.userId, shop.shopId, 'owner');

        res.json({
            success: true,
            message: 'Login successful!',
            token: token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            shop: {
                shopId: shop.shopId,
                shopName: shop.shopName,
                shopType: shop.shopType,
                location: shop.location,
                phone: shop.phone,
                categories: shop.categories,
                plan: shop.subscriptionPlan,
                trialEnds: shop.trialEnds
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Staff Login
app.post('/api/auth/staff-login', async (req, res) => {
    try {
        const { shopName, staffId, pin } = req.body;

        if (!shopName || !staffId || !pin) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields required' 
            });
        }

        const shop = await Shop.findOne({ shopName: shopName });
        if (!shop) {
            return res.status(404).json({ 
                success: false, 
                message: 'Shop not found' 
            });
        }

        const staff = await Staff.findOne({ 
            shopId: shop.shopId, 
            staffId: staffId 
        });
        if (!staff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff not found' 
            });
        }

        if (staff.status === 'blocked') {
            return res.status(403).json({ 
                success: false, 
                message: 'Staff account is blocked' 
            });
        }

        // In production, compare hashed PIN
        if (staff.pin !== pin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid PIN' 
            });
        }

        staff.lastLogin = new Date();
        await staff.save();

        const token = generateToken(staff.staffId, shop.shopId, 'staff');

        res.json({
            success: true,
            message: 'Login successful!',
            token: token,
            staff: {
                staffId: staff.staffId,
                name: staff.name,
                phone: staff.phone,
                role: staff.role,
                status: staff.status
            },
            shop: {
                shopId: shop.shopId,
                shopName: shop.shopName
            }
        });

    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Verify Token
app.get('/api/auth/verify', auth, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.userId });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const shop = await Shop.findOne({ shopId: req.shopId });

        res.json({
            success: true,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            shop: shop ? {
                shopId: shop.shopId,
                shopName: shop.shopName,
                plan: shop.subscriptionPlan
            } : null
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Change Password
app.put('/api/auth/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current and new password required' 
            });
        }

        const user = await User.findOne({ userId: req.userId });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// PRODUCT ROUTES
// ============================================

// Get all products
app.get('/api/products', auth, async (req, res) => {
    try {
        const { category, search, lowStock } = req.query;
        const query = { shopId: req.shopId, isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (lowStock === 'true') {
            query.stock = { $lt: 10, $gt: 0 };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products: products
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get single product
app.get('/api/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOne({ 
            productId: req.params.id, 
            shopId: req.shopId 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.json({
            success: true,
            product: product
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Add product
app.post('/api/products', auth, async (req, res) => {
    try {
        const { name, price, cost, stock, category, description, image, barcode } = req.body;

        if (!name || !price || stock === undefined || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, price, stock and category are required' 
            });
        }

        const product = new Product({
            shopId: req.shopId,
            name: name,
            price: price,
            cost: cost || 0,
            stock: stock,
            category: category,
            description: description || '',
            image: image || null,
            barcode: barcode || ''
        });

        await product.save();

        // Emit real-time event
        io.to(`shop-${req.shopId}`).emit('product-added', {
            product: product,
            message: `📦 New product: ${product.name} added`
        });

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product: product
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Update product
app.put('/api/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOne({ 
            productId: req.params.id, 
            shopId: req.shopId 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        const updates = req.body;
        const allowedUpdates = ['name', 'price', 'cost', 'stock', 'category', 'description', 'image', 'barcode', 'isActive'];
        
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                product[field] = updates[field];
            }
        });

        product.updatedAt = new Date();
        await product.save();

        io.to(`shop-${req.shopId}`).emit('product-updated', {
            product: product,
            message: `✏️ Product updated: ${product.name}`
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: product
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete product (soft delete)
app.delete('/api/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOne({ 
            productId: req.params.id, 
            shopId: req.shopId 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        product.isActive = false;
        await product.save();

        io.to(`shop-${req.shopId}`).emit('product-deleted', {
            productId: product.productId,
            message: `🗑️ Product deleted: ${product.name}`
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Stock in
app.post('/api/products/:id/stock-in', auth, async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid quantity required' 
            });
        }

        const product = await Product.findOne({ 
            productId: req.params.id, 
            shopId: req.shopId 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        const oldStock = product.stock;
        product.stock += quantity;
        await product.save();

        io.to(`shop-${req.shopId}`).emit('stock-updated', {
            product: product,
            oldStock: oldStock,
            newStock: product.stock,
            message: `📦 Stock in: ${product.name} (+${quantity})`
        });

        if (product.stock < product.lowStockThreshold) {
            io.to(`shop-${req.shopId}`).emit('low-stock-alert', {
                product: product,
                message: `⚠️ ${product.name} is running low (${product.stock} left)`
            });
        }

        res.json({
            success: true,
            message: 'Stock added successfully',
            product: product
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// STAFF ROUTES
// ============================================

// Get all staff
app.get('/api/staff', auth, async (req, res) => {
    try {
        const staff = await Staff.find({ shopId: req.shopId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: staff.length,
            staff: staff
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Add staff
app.post('/api/staff', auth, async (req, res) => {
    try {
        const { name, phone, email, pin, role } = req.body;

        if (!name || !phone || !pin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, phone and PIN required' 
            });
        }

        // Check staff limit based on subscription
        const shop = await Shop.findOne({ shopId: req.shopId });
        if (!shop) {
            return res.status(404).json({ 
                success: false, 
                message: 'Shop not found' 
            });
        }

        const staffCount = await Staff.countDocuments({ shopId: req.shopId, status: 'active' });
        const limits = { starter: 3, business: 5, premium: 10, enterprise: 999 };
        const limit = limits[shop.subscriptionPlan] || 3;

        if (staffCount >= limit) {
            return res.status(403).json({ 
                success: false, 
                message: `Staff limit reached (${limit}). Upgrade your plan.` 
            });
        }

        const staff = new Staff({
            shopId: req.shopId,
            name: name,
            phone: phone,
            email: email || '',
            pin: pin,
            role: role || 'staff',
            status: 'active'
        });

        await staff.save();

        io.to(`shop-${req.shopId}`).emit('staff-added', {
            staff: staff,
            message: `👥 New staff: ${staff.name} added`
        });

        res.status(201).json({
            success: true,
            message: 'Staff added successfully',
            staff: staff
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Update staff
app.put('/api/staff/:id', auth, async (req, res) => {
    try {
        const staff = await Staff.findOne({ 
            staffId: req.params.id, 
            shopId: req.shopId 
        });

        if (!staff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff not found' 
            });
        }

        const { name, phone, email, role, pin } = req.body;

        if (name) staff.name = name;
        if (phone) staff.phone = phone;
        if (email !== undefined) staff.email = email;
        if (role) staff.role = role;
        if (pin) staff.pin = pin;

        staff.updatedAt = new Date();
        await staff.save();

        res.json({
            success: true,
            message: 'Staff updated successfully',
            staff: staff
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Block staff
app.put('/api/staff/:id/block', auth, async (req, res) => {
    try {
        const staff = await Staff.findOne({ 
            staffId: req.params.id, 
            shopId: req.shopId 
        });

        if (!staff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff not found' 
            });
        }

        staff.status = 'blocked';
        await staff.save();

        io.to(`shop-${req.shopId}`).emit('staff-blocked', {
            staffId: staff.staffId,
            name: staff.name,
            message: `🔒 Staff blocked: ${staff.name}`
        });

        res.json({
            success: true,
            message: 'Staff blocked successfully',
            staff: staff
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Unblock staff
app.put('/api/staff/:id/unblock', auth, async (req, res) => {
    try {
        const staff = await Staff.findOne({ 
            staffId: req.params.id, 
            shopId: req.shopId 
        });

        if (!staff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff not found' 
            });
        }

        staff.status = 'active';
        await staff.save();

        io.to(`shop-${req.shopId}`).emit('staff-unblocked', {
            staffId: staff.staffId,
            name: staff.name,
            message: `🔓 Staff unblocked: ${staff.name}`
        });

        res.json({
            success: true,
            message: 'Staff unblocked successfully',
            staff: staff
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete staff
app.delete('/api/staff/:id', auth, async (req, res) => {
    try {
        const staff = await Staff.findOne({ 
            staffId: req.params.id, 
            shopId: req.shopId 
        });

        if (!staff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff not found' 
            });
        }

        await staff.deleteOne();

        io.to(`shop-${req.shopId}`).emit('staff-deleted', {
            staffId: staff.staffId,
            name: staff.name,
            message: `🗑️ Staff removed: ${staff.name}`
        });

        res.json({
            success: true,
            message: 'Staff deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// SALES ROUTES
// ============================================

// Record sale
app.post('/api/sales', auth, async (req, res) => {
    try {
        const { items, subtotal, discount, totalAmount, paymentMethod, paymentReference, customerName, customerPhone } = req.body;

        if (!items || items.length === 0 || !totalAmount || !paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Items, total amount and payment method required' 
            });
        }

        const shopId = req.shopId;

        // Create sale
        const sale = new Sale({
            shopId: shopId,
            items: items,
            subtotal: subtotal || items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
            discount: discount || 0,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            paymentReference: paymentReference || '',
            staffId: req.role === 'staff' ? req.userId : null,
            staffName: req.role === 'staff' ? req.staffName : 'Owner',
            customerName: customerName || '',
            customerPhone: customerPhone || '',
            status: 'completed',
            isSynced: true
        });

        await sale.save();

        // Update product stock
        for (const item of items) {
            await Product.findOneAndUpdate(
                { productId: item.productId, shopId: shopId },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Get updated products
        const products = await Product.find({ shopId: shopId });
        
        // Check low stock
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 5);
        const outOfStock = products.filter(p => p.stock === 0);

        // Get today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = await Sale.find({
            shopId: shopId,
            createdAt: { $gte: today }
        });
        const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

        // Emit real-time events
        io.to(`shop-${shopId}`).emit('new-sale', {
            sale: sale,
            message: `💰 New sale: KSh ${totalAmount.toLocaleString()} by ${sale.staffName}`
        });

        io.to(`shop-${shopId}`).emit('stats-updated', {
            todaySales: todayTotal,
            totalOrders: todaySales.length,
            recentSales: todaySales.slice(-5).reverse()
        });

        io.to(`shop-${shopId}`).emit('stock-updated', {
            products: products
        });

        if (lowStock.length > 0 || outOfStock.length > 0) {
            io.to(`shop-${shopId}`).emit('low-stock-alert', {
                lowStock: lowStock,
                outOfStock: outOfStock,
                message: `⚠️ ${lowStock.length} products low, ${outOfStock.length} out of stock!`
            });
        }

        res.status(201).json({
            success: true,
            message: 'Sale recorded successfully',
            sale: sale
        });

    } catch (error) {
        console.error('Sale error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get sales
app.get('/api/sales', auth, async (req, res) => {
    try {
        const { period, limit } = req.query;
        const query = { shopId: req.shopId };

        if (period === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: today };
        } else if (period === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query.createdAt = { $gte: weekAgo };
        } else if (period === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query.createdAt = { $gte: monthAgo };
        }

        const sales = await Sale.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) || 100);

        // Get stats
        const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalOrders = sales.length;
        const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = await Sale.find({
            shopId: req.shopId,
            createdAt: { $gte: today }
        });
        const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

        res.json({
            success: true,
            sales: sales,
            stats: {
                totalSales: totalSales,
                totalOrders: totalOrders,
                avgOrder: avgOrder,
                todaySales: todayTotal,
                todayOrders: todaySales.length
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// SHOP ROUTES
// ============================================

// Get shop details
app.get('/api/shop', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopId: req.shopId });
        if (!shop) {
            return res.status(404).json({ 
                success: false, 
                message: 'Shop not found' 
            });
        }

        res.json({
            success: true,
            shop: shop
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Update shop
app.put('/api/shop', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopId: req.shopId });
        if (!shop) {
            return res.status(404).json({ 
                success: false, 
                message: 'Shop not found' 
            });
        }

        const updates = req.body;
        const allowedUpdates = ['shopName', 'shopType', 'location', 'phone', 'logo', 'categories'];
        
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                shop[field] = updates[field];
            }
        });

        shop.updatedAt = new Date();
        await shop.save();

        res.json({
            success: true,
            message: 'Shop updated successfully',
            shop: shop
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// ANNOUNCEMENT ROUTES
// ============================================

// Get announcements
app.get('/api/announcements', auth, async (req, res) => {
    try {
        const announcements = await Announcement.find({ 
            shopId: req.shopId, 
            archived: false 
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: announcements.length,
            announcements: announcements
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Add announcement
app.post('/api/announcements', auth, async (req, res) => {
    try {
        const { title, message, priority, target, targetStaff, requireAck } = req.body;

        if (!title || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and message required' 
            });
        }

        const announcement = new Announcement({
            shopId: req.shopId,
            title: title,
            message: message,
            priority: priority || 'normal',
            target: target || 'all',
            targetStaff: targetStaff || [],
            requireAck: requireAck || false,
            createdBy: 'Owner'
        });

        await announcement.save();

        io.to(`shop-${req.shopId}`).emit('new-announcement', {
            announcement: announcement,
            message: `📢 New announcement: ${announcement.title}`
        });

        res.status(201).json({
            success: true,
            message: 'Announcement posted successfully',
            announcement: announcement
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete announcement
app.delete('/api/announcements/:id', auth, async (req, res) => {
    try {
        const announcement = await Announcement.findOne({ 
            announcementId: req.params.id, 
            shopId: req.shopId 
        });

        if (!announcement) {
            return res.status(404).json({ 
                success: false, 
                message: 'Announcement not found' 
            });
        }

        announcement.archived = true;
        await announcement.save();

        res.json({
            success: true,
            message: 'Announcement archived'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// FLASH SALE ROUTES
// ============================================

// Get flash sales
app.get('/api/flashsales', auth, async (req, res) => {
    try {
        const flashSales = await FlashSale.find({ shopId: req.shopId })
            .sort({ createdAt: -1 });

        // Update statuses
        const now = new Date();
        flashSales.forEach(fs => {
            if (fs.status === 'paused') return;
            const start = new Date(fs.startDate);
            const end = new Date(fs.endDate);
            if (now < start) fs.status = 'upcoming';
            else if (now > end) fs.status = 'ended';
            else fs.status = 'active';
        });

        res.json({
            success: true,
            count: flashSales.length,
            flashSales: flashSales
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Add flash sale
app.post('/api/flashsales', auth, async (req, res) => {
    try {
        const { productId, productName, originalPrice, salePrice, discount, stockLimit, startDate, endDate, reason, notes } = req.body;

        if (!productId || !productName || !originalPrice || !salePrice || !discount || !startDate || !endDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be provided' 
            });
        }

        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let status = 'upcoming';
        if (now >= start && now <= end) status = 'active';
        else if (now > end) status = 'ended';

        const flashSale = new FlashSale({
            shopId: req.shopId,
            productId: productId,
            productName: productName,
            originalPrice: originalPrice,
            salePrice: salePrice,
            discount: discount,
            stockLimit: stockLimit || 999,
            startDate: startDate,
            endDate: endDate,
            status: status,
            reason: reason || 'promotion',
            notes: notes || '',
            createdBy: 'Owner'
        });

        await flashSale.save();

        io.to(`shop-${req.shopId}`).emit('flash-sale-created', {
            flashSale: flashSale,
            message: `⚡ Flash sale: ${flashSale.productName} at ${flashSale.discount}% off`
        });

        res.status(201).json({
            success: true,
            message: 'Flash sale created successfully',
            flashSale: flashSale
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Update flash sale
app.put('/api/flashsales/:id', auth, async (req, res) => {
    try {
        const flashSale = await FlashSale.findOne({ 
            flashSaleId: req.params.id, 
            shopId: req.shopId 
        });

        if (!flashSale) {
            return res.status(404).json({ 
                success: false, 
                message: 'Flash sale not found' 
            });
        }

        const { status, discount, salePrice, endDate, notes } = req.body;

        if (status) flashSale.status = status;
        if (discount) flashSale.discount = discount;
        if (salePrice) flashSale.salePrice = salePrice;
        if (endDate) flashSale.endDate = endDate;
        if (notes !== undefined) flashSale.notes = notes;

        await flashSale.save();

        io.to(`shop-${req.shopId}`).emit('flash-sale-updated', {
            flashSale: flashSale,
            message: `⚡ Flash sale updated: ${flashSale.productName}`
        });

        res.json({
            success: true,
            message: 'Flash sale updated successfully',
            flashSale: flashSale
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete flash sale
app.delete('/api/flashsales/:id', auth, async (req, res) => {
    try {
        const flashSale = await FlashSale.findOne({ 
            flashSaleId: req.params.id, 
            shopId: req.shopId 
        });

        if (!flashSale) {
            return res.status(404).json({ 
                success: false, 
                message: 'Flash sale not found' 
            });
        }

        await flashSale.deleteOne();

        io.to(`shop-${req.shopId}`).emit('flash-sale-deleted', {
            flashSaleId: flashSale.flashSaleId,
            message: `🗑️ Flash sale deleted: ${flashSale.productName}`
        });

        res.json({
            success: true,
            message: 'Flash sale deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

// Get current subscription
app.get('/api/subscription', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopId: req.shopId });
        if (!shop) {
            return res.status(404).json({ 
                success: false, 
                message: 'Shop not found' 
            });
        }

        const plans = {
            starter: { name: 'Starter', staff: 3, products: 500, price: 2500 },
            business: { name: 'Business', staff: 5, products: 2000, price: 3500 },
            premium: { name: 'Premium', staff: 10, products: 5000, price: 5500 },
            enterprise: { name: 'Enterprise', staff: 'Unlimited', products: 'Unlimited', price: 7500 }
        };

        const currentPlan = plans[shop.subscriptionPlan] || plans.starter;
        const isTrialActive = new Date(shop.trialEnds) > new Date();

        res.json({
            success: true,
            subscription: {
                plan: shop.subscriptionPlan,
                planDetails: currentPlan,
                trialEnds: shop.trialEnds,
                isTrialActive: isTrialActive,
                staffCount: await Staff.countDocuments({ shopId: req.shopId, status: 'active' }),
                productCount: await Product.countDocuments({ shopId: req.shopId, isActive: true })
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Upgrade subscription
app.put('/api/subscription/upgrade', auth, async (req, res) => {
    try {
        const { plan } = req.body;
        const validPlans = ['starter', 'business', 'premium', 'enterprise'];

        if (!plan || !validPlans.includes(plan)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid plan selected' 
            });
        }

        const shop = await Shop.findOne({ shopId: req.shopId });
        if (!shop) {
            return res.status(404).json({ 
                success: false, 
                message: 'Shop not found' 
            });
        }

        shop.subscriptionPlan = plan;
        shop.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await shop.save();

        io.to(`shop-${req.shopId}`).emit('subscription-updated', {
            plan: plan,
            message: `💳 Subscription upgraded to ${plan}`
        });

        res.json({
            success: true,
            message: `Subscription upgraded to ${plan} successfully`,
            plan: plan
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// WEBSOCKET EVENTS
// ============================================
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join-shop', (shopId) => {
        socket.join(`shop-${shopId}`);
        console.log(`📦 Client joined shop: ${shopId}`);
    });

    socket.on('leave-shop', (shopId) => {
        socket.leave(`shop-${shopId}`);
        console.log(`📦 Client left shop: ${shopId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📦 ShopFlow Backend Ready!`);
    console.log(`📋 Models: User, Shop, Product, Staff, Sale, Announcement, FlashSale`);
    console.log(`🔌 WebSocket: Real-time updates enabled`);
});

module.exports = { app, server, io };