import { navigateTo } from '../main.js';

export function renderLanding() {
  const wrapper = document.createElement('div');
  wrapper.className = 'landing-page';
  wrapper.style.cssText = 'margin: -2rem -1rem 0 -1rem; display: flex; flex-direction: column; gap: 4rem;';

  // 1. Split Hero Section
  const heroSection = document.createElement('section');
  heroSection.className = 'container';
  heroSection.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    min-height: calc(100vh - 4.5rem);
    padding: 3rem 0;
    gap: 4rem;
  `;
  
  const heroLeft = document.createElement('div');
  heroLeft.style.cssText = 'flex: 1 1 500px; max-width: 620px; display: flex; flex-direction: column; justify-content: center;';
  
  // Custom Typography & Text Gradients
  heroLeft.innerHTML = `
    <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(var(--accent-rgb), 0.08); border: 1.5px solid rgba(var(--accent-rgb), 0.15); border-radius: 9999px; width: fit-content; margin-bottom: 1.5rem; animation: pulse-glow 2.5s infinite;">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent);"></span>
      <span style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent);">AI Calorie Tracking v2.0</span>
    </div>
    <h1 style="font-size: 3.75rem; font-weight: 800; line-height: 1.15; margin-bottom: 1.5rem; color: var(--text-primary); font-family: var(--font-display); letter-spacing: -0.03em;">
      Good health starts with what you <span style="background: linear-gradient(135deg, var(--accent) 30%, var(--primary-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">eat.</span>
    </h1>
    <p class="text-secondary" style="font-size: 1.2rem; margin-bottom: 2.5rem; line-height: 1.7; font-family: var(--font-body); font-weight: 400; max-width: 540px;">
      Want to lose weight, tone up, hit nutrition targets, or lower your BMI? CalorieDetect Pro combines AI vision and clinical food databases to guide your health journey.
    </p>
  `;
  
  const ctaBtnGroup = document.createElement('div');
  ctaBtnGroup.style.cssText = 'display: flex; gap: 1.25rem; flex-wrap: wrap;';
  
  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-purple';
  startBtn.style.cssText = 'font-size: 1.05rem; padding: 1rem 2.5rem; border-radius: 1rem;';
  startBtn.innerHTML = `Start Tracking Free <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>`;
  startBtn.addEventListener('click', () => navigateTo('register'));
  ctaBtnGroup.appendChild(startBtn);

  const loginBtn = document.createElement('button');
  loginBtn.className = 'btn btn-outline';
  loginBtn.style.cssText = 'font-size: 1.05rem; padding: 1rem 2.5rem; border-radius: 1rem;';
  loginBtn.innerHTML = `Log In <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>`;
  loginBtn.addEventListener('click', () => navigateTo('login'));
  ctaBtnGroup.appendChild(loginBtn);
  
  heroLeft.appendChild(ctaBtnGroup);
  heroSection.appendChild(heroLeft);

  // Hero Right Graphic Container
  const heroRight = document.createElement('div');
  heroRight.style.cssText = 'flex: 1 1 450px; display: flex; justify-content: center; align-items: center; position: relative;';
  
  // Create a stunning mock visual or render premium placeholder if real image doesn't exist
  const heroImg = document.createElement('img');
  heroImg.src = '/hero-image.png';
  heroImg.alt = 'Dynamic Fitness Tracking';
  heroImg.style.cssText = 'width: 100%; max-width: 500px; border-radius: 2rem; box-shadow: var(--shadow); border: 1.5px solid var(--glass-border);';
  
  // Premium Fallback Mockup Card
  heroImg.onerror = () => {
    heroRight.innerHTML = `
      <div class="card glass-card-purple" style="width: 100%; max-width: 480px; height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem; border: 1.5px solid var(--glass-border); border-radius: 2.25rem; background: rgba(18, 18, 30, 0.4); box-shadow: var(--shadow); position: relative; z-index: 1;">
        <!-- Scanner laser animation line -->
        <div class="scanner-line"></div>
        
        <!-- Glowing circular icon container -->
        <div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(99, 102, 241, 0.15) 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; border: 2px dashed rgba(var(--accent-rgb), 0.3); position: relative; z-index: 2;">
          <i data-lucide="scan" style="width: 42px; height: 42px; color: var(--accent); stroke-width: 1.5;"></i>
        </div>
        
        <h3 style="font-size: 1.8rem; font-weight: 800; text-align: center; margin-bottom: 0.75rem; font-family: var(--font-display); background: linear-gradient(135deg, #ffffff 30%, var(--text-secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AI Food Scanner</h3>
        <p class="text-secondary" style="font-size: 0.95rem; text-align: center; line-height: 1.6; max-width: 320px; font-family: var(--font-body); margin-bottom: 1.5rem;">
          Snap, detect, and analyze biochemical calories and complete macro distribution instantly.
        </p>

        <!-- Stats Mockup overlays inside card -->
        <div style="display: flex; gap: 0.75rem; width: 100%; margin-top: auto; justify-content: center;">
          <div style="padding: 0.5rem 1rem; border-radius: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">
            <span style="color: var(--accent);">•</span> Protein 30g
          </div>
          <div style="padding: 0.5rem 1rem; border-radius: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">
            <span style="color: var(--primary-purple);">•</span> Carbs 45g
          </div>
          <div style="padding: 0.5rem 1rem; border-radius: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">
            <span style="color: var(--warning);">•</span> Fat 12g
          </div>
        </div>
      </div>
      <!-- Background glowing orb behind fallback card -->
      <div style="position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(var(--accent-glow) 0%, transparent 70%); filter: blur(30px); z-index: 0; pointer-events: none;"></div>
    `;
  };
  heroRight.appendChild(heroImg);
  heroSection.appendChild(heroRight);
  wrapper.appendChild(heroSection);

  // 2. Database Teaser Banner (Stunning Glass Container instead of a plain solid banner)
  const teaserSection = document.createElement('section');
  teaserSection.className = 'container';
  teaserSection.style.cssText = 'padding: 1.5rem 0;';
  
  teaserSection.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(99, 102, 241, 0.08) 100%); border: 1px solid rgba(var(--accent-rgb), 0.2); padding: 2rem; text-align: center; border-radius: 2.25rem; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
      <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; font-family: var(--font-display); letter-spacing: -0.02em;">Search Over 14 Million Foods</h2>
      <p style="font-size: 1.15rem; max-width: 820px; margin: 0 auto; line-height: 1.7; font-family: var(--font-body); color: var(--text-primary); opacity: 0.95;">
        Our massive dynamic catalog syncs with Indian, USDA, and global food datasets. Easily look up native Indian culinary ingredients, raw food items, and premium packaged foods instantly.
      </p>
    </div>
  `;
  wrapper.appendChild(teaserSection);

  // 3. Features Section (Learn, Track, Improve) with premium glassmorphic cards
  const featuresSection = document.createElement('section');
  featuresSection.className = 'container';
  featuresSection.style.cssText = 'padding: 4rem 0; text-align: center;';
  
  const featuresTitle = document.createElement('h2');
  featuresTitle.style.cssText = 'font-size: 2.6rem; font-weight: 800; margin-bottom: 4rem; color: var(--text-primary); font-family: var(--font-display); letter-spacing: -0.02em;';
  featuresTitle.textContent = 'Ultimate Health Companion';
  featuresSection.appendChild(featuresTitle);

  const featuresGrid = document.createElement('div');
  featuresGrid.className = 'grid-3';
  featuresGrid.innerHTML = `
    <!-- Feature 1 -->
    <div class="card glass-card-purple" style="display: flex; flex-direction: column; align-items: center; padding: 2.25rem 1.5rem;">
      <div style="width: 76px; height: 76px; border-radius: 1.5rem; background: rgba(59, 130, 246, 0.1); border: 1.5px solid rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: inset 0 4px 10px rgba(59, 130, 246, 0.05); transition: var(--transition);">
        <i data-lucide="search" style="width: 32px; height: 32px; color: var(--primary-blue); stroke-width: 2.25;"></i>
      </div>
      <h3 style="font-size: 1.45rem; font-weight: 700; margin-bottom: 1rem; font-family: var(--font-display);">1. Discover</h3>
      <p class="text-secondary" style="font-size: 1rem; line-height: 1.6; font-family: var(--font-body);">Track daily meals to learn and understand eating habits. Rich macro analyses bring full nutritional transparency.</p>
    </div>
    <!-- Feature 2 -->
    <div class="card glass-card-purple" style="display: flex; flex-direction: column; align-items: center; padding: 2.25rem 1.5rem;">
      <div style="width: 76px; height: 76px; border-radius: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1.5px solid rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: inset 0 4px 10px rgba(16, 185, 129, 0.05); transition: var(--transition);">
        <i data-lucide="check-circle-2" style="width: 32px; height: 32px; color: var(--accent); stroke-width: 2.25;"></i>
      </div>
      <h3 style="font-size: 1.45rem; font-weight: 700; margin-bottom: 1rem; font-family: var(--font-display);">2. Precision</h3>
      <p class="text-secondary" style="font-size: 1rem; line-height: 1.6; font-family: var(--font-body);">Log ingredients effortlessly with automated AI scan, rapid key-phrase catalog lookups, and direct macro adjustments.</p>
    </div>
    <!-- Feature 3 -->
    <div class="card glass-card-purple" style="display: flex; flex-direction: column; align-items: center; padding: 2.25rem 1.5rem;">
      <div style="width: 76px; height: 76px; border-radius: 1.5rem; background: rgba(99, 102, 241, 0.1); border: 1.5px solid rgba(99, 102, 241, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: inset 0 4px 10px rgba(99, 102, 241, 0.05); transition: var(--transition);">
        <i data-lucide="trending-up" style="width: 32px; height: 32px; color: var(--primary-purple); stroke-width: 2.25;"></i>
      </div>
      <h3 style="font-size: 1.45rem; font-weight: 700; margin-bottom: 1rem; font-family: var(--font-display);">3. Transform</h3>
      <p class="text-secondary" style="font-size: 1rem; line-height: 1.6; font-family: var(--font-body);">Experience customized calorie algorithms tailored dynamically based on your physical vitals, BMI tracking, and updates.</p>
    </div>
  `;
  featuresSection.appendChild(featuresGrid);
  wrapper.appendChild(featuresSection);

  // 4. Final CTA Hero
  const finalCtaSection = document.createElement('section');
  finalCtaSection.className = 'container';
  finalCtaSection.style.cssText = 'padding: 4rem 0 6rem;';
  
  const ctaCard = document.createElement('div');
  ctaCard.className = 'card glass-card';
  ctaCard.style.cssText = `
    text-align: center;
    padding: 3rem 2rem;
    background: radial-gradient(circle at center, rgba(var(--primary-purple-rgb), 0.1) 0%, rgba(0,0,0,0) 80%), var(--card-bg);
    border-radius: 2.5rem;
    border: 1.5px solid var(--glass-border);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
  `;
  
  const ctaTitle = document.createElement('h2');
  ctaTitle.style.cssText = 'font-size: 3.25rem; font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; font-family: var(--font-display); letter-spacing: -0.03em; max-width: 720px;';
  ctaTitle.textContent = 'Reach your goals with CalorieDetect Pro';
  ctaCard.appendChild(ctaTitle);

  const ctaSubtitle = document.createElement('p');
  ctaSubtitle.className = 'text-secondary';
  ctaSubtitle.style.cssText = 'font-size: 1.15rem; margin-bottom: 2.5rem; max-width: 580px; font-family: var(--font-body);';
  ctaSubtitle.textContent = 'Join thousands of users logging meals, calculating water intake levels, and changing habits.';
  ctaCard.appendChild(ctaSubtitle);

  const finalCtaBtn = document.createElement('button');
  finalCtaBtn.className = 'btn btn-purple';
  finalCtaBtn.style.cssText = 'font-size: 1.15rem; padding: 1.125rem 3.5rem; border-radius: 1.25rem;';
  finalCtaBtn.innerHTML = `Start Your Journey Now <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>`;
  finalCtaBtn.addEventListener('click', () => navigateTo('register'));
  ctaCard.appendChild(finalCtaBtn);

  finalCtaSection.appendChild(ctaCard);
  wrapper.appendChild(finalCtaSection);

  return wrapper;
}
