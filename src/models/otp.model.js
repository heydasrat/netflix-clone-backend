import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes
    },
});

otpSchema.pre("save", async function () {
    if (!this.isModified("otp")) return;

    this.otp = await bcrypt.hash(this.otp, 10);
});

otpSchema.methods.compareOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otp);
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;