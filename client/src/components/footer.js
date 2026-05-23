import { state, navigateTo } from '../main.js';

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.style.cssText = `
    background-color: var(--card-bg);
    backdrop-filter: blur(var(--glass-blur));
    border-top: 1px solid var(--glass-border);
    padding: 5rem 2rem 2.5rem;
    margin-top: auto;
    position: relative;
  `;

  const container = document.createElement('div');
  container.className = 'container';
  container.style.cssText = `
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 3rem;
    margin-bottom: 4rem;
  `;
  footer.appendChild(container);

  // Brand Column
  const brandCol = document.createElement('div');
  brandCol.innerHTML = `
    <a href="#" class="logo" style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.625rem; fontSize: 1.6rem;">
      <i data-lucide="activity" style="width: 32px; height: 32px; stroke-width: 2.5;"></i>
      <span style="font-weight: 800; font-family: var(--font-display);">CalorieDetect Pro</span>
    </a>
    <p class="text-secondary" style="font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.75rem; max-width: 320px;">
      Empowering you to make smarter, healthier food choices. Track your intake, analyze nutrient composition, and hit your fitness milestones with precision.
    </p>
    <div style="display: flex; gap: 1rem;">
      <a href="#" class="social-icon" aria-label="Website" style="color: var(--text-secondary); padding: 0.5rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="globe" style="width: 18px; height: 18px;"></i></a>
      <a href="#" class="social-icon" aria-label="Email" style="color: var(--text-secondary); padding: 0.5rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="mail" style="width: 18px; height: 18px;"></i></a>
      <a href="#" class="social-icon" aria-label="Phone" style="color: var(--text-secondary); padding: 0.5rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="phone" style="width: 18px; height: 18px;"></i></a>
    </div>
  `;
  // Bind logo link
  const logo = brandCol.querySelector('.logo');
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(state.token ? 'dashboard' : 'landing');
  });
  
  // Add hover effect style for social icons
  const socialIcons = brandCol.querySelectorAll('.social-icon');
  socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.color = 'var(--accent)';
      icon.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
      icon.style.background = 'rgba(var(--accent-rgb), 0.05)';
      icon.style.transform = 'translateY(-2px)';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.color = 'var(--text-secondary)';
      icon.style.borderColor = 'var(--glass-border)';
      icon.style.background = 'rgba(255,255,255,0.03)';
      icon.style.transform = 'none';
    });
  });
  container.appendChild(brandCol);

  // Column 2 - Products
  const productsCol = document.createElement('div');
  productsCol.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary);">Products</h4>
    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.875rem;">
      <li><a href="#" class="footer-link footer-link-foods" style="color: var(--text-secondary); font-size: 0.95rem;">Food Database</a></li>
      <li><a href="#" class="footer-link footer-link-dash" style="color: var(--text-secondary); font-size: 0.95rem;">Macro Tracker</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Mobile App</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Premium API</a></li>
    </ul>
  `;
  productsCol.querySelector('.footer-link-foods').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(state.token ? 'foods' : 'login');
  });
  productsCol.querySelector('.footer-link-dash').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(state.token ? 'dashboard' : 'login');
  });
  container.appendChild(productsCol);

  // Column 3 - Resources
  const resourcesCol = document.createElement('div');
  resourcesCol.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary);">Resources</h4>
    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.875rem;">
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Health Blog</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Community Forums</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Success Stories</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Help Center</a></li>
    </ul>
  `;
  container.appendChild(resourcesCol);

  // Column 4 - Company
  const companyCol = document.createElement('div');
  companyCol.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary);">Company</h4>
    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.875rem;">
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">About Us</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Careers</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Privacy Policy</a></li>
      <li><a href="#" class="footer-link" style="color: var(--text-secondary); font-size: 0.95rem;">Terms of Service</a></li>
    </ul>
  `;
  container.appendChild(companyCol);

  // Setup link hover transitions for footer-link class
  footer.querySelectorAll('.footer-link').forEach(link => {
    link.style.transition = 'var(--transition)';
    link.addEventListener('mouseenter', () => {
      link.style.color = 'var(--accent)';
      link.style.transform = 'translateX(4px)';
    });
    link.addEventListener('mouseleave', () => {
      link.style.color = 'var(--text-secondary)';
      link.style.transform = 'none';
    });
  });

  // Bottom Area
  const bottom = document.createElement('div');
  bottom.className = 'container';
  bottom.style.cssText = `
    border-top: 1px solid var(--glass-border);
    padding-top: 2.5rem;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  `;
  bottom.innerHTML = `
    <p class="text-secondary" style="font-size: 0.9rem;">
      &copy; ${new Date().getFullYear()} CalorieDetect Pro. Built with premium precision. All rights reserved.
    </p>
    <p style="font-size: 0.85rem; color: rgba(var(--accent-rgb), 0.7); display: flex; align-items: center; gap: 0.35rem; font-weight: 500;">
      <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Secure & Encrypted Connection
    </p>
  `;
  footer.appendChild(bottom);

  // Responsive Footer styling
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @media (max-width: 968px) {
      footer > .container {
        grid-template-columns: 1fr 1fr !important;
        gap: 2.5rem !important;
      }
    }
    @media (max-width: 520px) {
      footer > .container {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      footer div[style*="justify-content: space-between"] {
        flex-direction: column !important;
        text-align: center !important;
      }
    }
  `;
  document.head.appendChild(styleTag);

  return footer;
}
