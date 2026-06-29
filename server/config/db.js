const mongoose = require('mongoose');


exports.connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI);
        console.log(`mongoDB connected ${conn.connection.host}`);
    } catch (error) {
        console.log({ message: error.message });
        process.exit(1);
    }
}

