const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const payload = { id: user._id };
    const accessToken = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};

const refreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

const userPayload = (user) => (
    {
        id: user._id,
        username: user.username,
        email: user.email,
    }
);


exports.register = async (req, res) => {

    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) return res.status(400).json({ message: 'all fiellds are required' });
        const existUser = await User.findOne({ email });
        if (existUser) return res.status(409).json({ message: 'user already exist' });

        const user = await User.create({
            username, email, password
        });

        const { accessToken, refreshToken } = generateTokens(user);
        refreshCookie(res, refreshToken);

        return res.status(201).json({
            message: 'user created successfuly',
            accessToken,
            user: userPayload(user)
        });

    } catch (error) {
        res.status(500).json({ error: error.message || 'internal server error' });
    }

};


exports.login = async (req, res) => {

    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ message: 'wrong email or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'wrong email or password' });

        const { refreshToken, accessToken } = generateTokens(user);
        refreshCookie(res, refreshToken);

        return res.status(200).json({
            message: 'user loged in successfuly',
            accessToken,
            user: userPayload(user)
        });

    } catch (error) {
        res.status(500).json({ error: error.message || 'internal server error' });
    }
};


exports.refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    try {
        if (!token) return res.status(401).json({ message: 'no refreshtoken provided' })

        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'user not found' })

        const newAccessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_TOKEN,
            { expiresIn: "15m" }
        );

        return res.status(200).json({ accessToken: newAccessToken, user: userPayload(user) });
    } catch (error) {
        return res.status(401).json({
            message: 'unauthorized'
        });
    }
};


exports.logout = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.status(200).json({ message: 'logout successful' });
    } catch (error) {
        return res.status(500).json({
            error: error.message || 'server error'
        });
    }
};