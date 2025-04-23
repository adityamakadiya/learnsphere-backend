const courseService = require('../services/courseService');

const createCourse = async(req, res) => {
  try{
    const course = await courseService.createCourse(req.user.id, req.body);
    console.log(course);
    
    res.status(201).json({data:course});
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}

const getInstructorCourses = async (req, res) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user.id);
    res.status(200).json({ data: courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await courseService.getCourse(req.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json({ data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.courseId, req.body);
    res.status(200).json({ data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.courseId);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await courseService.getCategories();
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createCourse,
  getInstructorCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCategories
};