const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPublishedCourses = async (categoryId) => {
  const where = {};
  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }
  return prisma.course.findMany({
    where,
    include: {
      category: { select: { name: true } },
      sessions: { select: { id: true, title: true } },
    },
  });
};

const enrollCourse = async (userId, courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
  });
  if (!course) {
    throw new Error('Course not found');
  }
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: parseInt(courseId) } },
  });
  if (existingEnrollment) {
    throw new Error('Already enrolled in this course');
  }
  return prisma.enrollment.create({
    data: {
      userId,
      courseId: parseInt(courseId),
    },
  });
};

const getEnrolledCourses = async (userId) => {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          category: { select: { name: true } },
          sessions: { select: { id: true, title: true } },
        },
      },
    },
  });
};

const getCourseSessions = async (userId, courseId) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: parseInt(courseId) } },
  });
  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }
  return prisma.session.findMany({
    where: { courseId: parseInt(courseId) },
    select: {
      id: true,
      title: true,
      youtubeUrl: true,
      content: true,
      order: true,
    },
    orderBy: { order: 'asc' },
  });
};

const markSessionComplete = async (userId, sessionId) => {
  const session = await prisma.session.findUnique({
    where: { id: parseInt(sessionId) },
    include: { course: { select: { id: true } } },
  });
  if (!session) {
    throw new Error('Session not found');
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: session.course.id },
    },
  });
  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }
  const existingProgress = await prisma.progress.findUnique({
    where: { userId_sessionId: { userId, sessionId: parseInt(sessionId) } },
  });
  if (existingProgress && existingProgress.completed) {
    throw new Error('Session already completed');
  }
  if (existingProgress) {
    return prisma.progress.update({
      where: { userId_sessionId: { userId, sessionId: parseInt(sessionId) } },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });
  }
  return prisma.progress.create({
    data: {
      userId,
      sessionId: parseInt(sessionId),
      completed: true,
      completedAt: new Date(),
    },
  });
};

const getStudentDashboard = async (userId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          category: { select: { name: true } },
          sessions: { select: { id: true } },
        },
      },
    },
  });
  const completions = await prisma.progress.findMany({
    where: { userId, completed: true },
    select: { sessionId: true },
  });
  const completedSessionIds = completions.map((c) => c.sessionId);
  return enrollments.map((enrollment) => {
    const totalSessions = enrollment.course.sessions.length;
    const completedSessions = enrollment.course.sessions.filter((session) =>
      completedSessionIds.includes(session.id)
    ).length;
    return {
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        category: enrollment.course.category,
      },
      progress: {
        completed: completedSessions,
        total: totalSessions,
      },
    };
  });
};

module.exports = {
  getPublishedCourses,
  enrollCourse,
  getEnrolledCourses,
  getCourseSessions,
  markSessionComplete,
  getStudentDashboard,
};