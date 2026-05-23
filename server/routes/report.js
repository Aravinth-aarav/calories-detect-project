const express = require('express');
const PDFDocument = require('pdfkit');
const Log = require('../models/Log');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/download/:date', authMiddleware, async (req, res) => {
  try {
    const log = await Log.findOne({ user: req.user.id, date: req.params.date }).populate('meals.food');
    if (!log) return res.status(404).json({ error: 'No log found for this date' });

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DietReport-${req.params.date}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text('CalorieDetect Pro - Daily Diet Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`Date: ${req.params.date}`);
    doc.text(`Total Calories Consumed: ${log.totalCaloriesConsumed} kcal`);
    doc.text(`Total Calories Burned: ${log.totalCaloriesBurned} kcal`);
    doc.moveDown();

    doc.fontSize(16).text('Meals:');
    doc.moveDown();
    
    if (log.meals.length > 0) {
       log.meals.forEach(meal => {
         if (meal.food) {
           doc.fontSize(12).text(`- ${meal.mealType}: ${meal.food.name} (${meal.quantity} serving) - ${meal.food.calories * meal.quantity} kcal`);
         }
       });
    } else {
       doc.fontSize(12).text('No meals logged.');
    }

    doc.moveDown();
    doc.fontSize(16).text('Activities:');
    doc.moveDown();

    if (log.activities.length > 0) {
       log.activities.forEach(act => {
         doc.fontSize(12).text(`- ${act.name}: ${act.durationMinutes} minutes (-${act.caloriesBurned} kcal)`);
       });
    } else {
       doc.fontSize(12).text('No activities logged.');
    }

    doc.end();

  } catch (err) {
    res.status(500).json({ error: 'Server error generating PDF' });
  }
});

module.exports = router;
