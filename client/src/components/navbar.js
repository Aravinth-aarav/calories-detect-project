import { state, navigateTo, toggleTheme, handleLogout, refreshIcons } from '../main.js';

export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';

  const container = document.createElement('div');
  container.className = 'container nav-content';
  nav.appendChild(container);

  // Logo Link
  const logoLink = document.createElement('a');
  logoLink.href = '#';
  logoLink.className = 'logo';
  logoLink.style.display = 'flex';
  logoLink.style.alignItems = 'center';
  logoLink.style.gap = '0.625rem';
  logoLink.innerHTML = `
    <i data-lucide="activity" style="width: 30px; height: 30px; stroke-width: 2.5;"></i>
    <span style="font-weight: 800; font-family: var(--font-display);">CalorieDetect Pro</span>
  `;
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(state.token ? 'dashboard' : 'landing');
  });
  container.appendChild(logoLink);

  // Mobile Menu Toggle Button (Hamburger)
  const mobileToggle = document.createElement('button');
  mobileToggle.className = 'btn-outline';
  mobileToggle.style.cssText = `
    display: none;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  `;
  mobileToggle.innerHTML = '<i data-lucide="menu" style="width: 22px; height: 22px; color: var(--text-primary);"></i>';
  container.appendChild(mobileToggle);

  // Nav Links and Actions Wrapper
  const navLinks = document.createElement('div');
  navLinks.className = 'nav-links';
  navLinks.style.cssText = `
    display: flex;
    gap: 1.5rem;
    align-items: center;
    transition: var(--transition);
  `;
  container.appendChild(navLinks);

  // Theme Toggle Button with beautiful rotating animation
  const themeBtn = document.createElement('button');
  themeBtn.className = 'btn-outline';
  themeBtn.style.cssText = `
    border: none;
    padding: 0.6rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--glass-border);
    transition: var(--transition);
  `;
  themeBtn.setAttribute('aria-label', 'Toggle theme');
  themeBtn.innerHTML = state.theme === 'light' 
    ? '<i data-lucide="moon" style="width: 18px; height: 18px; color: var(--text-primary);"></i>' 
    : '<i data-lucide="sun" style="width: 18px; height: 18px; color: var(--text-primary);"></i>';
  themeBtn.addEventListener('click', () => {
    themeBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      toggleTheme();
    }, 150);
  });
  navLinks.appendChild(themeBtn);

  if (state.token && state.user) {
    // Foods Database link if authenticated
    const foodsLink = document.createElement('a');
    foodsLink.href = '#';
    foodsLink.className = state.currentView === 'foods' ? 'text-primary' : 'text-secondary';
    foodsLink.style.cssText = 'font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;';
    foodsLink.innerHTML = `<i data-lucide="search" style="width: 16px; height: 16px;"></i> Foods`;
    foodsLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('foods');
    });
    navLinks.appendChild(foodsLink);

    // Dashboard link if authenticated
    const dashLink = document.createElement('a');
    dashLink.href = '#';
    dashLink.className = state.currentView === 'dashboard' ? 'text-primary' : 'text-secondary';
    dashLink.style.cssText = 'font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; margin-right: 0.5rem;';
    dashLink.innerHTML = `<i data-lucide="layout-dashboard" style="width: 16px; height: 16px;"></i> Dashboard`;
    dashLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('dashboard');
    });
    navLinks.appendChild(dashLink);

    // User Profile Widget with Hover Glow
    const profileWidget = document.createElement('div');
    profileWidget.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.625rem;
      color: var(--text-primary);
      cursor: pointer;
      padding: 0.375rem 0.875rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--glass-border);
      border-radius: 9999px;
      transition: var(--transition);
    `;
    profileWidget.addEventListener('mouseenter', () => {
      profileWidget.style.boxShadow = '0 0 12px rgba(var(--accent-rgb), 0.2)';
      profileWidget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
    });
    profileWidget.addEventListener('mouseleave', () => {
      profileWidget.style.boxShadow = 'none';
      profileWidget.style.borderColor = 'var(--glass-border)';
    });
    profileWidget.addEventListener('click', () => navigateTo('dashboard', 'settings'));

    if (state.user.profilePhoto) {
      profileWidget.innerHTML = `
        <img src="${state.user.profilePhoto}" alt="${state.user.name}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--accent);" />
        <span style="font-weight: 600; font-size: 0.9rem;">${state.user.name}</span>
      `;
    } else {
      profileWidget.innerHTML = `
        <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--border);">
          <i data-lucide="user" style="width: 13px; height: 13px; color: var(--text-secondary);"></i>
        </div>
        <span style="font-weight: 600; font-size: 0.9rem;">${state.user.name}</span>
      `;
    }
    navLinks.appendChild(profileWidget);

    // Logout Button with Beautiful styling
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn-outline';
    logoutBtn.style.cssText = `
      border: none;
      padding: 0.6rem;
      border-radius: 50%;
      cursor: pointer;
      color: var(--danger);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(244, 63, 94, 0.05);
      border: 1px solid rgba(244, 63, 94, 0.1);
      transition: var(--transition);
    `;
    logoutBtn.setAttribute('aria-label', 'Log out');
    logoutBtn.innerHTML = '<i data-lucide="log-out" style="width: 18px; height: 18px;"></i>';
    logoutBtn.addEventListener('mouseenter', () => {
      logoutBtn.style.background = 'rgba(244, 63, 94, 0.15)';
      logoutBtn.style.transform = 'translateX(2px)';
    });
    logoutBtn.addEventListener('mouseleave', () => {
      logoutBtn.style.background = 'rgba(244, 63, 94, 0.05)';
      logoutBtn.style.transform = 'none';
    });
    logoutBtn.addEventListener('click', () => {
      if (window.confirm('Are you sure you want to log out?')) {
        handleLogout();
      }
    });
    navLinks.appendChild(logoutBtn);

  } else {
    // Guest Auth Links
    const authWrapper = document.createElement('div');
    authWrapper.style.cssText = 'display: flex; gap: 0.75rem;';

    const loginLink = document.createElement('a');
    loginLink.href = '#';
    loginLink.className = 'btn btn-outline';
    loginLink.style.padding = '0.6rem 1.25rem';
    loginLink.style.borderRadius = '0.75rem';
    loginLink.style.fontSize = '0.9rem';
    loginLink.textContent = 'Login';
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('login');
    });
    authWrapper.appendChild(loginLink);

    const registerLink = document.createElement('a');
    registerLink.href = '#';
    registerLink.className = 'btn';
    registerLink.style.padding = '0.6rem 1.25rem';
    registerLink.style.borderRadius = '0.75rem';
    registerLink.style.fontSize = '0.9rem';
    registerLink.textContent = 'Register';
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('register');
    });
    authWrapper.appendChild(registerLink);

    navLinks.appendChild(authWrapper);
  }

  // Responsive Navbar Logic for Tablets & Mobile
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @media (max-width: 768px) {
      .navbar .nav-content {
        position: relative;
      }
      .navbar .btn-outline[style*="display: none"] {
        display: flex !important;
      }
      .navbar .nav-links {
        display: none !important;
        position: absolute;
        top: 4.5rem;
        right: 1rem;
        flex-direction: column;
        background: var(--card-bg);
        backdrop-filter: blur(24px);
        border: 1px solid var(--glass-border);
        padding: 1.5rem;
        border-radius: 1.25rem;
        box-shadow: var(--shadow);
        width: calc(100% - 2rem);
        align-items: stretch !important;
        gap: 1.25rem !important;
        z-index: 999;
      }
      .navbar .nav-links.mobile-open {
        display: flex !important;
      }
      .navbar .nav-links div[style*="display: flex"] {
        flex-direction: column;
        width: 100%;
      }
      .navbar .nav-links div[style*="display: flex"] a,
      .navbar .nav-links div[style*="display: flex"] button {
        width: 100%;
        text-align: center;
        justify-content: center;
      }
      .navbar .nav-links a {
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
    }
  `;
  document.head.appendChild(styleTag);

  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const isOpen = navLinks.classList.contains('mobile-open');
    mobileToggle.innerHTML = isOpen 
      ? '<i data-lucide="x" style="width: 22px; height: 22px; color: var(--text-primary);"></i>' 
      : '<i data-lucide="menu" style="width: 22px; height: 22px; color: var(--text-primary);"></i>';
    // Re-render icons dynamically
    refreshIcons();
  });

  return nav;
}
