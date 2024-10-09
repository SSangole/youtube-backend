import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getSubscribersOfChannel, subscribeToChannel, unsubscribeFromChannel } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/create-subscription").post(verifyJWT, subscribeToChannel);
router.route("/unsubscribe-channel").post(verifyJWT, unsubscribeFromChannel);
router.route("/get-all-subscribed-channels-by-userId/:userId").get(verifyJWT, getSubscribedChannels );
router.route("/get-all-subscribers-by-channelId/:channelId").get(verifyJWT, getSubscribersOfChannel );

export default router;
