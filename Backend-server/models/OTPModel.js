const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailVerificationTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60,
    },
});

otpSchema.pre("save", async function sendVerificationEmail(next) {
    try {
        await mailSender(
            this.email,
            "Verify your Task Scheduling account",
            emailVerificationTemplate(this.otp)
        );
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("OTP", otpSchema);
