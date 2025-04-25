const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSession = async (courseId, sessionData) => {
  return prisma.session.create({
    data: {
      title: sessionData.title,
      youtubeUrl: sessionData.youtubeUrl,
      content: sessionData.content,
      order: sessionData.order || 0,
      courseId: courseId,
    },
  });
};

const getSession = async (courseId) => {
  return prisma.session.findMany({
    where: {
      courseId: courseId,
    },
    orderBy: {
      order: 'asc', // Optional: sort sessions by their order
    },
  });
};

const updateSession = async (sessionId, sessionData) => {
  return prisma.session.update({
    where: { id: sessionId },
    data: {
      title: sessionData.title,
      youtubeUrl: sessionData.youtubeUrl,
      content: sessionData.content,
      order: sessionData.order,
    },
  });
};

const deleteSession = async (sessionId) => {
  return prisma.session.delete({
    where: { id: sessionId },
  });
};

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
};