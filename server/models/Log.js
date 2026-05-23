const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  meals: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    quantity: { type: Number, default: 1 }, // number of servings
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] }
  }],
  activities: [{
    name: { type: String, required: true },
    caloriesBurned: { type: Number, required: true },
    durationMinutes: { type: Number }
  }],
  totalCaloriesConsumed: { type: Number, default: 0 },
  totalCaloriesBurned: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 } // in glasses
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
