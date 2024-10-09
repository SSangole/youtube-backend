import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/get-user-playlists/:userId").get(verifyJWT, getUserPlaylists);
router.route("/get-playlist-by-id/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/update-playlist").post(verifyJWT, updatePlaylist);
router.route("/add-video-to-playlist").post(verifyJWT, addVideoToPlaylist);
router.route("/remove-video-from-playlist").delete(verifyJWT, removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;