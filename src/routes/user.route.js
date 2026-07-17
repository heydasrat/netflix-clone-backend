import { Router } from "express";
import {
    register,
    verifyOTP,
    login,
    logout,
    refreshAccessToken,
    forgetPassword,
    verifyOTPToResetPassword,
    resetPassword,
    changeCurrentPassword,
    changeCurrentEmail,
    changeUserDetails,
    updateUserProfileImage
} from "../controllers/user.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

router.post("/forget-password", forgetPassword);
router.post("/verify-otp-to-reset-password", verifyOTPToResetPassword);
router.patch("/reset-password", resetPassword);

router.post("/refresh-access-token", refreshAccessToken);

router.post("/logout", verifyJWT, logout);
router.patch("/change-password", verifyJWT, changeCurrentPassword);
router.patch("/change-email", verifyJWT, changeCurrentEmail);
router.patch("/change-user-details", verifyJWT, changeUserDetails);
router.patch("/update-profile-image", verifyJWT, updateUserProfileImage);

export default router;