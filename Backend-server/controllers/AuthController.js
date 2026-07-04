const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTPModel");
const User = require("../models/UserModel");

const normalizeEmail = (email) => email?.trim().toLowerCase();

const createToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
    };

    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
    });
};

exports.sendOTP = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        let otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        while (await OTP.findOne({ otp })) {
            otp = otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });
        }

        await OTP.create({ email, otp });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to send OTP",
            error: error.message,
        });
    }
};

exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName = "",
            password,
            confirmPassword,
            accountType = "Operator",
            roleSignupSecret,
            otp,
        } = req.body;
        const email = normalizeEmail(req.body.email);

        if (!firstName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "firstName, email, password, confirmPassword, and otp are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        const requestedRole = ["Admin", "Manager", "Operator"].includes(accountType)
            ? accountType
            : "Operator";

        if (
            ["Admin", "Manager"].includes(requestedRole) &&
            roleSignupSecret !== process.env.ROLE_SIGNUP_SECRET
        ) {
            return res.status(403).json({
                success: false,
                message: "A valid role signup secret is required for privileged accounts",
            });
        }

        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!recentOtp || recentOtp.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const image = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            `${firstName} ${lastName || ""}`.trim()
        )}`;

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType: requestedRole,
            image,
            isEmailVerified: true,
        });

        await OTP.deleteMany({ email });

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error in registering user",
            error: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User does not exist. Please sign up first.",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
            });
        }

        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: "JWT_SECRET_KEY is not configured",
            });
        }

        const token = createToken(user);
        user.token = token;
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        const cookieOptions = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        };

        return res.cookie("token", token, cookieOptions).status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: userResponse,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in logging in user",
            error: error.message,
        });
    }
};

exports.getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.userDetails,
    });
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "oldPassword and newPassword are required",
            });
        }

        if (confirmNewPassword && newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match",
            });
        }

        const user = await User.findById(req.user.id);
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
};
