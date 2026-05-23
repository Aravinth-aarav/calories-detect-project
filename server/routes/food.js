const express = require('express');
const Food = require('../models/Food');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all foods or search by name
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    let foods = [];
    if (query) {
      // 1. Search local database first
      foods = await Food.find({ name: { $regex: query, $options: 'i' } }).limit(20);
      
      // Upgrade local foods with images if they lack them
      for (let i = 0; i < foods.length; i++) {
         if (!foods[i].imageUrl) {
            try {
               // Remove parentheses like "(Chapati)" from search
               const queryTerm = encodeURIComponent(foods[i].name.split(/[,\(]/)[0].trim());
               const spoonUrl = `https://api.spoonacular.com/food/ingredients/search?query=${queryTerm}&apiKey=baff84273e3c4ab780e0a904a1a67b53&number=1`;
               const spoonRes = await fetch(spoonUrl);
               const spoonData = await spoonRes.json();
               if (spoonData.results && spoonData.results.length > 0 && spoonData.results[0].image) {
                  foods[i].imageUrl = `https://spoonacular.com/cdn/ingredients_100x100/${spoonData.results[0].image}`;
                  await foods[i].save();
               }
            } catch (e) {}
         }
      }

      // 2. Intercept and fetch from USDA Data API to expand our database dynamically
      try {
        const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=ffLdJruDLatdh0Hco6xO8hjIWblhc5inoR40BbKt&pageSize=10`;
        const response = await fetch(usdaUrl);
        const data = await response.json();
        
        if (data.foods) {
          for (let f of data.foods) {
            const existing = await Food.findOne({ name: f.description });
            if (!existing) {
               let calories = 0, protein = 0, carbs = 0, fats = 0;
               f.foodNutrients.forEach(n => {
                  if (n.nutrientNumber === '208' || n.nutrientId === 1008) calories = n.value;
                  if (n.nutrientNumber === '203' || n.nutrientId === 1003) protein = n.value;
                  if (n.nutrientNumber === '205' || n.nutrientId === 1005) carbs = n.value;
                  if (n.nutrientNumber === '204' || n.nutrientId === 1004) fats = n.value;
               });
               
               let imageUrl = '';
               try {
                  const queryTerm = encodeURIComponent(f.description.split(',')[0]);
                  const spoonUrl = `https://api.spoonacular.com/food/ingredients/search?query=${queryTerm}&apiKey=baff84273e3c4ab780e0a904a1a67b53&number=1`;
                  const spoonRes = await fetch(spoonUrl);
                  const spoonData = await spoonRes.json();
                  if (spoonData.results && spoonData.results.length > 0 && spoonData.results[0].image) {
                     imageUrl = `https://spoonacular.com/cdn/ingredients_100x100/${spoonData.results[0].image}`;
                  }
               } catch (e) { console.error("Spoonacular API error:", e); }

               const newFood = new Food({
                 name: f.description,
                 calories: calories || 0,
                 protein: protein || 0,
                 carbs: carbs || 0,
                 fats: fats || 0,
                 servingSize: '100g', // USDA default measurement
                 imageUrl: imageUrl
               });
               await newFood.save();
               foods.push(newFood);
            }
          }
        }
      } catch (apiErr) {
        console.error("USDA API error:", apiErr);
      }
    } else {
      foods = await Food.find().limit(50);
      // Upgrade default loaded foods with images if they lack them
      for (let i = 0; i < foods.length; i++) {
         if (!foods[i].imageUrl) {
            try {
               const queryTerm = encodeURIComponent(foods[i].name.split(/[,\(]/)[0].trim());
               const spoonUrl = `https://api.spoonacular.com/food/ingredients/search?query=${queryTerm}&apiKey=baff84273e3c4ab780e0a904a1a67b53&number=1`;
               const spoonRes = await fetch(spoonUrl);
               const spoonData = await spoonRes.json();
               if (spoonData.results && spoonData.results.length > 0 && spoonData.results[0].image) {
                  foods[i].imageUrl = `https://spoonacular.com/cdn/ingredients_100x100/${spoonData.results[0].image}`;
                  await foods[i].save();
               }
            } catch (e) {}
         }
      }
    }
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a custom food
router.post('/', authMiddleware, async (req, res) => {
  try {
     const { name, calories, protein, carbs, fats, servingSize } = req.body;
     const newFood = new Food({ name, calories, protein, carbs, fats, servingSize });
     await newFood.save();
     res.status(201).json(newFood);
  } catch (err) {
     res.status(500).json({ error: 'Server error' });
  }
});

// Seed common Indian foods
router.post('/seed', async (req, res) => {
  try {
    const existingFoods = await Food.countDocuments();
    if (existingFoods > 0) {
      return res.status(400).json({ message: 'Database already seeded' });
    }

    const indianFoods = [
      { name: 'Roti (Chapati)', calories: 71, protein: 3, carbs: 15, fats: 0.4, servingSize: '1 medium (30g)', isCommon: true },
      { name: 'Dal Tadka', calories: 154, protein: 7, carbs: 20, fats: 5, servingSize: '1 bowl (150g)', isCommon: true },
      { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, servingSize: '1 bowl (100g cooked)', isCommon: true },
      { name: 'Paneer Butter Masala', calories: 350, protein: 12, carbs: 14, fats: 28, servingSize: '1 bowl (200g)', isCommon: true },
      { name: 'Chicken Curry', calories: 240, protein: 25, carbs: 8, fats: 12, servingSize: '1 bowl (200g)', isCommon: true },
      { name: 'Aloo Gobi', calories: 130, protein: 4, carbs: 15, fats: 6, servingSize: '1 bowl (150g)', isCommon: true },
      { name: 'Idli', calories: 39, protein: 1, carbs: 8, fats: 0.1, servingSize: '1 piece', isCommon: true },
      { name: 'Dosa (Plain)', calories: 133, protein: 3, carbs: 29, fats: 0.5, servingSize: '1 medium', isCommon: true },
      { name: 'Masala Dosa', calories: 415, protein: 8, carbs: 64, fats: 14, servingSize: '1 medium', isCommon: true },
      { name: 'Samosa', calories: 260, protein: 3, carbs: 26, fats: 16, servingSize: '1 piece', isCommon: true },
      { name: 'Boiled Egg', calories: 68, protein: 5.5, carbs: 0.6, fats: 4.7, servingSize: '1 large', isCommon: true },
      { name: 'Oats (Cooked)', calories: 150, protein: 5, carbs: 27, fats: 3, servingSize: '1 cup', isCommon: true }
    ];

    await Food.insertMany(indianFoods);
    res.json({ message: 'Indian foods seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during seeding' });
  }
});

// Toggle favorite
router.post('/favorite/:id', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const foodId = req.params.id;

    const index = user.favorites.indexOf(foodId);
    if (index === -1) {
      user.favorites.push(foodId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
