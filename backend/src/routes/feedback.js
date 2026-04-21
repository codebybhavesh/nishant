import express from "express";
import { Feedback } from "../models/Feedback.js";
import { Booking } from "../models/Booking.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const feedbackRouter = express.Router();

// POST /api/feedback - Submit feedback (User)
feedbackRouter.post(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const { bookingId, rating, message } = req.body ?? {};

        if (!bookingId || !rating || !message) {
            return res.status(400).json({ error: "Booking ID, rating, and message are required." });
        }

        const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found or access denied." });
        }

        if (booking.status !== "approved") {
            return res.status(400).json({ error: "Feedback can only be given for approved bookings." });
        }

        if (booking.feedbackGiven) {
            return res.status(400).json({ error: "Feedback already submitted for this booking." });
        }

        const feedback = await Feedback.create({
            userId: req.user._id,
            bookingId,
            rating: Number(rating),
            message: String(message),
            status: "pending" // New feedback is pending by default
        });

        booking.feedbackGiven = true;
        await booking.save();

        res.status(201).json({ message: "Feedback submitted. It will be visible after admin approval.", feedback });
    })
);

// GET /api/feedback/latest - Public route for testimonials
feedbackRouter.get(
    "/latest",
    asyncHandler(async (req, res) => {
        const feedbacks = await Feedback.find({ status: "approved" })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("userId", "name")
            .lean();

        res.json(feedbacks);
    })
);

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────

// GET /api/feedback/admin - Get all feedback (Admin)
// NOTE: I'm using /admin as a sub-path within feedbackRouter
feedbackRouter.get(
    "/admin/all",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name")
            .lean();
        res.json(feedbacks);
    })
);

// PATCH /api/feedback/admin/:id - Approve/Reject (Admin)
feedbackRouter.patch(
    "/admin/:id",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const { status } = req.body ?? {};
        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ error: "Invalid status." });
        }

        const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!feedback) return res.status(404).json({ error: "Feedback not found." });

        res.json({ message: `Feedback status updated to ${status}.`, feedback });
    })
);

// POST /api/feedback/admin/manual - Add manual feedback (Admin)
feedbackRouter.post(
    "/admin/manual",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const { name, rating, message } = req.body ?? {};
        if (!name || !rating || !message) {
            return res.status(400).json({ error: "Name, rating, and message are required." });
        }

        const feedback = await Feedback.create({
            name,
            rating: Number(rating),
            message: String(message),
            isManual: true,
            status: "approved" // Admin entries are approved by default
        });

        res.status(201).json({ message: "Manual testimonial added successfully.", feedback });
    })
);
