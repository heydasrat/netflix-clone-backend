import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
            match: [
                /^[a-z0-9_]+$/,
                "Username can only contain lowercase letters, numbers, and underscores"
            ]
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [3, "Full name must be at least 3 characters"],
            maxlength: [50, "Full name cannot exceed 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            maxlength: [100, "Password cannot exceed 100 characters"]
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        profilePicture: {
            url: {
                type: String,
                default: null
            },
            public_id: {
                type: String,
                default: null
            }
        },
        resetToken: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return null
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, config.accessTokenSecret, { expiresIn: config.accessTokenExpiry })
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiry })
}
userSchema.methods.generateResetToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, config.resetTokenSecret, { expiresIn: config.resetTokenExpiry })
}

const User = mongoose.model("User", userSchema)


export default User