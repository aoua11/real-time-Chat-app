const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: true,
        trim: true,
        minlength: [5, 'username must be at least 5 characters'],
        maxlength: [30, 'username cannot exceed  30 characters'],
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [8, 'password must be at least 8 characters'],
        select: false
    }
},
    { timestamps: true }
);

userSchema.pre('validate', async function () {
    if (!this.password) return;
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    if (!regex.test(this.password)) return this.invalidate('password', 'Password must include uppercase, lowercase, and number and special character')
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (entredPassword) {
    return await bcrypt.compare(entredPassword, this.password);
}

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}

const User = mongoose.model('User', userSchema);
module.exports = User;