import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createComment, deleteComment, getAllCommentsByVideoId, replyToComment, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT); // secure all routes, this will go through verifyJWT before all the routes below it

router.route("/create-comment").post(createComment);
router.route("/reply-to-comment").post(replyToComment);
router.route("/get-comments-by-videoId/:id").get(getAllCommentsByVideoId);
router.route("/update-comment/:id").post(updateComment);
router.route("/delete-comment/:id").delete(deleteComment);

export default router;