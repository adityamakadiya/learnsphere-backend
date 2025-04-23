const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCourse = async(userId, courseData) => {
  const course = await prisma.course.create({
    data: {
      title: courseData.title,
      description: courseData.description,
      categoryId: courseData.categoryId,
      instructorId: userId,
    }
  });
};

const getInstructorCourses = async (userId) => {
  return prisma.course.findMany({
    where: { instructorId: userId },
    include: {
      category: { select: {name:true} },
      sessions: { select: { id: true, title: true } },
    },
  });
};

const getCourse = async (courseId) => {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: { select: { name: true } },
      sessions: true,
    },
  });
};

const updateCourse = async (courseId, courseData) => {
  return prisma.course.update({
    where: { id: courseId },
    data: {
      title: courseData.title,
      description: courseData.description,
      categoryId: courseData.categoryId,
      published: courseData.published,
    },
  });
};

const deleteCourse = async (courseId) => {
  return prisma.course.delete({
    where: { id: courseId },
  });
};

module.exports = {
  createCourse,
  getInstructorCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};