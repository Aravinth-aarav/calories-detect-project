const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true }, // per 100g or 1 serving
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  servingSize: { type: String, default: "1 serving" },
  isCommon: { type: Boolean, default: false }, // To help filter Indian datasets easily
  imageUrl: { type: String }
});

module.exports = mongoose.model('Food', foodSchema);
