const express = require('express');
const router = express.Router();
const restrictToInstructor = require('../middleware/restrictToInstructor');
const ownCourse = require('../middleware/ownCourse');
const { createCourse, getInstructorCourses, getCourse, updateCourse, deleteCourse, getCategories, getAllCourses } = require('../controllers/courseController');
const auth = require('../middleware/auth');

// All routes require instructor role

router.post('/',auth,restrictToInstructor,createCourse);
router.get('/instructor',auth , restrictToInstructor, getInstructorCourses);

router.get('/category',auth, getCategories);
router.get('/allCourses',auth,getAllCourses);

router.use('/:id',auth , restrictToInstructor, ownCourse);
router.get('/:id',auth , restrictToInstructor, getCourse);
router.put('/:id',auth , restrictToInstructor, updateCourse);
router.delete('/:id',auth , restrictToInstructor, deleteCourse);


module.exports = router;