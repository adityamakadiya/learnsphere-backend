const studentService = require('../services/studentService');

const getPublishedCourses = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const courses = await studentService.getPublishedCourses(categoryId);
    res.status(200).json({ data: courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const enrollment = await studentService.enrollCourse(req.user.id, req.params.courseId);
    res.status(201).json({ data: enrollment });
  } catch (error) {
    if (error.message === 'Course not found' || error.message === 'Already enrolled in this course') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await studentService.getEnrolledCourses(req.user.id);
    res.status(200).json({ data: enrollments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseSessions = async (req, res) => {
  try {
    const sessions = await studentService.getCourseSessions(req.user.id, req.params.courseId);
    res.status(200).json({ data: sessions });
  } catch (error) {
    if (error.message === 'Not enrolled in this course') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const markSessionComplete = async (req, res) => {
  try {
    const completion = await studentService.markSessionComplete(req.user.id, req.params.sessionId);
    res.status(201).json({ data: completion });
  } catch (error) {
    if (
      error.message === 'Session not found' ||
      error.message === 'Not enrolled in this course' ||
      error.message === 'Session already completed'
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const dashboard = await studentService.getStudentDashboard(req.user.id);
    res.status(200).json({ data: dashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPublishedCourses,
  enrollCourse,
  getEnrolledCourses,
  getCourseSessions,
  markSessionComplete,
  getStudentDashboard,
};