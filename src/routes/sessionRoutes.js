const express = require('express');
const router = express.Router();
const restrictToInstructor = require('../middleware/restrictToInstructor');
const ownCourse = require('../middleware/ownCourse');
const { createSession, getSession, updateSession, deleteSession, getSessionbyId } = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// All routes require instructor role
router.use(auth , restrictToInstructor);

// Session creation (requires course ownership)
router.post('/courses/:courseId/sessions', ownCourse, createSession);

// Session-specific routes (require course ownership via session)
// router.use('/:id', ownCourse);
router.get('/:id', ownCourse, getSession);
router.get('/sid/:id', ownCourse, getSessionbyId)
router.put('/:id', ownCourse, updateSession);
router.delete('/:id', deleteSession);

module.exports = router;