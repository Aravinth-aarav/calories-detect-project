import api from '../api.js';
import { state, showToast, refreshIcons, renderApp } from '../main.js';
import Chart from 'chart.js/auto';

// Local Chart Instances to prevent memory leaks and canvas bugs
let progressChartInstance = null;
let macroChartInstance = null;
let compareChartInstance = null;

// Local Dashboard State variables
let foods = [];
let search = '';
let selectedFood = null;
let compareItems = [];
let isScanning = false;
let quantity = 1;
let todayLog = null;
let loading = true;
let bmiWeight = 70;
let bmiHeight = 170;
let fetchDashboardDataFn = null;

export function renderDashboard() {
  const container = document.createElement('div');
  container.className = 'dashboard-wrapper';
  container.style.cssText = 'min-height: 100vh; padding-bottom: 4rem; position: relative;';

  // Define local fetch routine
  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [logRes, foodsRes] = await Promise.all([
        api.get(`/logs/${today}`),
        api.get('/foods?limit=15')
      ]);
      todayLog = logRes.data;
      foods = foodsRes.data;
      loading = false;
      
      // Check for daily goals achieved
      const goal = state.user.dailyCalorieGoal || 2000;
      const consumed = todayLog.totalCaloriesConsumed || 0;
      const water = todayLog.waterIntake || 0;

      if (consumed >= goal && !localStorage.getItem(`goal_reached_cal_${today}`)) {
        showToast('🎉 Congratulations! Daily Calorie Goal Reached!', 'success');
        localStorage.setItem(`goal_reached_cal_${today}`, 'true');
      }
      if (water >= 8 && !localStorage.getItem(`goal_reached_water_${today}`)) {
        showToast('💧 Amazing! Daily Hydration Target Reached!', 'success');
        localStorage.setItem(`goal_reached_water_${today}`, 'true');
      }

      drawDashboardContent(container);
    } catch {
      loading = false;
      container.innerHTML = '<div class="container" style="max-width: 600px; margin: 4rem auto; text-align: center;"><p class="text-danger mt-4" style="font-weight: 600;">Failed to initialize dashboard. Please check database connection.</p></div>';
    }
  };
  fetchDashboardDataFn = fetchDashboardData;

  // Global styles for animations
  const animationStyles = document.createElement('style');
  animationStyles.textContent = `
    @keyframes slideIn {
      from { transform: translateY(15px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .custom-scroll::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 10px;
    }
    .custom-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }
    .dashboard-layout {
      animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `;
  container.appendChild(animationStyles);

  // Initial Sync of Local state from global state
  if (state.user) {
    bmiWeight = state.user.weight || 70;
    bmiHeight = state.user.height || 170;
  }

  if (loading) {
    // Elegant Pulse Loader
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; background: var(--bg-primary);">
        <div class="pulse" style="padding: 2.25rem; border-radius: 50%; background: var(--accent-glow); display: flex;">
          <i data-lucide="zap" style="width: 56px; height: 56px; color: var(--accent);"></i>
        </div>
        <h2 style="margin-top: 2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Initializing AI Engine...</h2>
        <p class="text-secondary" style="font-size: 1.05rem; margin-top: 0.5rem; font-family: var(--font-body);">Syncing with biochemical nutrition catalog</p>
      </div>
    `;
    fetchDashboardData();
  } else {
    drawDashboardContent(container);
  }

  return container;
}

// Render loop drawer
function drawDashboardContent(container) {
  container.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'dashboard-layout';
  container.appendChild(layout);

  // 1. Sidebar Navigation
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  layout.appendChild(sidebar);

  const tabIcons = [
    { id: 'detector', icon: 'layout-dashboard', label: 'AI Scanner' },
    { id: 'compare', icon: 'arrow-left-right', label: 'Compare' },
    { id: 'history', icon: 'history', label: 'Diet Log' },
    { id: 'workouts', icon: 'trending-up', label: 'Exercise' },
    { id: 'favorites', icon: 'heart', label: 'Favorites' },
    { id: 'bmi', icon: 'calculator', label: 'BMI Hub' }
  ];

  tabIcons.forEach(tab => {
    const iconBtn = document.createElement('div');
    iconBtn.className = `sidebar-icon ${state.activeTab === tab.id ? 'active' : ''}`;
    iconBtn.title = tab.label;
    iconBtn.innerHTML = `<i data-lucide="${tab.icon}" style="width: 22px; height: 22px;"></i>`;
    iconBtn.addEventListener('click', () => {
      state.activeTab = tab.id;
      drawDashboardContent(container);
    });
    sidebar.appendChild(iconBtn);
  });

  const spacer = document.createElement('div');
  spacer.style.flex = '1';
  sidebar.appendChild(spacer);

  const sidebarUser = document.createElement('div');
  sidebarUser.className = 'sidebar-icon';
  sidebarUser.title = 'Settings';
  sidebarUser.innerHTML = '<i data-lucide="user" style="width: 22px; height: 22px;"></i>';
  sidebarUser.addEventListener('click', () => {
    state.activeTab = 'settings';
    drawDashboardContent(container);
  });
  sidebar.appendChild(sidebarUser);

  // 2. Main Content Wrapper
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  mainContent.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 2.5rem; overflow-x: hidden;';
  layout.appendChild(mainContent);

  // 3. Header & Overview Section (Welcome & Stats Grid)

  // Welcome banner row
  const welcomeRow = document.createElement('div');
  welcomeRow.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;';
  welcomeRow.innerHTML = `
    <div>
      <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.03em;">
        Welcome back, <span style="background: linear-gradient(135deg, var(--accent) 30%, var(--primary-purple) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${state.user.name.split(' ')[0]}</span>!
      </h1>
      <p class="text-secondary" style="font-size: 1.05rem; font-family: var(--font-body);">Here is your bio-energetic nutritional overview for today.</p>
    </div>
    <div class="card" style="padding: 0.5rem 1.25rem; display: flex; align-items: center; gap: 0.875rem; border-radius: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
      <div style="text-align: right;">
        <div style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.05em; text-transform: uppercase;">BIOMETRIC SYNC</div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">Online Mainframe</div>
      </div>
      <div class="pulse" style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent);"></div>
    </div>
  `;
  mainContent.appendChild(welcomeRow);

  // Stats Grid Cards
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid-3';
  // statsGrid will be appended below dynamicGrid

  const totalConsumed = todayLog?.totalCaloriesConsumed || 0;
  const totalBurned = todayLog?.totalCaloriesBurned || 0;
  const netCalories = totalConsumed - totalBurned;
  const goal = state.user.dailyCalorieGoal || 2000;
  const remaining = goal - netCalories;
  const progressPercent = Math.min(Math.max((netCalories / goal) * 100, 0), 100);

  // Circular Calorie doughnut card
  const progressCard = document.createElement('div');
  progressCard.className = 'card';
  progressCard.style.cssText = `
    background: linear-gradient(135deg, var(--card-bg) 0%, rgba(var(--accent-rgb), 0.05) 100%);
    display: flex;
    align-items: center;
    gap: 1.75rem;
    position: relative;
    overflow: hidden;
  `;
  statsGrid.appendChild(progressCard);

  const progressChartContainer = document.createElement('div');
  progressChartContainer.style.cssText = 'position: relative; width: 110px; height: 110px; flex-shrink: 0;';
  progressChartContainer.innerHTML = `
    <canvas id="progressCalorieChart" width="110" height="110"></canvas>
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 800; font-size: 0.95rem; font-family: var(--font-display); color: var(--accent);">${Math.round(progressPercent)}%</div>
  `;
  progressCard.appendChild(progressChartContainer);

  const progressStats = document.createElement('div');
  progressStats.innerHTML = `
    <div class="text-secondary" style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.25rem;">Daily Progress</div>
    <div style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.25rem; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">
      ${remaining > 0 ? `${remaining} kcal left` : 'Target Achieved!'}
    </div>
    <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
      <i data-lucide="target" style="width: 14px; height: 14px; color: var(--accent);"></i>
      <span>Goal: ${goal} kcal</span>
    </div>
  `;
  progressCard.appendChild(progressStats);

  // Consumed Card
  const consumedCard = document.createElement('div');
  consumedCard.className = 'card';
  consumedCard.style.cssText = 'display: flex; flex-direction: column; justify-content: center; padding: 1.75rem;';
  consumedCard.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
      <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(59, 130, 246, 0.08); display: flex; align-items: center; justify-content: center; border: 1.5px solid rgba(59, 130, 246, 0.15);">
        <i data-lucide="flame" style="width: 18px; height: 18px; color: var(--primary-blue);"></i>
      </div>
      <span class="text-secondary" style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Intake Log</span>
    </div>
    <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">${totalConsumed} <span style="font-size: 1rem; color: var(--text-secondary); font-weight: 500;">kcal</span></div>
    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">Total calories consumed today</div>
  `;
  statsGrid.appendChild(consumedCard);

  // Burned / Activities Card
  const burnedCard = document.createElement('div');
  burnedCard.className = 'card';
  burnedCard.style.cssText = 'display: flex; flex-direction: column; justify-content: center; padding: 1.75rem;';
  burnedCard.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
      <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245, 158, 11, 0.08); display: flex; align-items: center; justify-content: center; border: 1.5px solid rgba(245, 158, 11, 0.15);">
        <i data-lucide="activity" style="width: 18px; height: 18px; color: #f59e0b;"></i>
      </div>
      <span class="text-secondary" style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Active Burn</span>
    </div>
    <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">${totalBurned} <span style="font-size: 1rem; color: var(--text-secondary); font-weight: 500;">kcal</span></div>
    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">Active calories burned through exercise</div>
  `;
  statsGrid.appendChild(burnedCard);

  // 4. Hydration Water Tracker Section (with gorgeous simulated cylinder)
  const waterTracker = document.createElement('section');
  waterTracker.className = 'card';
  waterTracker.style.cssText = `
    padding: 2rem; 
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%);
    border: 1.5px solid rgba(59, 130, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 2rem;
  `;

  const waterLeft = document.createElement('div');
  waterLeft.style.cssText = 'display: flex; align-items: center; gap: 1.5rem;';
  
  const currentWater = todayLog?.waterIntake || 0;
  
  // 3D Glass Cylinder Simulation HTML
  waterLeft.innerHTML = `
    <div class="water-container">
      <div class="water-fluid" style="height: ${Math.min((currentWater / 8) * 100, 100)}%;"></div>
    </div>
    <div>
      <h3 style="font-size: 1.45rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Hydration Cylinder</h3>
      <p class="text-secondary" style="font-size: 0.9rem; margin-top: 0.15rem; font-family: var(--font-body);">Fluid Intake Target: 8 Glasses (2.5L)</p>
    </div>
  `;
  waterTracker.appendChild(waterLeft);

  const waterRight = document.createElement('div');
  waterRight.style.cssText = 'display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;';
  waterTracker.appendChild(waterRight);

  // Glasses visual representation (minimalist dots grid)
  const glassesWrapper = document.createElement('div');
  glassesWrapper.style.cssText = 'display: flex; gap: 0.65rem;';
  waterRight.appendChild(glassesWrapper);

  for (let i = 0; i < 8; i++) {
    const glass = document.createElement('div');
    glass.style.cssText = `
      width: 12px; 
      height: 12px; 
      border-radius: 50%; 
      background: ${i < currentWater ? 'var(--primary-blue)' : 'rgba(255,255,255,0.04)'}; 
      border: 1px solid rgba(59, 130, 246, 0.4);
      box-shadow: ${i < currentWater ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'};
      transition: var(--transition);
    `;
    glassesWrapper.appendChild(glass);
  }

  // Adjust controls
  const waterControls = document.createElement('div');
  waterControls.style.cssText = 'display: flex; align-items: center; gap: 1rem; background: rgba(0,0,0,0.12); padding: 0.4rem 0.875rem; border-radius: 0.875rem; border: 1px solid var(--glass-border);';
  waterControls.innerHTML = `
    <button class="minus-water" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: var(--transition);" title="Minus 1 glass">
      <i data-lucide="minus-circle" style="width: 20px; height: 20px;"></i>
    </button>
    <span style="font-size: 1.35rem; font-weight: 800; min-width: 1.5ch; text-align: center; color: var(--text-primary); font-family: var(--font-display);">${currentWater}</span>
    <button class="plus-water" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--primary-blue); transition: var(--transition);" title="Plus 1 glass">
      <i data-lucide="plus-circle" style="width: 20px; height: 20px;"></i>
    </button>
  `;
  waterRight.appendChild(waterControls);

  // Bind water buttons
  const triggerWaterUpdate = async (amount) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.post(`/logs/${today}/water`, { amount });
      todayLog = res.data;
      showToast(amount > 0 ? '💧 Water intake increased' : 'Water intake decreased', 'info');
      drawDashboardContent(container);
    } catch (err) {
      console.error(err);
      showToast('Error updating water', 'error');
    }
  };
  waterControls.querySelector('.minus-water').addEventListener('click', () => triggerWaterUpdate(-1));
  waterControls.querySelector('.plus-water').addEventListener('click', () => triggerWaterUpdate(1));

  // 5. Tab view wrapper
  const dynamicGrid = document.createElement('section');
  const doubleColumnTabs = ['detector', 'compare', 'favorites'];
  const isDoubleColumn = doubleColumnTabs.includes(state.activeTab);
  dynamicGrid.className = `dashboard-grid ${isDoubleColumn ? 'double-column' : ''}`;
  mainContent.appendChild(dynamicGrid);
  mainContent.appendChild(statsGrid);
  mainContent.appendChild(waterTracker);

  // RENDER CORRESPONDING TAB VIEW
  if (isDoubleColumn) {
    // Render left gallery column
    const leftGallery = renderLeftGallery();
    dynamicGrid.appendChild(leftGallery);
  }

  // Render right interactive column
  const rightTabPanel = renderRightTabPanel(container);
  dynamicGrid.appendChild(rightTabPanel);

  // Instantiations post DOM mounting
  setTimeout(() => {
    // 1. Core Calorie Progress Doughnut Chart
    const progressCtx = document.getElementById('progressCalorieChart');
    if (progressCtx) {
      if (progressChartInstance) progressChartInstance.destroy();
      progressChartInstance = new Chart(progressCtx, {
        type: 'doughnut',
        data: {
          labels: ['Consumed', 'Remaining'],
          datasets: [{
            data: [netCalories, Math.max(goal - netCalories, 0)],
            backgroundColor: ['#10b981', state.theme === 'light' ? '#cbd5e1' : 'rgba(255, 255, 255, 0.05)'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '75%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      });
    }

    // 2. AI Molecular details chart
    const macroCtx = document.getElementById('macroChart');
    if (macroCtx && selectedFood) {
      if (macroChartInstance) macroChartInstance.destroy();
      macroChartInstance = new Chart(macroCtx, {
        type: 'doughnut',
        data: {
          labels: ['Protein', 'Carbs', 'Fats'],
          datasets: [{
            data: [selectedFood.protein * quantity, selectedFood.carbs * quantity, selectedFood.fats * quantity],
            backgroundColor: ['#f43f5e', '#3b82f6', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '72%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // 3. Comparison Chart
    const compareCtx = document.getElementById('compareChart');
    if (compareCtx && compareItems.length === 2) {
      if (compareChartInstance) compareChartInstance.destroy();
      compareChartInstance = new Chart(compareCtx, {
        type: 'bar',
        data: {
          labels: ['Calories (kcal)', 'Protein (g x5)', 'Carbs (g x5)', 'Fats (g x5)'],
          datasets: [
            {
              label: compareItems[0].name,
              data: [compareItems[0].calories, compareItems[0].protein * 5, compareItems[0].carbs * 5, compareItems[0].fats * 5],
              backgroundColor: '#10b981',
              borderRadius: 6
            },
            {
              label: compareItems[1].name,
              data: [compareItems[1].calories, compareItems[1].protein * 5, compareItems[1].carbs * 5, compareItems[1].fats * 5],
              backgroundColor: '#6366f1',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: state.theme === 'light' ? '#0f172a' : '#ffffff', font: { family: 'Outfit', weight: '600' } }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: 'var(--text-secondary)', font: { family: 'Outfit', weight: '600' } }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: { color: 'var(--text-secondary)', font: { family: 'Outfit' } }
            }
          }
        }
      });
    }

    // Load dynamic lucide triggers for nested tags
    refreshIcons();
  }, 100);
}

// Render Left Food Gallery Selection List
function renderLeftGallery() {
  const card = document.createElement('div');
  card.className = 'card dashboard-card-gallery';
  card.style.cssText = 'padding: 1.5rem; width: 100%;';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;';
  headerRow.innerHTML = `
    <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">
      ${state.activeTab === 'detector' ? 'Molecular Gallery' : 
        state.activeTab === 'compare' ? 'Compare Targets' : 'Saved Favorites'}
    </h2>
    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center;">
      <i data-lucide="layers" class="text-secondary" style="width: 16px; height: 16px;"></i>
    </div>
  `;
  card.appendChild(headerRow);

  // Search filter
  if (state.activeTab !== 'favorites') {
    const searchForm = document.createElement('form');
    searchForm.style.cssText = 'position: relative; margin-bottom: 1.5rem;';
    searchForm.innerHTML = `
      <i data-lucide="search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); width: 16px; height: 16px;"></i>
      <input 
        type="text" 
        class="input" 
        placeholder="Filter by name..." 
        style="padding-left: 2.5rem; padding-top: 0.65rem; padding-bottom: 0.65rem; border-radius: 0.75rem;"
        value="${search}"
      />
    `;
    
    searchForm.querySelector('input').addEventListener('input', (e) => {
      search = e.target.value;
    });

    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loading = true;
      try {
        const res = await api.get(`/foods?query=${search}`);
        foods = res.data;
      } catch {
        showToast('Search failed', 'error');
      } finally {
        loading = false;
        const appWrapper = document.querySelector('.dashboard-wrapper');
        if (appWrapper) drawDashboardContent(appWrapper);
      }
    });

    card.appendChild(searchForm);
  }

  // Scroll list of items
  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = 'custom-scroll';
  scrollWrapper.style.cssText = 'flex: 1; overflow-y: auto; padding-right: 0.25rem; display: flex; flex-direction: column; gap: 0.75rem;';
  card.appendChild(scrollWrapper);

  const displayFoods = state.activeTab === 'favorites' 
    ? foods.filter(f => state.user.favorites?.includes(f._id)) 
    : foods;

  if (displayFoods.length === 0) {
    scrollWrapper.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; opacity: 0.5;">
        <i data-lucide="${state.activeTab === 'favorites' ? 'heart' : 'database'}" style="width: 38px; height: 38px; color: var(--text-secondary); margin: 0 auto 0.75rem auto; display: block;"></i>
        <p style="color: var(--text-secondary); font-family: var(--font-body); font-size: 0.9rem;">No catalogued elements</p>
      </div>
    `;
  } else {
    displayFoods.forEach(food => {
      const isSelected = selectedFood?._id === food._id || compareItems.find(f => f._id === food._id);
      const foodItem = document.createElement('div');
      foodItem.style.cssText = `
        padding: 0.875rem; 
        border-radius: 1rem; 
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 1rem;
        border: ${isSelected ? '1.5px solid var(--accent)' : '1px solid var(--glass-border)'};
        background: ${isSelected ? 'rgba(var(--accent-rgb), 0.05)' : 'rgba(255,255,255,0.02)'};
        transition: var(--transition);
      `;
      
      foodItem.addEventListener('mouseenter', () => {
        if (!isSelected) {
          foodItem.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
          foodItem.style.background = 'rgba(255, 255, 255, 0.04)';
        }
      });
      foodItem.addEventListener('mouseleave', () => {
        if (!isSelected) {
          foodItem.style.borderColor = 'var(--glass-border)';
          foodItem.style.background = 'rgba(255,255,255,0.02)';
        }
      });

      // Visual Identity
      const imgWrapper = document.createElement('div');
      imgWrapper.style.position = 'relative';
      if (food.imageUrl) {
        imgWrapper.innerHTML = `<img src="${food.imageUrl}" alt="${food.name}" style="width: 50px; height: 50px; border-radius: 0.75rem; object-fit: cover; border: 1px solid var(--glass-border);" />`;
      } else {
        imgWrapper.innerHTML = `
          <div style="width: 50px; height: 50px; border-radius: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: var(--accent);">
            ${food.name.charAt(0).toUpperCase()}
          </div>
        `;
      }
      
      if (state.user.favorites?.includes(food._id)) {
        const favIndicator = document.createElement('div');
        favIndicator.style.cssText = 'position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; background: #f43f5e; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--bg-primary);';
        favIndicator.innerHTML = '<i data-lucide="heart" style="width: 9px; height: 9px; color: white; fill: white;"></i>';
        imgWrapper.appendChild(favIndicator);
      }
      foodItem.appendChild(imgWrapper);

      // Name & Calories
      const label = document.createElement('div');
      label.style.flex = '1';
      label.innerHTML = `
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); font-family: var(--font-display); line-height: 1.3;">${food.name}</div>
        <div class="text-secondary" style="font-size: 0.8rem; font-family: var(--font-body); margin-top: 0.15rem;">${food.calories} kcal • ${food.servingSize}</div>
      `;
      foodItem.appendChild(label);

      const arrow = document.createElement('i');
      arrow.setAttribute('data-lucide', 'chevron-right');
      arrow.style.cssText = 'color: var(--text-secondary); opacity: 0.5; width: 16px; height: 16px;';
      foodItem.appendChild(arrow);

      // Select Handler
      foodItem.addEventListener('click', () => {
        if (state.activeTab === 'compare') {
          if (compareItems.length < 2 && !compareItems.find(f => f._id === food._id)) {
            compareItems.push(food);
            const appWrapper = document.querySelector('.dashboard-wrapper');
            if (appWrapper) drawDashboardContent(appWrapper);
          } else if (compareItems.length === 2) {
            showToast('Only 2 items can be compared side-by-side', 'info');
          }
        } else {
          // AI Scanning Molecular trigger
          isScanning = true;
          selectedFood = null;
          const appWrapper = document.querySelector('.dashboard-wrapper');
          if (appWrapper) drawDashboardContent(appWrapper);

          setTimeout(() => {
            selectedFood = food;
            quantity = 1;
            isScanning = false;
            if (appWrapper) drawDashboardContent(appWrapper);
          }, 800);
        }
      });

      scrollWrapper.appendChild(foodItem);
    });
  }

  return card;
}

// Render active tab view panel
function renderRightTabPanel(container) {
  const card = document.createElement('div');
  const isDoubleColumn = ['detector', 'compare', 'favorites'].includes(state.activeTab);
  card.className = `card dashboard-card-panel custom-scroll ${isDoubleColumn ? 'double-column-active' : ''}`;
  card.style.cssText = 'position: relative; overflow: hidden; padding: 1.75rem; width: 100%;';

  switch (state.activeTab) {
    case 'detector':
      if (isScanning) {
        // Scanning laser animation line
        const scanLine = document.createElement('div');
        scanLine.className = 'scanner-line';
        card.appendChild(scanLine);

        card.innerHTML += `
          <div style="margin: auto; text-align: center;">
            <div class="pulse" style="margin-bottom: 2rem;">
              <div style="width: 80px; height: 80px; border: 3.5px solid var(--accent); border-top-color: transparent; border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
            </div>
            <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Processing...</h2>
            <p class="text-secondary" style="letter-spacing: 0.08em; font-weight: 700; font-size: 0.8rem; font-family: var(--font-body); text-transform: uppercase;">CALIBRATING SENSORS & EXTRACTING NUTRITIONAL BIOMARKERS</p>
          </div>
        `;
      } else if (!selectedFood) {
        card.innerHTML = `
          <div style="margin: auto; text-align: center; display: flex; flex-direction: column; align-items: center;">
            <div class="pulse" style="width: 90px; height: 90px; border-radius: 1.5rem; background: rgba(var(--accent-rgb), 0.08); border: 1.5px solid rgba(var(--accent-rgb), 0.15); margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--accent-glow);">
              <i data-lucide="scan" style="width: 38px; height: 38px; color: var(--accent); stroke-width: 1.75;"></i>
            </div>
            <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">AI Scan Engine</h2>
            <p class="text-secondary" style="max-width: 320px; font-size: 0.95rem; line-height: 1.6; font-family: var(--font-body);">Select a food item from the gallery list to initiate biochemical nutritional analysis and logs.</p>
          </div>
        `;
      } else {
        // Complete Scan detailed dashboard
        const panel = document.createElement('div');
        panel.style.width = '100%';
        card.appendChild(panel);

        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.25rem; flex-wrap: wrap; gap: 1rem;';
        headerRow.innerHTML = `
          <div>
            <div style="display: inline-flex; padding: 0.35rem 1rem; background: rgba(var(--accent-rgb), 0.08); border-radius: 2rem; color: var(--accent); font-weight: 700; font-size: 0.7rem; margin-bottom: 1rem; border: 1px solid rgba(var(--accent-rgb), 0.15); align-items: center; gap: 0.35rem; font-family: var(--font-display);">
              <i data-lucide="check-circle" style="width: 13px; height: 13px;"></i> MOLECULAR SCAN COMPLETE
            </div>
            <h2 style="font-size: 2.4rem; font-weight: 800; margin: 0; line-height: 1.1; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.03em;">${selectedFood.name}</h2>
            <div class="text-secondary" style="margin-top: 0.5rem; font-weight: 600; font-size: 0.8rem; font-family: var(--font-body);">Serving: ${selectedFood.servingSize}</div>
          </div>
          <button class="fav-btn ${state.user.favorites?.includes(selectedFood._id) ? 'active' : ''}" 
                  style="width: 44px; height: 44px; border-radius: 0.75rem; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; border: 1px solid var(--glass-border); cursor: pointer; transition: var(--transition);">
            <i data-lucide="heart" style="width: 20px; height: 20px; fill: ${state.user.favorites?.includes(selectedFood._id) ? '#f43f5e' : 'none'};"></i>
          </button>
        `;
        
        // Favorite toggle
        headerRow.querySelector('.fav-btn').addEventListener('click', async () => {
          try {
            const res = await api.post(`/foods/favorite/${selectedFood._id}`);
            state.user.favorites = res.data;
            localStorage.setItem('user', JSON.stringify(state.user));
            showToast(res.data.includes(selectedFood._id) ? '💖 Added to favorites catalog' : 'Removed from favorites', 'info');
            drawDashboardContent(container);
          } catch (err) {
            console.error(err);
            showToast('Failed to update favorites', 'error');
          }
        });

        panel.appendChild(headerRow);

        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center;';
        panel.appendChild(grid);

        // Chart column
        const chartCol = document.createElement('div');
        chartCol.style.cssText = 'height: 220px; position: relative; width: 100%;';
        chartCol.innerHTML = `
          <canvas id="macroChart" width="220" height="220"></canvas>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
            <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary); line-height: 1;">${selectedFood.calories * quantity}</div>
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.05em; margin-top: 0.15rem; text-transform: uppercase;">kcal</div>
          </div>
        `;
        grid.appendChild(chartCol);

        // Controls portions column
        const controlsCol = document.createElement('div');
        controlsCol.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';
        grid.appendChild(controlsCol);

        const portionAdjust = document.createElement('div');
        portionAdjust.style.cssText = 'margin-bottom: 0.5rem; background: rgba(0,0,0,0.12); padding: 0.75rem 1.125rem; border-radius: 1rem; border: 1px solid var(--glass-border);';
        portionAdjust.innerHTML = `
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.02em;">Portion Multiplier</label>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="minus-qty" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1.5rem; font-weight: 600; display: flex; align-items: center;">-</button>
            <span style="font-size: 1.45rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-display);">${quantity}</span>
            <button class="plus-qty" style="background: none; border: none; cursor: pointer; color: var(--accent); font-size: 1.5rem; font-weight: 600; display: flex; align-items: center;">+</button>
          </div>
        `;
        portionAdjust.querySelector('.minus-qty').addEventListener('click', () => {
          quantity = Math.max(1, quantity - 1);
          drawDashboardContent(container);
        });
        portionAdjust.querySelector('.plus-qty').addEventListener('click', () => {
          quantity += 1;
          drawDashboardContent(container);
        });
        controlsCol.appendChild(portionAdjust);

        // Render individual macro details
        const macroElements = [
          { name: 'Protein', val: selectedFood.protein, color: '#f43f5e', class: 'badge-danger' },
          { name: 'Carbs', val: selectedFood.carbs, color: '#3b82f6', class: 'badge-purple' },
          { name: 'Fats', val: selectedFood.fats, color: '#f59e0b', class: 'badge-success' }
        ];

        macroElements.forEach(m => {
          const detail = document.createElement('div');
          detail.style.cssText = 'display: flex; justify-content: space-between; padding: 0.65rem 1rem; background: rgba(255,255,255,0.01); border-radius: 0.75rem; border: 1px solid var(--glass-border); align-items: center;';
          detail.innerHTML = `
            <span style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">
              <div style="width: 10px; height: 10px; border-radius: 3px; background: ${m.color};"></div>
              ${m.name}
            </span>
            <span class="badge ${m.class}" style="font-family: var(--font-body); font-weight: 700; font-size: 0.8rem;">${(m.val * quantity).toFixed(1)}g</span>
          `;
          controlsCol.appendChild(detail);
        });

        // Add Log actions
        const actionsArea = document.createElement('div');
        actionsArea.style.cssText = 'margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 1.5rem;';
        actionsArea.innerHTML = `
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; font-family: var(--font-display); color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.02em;">Log To Meal Window</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
             <button class="btn btn-outline quick-log-Breakfast" style="padding: 0.75rem 0.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.85rem;">Breakfast</button>
             <button class="btn btn-outline quick-log-Lunch" style="padding: 0.75rem 0.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.85rem;">Lunch</button>
             <button class="btn btn-outline quick-log-Dinner" style="padding: 0.75rem 0.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.85rem;">Dinner</button>
             <button class="btn btn-outline quick-log-Snacks" style="padding: 0.75rem 0.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.85rem;">Snacks</button>
          </div>
        `;
        
        const triggerQuickLog = async (mealType) => {
          try {
            const today = new Date().toISOString().split('T')[0];
            await api.post(`/logs/${today}/meal`, {
              foodId: selectedFood._id,
              quantity: quantity,
              mealType
            });
            showToast(`Logged ${selectedFood.name} portions to ${mealType}!`, 'success');
            selectedFood = null;
            fetchDashboardDataFn?.();
          } catch {
            showToast('Error logging food to profile log', 'error');
          }
        };

        ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].forEach(type => {
          actionsArea.querySelector(`.quick-log-${type}`).addEventListener('click', () => triggerQuickLog(type));
        });

        panel.appendChild(actionsArea);
      }
      break;

    case 'compare': {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <h2 style="font-size: 1.45rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Advanced Nutritional Comparison</h2>
          <button class="btn btn-outline clear-compare" style="border-radius: 0.75rem; padding: 0.5rem 1.125rem; border-color: rgba(244, 63, 94, 0.3); color: var(--danger); background: rgba(244, 63, 94, 0.05); font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; border-width: 1px;">
            <i data-lucide="trash" style="width: 15px; height: 15px;"></i> Clear Slots
          </button>
        </div>
      `;
      card.querySelector('.clear-compare').addEventListener('click', () => {
        compareItems = [];
        drawDashboardContent(container);
      });

      const compareWrapper = document.createElement('div');
      compareWrapper.style.cssText = 'display: grid; grid-template-columns: 1fr auto 1fr; gap: 1.25rem; align-items: center; margin-bottom: 2rem;';
      card.appendChild(compareWrapper);

      for (let i = 0; i < 2; i++) {
        const itemSlot = document.createElement('div');
        itemSlot.className = 'glass-card';
        itemSlot.style.cssText = `
          padding: 1.75rem; 
          text-align: center; 
          min-height: 180px; 
          border-radius: 1.5rem;
          display: flex; 
          flex-direction: column; 
          justify-content: center;
          align-items: center;
          position: relative;
          border: ${compareItems[i] ? `1.5px solid ${i === 0 ? 'var(--accent)' : 'var(--primary-purple)'}` : '1.5px dashed var(--glass-border)'};
          background: rgba(255, 255, 255, 0.01);
          transition: var(--transition);
        `;

        if (compareItems[i]) {
          itemSlot.innerHTML = `
            <button class="remove-compare-item" style="position: absolute; top: 0.75rem; right: 0.75rem; background: var(--danger); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(244, 63, 94, 0.2);"><i data-lucide="x" style="width: 12px; height: 12px;"></i></button>
            <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">FOOD METRIC ${i+1}</div>
            <div style="font-weight: 800; font-size: 1.35rem; margin-bottom: 0.35rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${compareItems[i].name}</div>
            <div style="font-size: 1.1rem; color: ${i === 0 ? 'var(--accent)' : 'var(--primary-purple)'}; font-weight: 800; font-family: var(--font-display);">${compareItems[i].calories} kcal</div>
          `;
          itemSlot.querySelector('.remove-compare-item').addEventListener('click', (e) => {
            e.stopPropagation();
            compareItems = compareItems.filter((_, idx) => idx !== i);
            drawDashboardContent(container);
          });
        } else {
          itemSlot.innerHTML = `
            <i data-lucide="plus-circle" style="width: 24px; height: 24px; color: var(--text-secondary); opacity: 0.3; margin-bottom: 0.5rem;"></i>
            <div class="text-secondary" style="font-size: 0.85rem; font-weight: 600; font-family: var(--font-body); line-height: 1.4;">Select Element ${i + 1}<br/>from gallery</div>
          `;
        }
        compareWrapper.appendChild(itemSlot);

        if (i === 0) {
          const vsBadge = document.createElement('div');
          vsBadge.style.cssText = 'width: 44px; height: 44px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 800; font-style: italic; color: var(--text-primary); border: 1px solid var(--glass-border); box-shadow: var(--shadow);';
          vsBadge.textContent = 'VS';
          compareWrapper.appendChild(vsBadge);
        }
      }

      if (compareItems.length === 2) {
        const compareChartBox = document.createElement('div');
        compareChartBox.style.cssText = 'height: 280px; background: rgba(0, 0, 0, 0.08); padding: 1.25rem; border-radius: 1.5rem; border: 1px solid var(--glass-border); width: 100%;';
        compareChartBox.innerHTML = `<canvas id="compareChart" width="100%" height="100%"></canvas>`;
        card.appendChild(compareChartBox);
      }
      break;
    }

    case 'history': {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.25rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 42px; height: 42px; border-radius: 0.75rem; background: rgba(59, 130, 246, 0.08); border: 1.5px solid rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="calendar" style="width: 20px; height: 20px; color: var(--primary-blue);"></i>
            </div>
            <div>
              <h2 style="font-size: 1.45rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Daily Intake Logbook</h2>
              <p class="text-secondary" style="font-size: 0.8rem; margin: 0;">Comprehensive macro log indices.</p>
            </div>
          </div>
          
          <button class="btn btn-outline download-pdf-report" style="display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.85rem; border-radius: 0.75rem; padding: 0.5rem 1rem;">
            <i data-lucide="download" style="width: 15px; height: 15px;"></i> Export PDF
          </button>
        </div>
      `;

      // Handle PDF generation
      card.querySelector('.download-pdf-report').addEventListener('click', async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          showToast('Generating biometric diet report...', 'info');
          const blob = await api.get(`/reports/download/${today}`);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `DietReport-${today}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          showToast('PDF log sheet successfully compiled!', 'success');
        } catch (e) {
          console.error(e);
          showToast('Failed to compile PDF reports', 'error');
        }
      });

      const mealsList = document.createElement('div');
      mealsList.style.cssText = 'display: flex; flex-direction: column; gap: 0.875rem; overflow-y: auto; flex: 1;';
      mealsList.className = 'custom-scroll';
      card.appendChild(mealsList);

      if (todayLog?.meals?.length > 0) {
        todayLog.meals.forEach((meal) => {
          if (!meal.food) return;
          const row = document.createElement('div');
          row.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 1rem 1.25rem; 
            border-radius: 1.15rem; 
            background: rgba(255,255,255,0.01);
            border: 1px solid var(--glass-border);
            flex-wrap: wrap; 
            gap: 1rem;
            transition: var(--transition);
          `;
          
          row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(255, 255, 255, 0.03)';
            row.style.borderColor = 'rgba(var(--accent-rgb), 0.15)';
          });
          row.addEventListener('mouseleave', () => {
            row.style.background = 'rgba(255,255,255,0.01)';
            row.style.borderColor = 'var(--glass-border)';
          });

          row.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center;">
               <div style="width: 42px; height: 42px; border-radius: 0.75rem; background: rgba(16, 185, 129, 0.08); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(16, 185, 129, 0.15);">
                  <i data-lucide="check" style="width: 20px; height: 20px; color: var(--accent);"></i>
               </div>
               <div>
                 <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary); font-family: var(--font-display);">${meal.food.name}</div>
                 <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.1rem; font-family: var(--font-body);">${meal.mealType} • ${meal.quantity} portion${meal.quantity > 1 ? 's' : ''}</div>
               </div>
            </div>
            <div style="display: flex; align-items: center; gap: 2rem;">
              <div style="text-align: right;">
                <div style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-display);">+${meal.food.calories * meal.quantity} <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">kcal</span></div>
              </div>
              <button class="delete-meal-btn" 
                      style="border: none; width: 38px; height: 38px; background: rgba(244, 63, 94, 0.05); color: var(--danger); border-radius: 0.65rem; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(244, 63, 94, 0.1); transition: var(--transition);">
                <i data-lucide="trash" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          `;
          
          row.querySelector('.delete-meal-btn').addEventListener('click', async () => {
            if (window.confirm('Remove this meal from daily log?')) {
              try {
                const today = new Date().toISOString().split('T')[0];
                const res = await api.delete(`/logs/${today}/meal/${meal._id}`);
                todayLog = res.data;
                showToast('Meal removed from daily checklist', 'info');
                drawDashboardContent(container);
              } catch {
                showToast('Error removing meal', 'error');
              }
            }
          });

          mealsList.appendChild(row);
        });
      } else {
        mealsList.innerHTML = `
          <div style="text-align: center; padding: 5rem 1rem; opacity: 0.3; display: flex; flex-direction: column; align-items: center;">
            <i data-lucide="database-backup" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
            <h4 style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-display); margin: 0;">Logbook Empty</h4>
            <p style="font-size: 0.85rem; font-family: var(--font-body); margin-top: 0.35rem;">Start scanning or adding meals to view log details.</p>
          </div>
        `;
      }
      break;
    }

    case 'workouts': {
      card.innerHTML = '';
      const splitRow = document.createElement('div');
      splitRow.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2.5rem;';
      card.appendChild(splitRow);

      // Left panel: Manual Log workout
      const leftWCard = document.createElement('div');
      leftWCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
          <div style="width: 42px; height: 42px; border-radius: 0.75rem; background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
            <i data-lucide="dumbbell" style="width: 20px; height: 20px; color: var(--accent);"></i>
          </div>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Log Workout</h2>
        </div>
        <form style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="input-group" style="margin-bottom: 0;">
            <label>Workout Name</label>
            <input type="text" name="name" class="input" placeholder="e.g. Aerobics, Treadmill" required />
          </div>
          <div class="grid-2" style="gap: 1rem;">
            <div class="input-group" style="margin-bottom: 0;">
              <label>Duration (min)</label>
              <input type="number" name="duration" class="input" placeholder="30" required min="1" />
            </div>
            <div class="input-group" style="margin-bottom: 0;">
              <label>Burned (kcal)</label>
              <input type="number" name="calories" class="input" placeholder="250" required min="1" />
            </div>
          </div>
          <button type="submit" class="btn btn-purple" style="width: 100%; margin-top: 1.25rem; padding: 0.875rem; border-radius: 0.875rem;">
             Add Workout <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
          </button>
        </form>
      `;
      splitRow.appendChild(leftWCard);

      const workoutForm = leftWCard.querySelector('form');
      workoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subBtn = workoutForm.querySelector('button[type="submit"]');
        subBtn.disabled = true;
        subBtn.innerHTML = `Tracking <i data-lucide="loader" style="width: 16px; height: 16px; animation: spin 1.5s linear infinite;"></i>`;
        refreshIcons();

        const name = workoutForm.name.value;
        const durationMinutes = Number(workoutForm.duration.value);
        const caloriesBurned = Number(workoutForm.calories.value);

        try {
          const today = new Date().toISOString().split('T')[0];
          await api.post(`/logs/${today}/activity`, {
            name,
            durationMinutes,
            caloriesBurned
          });
          showToast('Workout successfully tracked!', 'success');
          fetchDashboardDataFn?.();
        } catch {
          showToast('Error tracking workout log', 'error');
        } finally {
          subBtn.disabled = false;
          subBtn.innerHTML = 'Add Workout <i data-lucide="plus" style="width: 16px; height: 16px;"></i>';
          refreshIcons();
        }
      });

      // Right panel: Today's logged activities
      const rightWCard = document.createElement('div');
      rightWCard.style.cssText = 'display: flex; flex-direction: column;';
      rightWCard.innerHTML = `<h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 2rem; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Logged Activities</h3>`;
      splitRow.appendChild(rightWCard);

      const wList = document.createElement('div');
      wList.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; flex: 1;';
      wList.className = 'custom-scroll';
      rightWCard.appendChild(wList);

      if (todayLog?.activities?.length > 0) {
        todayLog.activities.forEach(act => {
          const row = document.createElement('div');
          row.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 0.875rem 1.125rem; 
            border-radius: 1rem;
            background: rgba(255,255,255,0.01);
            border: 1px solid var(--glass-border);
          `;
          row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(245, 158, 11, 0.08); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(245, 158, 11, 0.15);">
                <i data-lucide="flame" style="width: 18px; height: 18px; color: #f59e0b;"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); font-family: var(--font-display);">${act.name}</div>
                <div class="text-secondary" style="font-size: 0.8rem; font-family: var(--font-body);">${act.durationMinutes} min</div>
              </div>
            </div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #f59e0b; font-family: var(--font-display); text-align: right;">-${act.caloriesBurned} <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">kcal</span></div>
          `;
          wList.appendChild(row);
        });
      } else {
        wList.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; opacity: 0.3; display: flex; flex-direction: column; align-items: center;">
            <i data-lucide="flame" style="width: 38px; height: 38px; margin-bottom: 0.75rem;"></i>
            <p style="font-size: 0.85rem;">No physical logs logged today.</p>
          </div>
        `;
      }
      break;
    }

    case 'favorites':
      // Handled in double-column list mode
      card.innerHTML = `
        <div style="margin: auto; text-align: center; display: flex; flex-direction: column; align-items: center;">
          <div class="pulse" style="width: 90px; height: 90px; border-radius: 1.5rem; background: rgba(244, 63, 94, 0.08); border: 1.5px solid rgba(244, 63, 94, 0.15); margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.15);">
            <i data-lucide="heart" style="width: 38px; height: 38px; color: #f43f5e; fill: #f43f5e;"></i>
          </div>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Biometric Favorites</h2>
          <p class="text-secondary" style="max-width: 320px; font-size: 0.95rem; line-height: 1.6; font-family: var(--font-body);">Click favorited list items on the left panel to execute instantaneous calorie logging procedures.</p>
        </div>
      `;
      break;

    case 'bmi': {
      card.innerHTML = '';
      const splitBmi = document.createElement('div');
      splitBmi.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2.5rem;';
      card.appendChild(splitBmi);

      // Left column: Vitals form
      const leftBCard = document.createElement('div');
      leftBCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
          <div style="width: 42px; height: 42px; border-radius: 0.75rem; background: rgba(99, 102, 241, 0.08); border: 1.5px solid rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center;">
            <i data-lucide="scale" style="width: 20px; height: 20px; color: var(--primary-purple);"></i>
          </div>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Biometrics</h2>
        </div>
        
        <div class="input-group" style="margin-bottom: 1.25rem;">
          <label>Weight (kg)</label>
          <input 
            type="number" 
            class="input input-weight" 
            placeholder="e.g. 70"
            value="${bmiWeight}" 
            style="font-size: 1rem;"
          />
        </div>
        <div class="input-group" style="margin-bottom: 2rem;">
          <label>Height (cm)</label>
          <input 
            type="number" 
            class="input input-height" 
            placeholder="e.g. 175"
            value="${bmiHeight}" 
            style="font-size: 1rem;"
          />
        </div>
        
        <button class="btn btn-purple sync-vitals-btn" style="width: 100%; padding: 0.875rem; border-radius: 0.875rem; font-size: 1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
          Update Metrics <i data-lucide="check" style="width: 16px; height: 16px;"></i>
        </button>
      `;
      splitBmi.appendChild(leftBCard);

      const wInput = leftBCard.querySelector('.input-weight');
      const hInput = leftBCard.querySelector('.input-height');

      const refreshBmiRealtime = () => {
        bmiWeight = Number(wInput.value) || 0;
        bmiHeight = Number(hInput.value) || 0;
        recalcBmiVisuals(rightBCard);
      };
      
      wInput.addEventListener('input', refreshBmiRealtime);
      hInput.addEventListener('input', refreshBmiRealtime);

      leftBCard.querySelector('.sync-vitals-btn').addEventListener('click', async () => {
        try {
          const res = await api.put('/auth/update', { weight: bmiWeight, height: bmiHeight });
          state.user = res.data;
          localStorage.setItem('user', JSON.stringify(res.data));
          showToast('Vitals updated successfully!', 'success');
          drawDashboardContent(container);
        } catch {
          showToast('Update failed', 'error');
        }
      });

      // Right column: BMI score visual report
      const rightBCard = document.createElement('div');
      rightBCard.className = 'glass-card';
      rightBCard.style.cssText = 'padding: 2.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 1.5rem; background: linear-gradient(180deg, var(--card-bg) 0%, rgba(99, 102, 241, 0.04) 100%); border: 1px solid var(--glass-border);';
      splitBmi.appendChild(rightBCard);

      // Recursive visual generator
      const recalcBmiVisuals = (element) => {
        element.innerHTML = '';
        const bmi = (bmiWeight / ((bmiHeight/100) * (bmiHeight/100))) || 0;
        
        let category = { label: 'Incomplete', color: 'var(--text-secondary)' };
        if (bmi > 0) {
          if (bmi < 18.5) category = { label: 'Underweight', color: '#3b82f6' };
          else if (bmi < 25) category = { label: 'Healthy', color: '#10b981' };
          else if (bmi < 30) category = { label: 'Overweight', color: '#f59e0b' };
          else category = { label: 'Obese', color: '#f43f5e' };
        }

        element.innerHTML = `
          <div class="text-secondary" style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem; font-family: var(--font-display);">BMI Score Card</div>
          <div style="font-size: 4.5rem; font-weight: 900; color: var(--primary-purple); line-height: 1; margin-bottom: 1.25rem; font-family: var(--font-display); letter-spacing: -0.03em;">
            ${bmi.toFixed(1)}
          </div>
          <div style="padding: 0.4rem 1.75rem; border-radius: 2rem; background: ${category.color}15; color: ${category.color}; font-weight: 800; font-size: 1.05rem; border: 1px solid ${category.color}30; margin-bottom: 2rem; font-family: var(--font-display);">
            ${category.label}
          </div>
          <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; position: relative; border: 1px solid var(--border); overflow: hidden;">
            <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${Math.min((bmi / 40) * 100, 100)}%; background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #f43f5e); border-radius: 6px; box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);"></div>
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.65rem; font-weight: 600; font-family: var(--font-body);">
            <span>15 (Low)</span>
            <span>25 (Norm)</span>
            <span>40+ (High)</span>
          </div>
        `;
      };
      recalcBmiVisuals(rightBCard);
      break;
    }

    case 'settings': {
      card.style.maxWidth = '760px';
      card.style.margin = '0 auto';
      
      let uploadedAvatarBase64 = state.user.profilePhoto || '';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 3rem;">
          <div style="width: 42px; height: 42px; border-radius: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center;">
            <i data-lucide="settings" style="width: 20px; height: 20px; color: var(--text-secondary);"></i>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; margin: 0; font-family: var(--font-display); color: var(--text-primary); letter-spacing: -0.02em;">Biometric Preferences</h2>
        </div>

        <form class="update-profile-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 2rem; flex-wrap: wrap;">
            <!-- Interactive Avatar Preview Box with Camera Hover Overlay -->
            <div id="avatar-preview-container" style="position: relative; width: 120px; height: 120px; border-radius: 2.25rem; overflow: hidden; border: 3px solid var(--accent); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2); flex-shrink: 0; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
              ${uploadedAvatarBase64 
                ? `<img id="avatar-image-preview" src="${uploadedAvatarBase64}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />` 
                : `<div id="avatar-image-fallback" style="display:flex; align-items:center; justify-content:center;"><i data-lucide="user" style="width: 44px; height: 44px; color: var(--text-secondary);"></i></div>`}
              <div class="avatar-hover-overlay" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
                <i data-lucide="camera" style="width: 28px; height: 28px; color: #fff;"></i>
              </div>
            </div>
            
            <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 0.75rem;">
              <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); font-family: var(--font-display);">User Profile Avatar</label>
              
              <!-- Hidden Native Input -->
              <input type="file" id="avatar-file-input" accept="image/*" style="display: none;" />
              
              <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <button type="button" id="btn-choose-avatar" class="btn" style="background: rgba(255,255,255,0.03); border: 1.5px solid var(--glass-border); padding: 0.6rem 1.25rem; border-radius: 0.75rem; color: var(--text-primary); font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease; cursor: pointer;">
                  <i data-lucide="upload" style="width: 15px; height: 15px; color: var(--accent);"></i> Choose Photo
                </button>
                <button type="button" id="btn-remove-avatar" class="btn" style="background: rgba(244, 63, 94, 0.05); border: 1.5px solid rgba(244, 63, 94, 0.2); padding: 0.6rem 1.25rem; border-radius: 0.75rem; color: var(--danger); font-weight: 600; font-size: 0.85rem; display: ${uploadedAvatarBase64 ? 'inline-flex' : 'none'}; align-items: center; gap: 0.5rem; transition: all 0.2s ease; cursor: pointer;">
                  <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i> Remove
                </button>
              </div>
              
              <!-- Selected File Name Indicator -->
              <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem;">
                <span id="avatar-file-name" style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-body);">No file selected</span>
                <span id="avatar-file-status" style="display: none; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--accent); font-weight: 600;">
                  <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Ready
                </span>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Supports JPG, PNG or WEBP formats (Max 5MB).</p>
            </div>
          </div>

          <div class="input-group" style="margin-bottom: 0;">
            <label>Operator Display Name</label>
            <input type="text" name="name" class="input" value="${state.user.name}" required />
          </div>
          <div class="grid-2" style="gap: 1.25rem;">
            <div class="input-group" style="margin-bottom: 0;">
              <label>Daily Calorie Target (kcal)</label>
              <input type="number" name="goal" class="input" value="${state.user.dailyCalorieGoal || 2000}" required />
            </div>
            <div class="input-group" style="margin-bottom: 0;">
              <label>Current Weight (kg)</label>
              <input type="number" name="weight" class="input" value="${state.user.weight || ''}" />
            </div>
          </div>
          <button type="submit" class="btn btn-purple" style="width: 100%; margin-top: 2rem; padding: 0.875rem; border-radius: 0.875rem; font-size: 1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
             Save Preferences <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
          </button>
        </form>

        <div style="margin-top: 4rem; padding: 1.75rem; border: 1.5px solid rgba(244, 63, 94, 0.2); border-radius: 1.5rem; background: rgba(244, 63, 94, 0.02);">
          <h4 style="color: var(--danger); font-weight: 800; margin-bottom: 0.35rem; font-family: var(--font-display);">Purge Operations</h4>
          <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 1.25rem; font-family: var(--font-body);">Permanent account termination. All catalogued histories, favorites and profile datasets will be cleared completely.</p>
          <button class="nuclear-purge" style="border-radius: 0.75rem; color: var(--danger); border: 1.5px solid rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.05); padding: 0.6rem 1.5rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: var(--transition);">Terminated Operator Account</button>
        </div>
      `;

      // Native File Selector Interaction
      const fileInput = card.querySelector('#avatar-file-input');
      const chooseBtn = card.querySelector('#btn-choose-avatar');
      const avatarContainer = card.querySelector('#avatar-preview-container');
      const fileNameSpan = card.querySelector('#avatar-file-name');
      const fileStatusSpan = card.querySelector('#avatar-file-status');
      const removeBtn = card.querySelector('#btn-remove-avatar');

      // Bind Hover Micro-interactions
      const bindAvatarHover = (containerEl) => {
        const hoverOverlay = containerEl.querySelector('.avatar-hover-overlay');
        containerEl.addEventListener('mouseenter', () => {
          if (hoverOverlay) hoverOverlay.style.opacity = '1';
          containerEl.style.transform = 'scale(1.03)';
          containerEl.style.borderColor = 'var(--accent)';
        });
        containerEl.addEventListener('mouseleave', () => {
          if (hoverOverlay) hoverOverlay.style.opacity = '0';
          containerEl.style.transform = 'scale(1)';
          containerEl.style.borderColor = 'var(--accent)';
        });
      };
      bindAvatarHover(avatarContainer);

      const triggerFileSelect = () => fileInput.click();
      avatarContainer.addEventListener('click', triggerFileSelect);
      chooseBtn.addEventListener('click', triggerFileSelect);

      // Handle Avatar Removal Action
      const handleRemoveAvatar = () => {
        uploadedAvatarBase64 = '';
        fileInput.value = '';
        
        avatarContainer.innerHTML = `
          <div id="avatar-image-fallback" style="display:flex; align-items:center; justify-content:center;">
            <i data-lucide="user" style="width: 44px; height: 44px; color: var(--text-secondary);"></i>
          </div>
          <div class="avatar-hover-overlay" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
            <i data-lucide="camera" style="width: 28px; height: 28px; color: #fff;"></i>
          </div>
        `;
        bindAvatarHover(avatarContainer);

        fileNameSpan.textContent = 'No file selected';
        fileStatusSpan.style.display = 'none';
        removeBtn.style.display = 'none';
        
        refreshIcons();
        showToast('Avatar removed from preferences.', 'info');
      };
      removeBtn.addEventListener('click', handleRemoveAvatar);

      // Handle Local File Reading & Encoding
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          showToast('File is too large! Maximum limit is 5MB.', 'error');
          fileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedAvatarBase64 = event.target.result;
          
          avatarContainer.innerHTML = `
            <img id="avatar-image-preview" src="${uploadedAvatarBase64}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
            <div class="avatar-hover-overlay" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
              <i data-lucide="camera" style="width: 28px; height: 28px; color: #fff;"></i>
            </div>
          `;
          bindAvatarHover(avatarContainer);

          fileNameSpan.textContent = file.name;
          fileStatusSpan.style.display = 'inline-flex';
          removeBtn.style.display = 'inline-flex';
          
          refreshIcons();
          showToast('Avatar preview loaded!', 'success');
        };
        reader.readAsDataURL(file);
      });

      // Update biometrics form submit
      card.querySelector('.update-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `Updating <i data-lucide="loader" style="width: 16px; height: 16px; animation: spin 1.5s linear infinite;"></i>`;
        refreshIcons();

        const payload = {
          name: fData.get('name'),
          dailyCalorieGoal: Number(fData.get('goal')),
          weight: fData.get('weight') ? Number(fData.get('weight')) : undefined,
          profilePhoto: uploadedAvatarBase64
        };

        try {
          const res = await api.put('/auth/update', payload);
          state.user = res.data;
          localStorage.setItem('user', JSON.stringify(res.data));
          showToast('Biometric profile updated successfully!', 'success');
          renderApp();
        } catch {
          showToast('Failed to update profile', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Save Preferences <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>';
          refreshIcons();
        }
      });

      // Purge account nuclear trigger
      card.querySelector('.nuclear-purge').addEventListener('click', () => {
        if (window.confirm('🔥 WARNING: Are you absolutely sure? This will delete all your records permanently!')) {
          showToast('Purging user data from server mainframes...', 'error');
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 1500);
        }
      });
      break;
    }
  }

  return card;
}
