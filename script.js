// Social Wallet API Configuration
const API_BASE = 'https://squid-app-mky7a.ondigitalocean.app';

// Global State
let currentUser = null;
let currentScreen = 'dashboard';
let mediaItems = [];
let giftCatalog = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
});

function initializeApp() {
    // Check if user is already authenticated
    const savedUser = localStorage.getItem('socialWalletUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAuthenticatedView();
    } else {
        showAuthenticationScreen();
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            switchScreen(page);
        });
    });

    // Upload area
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Modal close on background click
    document.getElementById('upload-modal').addEventListener('click', (e) => {
        if (e.target.id === 'upload-modal') {
            closeUploadModal();
        }
    });
}

// Authentication Functions
async function authenticateWithSocialWallet() {
    showLoading('Connecting to Social Wallet API...');
    
    try {
        // Simulate OAuth flow - in real app, this would redirect to Social Wallet
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test API connection
        const response = await fetch(`${API_BASE}/health`);
        const healthData = await response.json();
        
        if (healthData.status === 'OK') {
            // Simulate successful authentication
            currentUser = {
                id: 'usr_' + Math.random().toString(36).substr(2, 9),
                username: 'demo_user',
                displayName: 'Demo User',
                email: 'demo@socialwallet.com',
                profileImage: 'https://via.placeholder.com/150?text=Demo',
                bio: 'Social Wallet demo user',
                verified: true,
                joinDate: new Date().toISOString()
            };
            
            localStorage.setItem('socialWalletUser', JSON.stringify(currentUser));
            showAuthenticatedView();
            showToast('Successfully connected to Social Wallet!', 'success');
        } else {
            throw new Error('API health check failed');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showToast('Failed to connect to Social Wallet API', 'error');
    } finally {
        hideLoading();
    }
}

function loginAsGuest() {
    currentUser = {
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        username: 'guest_user',
        displayName: 'Guest User',
        email: 'guest@example.com',
        profileImage: 'https://via.placeholder.com/150?text=Guest',
        bio: 'Exploring Social Wallet as a guest',
        verified: false,
        joinDate: new Date().toISOString()
    };
    
    showAuthenticatedView();
    showToast('Welcome, Guest User!', 'success');
}

function logout() {
    localStorage.removeItem('socialWalletUser');
    currentUser = null;
    document.body.classList.remove('authenticated');
    showAuthenticationScreen();
    showToast('Logged out successfully', 'success');
}

function showAuthenticationScreen() {
    document.getElementById('auth-screen').classList.add('active');
    document.querySelectorAll('.screen:not(#auth-screen)').forEach(screen => {
        screen.classList.remove('active');
    });
    document.body.classList.remove('authenticated');
}

function showAuthenticatedView() {
    document.body.classList.add('authenticated');
    document.getElementById('auth-screen').classList.remove('active');
    
    // Update user info in header
    document.querySelector('.username').textContent = currentUser.displayName;
    
    // Load user data into forms
    loadUserProfile();
    
    // Switch to dashboard
    switchScreen('dashboard');
}

// Screen Navigation
function switchScreen(screenName) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${screenName}"]`).classList.add('active');
    
    // Update active screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}-screen`).classList.add('active');
    
    currentScreen = screenName;
    
    // Load screen-specific data
    switch(screenName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'profile':
            loadUserProfile();
            break;
        case 'media':
            loadMediaLibrary();
            break;
        case 'gifts':
            loadGiftCenter();
            break;
    }
}

// Dashboard Functions
function loadDashboardData() {
    // Update stats
    document.getElementById('connected-platforms').textContent = '3';
    document.getElementById('total-media').textContent = mediaItems.length;
    document.getElementById('gifts-received').textContent = '25';
    document.getElementById('wallet-balance').textContent = '1,250';
    
    // Load recent activity
    const activities = [
        {
            type: 'upload',
            icon: 'fas fa-upload',
            title: 'Uploaded new photo',
            description: 'Added "Sunset at the beach" to media library',
            time: '2 hours ago'
        },
        {
            type: 'gift',
            icon: 'fas fa-gift',
            title: 'Received a diamond',
            description: 'From @jane_doe on TikTok',
            time: '4 hours ago'
        },
        {
            type: 'profile',
            icon: 'fas fa-user',
            title: 'Updated profile',
            description: 'Changed bio and location information',
            time: '1 day ago'
        }
    ];
    
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Profile Functions
function loadUserProfile() {
    if (!currentUser) return;
    
    document.getElementById('display-name').value = currentUser.displayName || '';
    document.getElementById('username').value = currentUser.username || '';
    document.getElementById('bio').value = currentUser.bio || '';
    document.getElementById('location').value = currentUser.location || '';
    document.getElementById('website').value = currentUser.website || '';
}

async function saveProfile() {
    const profileData = {
        displayName: document.getElementById('display-name').value,
        username: document.getElementById('username').value,
        bio: document.getElementById('bio').value,
        location: document.getElementById('location').value,
        website: document.getElementById('website').value
    };
    
    showLoading('Saving profile...');
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update current user
        Object.assign(currentUser, profileData);
        localStorage.setItem('socialWalletUser', JSON.stringify(currentUser));
        
        // Update header
        document.querySelector('.username').textContent = currentUser.displayName;
        
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Profile save error:', error);
        showToast('Failed to save profile', 'error');
    } finally {
        hideLoading();
    }
}

// Media Functions
function loadMediaLibrary() {
    const mediaGrid = document.getElementById('media-grid');
    
    if (mediaItems.length === 0) {
        mediaGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-images" style="font-size: 48px; color: #ddd; margin-bottom: 16px;"></i>
                <p style="color: #666;">No media items yet. Click "Add Media" to get started!</p>
            </div>
        `;
        return;
    }
    
    mediaGrid.innerHTML = mediaItems.map(item => `
        <div class="media-item" onclick="viewMediaItem('${item.id}')">
            <img src="${item.url}" alt="${item.caption}" loading="lazy">
            <div class="media-overlay">
                <div>${item.caption}</div>
            </div>
        </div>
    `).join('');
}

function openUploadModal() {
    document.getElementById('upload-modal').classList.add('active');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.remove('active');
    
    // Reset form
    document.getElementById('file-input').value = '';
    document.getElementById('media-caption').value = '';
    document.getElementById('media-tags').value = '';
    
    // Reset upload area
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('dragover');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
        showToast('Some files were skipped (unsupported format)', 'warning');
    }
    
    if (validFiles.length === 0) {
        showToast('No valid files selected', 'error');
        return;
    }
    
    // Preview files (for demo purposes)
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update upload area to show preview
            const uploadArea = document.getElementById('upload-area');
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                <p>${validFiles.length} file(s) ready to upload</p>
                <p style="font-size: 12px; color: #666;">${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    });
}

async function uploadMedia() {
    const files = document.getElementById('file-input').files;
    const caption = document.getElementById('media-caption').value;
    const tags = document.getElementById('media-tags').value;
    
    if (files.length === 0) {
        showToast('Please select files to upload', 'error');
        return;
    }
    
    showLoading('Uploading media...');
    
    try {
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create media items
        Array.from(files).forEach(file => {
            const mediaItem = {
                id: 'media_' + Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                caption: caption || file.name,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                uploadDate: new Date().toISOString(),
                fileSize: file.size,
                fileType: file.type
            };
            
            mediaItems.push(mediaItem);
        });
        
        closeUploadModal();
        loadMediaLibrary();
        showToast(`Successfully uploaded ${files.length} file(s)!`, 'success');
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Failed to upload media', 'error');
    } finally {
        hideLoading();
    }
}

function viewMediaItem(itemId) {
    const item = mediaItems.find(m => m.id === itemId);
    if (item) {
        // For demo, just show an alert
        alert(`Viewing: ${item.caption}\nUploaded: ${new Date(item.uploadDate).toLocaleDateString()}`);
    }
}

// Gift Functions
function loadGiftCenter() {
    // Update balance
    document.getElementById('current-balance').textContent = '1,250 coins';
    
    // Load gift catalog
    const giftCatalogEl = document.getElementById('gift-catalog');
    giftCatalogEl.innerHTML = giftCatalog.map(gift => `
        <div class="gift-item" onclick="sendGift('${gift.id}')">
            <i class="${gift.icon}"></i>
            <h4>${gift.name}</h4>
            <div class="price">${gift.price} coins</div>
        </div>
    `).join('');
    
    // Load gift history
    const giftHistory = [
        {
            type: 'received',
            gift: 'Diamond',
            from: '@jane_doe',
            platform: 'TikTok',
            time: '2 hours ago',
            value: '500 coins'
        },
        {
            type: 'sent',
            gift: 'Rose',
            to: '@mike_smith',
            platform: 'Instagram',
            time: '1 day ago',
            value: '50 coins'
        }
    ];
    
    const giftHistoryEl = document.getElementById('gift-history');
    giftHistoryEl.innerHTML = giftHistory.map(item => `
        <div class="gift-history-item">
            <i class="fas fa-gift" style="color: #667eea;"></i>
            <div style="flex: 1;">
                <h4>${item.type === 'received' ? 'Received' : 'Sent'} ${item.gift}</h4>
                <p>${item.type === 'received' ? 'From' : 'To'} ${item.type === 'received' ? item.from : item.to} on ${item.platform}</p>
            </div>
            <div style="text-align: right;">
                <div>${item.value}</div>
                <div style="font-size: 12px; color: #666;">${item.time}</div>
            </div>
        </div>
    `).join('');
}

function sendGift(giftId) {
    const gift = giftCatalog.find(g => g.id === giftId);
    if (gift) {
        // For demo, just show confirmation
        if (confirm(`Send ${gift.name} (${gift.price} coins)?`)) {
            showToast(`${gift.name} sent successfully!`, 'success');
        }
    }
}

// Utility Functions
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Sample Data
function loadSampleData() {
    // Gift catalog
    giftCatalog = [
        { id: 'heart', name: 'Heart', icon: 'fas fa-heart', price: 10 },
        { id: 'rose', name: 'Rose', icon: 'fas fa-rose', price: 50 },
        { id: 'diamond', name: 'Diamond', icon: 'far fa-gem', price: 500 },
        { id: 'crown', name: 'Crown', icon: 'fas fa-crown', price: 1000 },
        { id: 'rocket', name: 'Rocket', icon: 'fas fa-rocket', price: 200 },
        { id: 'star', name: 'Star', icon: 'fas fa-star', price: 100 }
    ];
    
    // Sample media items (for demo)
    mediaItems = [
        {
            id: 'sample1',
            url: 'https://via.placeholder.com/400x400?text=Photo+1',
            caption: 'Beautiful sunset',
            tags: ['sunset', 'nature'],
            uploadDate: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'sample2',
            url: 'https://via.placeholder.com/400x400?text=Photo+2',
            caption: 'City lights',
            tags: ['city', 'night'],
            uploadDate: new Date(Date.now() - 172800000).toISOString()
        }
    ];
}

// API Testing Function
async function testSocialWalletAPI() {
    try {
        console.log('Testing Social Wallet API...');
        
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        const apiResponse = await fetch(API_BASE);
        const apiData = await apiResponse.json();
        console.log('API info:', apiData);
        
        return true;
    } catch (error) {
        console.error('API test failed:', error);
        return false;
    }
}