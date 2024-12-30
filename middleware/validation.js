
const validateRegistration = (req, res, next) => {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
  
    if (!['mentor', 'mentee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
  
    next();
  };
  
  module.exports = { validateRegistration };