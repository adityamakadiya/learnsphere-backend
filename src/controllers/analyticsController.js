const analyticsService = require('../services/analyticsService');

const getEnrollmentsByCourse = async (req, res) => {
  try {
    const enrollments = await analyticsService.getEnrollmentsByCourse(req.user.id);
    res.status(200).json({ data: enrollments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompletionRates = async (req, res) => {
  try {
    const completions = await analyticsService.getCompletionRates(req.user.id);
    res.status(200).json({ data: completions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAverageRatings = async (req, res) => {
  try {
    const ratings = await analyticsService.getAverageRatings(req.user.id);
    res.status(200).json({ data: ratings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.query;
    const students = await analyticsService.getStudentProgress(req.user.id, courseId);
    res.status(200).json({ data: students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEnrollmentsByCourse,
  getCompletionRates,
  getAverageRatings,
  getStudentProgress,
};