import api from '../api.js';
import { navigateTo, showToast, refreshIcons } from '../main.js';

export function renderFoods() {
  const container = document.createElement('div');
  container.className = 'grid-2';
  container.style.cssText = 'gap: 2.5rem; margin-top: 1rem;';

  // Left Column: Log Food
  const logFoodCol = document.createElement('div');
  container.appendChild(logFoodCol);

  const foodCard = document.createElement('div');
  foodCard.className = 'card';
  foodCard.style.cssText = 'height: calc(100vh - 12rem); min-height: 480px; overflow-y: hidden; display: flex; flex-direction: column; padding: 1.75rem;';
  logFoodCol.appendChild(foodCard);

  const headerGroup = document.createElement('div');
  headerGroup.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;';
  headerGroup.innerHTML = `
    <div style="width: 48px; height: 48px; border-radius: 1rem; background: rgba(var(--accent-rgb), 0.08); border: 1.5px solid rgba(var(--accent-rgb), 0.15); display: flex; align-items: center; justify-content: center; box-shadow: var(--accent-glow);">
      <i data-lucide="search" style="width: 22px; height: 22px; color: var(--accent); stroke-width: 2.5;"></i>
    </div>
    <div>
      <h2 style="font-family: var(--font-display); font-weight: 800; font-size: 1.65rem; margin: 0;">Log Food</h2>
      <p class="text-secondary" style="font-size: 0.85rem; margin: 0; font-family: var(--font-body);">Search millions of foods from USDA & Indian catalogs.</p>
    </div>
  `;
  foodCard.appendChild(headerGroup);

  // Search Form
  const searchForm = document.createElement('form');
  searchForm.style.cssText = 'display: flex; gap: 0.75rem; margin-bottom: 1.5rem;';
  searchForm.innerHTML = `
    <div style="position: relative; flex: 1;">
      <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
        <i data-lucide="search" style="width: 18px; height: 18px;"></i>
      </span>
      <input type="text" class="input" placeholder="Search (e.g. Biryani, Almonds, Apple...)" style="padding-left: 2.75rem;" />
    </div>
    <button type="submit" class="btn btn-purple" style="padding: 0.75rem 2rem; border-radius: 0.875rem;">Search</button>
  `;
  foodCard.appendChild(searchForm);
  const searchInput = searchForm.querySelector('input');

  // Food List container
  const listWrapper = document.createElement('div');
  listWrapper.style.cssText = 'flex: 1; overflow-y: auto; padding-right: 0.25rem; display: flex; flex-direction: column; gap: 1rem;';
  listWrapper.className = 'custom-scroll';
  foodCard.appendChild(listWrapper);

  // Right Column: Log Activity
  const activityCol = document.createElement('div');
  container.appendChild(activityCol);

  const actCard = document.createElement('div');
  actCard.className = 'card glass-card-purple';
  actCard.style.cssText = 'padding: 1.75rem;';
  actCard.innerHTML = `
     <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
       <div style="width: 48px; height: 48px; border-radius: 1rem; background: rgba(99, 102, 241, 0.08); border: 1.5px solid rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; box-shadow: var(--primary-purple-glow);">
         <i data-lucide="dumbbell" style="width: 22px; height: 22px; color: var(--primary-purple); stroke-width: 2.5;"></i>
       </div>
       <div>
         <h2 style="font-family: var(--font-display); font-weight: 800; font-size: 1.65rem; margin: 0;">Log Workout</h2>
         <p class="text-secondary" style="font-size: 0.85rem; margin: 0; font-family: var(--font-body);">Record physical exercises & active calorie expenditures.</p>
       </div>
     </div>
     
     <form style="display: flex; flex-direction: column; gap: 1.25rem;">
       <div class="input-group" style="margin-bottom: 0;">
         <label>Workout Name</label>
         <div style="position: relative;">
           <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
             <i data-lucide="activity" style="width: 18px; height: 18px;"></i>
           </span>
           <input type="text" name="name" class="input" placeholder="e.g. Outdoor Running, Strength Training" required style="padding-left: 2.75rem;" />
         </div>
       </div>
       
       <div class="grid-2" style="gap: 1.25rem;">
          <div class="input-group" style="margin-bottom: 0;">
            <label>Duration (minutes)</label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
                <i data-lucide="clock" style="width: 18px; height: 18px;"></i>
              </span>
              <input type="number" name="duration" class="input" placeholder="e.g. 45" required min="1" style="padding-left: 2.75rem;" />
            </div>
          </div>
          <div class="input-group" style="margin-bottom: 0;">
            <label>Calories Burned (kcal)</label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); display: flex; align-items: center; pointer-events: none;">
                <i data-lucide="flame" style="width: 18px; height: 18px;"></i>
              </span>
              <input type="number" name="calories" class="input" placeholder="e.g. 320" required min="1" style="padding-left: 2.75rem;" />
            </div>
          </div>
       </div>
       
       <button type="submit" class="btn btn-purple" style="width: 100%; margin-top: 1.5rem; padding: 0.875rem; border-radius: 0.875rem;">
         Log Workout <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
       </button>
     </form>
  `;
  activityCol.appendChild(actCard);
  const actForm = actCard.querySelector('form');

  // Fetch foods helper with stunning glass dynamic list items
  const loadFoods = async (query = '') => {
    listWrapper.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1rem;">
        <i data-lucide="loader" style="width: 32px; height: 32px; color: var(--accent); animation: spin 1.5s linear infinite;"></i>
        <p class="text-secondary" style="font-size: 0.95rem;">Cataloguing database elements...</p>
      </div>
    `;
    refreshIcons();

    try {
      const res = await api.get(`/foods?query=${query}`);
      const foods = res.data;

      listWrapper.innerHTML = '';
      if (foods.length === 0) {
        listWrapper.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <i data-lucide="help-circle" style="width: 44px; height: 44px; color: var(--text-secondary); opacity: 0.5;"></i>
            <h4 style="font-family: var(--font-display); font-weight: 700; margin: 0;">No Foods Catalogued</h4>
            <p class="text-secondary" style="font-size: 0.9rem; max-width: 260px; margin: 0 auto;">We couldn't find matches. Try adjusting spelling or searching another dietary term.</p>
          </div>
        `;
        refreshIcons();
        return;
      }

      foods.forEach(food => {
        const itemCard = document.createElement('div');
        itemCard.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
          border-radius: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          transition: var(--transition);
        `;
        
        itemCard.addEventListener('mouseenter', () => {
          itemCard.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
          itemCard.style.background = 'rgba(var(--accent-rgb), 0.02)';
          itemCard.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        });
        itemCard.addEventListener('mouseleave', () => {
          itemCard.style.borderColor = 'var(--glass-border)';
          itemCard.style.background = 'rgba(255, 255, 255, 0.02)';
          itemCard.style.boxShadow = 'none';
        });
        
        const cardTop = document.createElement('div');
        cardTop.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;';
        itemCard.appendChild(cardTop);

        const detailsGroup = document.createElement('div');
        detailsGroup.style.cssText = 'display: flex; gap: 1rem; align-items: center;';
        cardTop.appendChild(detailsGroup);

        if (food.imageUrl) {
          const img = document.createElement('img');
          img.src = food.imageUrl;
          img.alt = food.name;
          img.style.cssText = 'width: 54px; height: 54px; border-radius: 0.75rem; object-fit: cover; border: 1.5px solid var(--glass-border);';
          detailsGroup.appendChild(img);
        } else {
          // Beautiful letter avatar fallback if image is missing
          const letterAvatar = document.createElement('div');
          letterAvatar.style.cssText = 'width: 54px; height: 54px; border-radius: 0.75rem; background: var(--bg-secondary); border: 1.5px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: var(--accent); font-family: var(--font-display);';
          letterAvatar.textContent = food.name.charAt(0).toUpperCase();
          detailsGroup.appendChild(letterAvatar);
        }

        const info = document.createElement('div');
        info.innerHTML = `
          <h4 style="margin: 0; font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">${food.name}</h4>
          <p class="text-secondary" style="font-size: 0.85rem; margin: 0.15rem 0 0.5rem 0; font-family: var(--font-body);">
            Serving: ${food.servingSize}
          </p>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <span class="badge badge-success" style="font-size: 0.7rem; font-family: var(--font-body); font-weight: 600;">P: ${food.protein}g</span>
            <span class="badge badge-purple" style="font-size: 0.7rem; font-family: var(--font-body); font-weight: 600;">C: ${food.carbs}g</span>
            <span class="badge badge-danger" style="font-size: 0.7rem; font-family: var(--font-body); font-weight: 600;">F: ${food.fats}g</span>
          </div>
        `;
        detailsGroup.appendChild(info);

        // Calories Pill Display
        const calPill = document.createElement('div');
        calPill.style.cssText = 'padding: 0.5rem 1rem; border-radius: 0.875rem; background: rgba(var(--accent-rgb), 0.08); border: 1px solid rgba(var(--accent-rgb), 0.15); text-align: center;';
        calPill.innerHTML = `
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--accent); font-family: var(--font-display); line-height: 1;">${food.calories}</div>
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); margin-top: 0.25rem;">kcal</div>
        `;
        cardTop.appendChild(calPill);

        // Lower action group layout (aligned and premium)
        const actionGroup = document.createElement('div');
        actionGroup.style.cssText = 'display: flex; gap: 0.75rem; align-items: center; background: rgba(0, 0, 0, 0.12); padding: 0.5rem; border-radius: 0.875rem; border: 1px solid var(--glass-border);';
        itemCard.appendChild(actionGroup);

        const select = document.createElement('select');
        select.className = 'input';
        select.style.cssText = 'flex: 1.5; padding: 0.4rem 0.75rem; font-size: 0.85rem; border: none; background: transparent;';
        select.innerHTML = `
          <option value="Breakfast" style="background: var(--bg-secondary); color: var(--text-primary);">Breakfast</option>
          <option value="Lunch" style="background: var(--bg-secondary); color: var(--text-primary);">Lunch</option>
          <option value="Dinner" style="background: var(--bg-secondary); color: var(--text-primary);">Dinner</option>
          <option value="Snacks" style="background: var(--bg-secondary); color: var(--text-primary);">Snacks</option>
        `;
        actionGroup.appendChild(select);

        // Label for qty input helper inside action group
        const qtyLabel = document.createElement('span');
        qtyLabel.style.cssText = 'font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);';
        qtyLabel.textContent = 'Servings:';
        actionGroup.appendChild(qtyLabel);

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'input';
        qtyInput.defaultValue = '1';
        qtyInput.min = '0.5';
        qtyInput.step = '0.5';
        qtyInput.style.cssText = 'width: 72px; padding: 0.4rem 0.5rem; font-size: 0.85rem; border: none; background: transparent; text-align: center; border-left: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); border-radius: 0;';
        qtyInput.title = 'Servings';
        actionGroup.appendChild(qtyInput);

        const addBtn = document.createElement('button');
        addBtn.className = 'btn';
        addBtn.style.cssText = 'padding: 0.45rem 1.25rem; font-size: 0.85rem; border-radius: 0.625rem;';
        addBtn.innerHTML = `Add <i data-lucide="plus" style="width: 14px; height: 14px;"></i>`;
        
        addBtn.addEventListener('click', async () => {
          addBtn.disabled = true;
          addBtn.innerHTML = `Adding <i data-lucide="loader" style="width: 14px; height: 14px; animation: spin 1.5s linear infinite;"></i>`;
          refreshIcons();

          try {
            const today = new Date().toISOString().split('T')[0];
            await api.post(`/logs/${today}/meal`, {
              foodId: food._id,
              quantity: Number(qtyInput.value),
              mealType: select.value
            });
            showToast(`Successfully logged ${food.name} to ${select.value}!`, 'success');
            navigateTo('dashboard', 'history');
          } catch (err) {
            console.error(err);
            showToast('Error logging food to dashboard', 'error');
          } finally {
            addBtn.disabled = false;
            addBtn.innerHTML = `Add <i data-lucide="plus" style="width: 14px; height: 14px;"></i>`;
            refreshIcons();
          }
        });
        actionGroup.appendChild(addBtn);

        listWrapper.appendChild(itemCard);
      });
      // Convert Lucide icons in food list
      refreshIcons();
    } catch (err) {
      console.error(err);
      listWrapper.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--danger);">
          <i data-lucide="alert-triangle" style="width: 44px; height: 44px; margin-bottom: 0.75rem;"></i>
          <h4 style="margin: 0; font-family: var(--font-display);">Connection Intercepted</h4>
          <p class="text-secondary" style="font-size: 0.9rem; margin-top: 0.5rem;">Failed to fetch directory from the server. Check connectivity.</p>
        </div>
      `;
      refreshIcons();
    }
  };

  // Search Submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadFoods(searchInput.value);
  });

  // Log Activity Form Submit
  actForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = actForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `Logging... <i data-lucide="loader" style="width: 18px; height: 18px; animation: spin 1.5s linear infinite;"></i>`;
    refreshIcons();

    const name = actForm.name.value;
    const durationMinutes = Number(actForm.duration.value);
    const caloriesBurned = Number(actForm.calories.value);

    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post(`/logs/${today}/activity`, {
        name,
        durationMinutes,
        caloriesBurned
      });
      showToast('Activity successfully logged!', 'success');
      navigateTo('dashboard', 'workouts');
    } catch (err) {
      console.error(err);
      showToast('Error saving workout activity log', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Log Workout <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>`;
      refreshIcons();
    }
  });

  // Initial load
  loadFoods();

  return container;
}
