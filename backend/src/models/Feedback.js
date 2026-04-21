import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: false, unique: true, sparse: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        message: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        isManual: { type: Boolean, default: false },
        name: { type: String }
    },
    { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
