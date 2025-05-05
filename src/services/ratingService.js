const prisma = require('../config/database');

/**
 * Submit a rating for a course.
 * @param {Object} data - Rating data { courseId, userId, stars, review }
 * @returns {Promise<Object>} Created rating
 */
const submitRating = async ({ courseId, userId, stars, review }) => {
  console.log('ratingService/submitRating: Starting for user:', userId, 'course:', courseId);
  const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
  if (!course) {
    const error = new Error('Course not found');
    error.status = 404;
    throw error;
  }

  // Check if user is enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: parseInt(courseId) } },
  });
  if (!enrollment) {
    const error = new Error('User not enrolled in course');
    error.status = 403;
    throw error;
  }

  // Validate stars
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    const error = new Error('Stars must be an integer between 1 and 5');
    error.status = 400;
    throw error;
  }

  // Check for existing rating
  const existingRating = await prisma.rating.findUnique({
    where: { userId_courseId: { userId, courseId: parseInt(courseId) } },
  });
  if (existingRating) {
    const error = new Error('User has already rated this course');
    error.status = 400;
    throw error;
  }

  // Create rating
  const rating = await prisma.rating.create({
    data: {
      courseId: parseInt(courseId),
      userId,
      stars,
      review: review && review.trim() ? review.trim() : null,
    },
    select: { id: true, courseId: true, userId: true, stars: true, review: true, createdAt: true },
  });
  console.log('ratingService/submitRating: Created rating:', rating.id);
  return rating;
};

/**
 * Fetch a user's review for a course.
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object|null>} User's review or null if not found
 */
const getUserReviewForCourse = async (userId, courseId) => {
  console.log('ratingService/getUserReviewForCourse: Fetching for user:', userId, 'course:', courseId);
  const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
  if (!course) {
    const error = new Error('Course not found');
    error.status = 404;
    throw error;
  }

  const review = await prisma.rating.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: parseInt(courseId),
      },
    },
    select: {
      id: true,
      userId: true,
      courseId: true,
      stars: true,
      review: true,
      createdAt: true,
    },
  });
  console.log('ratingService/getUserReviewForCourse: Review:', review ? review.id : 'Not found');
  return review;
};

/**
 * Fetch ratings for a course.
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Ratings with average and count
 */
const getRatings = async (courseId) => {
  console.log('ratingService/getRatings: Fetching for course:', courseId);
  const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
  if (!course) {
    const error = new Error('Course not found');
    error.status = 404;
    throw error;
  }
  const ratings = await prisma.rating.findMany({
    where: { courseId: parseInt(courseId), flagged: false },
    select: {
      id: true,
      userId: true,
      courseId: true,
      stars: true,
      review: true,
      createdAt: true,
      user: { select: { email: true } },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  const averageRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
    : 0;
  console.log('ratingService/getRatings: Found', ratings.length, 'ratings');
  return {
    ratings,
    averageRating: parseFloat(averageRating.toFixed(1)),
    ratingCount: ratings.length,
  };
};

/**
 * Add a comment to a rating.
 * @param {Object} data - Comment data { ratingId, userId, content }
 * @returns {Promise<Object>} Created comment
 */
const addComment = async ({ ratingId, userId, content }) => {
  console.log('ratingService/addComment: Starting for user:', userId, 'rating:', ratingId);
  // Validate rating exists
  const rating = await prisma.rating.findUnique({ where: { id: parseInt(ratingId) } });
  if (!rating) {
    const error = new Error('Rating not found');
    error.status = 404;
    throw error;
  }

  // Check user role
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  console.log('ratingService/addComment: User role:', user.role);
  if (user.role.toLowerCase() !== 'instructor') {
    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: rating.courseId } },
    });
    if (!enrollment) {
      const error = new Error('User not enrolled in course');
      error.status = 403;
      throw error;
    }
  }

  // Validate content
  if (!content || content.trim().length < 5) {
    const error = new Error('Comment must be at least 5 characters');
    error.status = 400;
    throw error;
  }

  // Create comment
  const comment = await prisma.comment.create({
    data: {
      ratingId: parseInt(ratingId),
      userId,
      content: content.trim(),
    },
    select: {
      id: true,
      ratingId: true,
      userId: true,
      content: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });
  console.log('ratingService/addComment: Created comment:', comment.id);
  return comment;
};

/**
 * Fetch comments for a rating.
 * @param {string} ratingId - Rating ID
 * @returns {Promise<Array>} List of comments
 */
const getComments = async (ratingId) => {
  console.log('ratingService/getComments: Fetching for rating:', ratingId);
  const rating = await prisma.rating.findUnique({ where: { id: parseInt(ratingId) } });
  if (!rating) {
    const error = new Error('Rating not found');
    error.status = 404;
    throw error;
  }

  const comments = await prisma.comment.findMany({
    where: { ratingId: parseInt(ratingId), flagged: false },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  console.log('ratingService/getComments: Found', comments.length, 'comments');
  return comments;
};

/**
 * Flag a rating or comment for moderation.
 * @param {Object} data - Flag data { ratingId, commentId, userId }
 * @returns {Promise<Object>} Result
 */
const flagContent = async ({ ratingId, commentId, userId }) => {
  console.log('ratingService/flagContent: Starting for user:', userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !['Instructor', 'Admin'].includes(user.role)) {
    const error = new Error('Unauthorized: Only instructors or admins can flag content');
    error.status = 403;
    throw error;
  }

  if (ratingId) {
    const rating = await prisma.rating.findUnique({ where: { id: parseInt(ratingId) } });
    if (!rating) {
      const error = new Error('Rating not found');
      error.status = 404;
      throw error;
    }
    await prisma.rating.update({
      where: { id: parseInt(ratingId) },
      data: { flagged: true },
    });
    console.log('ratingService/flagContent: Rating flagged:', ratingId);
    return { message: 'Rating flagged for moderation' };
  } else if (commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
    if (!comment) {
      const error = new Error('Comment not found');
      error.status = 404;
      throw error;
    }
    await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { flagged: true },
    });
    console.log('ratingService/flagContent: Comment flagged:', commentId);
    return { message: 'Comment flagged for moderation' };
  } else {
    const error = new Error('Rating or comment ID required');
    error.status = 400;
    throw error;
  }
};

module.exports = { ratingService: { submitRating, getUserReviewForCourse, getRatings, addComment, getComments, flagContent } };