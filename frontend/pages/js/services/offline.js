// ============================================
// SHOPFLOW - OFFLINE STORAGE SERVICE (IndexedDB)
// ============================================

class OfflineService {
    constructor() {
        this.dbName = 'ShopFlowDB';
        this.dbVersion = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.pendingSync = [];

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Initialize database
        this.init();
    }

    // ============================================
    // INITIALIZE INDEXEDDB
    // ============================================
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'productId' });
                }
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'saleId' });
                    salesStore.createIndex('shopId', 'shopId', { unique: false });
                    salesStore.createIndex('synced', 'isSynced', { unique: false });
                }
                if (!db.objectStoreNames.contains('staff')) {
                    db.createObjectStore('staff', { keyPath: 'staffId' });
                }
                if (!db.objectStoreNames.contains('pendingSync')) {
                    const syncStore = db.createObjectStore('pendingSync', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    syncStore.createIndex('collection', 'collection', { unique: false });
                    syncStore.createIndex('synced', 'synced', { unique: false });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('💾 IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('❌ IndexedDB initialization failed:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // ============================================
    // SAVE DATA LOCALLY
    // ============================================
    async save(storeName, data) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                console.log(`💾 Saved to ${storeName}:`, data);
                resolve(data);
            };

            request.onerror = () => {
                console.error(`❌ Failed to save to ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    // ============================================
    // GET DATA LOCALLY
    // ============================================
    async get(storeName, key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // GET ALL DATA FROM STORE
    // ============================================
    async getAll(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // DELETE DATA
    // ============================================
    async delete(storeName, key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // CLEAR STORE
    // ============================================
    async clear(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // ============================================
    // QUEUE FOR SYNC
    // ============================================
    async queueForSync(collection, data) {
        const syncItem = {
            collection: collection,
            data: data,
            timestamp: new Date().toISOString(),
            synced: false
        };
        await this.save('pendingSync', syncItem);
        console.log(`📤 Queued for sync: ${collection}`);
        this.pendingSync.push(syncItem);
        
        // Try to sync immediately if online
        if (this.isOnline) {
            this.syncPending();
        }
    }

    // ============================================
    // SYNC PENDING DATA
    // ============================================
    async syncPending() {
        if (!this.isOnline) {
            console.log('📡 Offline - skipping sync');
            return;
        }

        if (!this.db) await this.init();

        const pending = await this.getAll('pendingSync');
        const unsynced = pending.filter(item => !item.synced);

        if (unsynced.length === 0) {
            console.log('✅ No pending items to sync');
            return;
        }

        console.log(`🔄 Syncing ${unsynced.length} items...`);

        for (const item of unsynced) {
            try {
                // Determine which API endpoint to use
                let endpoint = '';
                let method = 'POST';
                let data = item.data;

                switch (item.collection) {
                    case 'sales':
                        endpoint = '/api/sales';
                        break;
                    case 'products':
                        endpoint = '/api/products';
                        break;
                    case 'staff':
                        endpoint = '/api/staff';
                        break;
                    default:
                        console.warn('Unknown collection:', item.collection);
                        continue;
                }

                const response = await fetch(`${API.baseURL}${endpoint}`, {
                    method: method,
                    headers: API.getHeaders(),
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // Mark as synced
                    item.synced = true;
                    await this.save('pendingSync', item);
                    console.log(`✅ Synced: ${item.collection} - ${data.id || data.name || 'item'}`);
                } else {
                    console.error(`❌ Sync failed for ${item.collection}:`, response.status);
                }

            } catch (error) {
                console.error(`❌ Sync error for ${item.collection}:`, error);
            }
        }

        // Clean up synced items
        await this.cleanupSynced();
    }

    // ============================================
    // CLEANUP SYNCED ITEMS
    // ============================================
    async cleanupSynced() {
        if (!this.db) await this.init();

        const pending = await this.getAll('pendingSync');
        const synced = pending.filter(item => item.synced);

        for (const item of synced) {
            await this.delete('pendingSync', item.id);
        }

        console.log(`🧹 Cleaned up ${synced.length} synced items`);
    }

    // ============================================
    // HANDLE ONLINE
    // ============================================
    handleOnline() {
        this.isOnline = true;
        console.log('📶 Back online - syncing data...');
        showToast('📶 Back online! Syncing data...', 'info');
        this.syncPending();
    }

    // ============================================
    // HANDLE OFFLINE
    // ============================================
    handleOffline() {
        this.isOnline = false;
        console.log('📡 Offline mode - data saved locally');
        showToast('📡 Offline mode - data saved locally', 'info');
    }

    // ============================================
    // GET SYNC STATUS
    // ============================================
    async getSyncStatus() {
        const pending = await this.getAll('pendingSync');
        const unsynced = pending.filter(item => !item.synced);
        return {
            total: pending.length,
            unsynced: unsynced.length,
            isOnline: this.isOnline,
            isSynced: unsynced.length === 0
        };
    }

    // ============================================
    // EXPORT DATA
    // ============================================
    async exportData() {
        const stores = ['products', 'sales', 'staff', 'settings'];
        const data = {};

        for (const store of stores) {
            data[store] = await this.getAll(store);
        }

        return data;
    }

    // ============================================
    // CLEAR ALL DATA
    // ============================================
    async clearAllData() {
        const stores = ['products', 'sales', 'staff', 'pendingSync', 'settings'];
        for (const store of stores) {
            await this.clear(store);
        }
        console.log('🗑️ All offline data cleared');
    }
}

// Create instance
const offlineService = new OfflineService();

// Make globally available
window.offlineService = offlineService;