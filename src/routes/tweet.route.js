import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweetById, getAllTweets, getTweetById, updateTweetById } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet);
router.route("/update-tweet-by-tweetId").post(verifyJWT, updateTweetById);
router.route("/get-all-tweets-by-userId/:userId").get(verifyJWT, getAllTweets);
router.route("/get-tweet-by-tweetId/:tweetId").get(verifyJWT, getTweetById);
router.route("/delete-tweet-by-tweetId/:tweetId").delete(verifyJWT, deleteTweetById);

export default router;