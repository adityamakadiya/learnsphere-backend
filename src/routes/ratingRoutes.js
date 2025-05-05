// const express = require('express');
// const { submitRating, getRatings, addComment, getComments, flagContent } = require('../controllers/ratingController');
// const auth = require('../middleware/auth');
// const { validateRating, validateComment } = require('../middleware/validator');
// const router = express.Router();

// /**
//  * Ratings and comments routes for LearnSphere.
//  */
// router.post('/courses/:courseId/ratings', auth, validateRating, submitRating);
// router.get('/courses/:courseId/ratings', getRatings);
// router.post('/courses/:courseId/ratings/:ratingId/comments', auth, validateComment, addComment);
// router.get('/courses/:courseId/ratings/:ratingId/comments', getComments);
// router.patch('/ratings/:ratingId/flag', auth, flagContent);
// router.patch('/comments/:commentId/flag', auth, flagContent);

// module.exports = router;
const express = require('express');
const { submitRating, getRatings, addComment, getComments, flagContent, getUserReview } = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const { validateRating, validateComment } = require('../middleware/validator');
const router = express.Router();

/**
 * Ratings and comments routes for LearnSphere.
 */
router.post('/courses/:courseId/ratings', auth, validateRating, submitRating);
router.get('/courses/:courseId/ratings', getRatings);
router.get('/courses/:courseId/user/:userId', auth, getUserReview);
router.post('/courses/:courseId/ratings/:ratingId/comments', auth, validateComment, addComment);
router.get('/courses/:courseId/ratings/:ratingId/comments', getComments);
router.patch('/ratings/:ratingId/flag', auth, flagContent);
router.patch('/comments/:commentId/flag', auth, flagContent);

module.exports = router;