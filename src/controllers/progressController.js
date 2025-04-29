const progressService = require('../services/progressService');

class ProgressController {
  // GET /api/progress/:userId/:courseId
  async getCourseProgress(req, res) {
    const { userId, courseId } = req.params;

    // Validate input
    const userIdInt = parseInt(userId);
    const courseIdInt = parseInt(courseId);
    if (isNaN(userIdInt) || isNaN(courseIdInt)) {
      return res.status(400).json({ error: 'Invalid userId or courseId' });
    }

    try {
      const progress = await progressService.getCourseProgress(userIdInt, courseIdInt);
      res.json(progress);
    } catch (error) {
      console.error('Error in getCourseProgress:', error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // GET /api/progress/:userId
  async getAllCoursesProgress(req, res) {
    const { userId } = req.params;

    // Validate input
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
      const progress = await progressService.getAllCoursesProgress(userIdInt);
      res.json(progress);
    } catch (error) {
      console.error('Error in getAllCoursesProgress:', error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // POST /api/progress
  async markSessionProgress(req, res) {
    const { userId, sessionId, completed } = req.body;

    // Validate input
    if (!userId || !sessionId || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Invalid input: userId, sessionId, and completed are required' });
    }

    try {
      const progress = await progressService.markSessionProgress(userId, sessionId, completed);
      res.json(progress);
    } catch (error) {
      console.error('Error in markSessionProgress:', error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // GET /api/progress/courses/:courseId/enrollments
  async getCourseEnrollments(req, res) {
    const { courseId } = req.params;

    // Validate input
    const courseIdInt = parseInt(courseId);
    if (isNaN(courseIdInt)) {
      return res.status(400).json({ error: 'Invalid courseId' });
    }

    try {
      const enrollments = await progressService.getCourseEnrollments(courseIdInt);
      res.json(enrollments);
    } catch (error) {
      console.error('Error in getCourseEnrollments:', error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // DELETE /api/progress/enrollments/:enrollmentId
  async deleteEnrollment(req, res) {
    const { enrollmentId } = req.params;

    // Validate input
    const enrollmentIdInt = parseInt(enrollmentId);
    if (isNaN(enrollmentIdInt)) {
      return res.status(400).json({ error: 'Invalid enrollmentId' });
    }

    try {
      const result = await progressService.deleteEnrollment(enrollmentIdInt);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteEnrollment:', error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = new ProgressController();