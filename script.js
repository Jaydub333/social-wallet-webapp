// Social Wallet API Configuration
const API_BASE = 'https://squid-app-mky7a.ondigitalocean.app';

// Global State
let currentUser = null;
let currentScreen = 'dashboard';
let mediaItems = [];
let giftCatalog = [];
let socialPosts = [];
let trendingTopics = [];
let suggestedUsers = [];

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
    
    // Switch to feed (main social media screen)
    switchScreen('feed');
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
        case 'feed':
            loadSocialFeed();
            break;
        case 'explore':
            loadExplorePage();
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

// Social Media Functions
async function loadSocialFeed() {
    const postsContainer = document.getElementById('posts-feed');
    
    try {
        showLoading('Loading posts...');
        
        const response = await fetch(`${API_BASE}/api/posts`);
        const data = await response.json();
        
        if (data.success && data.posts.length > 0) {
            socialPosts = data.posts;
            postsContainer.innerHTML = socialPosts.map(post => createPostHTML(post)).join('');
        } else {
            postsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; color: #ddd;"></i>
                    <h3 style="margin-bottom: 8px;">Welcome to Social Wallet!</h3>
                    <p>Start following people and creating posts to see content here.</p>
                    <button class="btn-primary" onclick="openCreatePostModal()" style="margin-top: 20px;">
                        <i class="fas fa-plus"></i> Create Your First Post
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: #dc3545;"></i>
                <h3 style="margin-bottom: 8px;">Error Loading Posts</h3>
                <p>Unable to connect to Social Wallet API</p>
                <button class="btn-primary" onclick="loadSocialFeed()" style="margin-top: 20px;">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

function createPostHTML(post) {
    return `
        <div class="post-card" id="post-${post.id}">
            <div class="post-header">
                <div class="user-avatar-small">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="post-user-info">
                    <div class="post-user-name">${post.author.displayName || post.author.name}</div>
                    <div class="post-user-handle">@${post.author.username}</div>
                </div>
                <div class="post-time">${formatPostTime(post.createdAt)}</div>
                <div class="post-options">
                    <button class="post-options-btn" onclick="showPostOptions('${post.id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
            
            <div class="post-content">
                ${post.content}
                ${post.hashtags && post.hashtags.length > 0 ? ' ' + post.hashtags.map(tag => `<span style="color: #667eea;">#${tag}</span>`).join(' ') : ''}
            </div>
            
            ${post.media ? `<img src="${post.media}" class="post-media" alt="Post media">` : ''}
            
            <div class="post-actions">
                <button class="post-action ${post.isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                    <i class="fas fa-heart"></i>
                    <span>${post.likesCount || post.likes || 0}</span>
                </button>
                <button class="post-action" onclick="toggleComments('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>${post.commentsCount || post.comments?.length || 0}</span>
                </button>
                <button class="post-action" onclick="sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    <span>${post.shares || 0}</span>
                </button>
                <button class="post-action" onclick="openGiftModal('${post.author.id}')">
                    <i class="fas fa-gift"></i>
                    <span>Gift</span>
                </button>
            </div>
            
            <div class="post-comments" id="comments-${post.id}" style="display: none;">
                <div class="comment-input-container">
                    <div class="comment-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <input type="text" class="comment-input" placeholder="Write a comment..." 
                           onkeypress="handleCommentSubmit(event, '${post.id}')">
                    <button class="comment-submit" onclick="submitComment('${post.id}')">Post</button>
                </div>
                <div class="comments-list">
                    ${(post.comments || []).map(comment => `
                        <div class="comment">
                            <div class="comment-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="comment-content">
                                <div class="comment-author">${comment.author?.displayName || comment.author || 'Anonymous'}</div>
                                <div class="comment-text">${comment.content || comment.text}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function loadExplorePage() {
    // Load trending topics
    const trendingList = document.getElementById('trending-list');
    trendingList.innerHTML = trendingTopics.map(topic => `
        <div class="trending-item" onclick="searchTopic('${topic.tag}')">
            <div class="trending-topic">#${topic.tag}</div>
            <div class="trending-posts">${topic.posts} posts</div>
        </div>
    `).join('');
    
    // Load suggested users
    const suggestedUsersEl = document.getElementById('suggested-users');
    suggestedUsersEl.innerHTML = suggestedUsers.map(user => `
        <div class="user-card">
            <div class="user-card-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-card-name">${user.name}</div>
            <div class="user-card-handle">@${user.username}</div>
            <button class="follow-btn ${user.following ? 'following' : ''}" 
                    onclick="toggleFollow('${user.id}')">
                ${user.following ? 'Following' : 'Follow'}
            </button>
        </div>
    `).join('');
    
    // Load popular posts (simplified version of regular posts)
    const popularPosts = document.getElementById('popular-posts');
    const topPosts = socialPosts.slice(0, 6);
    popularPosts.innerHTML = topPosts.map(post => `
        <div class="post-card" style="cursor: pointer;" onclick="viewPost('${post.id}')">
            ${post.media ? `<img src="${post.media}" class="post-media" alt="Post media">` : ''}
            <div style="padding: 12px;">
                <div style="font-size: 14px; margin-bottom: 8px;">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
                <div style="display: flex; justify-content: space-between; color: #666; font-size: 12px;">
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Create Post Functions
function openCreatePostModal(type = 'text') {
    const modal = document.getElementById('create-post-modal');
    modal.classList.add('active');
    
    // Update user info
    if (currentUser) {
        document.querySelector('.post-username').textContent = currentUser.displayName;
    }
    
    // Focus on content area
    document.getElementById('post-content').focus();
}

function closeCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('post-content').value = '';
    document.getElementById('post-media-preview').style.display = 'none';
    document.getElementById('post-media-input').value = '';
}

function addPostMedia() {
    document.getElementById('post-media-input').click();
}

function addPostPoll() {
    showToast('Poll feature coming soon!', 'info');
}

function addPostLocation() {
    showToast('Location feature coming soon!', 'info');
}

async function createPost() {
    const content = document.getElementById('post-content').value.trim();
    const mediaFiles = document.getElementById('post-media-input').files;
    
    if (!content && mediaFiles.length === 0) {
        showToast('Please add some content or media', 'error');
        return;
    }
    
    showLoading('Creating post...');
    
    try {
        // Create post data
        const postData = {
            content: content,
            userId: currentUser?.id || 'user_001',
            media: mediaFiles.length > 0 ? URL.createObjectURL(mediaFiles[0]) : null
        };
        
        // Send to API
        const response = await fetch(`${API_BASE}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal and reload feed
            closeCreatePostModal();
            switchScreen('feed');
            showToast('Post created successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to create post');
        }
        
    } catch (error) {
        console.error('Post creation error:', error);
        showToast('Failed to create post: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Post Interaction Functions
async function toggleLike(postId) {
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser?.id || 'user_001'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI immediately for better UX
            const postElement = document.getElementById(`post-${postId}`);
            const likeButton = postElement.querySelector('.post-action');
            const isLiked = data.liked;
            
            likeButton.classList.toggle('liked', isLiked);
            
            // Reload feed to get updated like counts
            await loadSocialFeed();
            
            showToast(isLiked ? 'Liked!' : 'Unliked', 'success');
        } else {
            throw new Error(data.error || 'Failed to toggle like');
        }
    } catch (error) {
        console.error('Like toggle error:', error);
        showToast('Failed to update like: ' + error.message, 'error');
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const isVisible = commentsSection.style.display !== 'none';
    commentsSection.style.display = isVisible ? 'none' : 'block';
}

function handleCommentSubmit(event, postId) {
    if (event.key === 'Enter') {
        submitComment(postId);
    }
}

async function submitComment(postId) {
    const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        showToast('Please enter a comment', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: commentText,
                userId: currentUser?.id || 'user_001'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            commentInput.value = '';
            // Reload the feed to show new comment
            await loadSocialFeed();
            // Reopen comments section
            toggleComments(postId);
            showToast('Comment added!', 'success');
        } else {
            throw new Error(data.error || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Comment submission error:', error);
        showToast('Failed to add comment: ' + error.message, 'error');
    }
}

function sharePost(postId) {
    const post = socialPosts.find(p => p.id === postId);
    if (post) {
        post.shares += 1;
        
        // Update UI
        const postElement = document.getElementById(`post-${postId}`);
        const shareButton = postElement.querySelectorAll('.post-action')[2];
        shareButton.querySelector('span').textContent = post.shares;
        shareButton.classList.add('shared');
        
        showToast('Post shared!', 'success');
    }
}

function toggleFollow(userId) {
    const user = suggestedUsers.find(u => u.id === userId);
    if (user) {
        user.following = !user.following;
        loadExplorePage();
        showToast(user.following ? `Now following ${user.name}!` : `Unfollowed ${user.name}`, 'success');
    }
}

function searchTopic(tag) {
    showToast(`Searching for #${tag}...`, 'info');
    // Here you would implement search functionality
}

function viewPost(postId) {
    showToast('Opening post...', 'info');
    // Here you would implement detailed post view
}

function formatPostTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postTime.toLocaleDateString();
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
    
    // Sample social posts
    socialPosts = [
        {
            id: 'post_001',
            author: { name: 'Sarah Johnson', username: 'sarah_j', id: 'user_001' },
            content: 'Just integrated Social Wallet into my app! 🚀 The user onboarding is now lightning fast! #SocialWallet #TechLife',
            hashtags: ['SocialWallet', 'TechLife'],
            media: 'https://via.placeholder.com/500x300?text=App+Screenshot',
            likes: 24,
            shares: 5,
            comments: [
                { author: 'Mike Chen', text: 'That\'s awesome! How was the integration process?', createdAt: new Date(Date.now() - 3600000).toISOString() }
            ],
            isLiked: false,
            createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: 'post_002',
            author: { name: 'Alex Rodriguez', username: 'alex_dev', id: 'user_002' },
            content: 'Building the future of social media with cross-platform profiles! Who else is tired of filling out the same forms over and over? 🤔 #Innovation #UX',
            hashtags: ['Innovation', 'UX'],
            media: null,
            likes: 18,
            shares: 3,
            comments: [
                { author: 'Emma Wilson', text: 'So true! This is exactly what we need!', createdAt: new Date(Date.now() - 5400000).toISOString() },
                { author: 'David Kim', text: 'Love this concept 💯', createdAt: new Date(Date.now() - 4800000).toISOString() }
            ],
            isLiked: true,
            createdAt: new Date(Date.now() - 14400000).toISOString()
        },
        {
            id: 'post_003',
            author: { name: 'TechCrunch', username: 'techcrunch', id: 'user_003' },
            content: 'BREAKING: Social Wallet API launches with $1M+ revenue potential. Universal profiles and cross-platform gifts are changing the game! 💎',
            hashtags: [],
            media: 'https://via.placeholder.com/500x250?text=News+Article',
            likes: 156,
            shares: 42,
            comments: [
                { author: 'Startup Founder', text: 'This is exactly what our platform needs!', createdAt: new Date(Date.now() - 10800000).toISOString() }
            ],
            isLiked: false,
            createdAt: new Date(Date.now() - 21600000).toISOString()
        }
    ];
    
    // Trending topics
    trendingTopics = [
        { tag: 'SocialWallet', posts: 1250 },
        { tag: 'TechLife', posts: 890 },
        { tag: 'Innovation', posts: 2340 },
        { tag: 'UX', posts: 1680 },
        { tag: 'API', posts: 3200 }
    ];
    
    // Suggested users
    suggestedUsers = [
        { id: 'user_004', name: 'Jessica Chen', username: 'jess_designer', following: false },
        { id: 'user_005', name: 'Marcus Thompson', username: 'marcus_code', following: false },
        { id: 'user_006', name: 'Linda Garcia', username: 'linda_pm', following: true },
        { id: 'user_007', name: 'Robert Kim', username: 'rob_startup', following: false }
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