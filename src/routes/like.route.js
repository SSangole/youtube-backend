import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleLikeStatusOfComment, toggleLikeStatusOfTweet, toggleLikeStatusOfVideo, getAllLikedVideosByUser, getAllLikedTweetsByUser } from "../controllers/like.controller.js";

const router = Router();

router.route("/get-liked-videos-by-userId/:userId").get(verifyJWT, getAllLikedVideosByUser);
router.route("/get-liked-tweets-by-userId/:userId").get(verifyJWT, getAllLikedTweetsByUser);
router.route("/toggle-comment-like/:commentId").post(verifyJWT, toggleLikeStatusOfComment);
router.route("/toggle-video-like/:videoId").post(verifyJWT, toggleLikeStatusOfVideo);
router.route("/toggle-tweet-like/:tweetId").post(verifyJWT, toggleLikeStatusOfTweet);

export default router;