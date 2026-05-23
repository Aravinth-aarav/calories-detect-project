import api from '../api.js';
import { navigateTo, showToast, refreshIcons } from '../main.js';

export function renderRegister() {
  const container = document.createElement('div');
  container.style.cssText = 'max-width: 520px; margin: 4rem auto; width: 100%; padding: 0 1rem;';

  const card = document.createElement('div');
  card.className = 'card glass-card-purple';
  card.style.cssText = `
    padding: 2.25rem 2rem;
    border-radius: 2rem;
    box-shadow: var(--shadow);
  `;
  container.appendChild(card);

  // Icon Badge Group at top of Register
  const badgeContainer = document.createElement('div');
  badgeContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem;';
  badgeContainer.innerHTML = `
    <div style="width: 64px; height: 64px; border-radius: 1.25rem; background: rgba(var(--accent-rgb), 0.08); border: 1.5px solid rgba(var(--accent-rgb), 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; box-shadow: var(--primary-purple-glow); transition: var(--transition);">
      <i data-lucide="user-plus" style="width: 30px; height: 30px; color: var(--accent); stroke-width: 2;"></i>
    </div>
  `;
  card.appendChild(badgeContainer);

  const title = document.createElement('h2');
  title.className = 'text-center mb-2';
  title.style.cssText = 'font-family: var(--font-display); font-size: 2.1rem; font-weight: 800; letter-spacing: -0.02em;';
  title.textContent = 'Create Account';
  badgeContainer.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'text-center text-secondary';
  subtitle.style.cssText = 'font-size: 0.95rem; font-family: var(--font-body); margin-bottom: 0.5rem;';
  subtitle.textContent = 'Begin your personal health & calorie tracking journey today.';
  badgeContainer.appendChild(subtitle);

  // Error Alert Container
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

  // Form Fields
  form.innerHTML = `
    <div class="input-group" style="margin-bottom: 1.25rem;">
      <label>Full Name</label>
      <div style="position: relative;">
        <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
          <i data-lucide="user" style="width: 18px; height: 18px;"></i>
        </span>
        <input type="text" name="name" placeholder="John Doe" class="input" required style="padding-left: 2.75rem;" />
      </div>
    </div>
    
    <div class="input-group" style="margin-bottom: 1.25rem;">
      <label>Email Address</label>
      <div style="position: relative;">
        <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
          <i data-lucide="mail" style="width: 18px; height: 18px;"></i>
        </span>
        <input type="email" name="email" placeholder="john@example.com" class="input" required style="padding-left: 2.75rem;" />
      </div>
    </div>
    
    <div class="grid-2" style="gap: 1rem; margin-bottom: 1.25rem;">
      <div class="input-group" style="margin-bottom: 0;">
        <label>Password</label>
        <div style="position: relative;">
          <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
            <i data-lucide="lock" style="width: 18px; height: 18px;"></i>
          </span>
          <input type="password" name="password" placeholder="••••••••" class="input" minlength="6" required style="padding-left: 2.75rem; padding-right: 2.5rem;" />
          <button type="button" class="btn-toggle-pass" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: var(--transition);">
            <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
      
      <div class="input-group" style="margin-bottom: 0;">
        <label>Confirm Password</label>
        <div style="position: relative;">
          <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
            <i data-lucide="lock" style="width: 18px; height: 18px;"></i>
          </span>
          <input type="password" name="confirmPassword" placeholder="••••••••" class="input" minlength="6" required style="padding-left: 2.75rem; padding-right: 2.5rem;" />
          <button type="button" class="btn-toggle-confirm" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: var(--transition);">
            <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="grid-2" style="gap: 1rem; margin-bottom: 1.25rem;">
      <div class="input-group" style="margin-bottom: 0;">
        <label>Weight (kg)</label>
        <div style="position: relative;">
          <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
            <i data-lucide="scale" style="width: 18px; height: 18px;"></i>
          </span>
          <input type="number" name="weight" placeholder="e.g. 70" class="input" required style="padding-left: 2.75rem;" />
        </div>
      </div>
      
      <div class="input-group" style="margin-bottom: 0;">
        <label>Height (cm)</label>
        <div style="position: relative;">
          <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
            <i data-lucide="ruler" style="width: 18px; height: 18px;"></i>
          </span>
          <input type="number" name="height" placeholder="e.g. 175" class="input" required style="padding-left: 2.75rem;" />
        </div>
      </div>
    </div>
    
    <div class="input-group" style="margin-bottom: 1.5rem;">
      <label>Daily Calorie Goal (kcal)</label>
      <div style="position: relative;">
        <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
          <i data-lucide="flame" style="width: 18px; height: 18px;"></i>
        </span>
        <input type="number" name="dailyCalorieGoal" placeholder="e.g. 2000" class="input" required style="padding-left: 2.75rem;" />
      </div>
    </div>

    <button type="submit" class="btn btn-purple" style="width: 100%; margin-top: 1rem; font-size: 1.05rem; padding: 0.875rem; border-radius: 0.875rem;">
      Register Account <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
    </button>
  `;

  // Dynamic Password Visibility Toggle Helper
  const setupPasswordToggle = (inputName, buttonClass) => {
    const input = form.querySelector(`input[name="${inputName}"]`);
    const btn = form.querySelector(`.${buttonClass}`);
    let show = false;

    btn.addEventListener('click', () => {
      show = !show;
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show 
        ? '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>' 
        : '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
      refreshIcons();
    });
  };

  setupPasswordToggle('password', 'btn-toggle-pass');
  setupPasswordToggle('confirmPassword', 'btn-toggle-confirm');

  // Login link teaser
  const loginTeaser = document.createElement('p');
  loginTeaser.className = 'text-center mt-6 text-secondary';
  loginTeaser.style.fontSize = '0.9rem';
  loginTeaser.innerHTML = `Already have an account? <a href="#" style="color: var(--accent); font-weight: 600; text-decoration: underline;">Log in</a>`;
  loginTeaser.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('login');
  });
  card.appendChild(loginTeaser);

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
    
    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      errorContainer.textContent = 'Passwords do not match!';
      errorContainer.style.display = 'block';
      showToast(errorContainer.textContent, 'error');
      return;
    }

    const payload = {
      name: formData.get('name') ? formData.get('name').trim() : '',
      email: formData.get('email') ? formData.get('email').trim().toLowerCase() : '',
      password: password,
      weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
      height: formData.get('height') ? Number(formData.get('height')) : undefined,
      dailyCalorieGoal: formData.get('dailyCalorieGoal') ? Number(formData.get('dailyCalorieGoal')) : undefined
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Creating Account <i data-lucide="loader" style="width: 18px; height: 18px; animation: spin 1.5s linear infinite;"></i>`;
    refreshIcons();

    try {
      await api.post('/auth/register', payload);
      showToast('Registration successful! Please login with your details.', 'success');
      setTimeout(() => {
        navigateTo('login');
      }, 500);
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to register';
      if (err.response?.data?.errors) {
        errMsg = err.response.data.errors[0].msg;
      } else {
        errMsg = err.response?.data?.error || err.message || 'Failed to register';
      }
      errorContainer.textContent = errMsg;
      errorContainer.style.display = 'block';
      showToast(errMsg, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Register Account <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>`;
      refreshIcons();
    }
  });

  return container;
}
