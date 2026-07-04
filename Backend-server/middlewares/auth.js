const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const getTokenFromRequest = (req) => {
    const authHeader = req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.replace("Bearer ", "");
    }

    return req.cookies?.token || req.body?.token;
};

exports.auth = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: "JWT_SECRET_KEY is not configured",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        req.user = {
            ...decoded,
            accountType: user.accountType,
            isEmailVerified: user.isEmailVerified,
        };
        req.userDetails = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

exports.isVerifiedUser = (req, res, next) => {
    if (!req.user?.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: "Please verify your email before accessing this resource",
        });
    }

    next();
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.accountType)) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource",
        });
    }

    next();
};

exports.isAdmin = exports.authorizeRoles("Admin");
exports.isManager = exports.authorizeRoles("Admin", "Manager");
exports.isOperator = exports.authorizeRoles("Admin", "Manager", "Operator");
