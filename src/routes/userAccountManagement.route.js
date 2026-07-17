import { Router } from "express";
import { changeCurrentPassword, changeCurrentEmail,updateUserProfileImage, changeUserDetails } from "../controllers/user.controller.js";
import verifyJWT from '../middleware/auth.middleware.js'
import upload from "../middleware/multer.middleware.js";


const router = Router()
router.route("/change-current-password").patch(verifyJWT, changeCurrentPassword)
router.route("/change-current-email").patch(verifyJWT, changeCurrentEmail)
router.route("/update-user-details").patch(verifyJWT, changeUserDetails)
router.route("/update-user-profile-image").patch(verifyJWT,upload.single("profileImage"),updateUserProfileImage)
export default router