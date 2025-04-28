const express = require('express');
const router = express.Router();
const {
  getPublishedCourses,
  enrollCourse,
  getEnrolledCourses,
  getCourseSessions,
  markSessionComplete,
  getStudentDashboard,
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const restrictToStudent = require('../middleware/restrictToStudent');

router.use(auth);
router.use(restrictToStudent);

router.get('/courses', getPublishedCourses);
router.post('/courses/:courseId/enroll', enrollCourse);
router.get('/enrollments', getEnrolledCourses);
router.get('/courses/:courseId/sessions', getCourseSessions);
router.post('/sessions/:sessionId/complete', markSessionComplete);
router.get('/dashboard', getStudentDashboard);

module.exports = router;