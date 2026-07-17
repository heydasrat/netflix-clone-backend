import { Router } from "express";
import { publishVideo,updateVideo,deleteVieoByid,getVideoById,getAllVideos, togglePublish } from "../controllers/video.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router()

router.route("/publish-video").post(verifyJWT, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishVideo)

router.route("/update-video/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/delete-video/:videoId").delete(verifyJWT,deleteVieoByid)
router.route("/toggle-public/:videoId").patch(verifyJWT,togglePublish)
router.route("/get-all-videos").get(verifyJWT,getAllVideos)
router.route("/get-video/:videoId").get(verifyJWT,getVideoById)

export default router