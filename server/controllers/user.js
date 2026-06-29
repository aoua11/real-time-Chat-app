const User = require('../models/User');


exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'user not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || 'internal server error' });
  }
};