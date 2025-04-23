const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ownCourse = async(req, res, next) => {
  const userId = req.user.id;
  let courseId;

  //For course routes, courseId is in params or body
  if(req.params.id){
    courseId = parseInt(req.params.id);
  }else if(req.params.courseId){
    courseId = parseInt(req.params.courseId);
  }else if (req.body.courseId) {
    courseId = parseInt(req.body.courseId);
  }

  // For session routes, get courseId from session

  if(req.params.id && !courseId) {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { courseId: true },
    });
    if(!session){
      return res.status(404).json({error: "Session not found"});
    }
    courseId = session.courseId;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (!course) {
    return res.status(404).json({error: "Course not found"});
  }

  if (course.instructorId !== userId) {
    return res.status(403).json({ error: 'Not authorized to access this course' });
  }

  req.courseId = courseId;
  next();
}

module.exports = ownCourse;