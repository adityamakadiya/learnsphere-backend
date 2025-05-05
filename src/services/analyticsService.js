const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEnrollmentsByCourse = async (instructorId) => {
  const enrollments = await prisma.enrollment.groupBy({
    by: ['courseId'],
    where: { course: { instructorId } },
    _count: { userId: true },
  });
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });
  return enrollments.map(e => ({
    courseId: e.courseId,
    courseTitle: courses.find(c => c.id === e.courseId)?.title || 'Unknown',
    enrollmentCount: e._count.userId,
  }));
};

const getCompletionRates = async (instructorId) => {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });
  const completionData = await Promise.all(
    courses.map(async (course) => {
      const totalSessions = await prisma.session.count({ where: { courseId: course.id } });
      const completedSessions = await prisma.progress.count({
        where: { session: { courseId: course.id }, completed: true },
      });
      const enrollments = await prisma.enrollment.count({ where: { courseId: course.id } });
      const totalPossible = totalSessions * enrollments;
      const completionRate = totalPossible ? (completedSessions / totalPossible) * 100 : 0;
      return {
        courseId: course.id,
        courseTitle: course.title,
        completionRate: parseFloat(completionRate.toFixed(2)),
        completedSessions,
        totalPossible,
      };
    })
  );
  return completionData;
};

const getAverageRatings = async (instructorId) => {
  const ratings = await prisma.rating.groupBy({
    by: ['courseId'],
    where: { course: { instructorId }, flagged: false },
    _avg: { stars: true },
    _count: { id: true },
  });
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });
  return ratings.map(r => ({
    courseId: r.courseId,
    courseTitle: courses.find(c => c.id === r.courseId)?.title || 'Unknown',
    averageRating: r._avg.stars ? parseFloat(r._avg.stars.toFixed(1)) : 0,
    ratingCount: r._count.id,
  }));
};

const getStudentProgress = async (instructorId, courseId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId, id: courseId ? parseInt(courseId) : undefined } },
    include: {
      user: { select: { id: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });
  return await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalSessions = await prisma.session.count({
        where: { courseId: enrollment.courseId },
      });
      const completedSessions = await prisma.progress.count({
        where: { userId: enrollment.userId, session: { courseId: enrollment.courseId }, completed: true },
      });
      const lastActivity = await prisma.progress.findFirst({
        where: { userId: enrollment.userId, session: { courseId: enrollment.courseId } },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      });
      return {
        userId: enrollment.user.id,
        email: enrollment.user.email,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        completionPercentage: totalSessions ? parseFloat(((completedSessions / totalSessions) * 100).toFixed(2)) : 0,
        completedSessions,
        totalSessions,
        lastActivity: lastActivity?.updatedAt || null,
      };
    })
  );
};

module.exports = {
  getEnrollmentsByCourse,
  getCompletionRates,
  getAverageRatings,
  getStudentProgress,
};