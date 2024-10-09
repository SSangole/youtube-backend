import { Router } from "express";
import { deleteVideo, getAllVideosByUserId, getVideoById, togglePublishStatusOfVideo, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/get-video/:id").get(verifyJWT, getVideoById);
router.route("/get-all-videos-by-userId/:id").get(verifyJWT, getAllVideosByUserId);
router.route("/update-video-details").post(verifyJWT, upload.single("thumbnail"), updateVideoDetails);
router.route("/toggle-publish-status-of-video/:id").post(verifyJWT, togglePublishStatusOfVideo);
router.route("/upload-video").post(verifyJWT, upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    }
  ]), uploadVideo);
router.route("/delete-video/:id").delete(verifyJWT, deleteVideo);

export default router;