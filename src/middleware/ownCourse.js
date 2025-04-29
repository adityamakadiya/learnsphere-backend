const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ownCourse = async (req, res, next) => {
  const userId = req.user.id;
  let courseId;

  // Check for courseId in params, body, or session
  if (req.params.id) {
    courseId = parseInt(req.params.id);
  } else if (req.params.courseId) {
    courseId = parseInt(req.params.courseId);
  } else if (req.body.courseId) {
    courseId = parseInt(req.body.courseId);
  }

  // If courseId is still not set, try to get it from the session
  if (req.params.id && !courseId) {
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Fetch session to find courseId
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { courseId: true },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    courseId = session.courseId;
  }

  // Check if the courseId is valid
  if (!courseId || isNaN(courseId)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  // Check for the course and validate if it belongs to the current instructor
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  // if (!course) {
  //   return res.status(404).json({ error: "Course not found" });
  // }

  // console.log(course.instructorId);
  // console.log(userId);
  
  
  // if (course.instructorId !== userId) {
  //   return res.status(403).json({ error: "Not authorized to access this course" });
  // }

  // Attach courseId to the request object for use in next middleware
  req.courseId = courseId;
  next();
};

module.exports = ownCourse;
