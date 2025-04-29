const express = require('express');
const router = express.Router();
const { getAllCoursesProgress, getCourseProgress, markSessionProgress, getCourseEnrollments, deleteEnrollment } = require('../controllers/progressController');
const auth = require('../middleware/auth');
const restrictToInstructor = require('../middleware/restrictToInstructor');

// Get progress for a specific course
router.get('/:userId/:courseId', auth, getCourseProgress);

// Get progress for all enrolled courses
router.get('/:userId', auth, getAllCoursesProgress);

// Mark a session as completed/uncompleted
router.post('/', auth, markSessionProgress);

// Get all enrollments for a course (instructor-only)
router.get('/courses/:courseId/enrollments', auth, restrictToInstructor, getCourseEnrollments);

// Delete an enrollment (instructor-only)
router.delete('/enrollments/:enrollmentId', auth, restrictToInstructor, deleteEnrollment);

module.exports = router;