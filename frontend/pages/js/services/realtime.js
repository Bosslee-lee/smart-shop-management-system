// ============================================
// SHOPFLOW - REAL-TIME SERVICE (WebSocket)
// ============================================

let socket = null;
let isConnected = false;
let eventListeners = {};

// ============================================
// CONNECT TO WEBSOCKET
// ============================================
function connectRealtime(shopId, token) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('🔌 Already connected to real-time');
        return;
    }

    // Determine WebSocket URL
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsUrl = isDev ? 'ws://localhost:5000' : 'wss://api.shopflow.co.ke';

    try {
        socket = new WebSocket(`${wsUrl}?token=${token}`);

        socket.onopen = () => {
            isConnected = true;
            console.log('🔌 Connected to real-time server');
            
            // Join shop room
            socket.send(JSON.stringify({
                type: 'join',
                shopId: shopId
            }));

            // Trigger connect event
            triggerEvent('connect', { shopId });
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleRealtimeEvent(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.onclose = () => {
            isConnected = false;
            console.log('🔌 Disconnected from real-time server');
            triggerEvent('disconnect', {});
            
            // Auto-reconnect after 5 seconds
            setTimeout(() => {
                if (shopId && token) {
                    console.log('🔄 Attempting to reconnect...');
                    connectRealtime(shopId, token);
                }
            }, 5000);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
    }
}

// ============================================
// HANDLE REAL-TIME EVENTS
// ============================================
function handleRealtimeEvent(data) {
    const { type, ...payload } = data;
    
    console.log('📨 Real-time event:', type, payload);

    switch (type) {
        case 'new-sale':
            triggerEvent('newSale', payload);
            showToast(`💰 ${payload.message}`, 'success');
            break;

        case 'stats-updated':
            triggerEvent('statsUpdated', payload);
            break;

        case 'stock-updated':
            triggerEvent('stockUpdated', payload);
            break;

        case 'low-stock-alert':
            triggerEvent('lowStockAlert', payload);
            showToast(`⚠️ ${payload.message}`, 'warning');
            break;

        case 'product-added':
            triggerEvent('productAdded', payload);
            showToast(`📦 ${payload.message}`, 'success');
            break;

        case 'product-updated':
            triggerEvent('productUpdated', payload);
            showToast(`✏️ ${payload.message}`, 'info');
            break;

        case 'product-deleted':
            triggerEvent('productDeleted', payload);
            showToast(`🗑️ ${payload.message}`, 'info');
            break;

        case 'staff-added':
            triggerEvent('staffAdded', payload);
            showToast(`👥 ${payload.message}`, 'success');
            break;

        case 'staff-blocked':
            triggerEvent('staffBlocked', payload);
            showToast(`🔒 ${payload.message}`, 'warning');
            break;

        case 'staff-unblocked':
            triggerEvent('staffUnblocked', payload);
            showToast(`🔓 ${payload.message}`, 'success');
            break;

        case 'new-announcement':
            triggerEvent('newAnnouncement', payload);
            showToast(`📢 ${payload.message}`, 'info');
            break;

        case 'flash-sale-created':
            triggerEvent('flashSaleCreated', payload);
            showToast(`⚡ ${payload.message}`, 'success');
            break;

        case 'flash-sale-updated':
            triggerEvent('flashSaleUpdated', payload);
            showToast(`⚡ ${payload.message}`, 'info');
            break;

        case 'subscription-updated':
            triggerEvent('subscriptionUpdated', payload);
            showToast(`💳 ${payload.message}`, 'success');
            break;

        case 'activity-updated':
            triggerEvent('activityUpdated', payload);
            break;

        default:
            console.log('Unknown event type:', type, payload);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function onEvent(event, callback) {
    if (!eventListeners[event]) {
        eventListeners[event] = [];
    }
    eventListeners[event].push(callback);
}

function triggerEvent(event, data) {
    if (eventListeners[event]) {
        eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
}

function removeEventListener(event, callback) {
    if (eventListeners[event]) {
        eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
    }
}

// ============================================
// DISCONNECT
// ============================================
function disconnectRealtime() {
    if (socket) {
        socket.close();
        socket = null;
        isConnected = false;
    }
}

// ============================================
// SEND MESSAGE
// ============================================
function sendRealtimeMessage(type, data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, ...data }));
    } else {
        console.warn('WebSocket not connected. Message not sent.');
    }
}

// ============================================
// TOAST HELPER
// ============================================
function showToast(message, type = 'success') {
    // Check if toast function exists from dashboard.js
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Simple alert fallback for critical messages
        if (type === 'error' || type === 'warning') {
            alert(message);
        }
    }
}

// ============================================
// EXPOSE GLOBALLY
// ============================================
window.connectRealtime = connectRealtime;
window.disconnectRealtime = disconnectRealtime;
window.onEvent = onEvent;
window.triggerEvent = triggerEvent;
window.removeEventListener = removeEventListener;
window.sendRealtimeMessage = sendRealtimeMessage;
window.showToast = showToast;