import Review from "../models/reviewModel.js";

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { name, email, rating, title, review, eventType } = req.body;

        // Validate required fields
        if (!name || !email || !rating || !title || !review || !eventType) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Create new review
        const newReview = new Review({
            name,
            email,
            rating,
            title,
            review,
            eventType
        });

        await newReview.save();

        res.status(201).json({
            message: "Review submitted successfully",
            review: newReview
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Error submitting review" });
    }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Error fetching reviews" });
    }
};

// Get reviews by event type
export const getReviewsByEventType = async (req, res) => {
    try {
        const { eventType } = req.params;
        const reviews = await Review.find({ eventType }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews by event type:", error);
        res.status(500).json({ message: "Error fetching reviews" });
    }
};

// Get average rating
export const getAverageRating = async (req, res) => {
    try {
        const result = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            averageRating: result[0]?.averageRating || 0,
            totalReviews: result[0]?.totalReviews || 0
        });
    } catch (error) {
        console.error("Error calculating average rating:", error);
        res.status(500).json({ message: "Error calculating average rating" });
    }
}; 