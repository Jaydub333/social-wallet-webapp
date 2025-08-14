/**
 * Professional Social Media Web Application
 * Powered by Social Wallet API
 * Features: User management, posts, comments, likes, real-time updates
 */

// API Configuration
const API_BASE_URL = 'https://squid-app-mky7a.ondigitalocean.app';

// Application State
class AppState {
  constructor() {
    this.currentUser = null;
    this.posts = [];
    this.users = [];
    this.currentPage = 'feed';
    this.isLoading = false;
    this.notifications = [];
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('socialWalletUser', JSON.stringify(user));
    this.notifyStateChange();
  }

  clearUser() {
    this.currentUser = null;
    localStorage.removeItem('socialWalletUser');
    this.notifyStateChange();
  }

  setPosts(posts) {
    this.posts = posts;
    this.notifyStateChange();
  }

  addPost(post) {
    this.posts.unshift(post);
    this.notifyStateChange();
  }

  updatePost(postId, updates) {
    const index = this.posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updates };
      this.notifyStateChange();
    }
  }

  notifyStateChange() {
    // Trigger UI updates
    this.updateUI();
  }

  updateUI() {
    if (this.currentUser) {
      updateUserInfo(this.currentUser);
    }
  }
}

// Global app state
const appState = new AppState();

// API Service
class APIService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${endpoint}`);
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!data.success && response.status >= 400) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get(endpoint) {
    return this.request(endpoint);
  }

  static async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  static async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // User endpoints
  static async createUser(userData) {
    return this.post('/api/users', userData);
  }

  static async getUsers() {
    return this.get('/api/users');
  }

  static async getProfile(userId) {
    return this.get(`/api/profile?userId=${userId}`);
  }

  static async updateProfile(profileData) {
    return this.put('/api/profile', profileData);
  }

  // Posts endpoints
  static async getPosts() {
    return this.get('/api/posts');
  }

  static async createPost(postData) {
    return this.post('/api/posts', postData);
  }

  // Comments endpoints
  static async addComment(postId, commentData) {
    return this.post(`/api/posts/${postId}/comments`, commentData);
  }

  // Likes endpoints
  static async toggleLike(postId, userId) {
    return this.post(`/api/posts/${postId}/like`, { userId });
  }

  // Health check
  static async healthCheck() {
    return this.get('/health');
  }
}

// UI Components and Functions

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Social Wallet App Initializing...');
  initializeApp();
});

async function initializeApp() {
  // Show loading screen
  showLoader();
  
  try {
    // Check API health
    await APIService.healthCheck();
    console.log('API connection successful');

    // Check for existing user session
    const savedUser = localStorage.getItem('socialWalletUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      appState.setUser(user);
      await showMainApp();
    } else {
      showAuthScreen();
    }
  } catch (error) {
    console.error('App initialization failed:', error);
    showToast('Failed to connect to Social Wallet API', 'error');
    showAuthScreen();
  } finally {
    hideLoader();
  }
}

function showLoader() {
  document.getElementById('app-loader').style.display = 'flex';
}

function hideLoader() {
  document.getElementById('app-loader').style.display = 'none';
}

function showAuthScreen() {
  document.getElementById('auth-container').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
}

async function showMainApp() {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  
  // Initialize main app
  await loadInitialData();
  setupEventListeners();
  updateUserInfo(appState.currentUser);
}

async function loadInitialData() {
  try {
    showLoading('Loading your feed...');
    
    // Load posts
    const postsData = await APIService.getPosts();
    if (postsData.success) {
      appState.setPosts(postsData.posts);
      renderPosts(postsData.posts);
    }
    
    // Load user profile if available
    if (appState.currentUser) {
      try {
        const profileData = await APIService.getProfile(appState.currentUser.id);
        if (profileData.success) {
          appState.setUser({ ...appState.currentUser, ...profileData.profile });
        }
      } catch (error) {
        console.warn('Could not load full profile:', error);
      }
    }
    
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('Failed to load content', 'error');
  } finally {
    hideLoading();
  }
}

// Authentication Functions
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  showLoading('Signing in...');
  
  try {
    // Since we don't have real authentication, we'll simulate it
    // In a real app, this would validate credentials
    const userData = {
      id: 'user_' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      username: email.split('@')[0],
      bio: 'New user',
      verified: false,
      joinDate: new Date().toISOString()
    };
    
    appState.setUser(userData);
    showToast('Welcome back!', 'success');
    await showMainApp();
    
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function handleSignup(event) {
  event.preventDefault();
  
  const formData = {
    displayName: `${document.getElementById('signup-firstname').value} ${document.getElementById('signup-lastname').value}`,
    username: document.getElementById('signup-username').value,
    email: document.getElementById('signup-email').value,
    bio: document.getElementById('signup-bio').value || '',
    location: '',
    website: ''
  };
  
  showLoading('Creating your account...');
  
  try {
    const response = await APIService.createUser(formData);
    
    if (response.success) {
      appState.setUser(response.user);
      showToast('Account created successfully!', 'success');
      await showMainApp();
    } else {
      throw new Error(response.error || 'Account creation failed');
    }
    
  } catch (error) {
    console.error('Signup error:', error);
    showToast('Signup failed: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

function switchToSignup() {
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('signup-form').classList.add('active');
}

function switchToLogin() {
  document.getElementById('signup-form').classList.remove('active');
  document.getElementById('login-form').classList.add('active');
}

async function loginAsGuest() {
  const guestUser = {
    id: 'guest_' + Date.now(),
    displayName: 'Guest User',
    username: 'guest',
    email: 'guest@example.com',
    bio: 'Exploring Social Wallet',
    verified: false,
    joinDate: new Date().toISOString()
  };
  
  appState.setUser(guestUser);
  showToast('Welcome, Guest!', 'success');
  await showMainApp();
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    appState.clearUser();
    showToast('Logged out successfully', 'success');
    showAuthScreen();
  }
}

// Navigation Functions
function setupEventListeners() {
  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      navigateToPage(page);
    });
  });

  // Post content character counter
  const postContent = document.getElementById('post-content');
  if (postContent) {
    postContent.addEventListener('input', updateCharacterCount);
  }

  // Media input
  const mediaInput = document.getElementById('media-input');
  if (mediaInput) {
    mediaInput.addEventListener('change', handleMediaSelect);
  }

  // Modal close on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Profile tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchProfileTab(tabName);
    });
  });
}

function navigateToPage(page) {
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Show selected page
  document.querySelectorAll('.page').forEach(pageEl => {
    pageEl.classList.remove('active');
  });
  document.getElementById(`${page}-page`).classList.add('active');
  
  appState.currentPage = page;
  
  // Load page-specific data
  loadPageData(page);
}

async function loadPageData(page) {
  switch (page) {
    case 'feed':
      await refreshFeed();
      break;
    case 'profile':
      await loadUserProfile();
      break;
    case 'explore':
      await loadExploreData();
      break;
    case 'notifications':
      await loadNotifications();
      break;
  }
}

// Posts Functions
async function refreshFeed() {
  try {
    showLoading('Refreshing feed...');
    const response = await APIService.getPosts();
    
    if (response.success) {
      appState.setPosts(response.posts);
      renderPosts(response.posts);
      showToast('Feed refreshed', 'success');
    }
  } catch (error) {
    console.error('Failed to refresh feed:', error);
    showToast('Failed to refresh feed', 'error');
  } finally {
    hideLoading();
  }
}

function renderPosts(posts) {
  const feedContainer = document.getElementById('posts-feed');
  
  if (!posts || posts.length === 0) {
    feedContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <h3>No posts yet</h3>
        <p>Be the first to share something!</p>
        <button class="btn-primary" onclick="openCreatePostModal()" style="margin-top: 20px;">
          <i class="fas fa-plus"></i>
          Create Your First Post
        </button>
      </div>
    `;
    return;
  }
  
  feedContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
  const timeAgo = formatTimeAgo(post.createdAt);
  const isLiked = post.isLiked || false;
  
  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <div class="user-avatar">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.displayName || post.author.name)}&background=667eea&color=fff" alt="${post.author.displayName || post.author.name}">
        </div>
        <div class="post-user-info">
          <div class="post-user-name">${post.author.displayName || post.author.name}</div>
          <div class="post-user-handle">@${post.author.username}</div>
        </div>
        <div class="post-time">${timeAgo}</div>
      </div>
      
      <div class="post-content">${post.content}</div>
      
      ${post.media ? `<img src="${post.media}" class="post-media" alt="Post media">` : ''}
      
      ${post.hashtags && post.hashtags.length > 0 ? 
        `<div class="post-hashtags">${post.hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}</div>` : ''
      }
      
      <div class="post-actions">
        <button class="post-action" onclick="toggleComments('${post.id}')">
          <i class="fas fa-comment"></i>
          <span>${post.commentsCount || post.comments?.length || 0}</span>
        </button>
        
        <button class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
          <i class="fas fa-heart"></i>
          <span>${post.likesCount || post.likes || 0}</span>
        </button>
        
        <button class="post-action" onclick="sharePost('${post.id}')">
          <i class="fas fa-share"></i>
          <span>${post.shares || 0}</span>
        </button>
        
        <button class="post-action" onclick="reportPost('${post.id}')">
          <i class="fas fa-flag"></i>
        </button>
      </div>
      
      <div class="post-comments" id="comments-${post.id}" style="display: none;">
        <div class="comment-input-container">
          <div class="user-avatar">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(appState.currentUser?.displayName || 'User')}&background=667eea&color=fff" alt="You">
          </div>
          <input type="text" class="comment-input" placeholder="Write a comment..." 
                 onkeypress="handleCommentKeyPress(event, '${post.id}')">
          <button class="comment-submit" onclick="submitComment('${post.id}')">Post</button>
        </div>
        
        <div class="comments-list">
          ${(post.comments || []).map(comment => `
            <div class="comment">
              <div class="comment-avatar">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.displayName || comment.author || 'User')}&background=95a5a6&color=fff" alt="${comment.author?.displayName || comment.author || 'User'}">
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

// Post Creation Functions
function openCreatePostModal(type = 'text') {
  const modal = document.getElementById('create-post-modal');
  modal.classList.add('active');
  
  // Update user info
  if (appState.currentUser) {
    document.getElementById('composer-avatar').src = 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(appState.currentUser.displayName)}&background=667eea&color=fff`;
    document.getElementById('composer-name').textContent = appState.currentUser.displayName;
  }
  
  // Focus on content
  setTimeout(() => {
    document.getElementById('post-content').focus();
  }, 100);
  
  // Auto-open media selector for photo/video
  if (type === 'image' || type === 'video') {
    setTimeout(() => selectMedia(), 200);
  }
}

function closeCreatePostModal() {
  const modal = document.getElementById('create-post-modal');
  modal.classList.remove('active');
  
  // Reset form
  document.getElementById('post-content').value = '';
  document.getElementById('media-preview').innerHTML = '';
  document.getElementById('media-preview').classList.remove('active');
  document.getElementById('media-input').value = '';
  updateCharacterCount();
}

function selectMedia() {
  document.getElementById('media-input').click();
}

function handleMediaSelect(event) {
  const files = event.target.files;
  const preview = document.getElementById('media-preview');
  
  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      preview.innerHTML = `
        <div style="position: relative; display: inline-block;">
          <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
          <button onclick="clearMedia()" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
        </div>
      `;
      preview.classList.add('active');
    };
    
    reader.readAsDataURL(file);
  }
}

function clearMedia() {
  document.getElementById('media-input').value = '';
  document.getElementById('media-preview').innerHTML = '';
  document.getElementById('media-preview').classList.remove('active');
}

function updateCharacterCount() {
  const content = document.getElementById('post-content').value;
  const counter = document.getElementById('char-count');
  counter.textContent = content.length;
  
  // Change color based on character count
  if (content.length > 250) {
    counter.style.color = 'var(--warning-color)';
  } else if (content.length > 280) {
    counter.style.color = 'var(--error-color)';
  } else {
    counter.style.color = 'var(--text-secondary)';
  }
}

async function submitPost() {
  const content = document.getElementById('post-content').value.trim();
  const mediaFiles = document.getElementById('media-input').files;
  
  if (!content && mediaFiles.length === 0) {
    showToast('Please add some content or media', 'error');
    return;
  }
  
  if (content.length > 280) {
    showToast('Post is too long (280 character limit)', 'error');
    return;
  }
  
  showLoading('Publishing post...');
  
  try {
    const postData = {
      content,
      userId: appState.currentUser?.id || 'guest',
      media: mediaFiles.length > 0 ? URL.createObjectURL(mediaFiles[0]) : null
    };
    
    const response = await APIService.createPost(postData);
    
    if (response.success) {
      closeCreatePostModal();
      showToast('Post published successfully!', 'success');
      await refreshFeed();
    } else {
      throw new Error(response.error || 'Failed to create post');
    }
    
  } catch (error) {
    console.error('Post creation error:', error);
    showToast('Failed to publish post: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Post Interaction Functions
function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  const isVisible = commentsSection.style.display !== 'none';
  commentsSection.style.display = isVisible ? 'none' : 'block';
}

function handleCommentKeyPress(event, postId) {
  if (event.key === 'Enter') {
    submitComment(postId);
  }
}

async function submitComment(postId) {
  const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
  const content = commentInput.value.trim();
  
  if (!content) {
    showToast('Please enter a comment', 'error');
    return;
  }
  
  try {
    const response = await APIService.addComment(postId, {
      content,
      userId: appState.currentUser?.id || 'guest'
    });
    
    if (response.success) {
      commentInput.value = '';
      showToast('Comment added!', 'success');
      await refreshFeed();
      // Reopen comments section
      toggleComments(postId);
    } else {
      throw new Error(response.error || 'Failed to add comment');
    }
    
  } catch (error) {
    console.error('Comment error:', error);
    showToast('Failed to add comment: ' + error.message, 'error');
  }
}

async function toggleLike(postId) {
  try {
    const response = await APIService.toggleLike(postId, appState.currentUser?.id || 'guest');
    
    if (response.success) {
      // Update UI immediately
      const likeButton = document.querySelector(`[data-post-id="${postId}"] .post-action.liked, [data-post-id="${postId}"] .post-actions .post-action`);
      if (likeButton) {
        likeButton.classList.toggle('liked', response.liked);
      }
      
      // Refresh to get updated counts
      await refreshFeed();
    } else {
      throw new Error(response.error || 'Failed to toggle like');
    }
    
  } catch (error) {
    console.error('Like error:', error);
    showToast('Failed to update like: ' + error.message, 'error');
  }
}

function sharePost(postId) {
  // Simple share functionality
  if (navigator.share) {
    navigator.share({
      title: 'Check out this post on Social Wallet',
      url: window.location.href + `#post-${postId}`
    });
  } else {
    // Fallback - copy to clipboard
    const url = window.location.href + `#post-${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Post link copied to clipboard!', 'success');
    });
  }
}

function reportPost(postId) {
  if (confirm('Report this post for inappropriate content?')) {
    showToast('Post reported. Thank you for helping keep our community safe.', 'success');
  }
}

// Profile Functions
async function loadUserProfile() {
  if (!appState.currentUser) return;
  
  try {
    showLoading('Loading profile...');
    
    const response = await APIService.getProfile(appState.currentUser.id);
    
    if (response.success) {
      const profile = response.profile;
      
      // Update profile display
      document.getElementById('profile-name').textContent = profile.displayName;
      document.getElementById('profile-username').textContent = `@${profile.username}`;
      document.getElementById('profile-bio').textContent = profile.bio || 'No bio available';
      document.getElementById('posts-count').textContent = profile.postsCount || 0;
      document.getElementById('followers-count').textContent = profile.followersCount || 0;
      document.getElementById('following-count').textContent = profile.followingCount || 0;
      
      // Update avatars
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=667eea&color=fff&size=120`;
      document.getElementById('profile-avatar').src = avatarUrl;
    }
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    showToast('Failed to load profile', 'error');
  } finally {
    hideLoading();
  }
}

function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  modal.classList.add('active');
  
  // Populate form with current data
  if (appState.currentUser) {
    document.getElementById('edit-display-name').value = appState.currentUser.displayName || '';
    document.getElementById('edit-bio').value = appState.currentUser.bio || '';
    document.getElementById('edit-location').value = appState.currentUser.location || '';
    document.getElementById('edit-website').value = appState.currentUser.website || '';
  }
}

function closeEditProfileModal() {
  document.getElementById('edit-profile-modal').classList.remove('active');
}

async function updateProfile(event) {
  event.preventDefault();
  
  const profileData = {
    displayName: document.getElementById('edit-display-name').value,
    bio: document.getElementById('edit-bio').value,
    location: document.getElementById('edit-location').value,
    website: document.getElementById('edit-website').value,
    userId: appState.currentUser?.id
  };
  
  showLoading('Updating profile...');
  
  try {
    const response = await APIService.updateProfile(profileData);
    
    if (response.success) {
      appState.setUser({ ...appState.currentUser, ...profileData });
      closeEditProfileModal();
      showToast('Profile updated successfully!', 'success');
      await loadUserProfile();
    } else {
      throw new Error(response.error || 'Failed to update profile');
    }
    
  } catch (error) {
    console.error('Profile update error:', error);
    showToast('Failed to update profile: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

function switchProfileTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`profile-${tabName}`).classList.add('active');
  
  // Load tab-specific content
  loadProfileTabData(tabName);
}

function loadProfileTabData(tabName) {
  const container = document.getElementById(`profile-${tabName}`);
  
  switch (tabName) {
    case 'posts':
      const userPosts = appState.posts.filter(post => 
        post.author.id === appState.currentUser?.id || 
        post.userId === appState.currentUser?.id
      );
      
      if (userPosts.length > 0) {
        container.innerHTML = userPosts.map(post => createPostHTML(post)).join('');
      } else {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <i class="fas fa-pen" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <h3>No posts yet</h3>
            <p>Start sharing your thoughts with the world!</p>
          </div>
        `;
      }
      break;
      
    case 'media':
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-images" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3>Media gallery coming soon</h3>
          <p>Your photos and videos will be displayed here</p>
        </div>
      `;
      break;
      
    case 'likes':
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-heart" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3>Liked posts coming soon</h3>
          <p>Posts you've liked will be shown here</p>
        </div>
      `;
      break;
  }
}

// Explore and other pages
async function loadExploreData() {
  const container = document.getElementById('trending-topics');
  container.innerHTML = `
    <div class="trending-item">
      <div class="trending-topic">#SocialWallet</div>
      <div class="trending-posts">1.2K posts</div>
    </div>
    <div class="trending-item">
      <div class="trending-topic">#TechLife</div>
      <div class="trending-posts">890 posts</div>
    </div>
    <div class="trending-item">
      <div class="trending-topic">#Innovation</div>
      <div class="trending-posts">2.3K posts</div>
    </div>
  `;
}

async function loadNotifications() {
  // Placeholder for notifications
  console.log('Loading notifications...');
}

// UI Helper Functions
function updateUserInfo(user) {
  if (!user) return;
  
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=667eea&color=fff`;
  
  // Update all user avatars and info
  const elements = {
    'nav-user-avatar': avatarUrl,
    'sidebar-avatar': avatarUrl,
    'sidebar-name': user.displayName,
    'sidebar-username': `@${user.username}`
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      if (id.includes('avatar')) {
        element.src = value;
      } else {
        element.textContent = value;
      }
    }
  });
}

function showLoading(message = 'Loading...') {
  // Simple loading implementation
  console.log('Loading:', message);
  // You could show a loading spinner or toast here
}

function hideLoading() {
  console.log('Loading complete');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function closeModal(modal) {
  modal.classList.remove('active');
}

// Utility Functions
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString();
}

// Additional features for future implementation
function createPoll() {
  showToast('Poll feature coming soon!', 'info');
}

function addLocation() {
  showToast('Location feature coming soon!', 'info');
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showToast('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showToast('Network error occurred', 'error');
});

// Export for debugging (in development)
if (typeof window !== 'undefined') {
  window.SocialWallet = {
    appState,
    APIService,
    refreshFeed,
    showToast
  };
}