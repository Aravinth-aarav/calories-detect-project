const express = require('express');
const Log = require('../models/Log');
const Food = require('../models/Food');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get log for a specific date (YYYY-MM-DD)
router.get('/:date', authMiddleware, async (req, res) => {
  try {
    let log = await Log.findOne({ user: req.user.id, date: req.params.date }).populate('meals.food');
    if (!log) {
      log = new Log({ user: req.user.id, date: req.params.date, meals: [], activities: [] });
      await log.save();
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add meal to log
router.post('/:date/meal', authMiddleware, async (req, res) => {
  try {
    const { foodId, quantity, mealType } = req.body;
    let log = await Log.findOne({ user: req.user.id, date: req.params.date });
    if (!log) {
      log = new Log({ user: req.user.id, date: req.params.date, meals: [], activities: [] });
    }

    const foodInfo = await Food.findById(foodId);
    if (!foodInfo) return res.status(404).json({ error: 'Food not found' });

    log.meals.push({ food: foodId, quantity, mealType });
    log.totalCaloriesConsumed += (foodInfo.calories * quantity);

    await log.save();
    
    // Return populated log
    log = await Log.findById(log._id).populate('meals.food');
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add activity
router.post('/:date/activity', authMiddleware, async (req, res) => {
  try {
    const { name, caloriesBurned, durationMinutes } = req.body;
    let log = await Log.findOne({ user: req.user.id, date: req.params.date });
    if (!log) {
      log = new Log({ user: req.user.id, date: req.params.date, meals: [], activities: [] });
    }

    log.activities.push({ name, caloriesBurned, durationMinutes });
    log.totalCaloriesBurned += caloriesBurned;

    await log.save();
    log = await Log.findById(log._id).populate('meals.food');
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update water intake
router.post('/:date/water', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // +1 or -1
    let log = await Log.findOne({ user: req.user.id, date: req.params.date });
    if (!log) {
      log = new Log({ user: req.user.id, date: req.params.date, meals: [], activities: [], waterIntake: 0 });
    }

    log.waterIntake = Math.max(0, log.waterIntake + amount);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete meal from log
router.delete('/:date/meal/:mealId', authMiddleware, async (req, res) => {
  try {
    const log = await Log.findOne({ user: req.user.id, date: req.params.date }).populate('meals.food');
    if (!log) return res.status(404).json({ error: 'Log not found' });

    const mealIndex = log.meals.findIndex(m => m._id.toString() === req.params.mealId);
    if (mealIndex === -1) return res.status(404).json({ error: 'Meal not found' });

    const meal = log.meals[mealIndex];
    log.totalCaloriesConsumed -= (meal.food.calories * meal.quantity);
    log.meals.splice(mealIndex, 1);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get week summary
router.get('/summary/week', authMiddleware, async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id }).sort({ date: -1 }).limit(7);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
