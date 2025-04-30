const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSession = async (courseId, sessionData) => {
  return prisma.session.create({
    data: {
      title: sessionData.title,
      youtubeUrl: sessionData.youtubeUrl,
      content: sessionData.content,
      courseId: parseInt(courseId),
    },
  });
};

const getSession = async (courseId) => {
  return prisma.session.findMany({
    where: {
      courseId: parseInt(courseId),
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

const getSessionbyId = async (sessionId) => {
  return prisma.session.findUnique({
    where: { id: parseInt(sessionId) },
    select: {
      id: true,
      title: true,
      youtubeUrl: true,
      content: true,
      courseId: true,
    },
  });
};

const updateSession = async (sessionId, sessionData) => {
  return prisma.session.update({
    where: { id: parseInt(sessionId) },
    data: {
      title: sessionData.title,
      youtubeUrl: sessionData.youtubeUrl,
      content: sessionData.content,
    },
  });
};

const deleteSession = async (sessionId) => {
  return prisma.session.delete({
    where: { id: parseInt(sessionId) },
  });
};

module.exports = {
  createSession,
  getSession,
  getSessionbyId,
  updateSession,
  deleteSession,
};