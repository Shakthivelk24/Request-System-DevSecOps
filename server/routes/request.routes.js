import express from "express";

import { getCurrentUser, getReceivedRequests, getSentRequests, sendRequest, updateRequestStatus } from "../controllers/request.controller.js";
import isAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/current", isAuth, getCurrentUser); // Get current authenticated user details 
// Send a request for demo
router.post("/send", isAuth, sendRequest);

// Get all requests received by logged-in user
router.get("/received", isAuth, getReceivedRequests);

// Get all requests sent by logged-in user
router.get("/sent", isAuth, getSentRequests);

// Update request status (accept/reject/cancel)
router.put("/status/:requestId", isAuth, updateRequestStatus);

export default router;
