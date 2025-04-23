const express = require('express');
const router = express.Router();
const restrictToInstructor = require('../middleware/restrictToInstructor');
const ownCourse = require('../middleware/ownCourse');
const { createSession, getSession, updateSession, deleteSession } = require('../controllers/sessionController');

// All routes require instructor role
router.use(restrictToInstructor);

// Session creation (requires course ownership)
router.post('/courses/:courseId/sessions', ownCourse, createSession);

// Session-specific routes (require course ownership via session)
router.use('/:id', ownCourse);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;