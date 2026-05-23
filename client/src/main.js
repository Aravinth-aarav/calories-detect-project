import './index.css';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderFoods } from './pages/foods.js';
import { createIcons, icons } from 'lucide';

// SPA Global State
export const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  theme: localStorage.getItem('theme') || 'light',
  currentView: 'landing', // landing, login, register, dashboard, foods
  activeTab: 'detector',  // detector, compare, history, workouts, favorites, bmi, settings
  notifications: []
};

// Initialize Application
export function initApp() {
  // Set theme attributes on startup
  document.documentElement.setAttribute('data-theme', state.theme);
  
  // Clean initial routing based on auth state
  if (state.token && state.user) {
    state.currentView = 'dashboard';
  } else {
    // Basic routing support for standard paths
    const path = window.location.pathname;
    if (path === '/login') {
      state.currentView = 'login';
    } else if (path === '/register') {
      state.currentView = 'register';
    } else if (path === '/foods') {
      state.currentView = 'foods';
    } else {
      state.currentView = 'landing';
    }
  }

  // Bind browser history back/forward button triggers
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.view) {
      state.currentView = e.state.view;
      if (e.state.tab) state.activeTab = e.state.tab;
      renderApp();
    }
  });

  // Render initial view
  renderApp();
}

// Global Toast Notifications
export function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; zIndex: 1000; display: flex; flexDirection: column; gap: 0.75rem;';
    document.body.appendChild(container);
  }
  
  const id = Date.now();
  const borderLeftColor = type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--danger)' : 'var(--primary-blue)';
  const iconName = type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle-2' : 'info';
  
  const toast = document.createElement('div');
  toast.className = 'card';
  toast.id = `toast-${id}`;
  toast.style.cssText = `
    padding: 1rem 1.5rem; 
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border-left: 4px solid ${borderLeftColor};
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <div style="color: ${borderLeftColor}; display: flex;">
      <i data-lucide="${iconName}" style="width: 20px; height: 20px;"></i>
    </div>
    <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${message}</span>
  `;
  
  document.getElementById('toast-container').appendChild(toast);
  createIcons({ icons });

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 280);
  }, 3000);
}

// Navigation Helper
export function navigateTo(view, tab = 'detector') {
  // Prevent unauthorized access to dashboard/foods page
  if ((view === 'dashboard' || view === 'foods') && !state.token) {
    view = 'login';
  }
  // Redirect logged-in users away from auth forms
  if ((view === 'login' || view === 'register') && state.token) {
    view = 'dashboard';
  }

  state.currentView = view;
  if (view === 'dashboard') {
    state.activeTab = tab;
  }
  
  // Push state to browser history
  window.history.pushState({ view, tab }, '', view === 'landing' ? '/' : `/${view}`);
  
  renderApp();
}

// Theme Switcher
export function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  renderApp();
}

// Global Login Helper
export function handleLoginSuccess(userData, token) {
  state.token = token;
  state.user = userData;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  navigateTo('dashboard', 'detector');
}

// Global Logout Helper
export function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigateTo('landing');
}

// Main Core Render Loop
export function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Clear App Container
  appContainer.innerHTML = '';

  // 1. Create App Root Wrapper
  const appRoot = document.createElement('div');
  appRoot.className = 'app';
  appRoot.style.cssText = 'display: flex; flex-direction: column; min-height: 100vh;';
  
  // 2. Render and Mount Navbar
  const navbarElement = renderNavbar();
  appRoot.appendChild(navbarElement);

  // 3. Create Main Content Container
  const mainElement = document.createElement('main');
  if (state.currentView === 'dashboard') {
    mainElement.className = 'dashboard-view-container';
    mainElement.style.cssText = 'padding: 0; flex: 1; width: 100%; max-width: 100%; overflow-x: hidden;';
  } else {
    mainElement.className = 'container';
    mainElement.style.cssText = 'padding: 2rem 1rem; flex: 1; width: 100%;';
  }

  // 4. Load Page Content based on State Router
  let pageContent;
  switch (state.currentView) {
    case 'landing':
      pageContent = renderLanding();
      break;
    case 'login':
      pageContent = renderLogin();
      break;
    case 'register':
      pageContent = renderRegister();
      break;
    case 'dashboard':
      pageContent = renderDashboard();
      break;
    case 'foods':
      pageContent = renderFoods();
      break;
    default:
      pageContent = renderLanding();
  }
  
  mainElement.appendChild(pageContent);
  appRoot.appendChild(mainElement);

  // 5. Render and Mount Footer
  const footerElement = renderFooter();
  appRoot.appendChild(footerElement);

  appContainer.appendChild(appRoot);

  // 6. Automatically convert lucide placeholders into crisp SVGs
  createIcons({ icons });
}

// Global helper to refresh icons across dynamic views without dynamic imports
export function refreshIcons() {
  createIcons({ icons });
}

// Startup
document.addEventListener('DOMContentLoaded', initApp);
// Also self-init in case of HMR or early DOM load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
}
