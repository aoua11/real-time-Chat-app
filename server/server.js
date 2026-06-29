const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieparser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const path = require('path');
const { connectDB } = require('./config/db');

const authrouter = require('./routes/auth');
const userrouter = require('./routes/user');

dotenv.config();
const app = express();


const PORT = process.env.PORT || 8000;
const isProd = process.env.NODE_ENV === 'production';
const ratelimit = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10
});


app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




app.use('/api/auth', authrouter);
app.use('/api' , userrouter);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
})



const start = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();

