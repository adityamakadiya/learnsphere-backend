const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProgressService {
  // Get progress for a specific course
  async getCourseProgress(userId, courseId) {
    // Validate user and course existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) {
      const error = new Error('User not enrolled in course');
      error.status = 403;
      throw error;
    }

    // Count total sessions
    const totalSessions = await prisma.session.count({
      where: { courseId },
    });

    // Count completed sessions
    const completedSessions = await prisma.progress.count({
      where: {
        userId,
        session: { courseId },
        completed: true,
      },
    });

    // Calculate percentage
    const completionPercentage = totalSessions === 0 ? 0 : (completedSessions / totalSessions) * 100;

    return {
      courseId,
      userId,
      completionPercentage: parseFloat(completionPercentage.toFixed(2)),
      completedSessions,
      totalSessions,
    };
  }

  // Get progress for all enrolled courses
  async getAllCoursesProgress(userId) {
    // Validate user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Fetch enrollments with course details
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            sessions: { select: { id: true } },
          },
        },
      },
    });

    const progress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        const totalSessions = course.sessions.length;

        const completedSessions = await prisma.progress.count({
          where: {
            userId,
            session: { courseId: course.id },
            completed: true,
          },
        });

        const completionPercentage = totalSessions === 0 ? 0 : (completedSessions / totalSessions) * 100;

        return {
          courseId: course.id,
          courseTitle: course.title,
          completionPercentage: parseFloat(completionPercentage.toFixed(2)),
          completedSessions,
          totalSessions,
        };
      })
    );

    return { userId, progress };
  }

  // Mark a session as completed/uncompleted
  async markSessionProgress(userId, sessionId, completed) {
    // Validate user and session
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    if (!session) {
      const error = new Error('Session not found');
      error.status = 404;
      throw error;
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: session.course.id } },
    });
    if (!enrollment) {
      const error = new Error('User not enrolled in course');
      error.status = 403;
      throw error;
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        sessionId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return progress;
  }

  // Get all enrollments for a course with progress
  async getCourseEnrollments(courseId) {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    // Fetch progress for each enrolled student
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalSessions = await prisma.session.count({
          where: { courseId: parseInt(courseId) },
        });
        const completedSessions = await prisma.progress.count({
          where: {
            userId: enrollment.userId,
            session: { courseId: parseInt(courseId) },
            completed: true,
          },
        });
        const completionPercentage = totalSessions === 0 ? 0 : (completedSessions / totalSessions) * 100;
        return {
          ...enrollment,
          progress: {
            completionPercentage: parseFloat(completionPercentage.toFixed(2)),
            completedSessions,
            totalSessions,
          },
        };
      })
    );

    return enrollmentsWithProgress;
  }

  // Delete an enrollment
  async deleteEnrollment(enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
    });
    if (!enrollment) {
      const error = new Error('Enrollment not found');
      error.status = 404;
      throw error;
    }

    // Delete associated progress records
    await prisma.progress.deleteMany({
      where: { userId: enrollment.userId, session: { courseId: enrollment.courseId } },
    });

    await prisma.enrollment.delete({
      where: { id: parseInt(enrollmentId) },
    });

    return { message: 'Student unenrolled successfully' };
  }
}

module.exports = new ProgressService();