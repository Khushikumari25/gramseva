// GramSeva - Main Application
// Global error handler to prevent JS from stopping
window.onerror = function(msg, url, line, col, error) {
  console.error('App Error:', msg, 'at', url, line);
  return true;
};
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled Promise:', e.reason);
  e.preventDefault();
});

const API_BASE = '/api';
let currentLang = localStorage.getItem('gramseva_lang') || 'hi';
let currentUser = null;
let authToken = localStorage.getItem('gramseva_token') || null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  try { initTheme(); } catch(e) { console.error('Theme init failed:', e); }
  try { initLanguage(); } catch(e) { console.error('Language init failed:', e); }
  try { initAuth(); } catch(e) { console.error('Auth init failed:', e); }
  try { initNavigation(); } catch(e) { console.error('Nav init failed:', e); }
  try { loadHomeData(); } catch(e) { console.error('Home data load failed:', e); }
  try { initGSAP(); } catch(e) { console.error('GSAP init failed:', e); }
  try { registerServiceWorker(); } catch(e) { console.error('SW registration failed:', e); }
});

// Theme Management
function initTheme() {
  const saved = localStorage.getItem('gramseva_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  if (saved === 'dark') document.documentElement.classList.add('dark');
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  html.classList.toggle('dark');
  localStorage.setItem('gramseva_theme', next);
}

// Language Management
function initLanguage() {
  const selector = document.getElementById('lang-selector');
  if (selector) {
    selector.value = currentLang;
    selector.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('gramseva_lang', currentLang);
      applyTranslations();
    });
  }
  applyTranslations();
}

function applyTranslations() {
  const t = translations[currentLang] || translations.hi;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keys = el.getAttribute('data-i18n').split('.');
    let value = t;
    for (const key of keys) {
      value = value?.[key];
    }
    if (value) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const keys = el.getAttribute('data-i18n-placeholder').split('.');
    let value = t;
    for (const key of keys) {
      value = value?.[key];
    }
    if (value) el.placeholder = value;
  });
}

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang] || translations.hi;
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

// Auth Management
function initAuth() {
  if (authToken) {
    fetchUser();
  }
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (currentUser) {
        window.location.href = '/pages/dashboard.html';
      } else {
        window.location.href = '/pages/login.html';
      }
    });
  }
  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.addEventListener('submit', handleAuth);
}

async function fetchUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      updateAuthUI();
    } else {
      logout();
    }
  } catch (e) {
    console.log('Auth check failed, using offline mode');
  }
}

function updateAuthUI() {
  const btn = document.getElementById('auth-btn');
  if (!btn) return;
  if (currentUser) {
    btn.textContent = currentUser.name?.split(' ')[0] || t('nav.logout');
    btn.onclick = () => { window.location.href = '/pages/dashboard.html'; };
  } else {
    btn.textContent = t('nav.login');
    btn.onclick = goToAuth;
  }
}

function goToAuth() {
  window.location.href = '/pages/login.html';
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('gramseva_token');
  localStorage.removeItem('gramseva_user');
  updateAuthUI();
}

function openAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

let authMode = 'login';
function switchAuthTab(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  if (window.event && window.event.target) window.event.target.classList.add('active');
  
  const registerFields = document.getElementById('register-fields');
  const emailFields = document.getElementById('email-fields');
  const otpFields = document.getElementById('otp-fields');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (registerFields) registerFields.classList.add('hidden');
  if (emailFields) emailFields.classList.add('hidden');
  if (otpFields) otpFields.classList.add('hidden');

  if (mode === 'login') {
    if (emailFields) emailFields.classList.remove('hidden');
    if (submitBtn) { submitBtn.classList.remove('hidden'); submitBtn.textContent = t('auth.login'); }
  } else if (mode === 'register') {
    if (registerFields) registerFields.classList.remove('hidden');
    if (emailFields) emailFields.classList.remove('hidden');
    if (submitBtn) { submitBtn.classList.remove('hidden'); submitBtn.textContent = t('auth.register'); }
  } else if (mode === 'otp') {
    if (otpFields) otpFields.classList.remove('hidden');
    if (submitBtn) submitBtn.classList.add('hidden');
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const rawData = Object.fromEntries(form);
  
  // Only include non-empty fields
  const data = {};
  for (const [key, value] of Object.entries(rawData)) {
    if (value && value.trim() !== '') {
      data[key] = value.trim();
    }
  }

  // Validate required fields
  if (authMode === 'register') {
    if (!data.name || !data.email || !data.password) {
      alert('Please fill in name, email and password');
      return;
    }
  } else {
    if (!data.email || !data.password) {
      alert('Please fill in email and password');
      return;
    }
  }

  try {
    let url = `${API_BASE}/auth/${authMode === 'register' ? 'register' : 'login'}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      authToken = result.token;
      localStorage.setItem('gramseva_token', authToken);
      currentUser = result.user;
      updateAuthUI();
      closeAuthModal();
      alert(authMode === 'register' ? 'Registration successful!' : 'Login successful!');
    } else {
      alert(result.error || result.errors?.[0]?.msg || 'Authentication failed');
    }
  } catch (error) {
    alert('Connection error. Please try again.');
  }
}

async function handleSendOtp() {
  const phone = document.querySelector('[name="phone"]').value;
  if (!phone) return alert('Enter phone number');
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (data.success) {
      document.querySelector('[name="otp"]').classList.remove('hidden');
      document.getElementById('send-otp-btn').textContent = 'Verify OTP';
      document.getElementById('send-otp-btn').onclick = handleVerifyOtp;
    }
  } catch (e) {
    alert('Failed to send OTP');
  }
}

async function handleVerifyOtp() {
  const phone = document.querySelector('[name="phone"]').value;
  const otp = document.querySelector('[name="otp"]').value;
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (data.success) {
      authToken = data.token;
      localStorage.setItem('gramseva_token', authToken);
      currentUser = data.user;
      updateAuthUI();
      closeAuthModal();
    }
  } catch (e) {
    alert('OTP verification failed');
  }
}

// Navigation
function initNavigation() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }
}

function navigateTo(section) {
  const el = document.getElementById(section);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Load Home Data
async function loadHomeData() {
  loadSchemes();
  loadMarketplace();
  loadEquipment();
  loadEmergencyContacts();
  // Tourism and weather are loaded by their own DOMContentLoaded listeners
}

// GSAP Animations
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('#hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });
  gsap.from('#hero-image', { opacity: 0, x: 50, duration: 1, delay: 0.3, ease: 'power3.out' });

  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 0, y: 40, duration: 0.6, delay: i * 0.1
    });
  });
}

// AI Assistant
function openAIAssistant() {
  window.location.href = '/pages/chatbot.html';
}

function closeAIAssistant() {
  document.getElementById('ai-modal').classList.add('hidden');
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById('ai-messages');
  
  // Add user message
  messagesDiv.innerHTML += `
    <div class="flex gap-3 justify-end">
      <div class="bg-green-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
        <p class="text-sm">${escapeHtml(message)}</p>
      </div>
    </div>`;
  input.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  messagesDiv.innerHTML += `
    <div id="${typingId}" class="flex gap-3">
      <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 flex items-center justify-center">
        <svg class="w-4 h-4 text-green-700 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>
      </div>
      <div class="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div class="flex gap-1"><span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.1s"></span><span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.2s"></span></div>
      </div>
    </div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken || ''}`
      },
      body: JSON.stringify({ message, language: currentLang })
    });
    const data = await res.json();
    document.getElementById(typingId)?.remove();
    
    const reply = data.data?.reply || 'Sorry, I could not process that.';
    messagesDiv.innerHTML += `
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 flex items-center justify-center">
          <svg class="w-4 h-4 text-green-700 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>
        </div>
        <div class="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <p class="text-sm">${escapeHtml(reply)}</p>
        </div>
      </div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'pa' ? 'pa-IN' : 'en-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  } catch (e) {
    document.getElementById(typingId)?.remove();
    messagesDiv.innerHTML += `
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 flex items-center justify-center">
          <svg class="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>
        </div>
        <div class="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <p class="text-sm">Connection error. Please try again.</p>
        </div>
      </div>`;
  }
}

// Voice Input
function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Voice input not supported in this browser');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'pa' ? 'pa-IN' : 'en-IN';
  recognition.interimResults = false;

  const voiceBtn = document.getElementById('voice-btn');
  voiceBtn.classList.add('voice-active');

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('ai-input').value = transcript;
    voiceBtn.classList.remove('voice-active');
    sendAIMessage();
  };
  recognition.onerror = () => voiceBtn.classList.remove('voice-active');
  recognition.onend = () => voiceBtn.classList.remove('voice-active');
  recognition.start();
}

// Enter key for AI input
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement?.id === 'ai-input') {
    sendAIMessage();
  }
});

// Utility
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}
