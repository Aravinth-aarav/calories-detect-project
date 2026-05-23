const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  weight: { type: Number, default: 70 }, // in kg
  height: { type: Number, default: 170 }, // in cm
  dailyCalorieGoal: { type: Number, default: 2000 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  profilePhoto: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
