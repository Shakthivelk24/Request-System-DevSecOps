import Request from "../models/request.model.js";
import User from "../models/user.model.js";

import {
  recordRequestCreated,
  updateRequestMetrics,
} from "../metrics/requestMetrics.js";

import { recordDatabaseQuery } from "../metrics/dbMetrics.js";

// ============================================================
// Get Current User Controller
// ============================================================

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    recordDatabaseQuery();

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: "Server error",
    });

  }
};

// ============================================================
// Send Request
// ============================================================

export const sendRequest = async (req, res) => {
  try {
    const { receiverEmail, message } = req.body;
    const senderId = req.userId;

    // Database Query
    recordDatabaseQuery();

    const receiver = await User.findOne({
      email: receiverEmail,
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver not found",
      });
    }

    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot send a request to yourself",
      });
    }

    const newRequest = new Request({
      sender: senderId,
      receiver: receiver._id,
      message,
    });

    // Database Query
    recordDatabaseQuery();

    await newRequest.save();

    // Request Metric
    recordRequestCreated();

    // Update Dashboard Metrics
    recordDatabaseQuery();
    const pending = await Request.countDocuments({
      status: "pending",
    });

    recordDatabaseQuery();
    const accepted = await Request.countDocuments({
      status: "accepted",
    });

    recordDatabaseQuery();
    const rejected = await Request.countDocuments({
      status: "rejected",
    });

    updateRequestMetrics({
      pending,
      approved: accepted,
      rejected,
    });

    res.status(201).json({
      success: true,
      request: newRequest,
    });

  } catch (err) {

    console.error("Send request error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }
};

// ============================================================
// Get Received Requests
// ============================================================

export const getReceivedRequests = async (req, res) => {
  try {

    recordDatabaseQuery();

    const requests = await Request.find({
      receiver: req.userId,
    })
      .populate("sender", "username email")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
};

// ============================================================
// Get Sent Requests
// ============================================================

export const getSentRequests = async (req, res) => {
  try {

    recordDatabaseQuery();

    const requests = await Request.find({
      sender: req.userId,
    })
      .populate("receiver", "username email")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
};

// ============================================================
// Update Request Status
// ============================================================

export const updateRequestStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const validStatus = [
      "pending",
      "accepted",
      "rejected",
      "cancelled",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: "Invalid status value",
      });
    }

    // Database Query
    recordDatabaseQuery();

    const updated = await Request.findOneAndUpdate(
      {
        _id: req.params.requestId,
        $or: [
          { receiver: req.userId },
          { sender: req.userId },
        ],
      },
      {
        status,
      },
      {
        new: true,
      }
    ).populate("sender receiver", "username email");

    if (!updated) {
      return res.status(404).json({
        error: "Request not found or unauthorized",
      });
    }

    // Refresh Metrics
    recordDatabaseQuery();
    const pending = await Request.countDocuments({
      status: "pending",
    });

    recordDatabaseQuery();
    const accepted = await Request.countDocuments({
      status: "accepted",
    });

    recordDatabaseQuery();
    const rejected = await Request.countDocuments({
      status: "rejected",
    });

    updateRequestMetrics({
      pending,
      approved: accepted,
      rejected,
    });

    res.json({
      message: "Status updated successfully",
      request: updated,
    });

  } catch (err) {

    console.error("Update request status error:", err.message);

    res.status(500).json({
      error: err.message,
    });

  }
};