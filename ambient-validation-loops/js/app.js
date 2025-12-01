import { getRandomAffirmation, getAllCategories, getCategoryById } from './affirmations.js';

// DOM Elements
const onboardingSection = document.getElementById('onboarding');
const dashboardSection = document.getElementById('dashboard');
const settingsSection = document.getElementById('settings');
const categorySelection = document.getElementById('category-selection');
const settingsCategories = document.getElementById('settings-categories');
const completeOnboardingBtn = document.getElementById('complete-onboarding');
const settingsToggle = document.getElementById('settings-toggle');
const cancelSettingsBtn = document.getElementById('cancel-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const nextAffirmationBtn = document.getElementById('next-affirmation');
const notificationsToggle = document.getElementById('notifications-toggle');
const currentAffirmationEl = document.getElementById('current-affirmation');
const todayCountEl = document.getElementById('today-count');
const activeCategoriesEl = document.getElementById('active-categories');
const frequencySelect = document.getElementById('frequency');
const installPrompt = document.getElementById('install-prompt');
const installBtn = document.getElementById('install-btn');
const dismissInstallBtn = document.getElementById('dismiss-install');

// App State
let state = {
  categories: [],
  selectedCategories: [],
  notificationFrequency: 'hourly',
  notificationsEnabled: false,
  todayCount: 0,
  lastNotificationTime: null,
  deferredPrompt: null
};

// Initialize the app
async function init() {
  // Load state from localStorage
  loadState();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check if it's the first run
  if (state.firstRun === undefined) {
    state.firstRun = true;
    saveState();
  }
  
  // Show onboarding if it's the first run or no categories selected
  if (state.firstRun || state.selectedCategories.length === 0) {
    showOnboarding();
  } else {
    showDashboard();
  }
  
  // Initialize service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      
      // Check notification permission
      if (Notification.permission === 'granted') {
        state.notificationsEnabled = true;
        notificationsToggle.textContent = '🔔';
        startNotificationSchedule();
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  // Show install prompt when available
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
    installPrompt.classList.remove('hidden');
  });
  
  // Update UI with current state
  updateUI();
}

// Set up event listeners
function setupEventListeners() {
  // Navigation
  completeOnboardingBtn.addEventListener('click', completeOnboarding);
  settingsToggle.addEventListener('click', showSettings);
  cancelSettingsBtn.addEventListener('click', showDashboard);
  saveSettingsBtn.addEventListener('click', saveSettings);
  nextAffirmationBtn.addEventListener('click', showNextAffirmation);
  
  // Notifications
  notificationsToggle.addEventListener('click', toggleNotifications);
  
  // Install prompt
  installBtn.addEventListener('click', installApp);
  dismissInstallBtn.addEventListener('click', () => installPrompt.classList.add('hidden'));
  
  // Visibility change (for tracking active time)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateUI();
    }
  });
}

// Show onboarding screen
function showOnboarding() {
  // Hide other sections
  dashboardSection.classList.add('hidden');
  settingsSection.classList.add('hidden');
  
  // Show onboarding
  onboardingSection.classList.remove('hidden');
  
  // Populate categories
  populateCategories(categorySelection, true);
}

// Show dashboard
function showDashboard() {
  // Hide other sections
  onboardingSection.classList.add('hidden');
  settingsSection.classList.add('hidden');
  
  // Show dashboard
  dashboardSection.classList.remove('hidden');
  
  // Show a new affirmation
  showNextAffirmation();
  
  // Update stats
  updateStats();
}

// Show settings
function showSettings() {
  // Hide other sections
  onboardingSection.classList.add('hidden');
  dashboardSection.classList.add('hidden');
  
  // Show settings
  settingsSection.classList.remove('hidden');
  
  // Populate settings
  populateSettings();
}

// Populate categories in the specified container
function populateCategories(container, isOnboarding = false) {
  container.innerHTML = '';
  
  getAllCategories().forEach(category => {
    const isSelected = state.selectedCategories.includes(category.id);
    const maxReached = isOnboarding && state.selectedCategories.length >= 3 && !isSelected;
    
    const categoryEl = document.createElement('div');
    categoryEl.className = `category-item ${isSelected ? 'selected' : ''} ${maxReached ? 'disabled' : ''}`;
    categoryEl.innerHTML = `
      <span class="emoji">${category.emoji}</span>
      <h4>${category.name}</h4>
      <p>${category.description}</p>
      <input type="checkbox" ${isSelected ? 'checked' : ''} ${maxReached ? 'disabled' : ''}>
    `;
    
    categoryEl.addEventListener('click', () => toggleCategory(category.id, isOnboarding));
    container.appendChild(categoryEl);
  });
}

// Toggle category selection
function toggleCategory(categoryId, isOnboarding = false) {
  const index = state.selectedCategories.indexOf(categoryId);
  
  if (index === -1) {
    // Add category if not already selected and not at max for free tier
    if (!isOnboarding || state.selectedCategories.length < 3) {
      state.selectedCategories.push(categoryId);
    }
  } else {
    // Remove category
    state.selectedCategories.splice(index, 1);
  }
  
  // Update UI
  if (isOnboarding) {
    populateCategories(categorySelection, true);
  } else {
    populateCategories(settingsCategories, false);
  }
  
  // Save state
  saveState();
}

// Complete onboarding
function completeOnboarding() {
  if (state.selectedCategories.length === 0) {
    alert('Please select at least one category to continue.');
    return;
  }
  
  state.firstRun = false;
  saveState();
  showDashboard();
  
  // Request notification permission
  requestNotificationPermission();
}

// Show next affirmation
function showNextAffirmation() {
  if (state.selectedCategories.length === 0) {
    currentAffirmationEl.textContent = 'Select categories in settings to receive affirmations.';
    return;
  }
  
  const affirmation = getRandomAffirmation(state.selectedCategories);
  currentAffirmationEl.textContent = affirmation;
  
  // Increment today's count if it's a new day
  updateDailyCount();
  
  // Save state
  saveState();
}

// Toggle notifications
async function toggleNotifications() {
  if (Notification.permission === 'granted') {
    state.notificationsEnabled = !state.notificationsEnabled;
    notificationsToggle.textContent = state.notificationsEnabled ? '🔔' : '🔕';
    
    if (state.notificationsEnabled) {
      startNotificationSchedule();
    } else {
      // Clear any pending notifications
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      }
    }
    
    saveState();
  } else {
    requestNotificationPermission();
  }
}

// Request notification permission
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      state.notificationsEnabled = true;
      notificationsToggle.textContent = '🔔';
      startNotificationSchedule();
      saveState();
      
      // Show a welcome notification
      showNotification('Welcome to Ambient Validation Loops', {
        body: 'Your affirmations will appear here. Stay tuned for your first validation!',
        icon: '/images/icon-192x192.png'
      });
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

// Show a notification
function showNotification(title, options) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  }
}

// Start the notification schedule based on user preferences
function startNotificationSchedule() {
  if (!state.notificationsEnabled || !('serviceWorker' in navigator)) return;
  
  // Clear any existing intervals
  if (window.notificationInterval) {
    clearInterval(window.notificationInterval);
  }
  
  // Calculate interval based on user preference
  let interval = 60 * 60 * 1000; // Default: hourly
  
  switch (state.notificationFrequency) {
    case '2hours':
      interval = 2 * 60 * 60 * 1000;
      break;
    case '4hours':
      interval = 4 * 60 * 60 * 1000;
      break;
    case 'random':
      // Random interval between 3-8 times per day
      const notificationsPerDay = Math.floor(Math.random() * 6) + 3; // 3-8 notifications
      interval = (24 * 60 * 60 * 1000) / notificationsPerDay;
      break;
  }
  
  // Schedule notifications
  window.notificationInterval = setInterval(() => {
    if (state.selectedCategories.length > 0) {
      const affirmation = getRandomAffirmation(state.selectedCategories);
      showNotification('Your Ambient Validation', {
        body: affirmation,
        icon: '/images/icon-192x192.png',
        vibrate: [200, 100, 200]
      });
      
      // Update today's count
      updateDailyCount();
    }
  }, interval);
  
  // Show first notification immediately (with a small delay)
  setTimeout(() => {
    if (state.selectedCategories.length > 0) {
      const affirmation = getRandomAffirmation(state.selectedCategories);
      showNotification('Your First Ambient Validation', {
        body: affirmation,
        icon: '/images/icon-192x192.png'
      });
      
      // Update today's count
      updateDailyCount();
    }
  }, 5000);
}

// Update the daily count
function updateDailyCount() {
  const today = new Date().toDateString();
  const lastDate = state.lastNotificationTime ? new Date(state.lastNotificationTime).toDateString() : null;
  
  if (lastDate !== today) {
    // It's a new day, reset count
    state.todayCount = 0;
  }
  
  state.todayCount++;
  state.lastNotificationTime = new Date().toISOString();
  
  // Update UI
  updateStats();
  
  // Save state
  saveState();
}

// Update the stats display
function updateStats() {
  todayCountEl.textContent = state.todayCount;
  activeCategoriesEl.textContent = state.selectedCategories.length;
}

// Populate settings
function populateSettings() {
  // Set frequency
  frequencySelect.value = state.notificationFrequency;
  
  // Populate categories
  populateCategories(settingsCategories, false);
  
  // Set notification toggle
  notificationsToggle.textContent = state.notificationsEnabled ? '🔔' : '🔕';
}

// Save settings
function saveSettings() {
  // Update frequency
  state.notificationFrequency = frequencySelect.value;
  
  // Save state
  saveState();
  
  // Restart notification schedule if needed
  if (state.notificationsEnabled) {
    startNotificationSchedule();
  }
  
  // Return to dashboard
  showDashboard();
}

// Install the app
async function installApp() {
  if (!state.deferredPrompt) return;
  
  state.deferredPrompt.prompt();
  const { outcome } = await state.deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
    installPrompt.classList.add('hidden');
  }
  
  state.deferredPrompt = null;
}

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem('ambientValidationState');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      state = { ...state, ...parsed };
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
  
  // Ensure selectedCategories is an array
  if (!Array.isArray(state.selectedCategories)) {
    state.selectedCategories = [];
  }
  
  // Ensure we have a valid frequency
  if (!['hourly', '2hours', '4hours', 'random'].includes(state.notificationFrequency)) {
    state.notificationFrequency = 'hourly';
  }
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem('ambientValidationState', JSON.stringify({
      selectedCategories: state.selectedCategories,
      notificationFrequency: state.notificationFrequency,
      notificationsEnabled: state.notificationsEnabled,
      todayCount: state.todayCount,
      lastNotificationTime: state.lastNotificationTime,
      firstRun: state.firstRun
    }));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// Update UI based on state
function updateUI() {
  // Update today's count if it's a new day
  if (state.lastNotificationTime) {
    const today = new Date().toDateString();
    const lastDate = new Date(state.lastNotificationTime).toDateString();
    
    if (lastDate !== today) {
      state.todayCount = 0;
      saveState();
    }
  }
  
  // Update stats
  updateStats();
  
  // Update notification icon
  notificationsToggle.textContent = state.notificationsEnabled ? '🔔' : '🔕';
}

// Initialize the app when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
