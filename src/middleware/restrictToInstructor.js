const jwt = require('jsonwebtoken');

const restrictToInstructor = (req,res,next) => {
  if(!req.user){
    console.log(req.user);
    
    return res.status(401).json({error: 'Authentication required'});
  }
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Access restricted to instructors' });
  }
  next();
}

module.exports = restrictToInstructor;