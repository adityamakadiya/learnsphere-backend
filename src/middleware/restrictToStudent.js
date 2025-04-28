const restrictToStudent = (req, res, next) => {
  if (req.user.role !== 'Student') {
    return res.status(403).json({ error: 'Access restricted to students' });
  }
  next();
};

module.exports = restrictToStudent;