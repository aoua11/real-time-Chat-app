const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'not authorized' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'user not found' });
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: 'token not valid', error: error.message });
    }
};