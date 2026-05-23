import api from '../api.js';
import { handleLoginSuccess, navigateTo, showToast, refreshIcons } from '../main.js';

export function renderLogin() {
  const container = document.createElement('div');
  container.style.cssText = 'max-width: 440px; margin: 5rem auto; width: 100%; padding: 0 1rem;';

  const card = document.createElement('div');
  card.className = 'card glass-card-purple';
  card.style.cssText = `
    padding: 2.25rem 2rem;
    border-radius: 2rem;
    box-shadow: var(--shadow);
  `;
  container.appendChild(card);

  // Icon Badge Group at top of Login
  const badgeContainer = document.createElement('div');
  badgeContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem;';
  badgeContainer.innerHTML = `
    <div style="width: 64px; height: 64px; border-radius: 1.25rem; background: rgba(var(--accent-rgb), 0.08); border: 1.5px solid rgba(var(--accent-rgb), 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; box-shadow: var(--primary-purple-glow); transition: var(--transition);">
      <i data-lucide="shield-check" style="width: 30px; height: 30px; color: var(--accent); stroke-width: 2;"></i>
    </div>
  `;
  card.appendChild(badgeContainer);

  const title = document.createElement('h2');
  title.className = 'text-center mb-2';
  title.style.cssText = 'font-family: var(--font-display); font-size: 2.1rem; font-weight: 800; letter-spacing: -0.02em;';
  title.textContent = 'Welcome Back';
  badgeContainer.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'text-center text-secondary';
  subtitle.style.cssText = 'font-size: 0.95rem; font-family: var(--font-body); margin-bottom: 0.5rem;';
  subtitle.textContent = 'Enter your credentials to access your vitals dashboard.';
  badgeContainer.appendChild(subtitle);

  // Error Alert Container with smooth height slide transitions
  const errorContainer = document.createElement('div');
  errorContainer.style.cssText = `
    color: var(--danger); 
    margin-bottom: 1.5rem; 
    text-align: center; 
    font-weight: 600; 
    font-size: 0.9rem; 
    padding: 0.75rem; 
    border-radius: 0.75rem; 
    background: rgba(244, 63, 94, 0.08); 
    border: 1px solid rgba(244, 63, 94, 0.15);
    display: none;
  `;
  card.appendChild(errorContainer);

  const form = document.createElement('form');
  card.appendChild(form);

  // Email Input Group
  const emailGroup = document.createElement('div');
  emailGroup.className = 'input-group';
  emailGroup.style.marginBottom = '1.5rem';
  
  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email Address';
  emailGroup.appendChild(emailLabel);

  const emailInputWrapper = document.createElement('div');
  emailInputWrapper.style.position = 'relative';
  emailGroup.appendChild(emailInputWrapper);

  const emailIcon = document.createElement('span');
  emailIcon.style.cssText = 'position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;';
  emailIcon.innerHTML = '<i data-lucide="mail" style="width: 18px; height: 18px;"></i>';
  emailInputWrapper.appendChild(emailIcon);

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'you@example.com';
  emailInput.className = 'input';
  emailInput.required = true;
  emailInput.style.paddingLeft = '2.75rem';
  emailInputWrapper.appendChild(emailInput);
  
  form.appendChild(emailGroup);

  // Password Input Group
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'input-group';
  passwordGroup.style.marginBottom = '1.5rem';
  
  const passLabel = document.createElement('label');
  passLabel.textContent = 'Password';
  passwordGroup.appendChild(passLabel);

  const passInputWrapper = document.createElement('div');
  passInputWrapper.style.position = 'relative';
  passwordGroup.appendChild(passInputWrapper);

  const lockIcon = document.createElement('span');
  lockIcon.style.cssText = 'position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;';
  lockIcon.innerHTML = '<i data-lucide="lock" style="width: 18px; height: 18px;"></i>';
  passInputWrapper.appendChild(lockIcon);

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = '••••••••';
  passwordInput.className = 'input';
  passwordInput.required = true;
  passwordInput.style.paddingLeft = '2.75rem';
  passwordInput.style.paddingRight = '2.75rem';
  passInputWrapper.appendChild(passwordInput);

  const togglePassBtn = document.createElement('button');
  togglePassBtn.type = 'button';
  togglePassBtn.style.cssText = 'position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: var(--transition);';
  togglePassBtn.innerHTML = '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
  
  let showPassword = false;
  togglePassBtn.addEventListener('click', () => {
    showPassword = !showPassword;
    passwordInput.type = showPassword ? 'text' : 'password';
    togglePassBtn.innerHTML = showPassword 
      ? '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>' 
      : '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
    // Redraw dynamic icons
    refreshIcons();
  });
  passInputWrapper.appendChild(togglePassBtn);
  form.appendChild(passwordGroup);

  // Submit Button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-purple';
  submitBtn.style.cssText = 'width: 100%; margin-top: 1rem; font-size: 1.05rem; padding: 0.875rem; border-radius: 0.875rem;';
  submitBtn.innerHTML = `Login <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>`;
  form.appendChild(submitBtn);

  // Signup Teaser
  const signupTeaser = document.createElement('p');
  signupTeaser.className = 'text-center mt-6 text-secondary';
  signupTeaser.style.fontSize = '0.9rem';
  signupTeaser.innerHTML = `Don't have an account? <a href="#" style="color: var(--accent); font-weight: 600; text-decoration: underline;">Sign up</a>`;
  signupTeaser.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('register');
  });
  card.appendChild(signupTeaser);

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Logging in <i data-lucide="loader" style="width: 18px; height: 18px; animation: spin 1.5s linear infinite;"></i>`;
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
    
    // Import loader icon standard spinner
    refreshIcons();

    try {
      const res = await api.post('/auth/login', {
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value
      });
      showToast('Welcome back to CalorieDetect Pro!', 'success');
      handleLoginSuccess(res.data.user, res.data.token);
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to login';
      if (err.response?.data?.errors) {
        errMsg = err.response.data.errors[0].msg;
      } else {
        errMsg = err.response?.data?.error || err.message || 'Failed to login';
      }
      errorContainer.textContent = errMsg;
      errorContainer.style.display = 'block';
      showToast(errMsg, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Login <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>`;
      refreshIcons();
    }
  });

  // Adding support styling for inline rotation and loading
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);

  return container;
}
