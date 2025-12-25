import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create a New Booking
router.post("/book", async (req, res) => {
    try {
        const { packageId, wedding_type, price, preview_image, features, phoneNumber, email, status, bookedAt } = req.body;

        const booking = new Booking({
            packageId,
            wedding_type,
            price,
            preview_image,
            features,
            phoneNumber,
            email,
            status,      // <-- Add this
            bookedAt     // <-- And this
        });

        await booking.save();
        res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking", error: error.message });
    }
});


// Get All Bookings (With Package Info)
router.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("packageId", "packageName price"); // Only populate package info

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).json({ success: false, message: "Error retrieving bookings", error });
    }
});

// Get a Single Booking by ID
router.get("/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("packageId", "packageName price"); // Only populate package info

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error("Error retrieving booking:", error);
        res.status(500).json({ success: false, message: "Error retrieving booking", error });
    }
});

// Delete a Booking by ID
router.delete("/bookings/:id", async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

        if (!deletedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        res.status(200).json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ success: false, message: "Error deleting booking", error });
    }
});

// Update a Booking by ID
router.put("/bookings/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("packageId", "packageName price");

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        res.status(200).json({ success: true, data: updatedBooking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ success: false, message: "Error updating booking", error });
    }
});

export default router;
