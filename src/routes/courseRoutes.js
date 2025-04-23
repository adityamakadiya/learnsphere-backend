const express = require('express');
const router = express.Router();
const restrictToInstructor = require('../middleware/restrictToInstructor');
const ownCourse = require('../middleware/ownCourse');
const { createCourse, getInstructorCourses, getCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const auth = require('../middleware/auth');

// All routes require instructor role

// router.use(auth , restrictToInstructor);

router.post('/',auth,restrictToInstructor,createCourse);
router.get('/instructor', getInstructorCourses);


router.use('/:id', ownCourse);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;