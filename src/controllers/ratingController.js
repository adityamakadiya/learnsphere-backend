// const { ratingService } = require('../services/ratingService');

// /**
//  * Submit a rating for a course.
//  */
// const submitRating = async (req, res, next) => {
//   try {
//     const { courseId } = req.params;
//     const { stars, review } = req.body;
//     const userId = req.user.id;
//     const rating = await ratingService.submitRating({ courseId, userId, stars, review });
//     res.status(201).json(rating);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * Fetch ratings for a course.
//  */
// const getRatings = async (req, res, next) => {
//   try {
//     const { courseId } = req.params;
//     const ratings = await ratingService.getRatings(courseId);
//     res.json(ratings);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * Add a comment to a rating.
//  */
// const addComment = async (req, res, next) => {
//   try {
//     const { ratingId } = req.params;
//     const { content } = req.body;
//     const userId = req.user.id;
//     const comment = await ratingService.addComment({ ratingId, userId, content });
//     res.status(201).json(comment);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * Fetch comments for a rating.
//  */
// const getComments = async (req, res, next) => {
//   try {
//     const { ratingId } = req.params;
//     const comments = await ratingService.getComments(ratingId);
//     res.json(comments);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * Flag a rating or comment for moderation.
//  */
// const flagContent = async (req, res, next) => {
//   try {
//     const { ratingId, commentId } = req.params;
//     const userId = req.user.id;
//     const result = await ratingService.flagContent({ ratingId, commentId, userId });
//     res.json(result);
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { submitRating, getRatings, addComment, getComments, flagContent };

const { ratingService } = require('../services/ratingService');

/**
 * Submit a rating for a course.
 */
const submitRating = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { stars, review } = req.body;
    const userId = req.user.id;
    const rating = await ratingService.submitRating({ courseId, userId, stars, review });
    res.status(201).json(rating);
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch ratings for a course.
 */
const getRatings = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const ratings = await ratingService.getRatings(courseId);
    res.json(ratings);
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch a user's review for a course.
 */
const getUserReview = async (req, res, next) => {
  try {
    const { courseId, userId } = req.params;
    const review = await ratingService.getUserReviewForCourse(parseInt(userId), parseInt(courseId));
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ data: review });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a comment to a rating.
 */
const addComment = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const comment = await ratingService.addComment({ ratingId, userId, content });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch comments for a rating.
 */
const getComments = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const comments = await ratingService.getComments(ratingId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * Flag a rating or comment for moderation.
 */
const flagContent = async (req, res, next) => {
  try {
    const { ratingId, commentId } = req.params;
    const userId = req.user.id;
    const result = await ratingService.flagContent({ ratingId, commentId, userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitRating, getRatings, getUserReview, addComment, getComments, flagContent };