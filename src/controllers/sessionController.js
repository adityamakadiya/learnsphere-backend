const sessionService = require('../services/sessionService');

const createSession = async (req, res) => {
  try {
    const session = await sessionService.createSession(req.courseId, req.body);
    res.status(201).json({ data: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSession = async (req, res) => {
  try {
    // console.log(req.params.id);
    
    const courseId = parseInt(req.params.id); // Make sure this exists and is parsed
    // console.log(courseId);
    
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid courseId' });
    }

    const sessions = await sessionService.getSession(courseId);
    res.status(200).json({ data: sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await sessionService.updateSession(parseInt(req.params.id), req.body);
    res.status(200).json({ data: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    await sessionService.deleteSession(parseInt(req.params.id));
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
};