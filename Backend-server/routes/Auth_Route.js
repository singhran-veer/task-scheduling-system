const express = require("express");
const router = express.Router();

const {
    sendOTP,
    signUp,
    login,
    getMe,
    changePassword,
} = require("../controllers/AuthController");
const { auth } = require("../middlewares/auth");

router.post("/sendotp", sendOTP);
router.post("/signup", signUp);
router.post("/login", login);
router.get("/me", auth, getMe);
router.post("/changepassword", auth, changePassword);

module.exports = router;
