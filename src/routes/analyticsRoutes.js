const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// Restrict to instructors
router.use(auth, (req, res, next) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Access restricted to instructors' });
  }
  next();
});

router.get('/enrollments', analyticsController.getEnrollmentsByCourse);
router.get('/completions', analyticsController.getCompletionRates);
router.get('/ratings', analyticsController.getAverageRatings);
router.get('/students', analyticsController.getStudentProgress);

module.exports = router;