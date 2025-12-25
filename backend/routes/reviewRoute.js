import express from "express";
import {
    createReview,
    getAllReviews,
    getReviewsByEventType,
    getAverageRating
} from "../controllers/reviewController.js";

const route = express.Router();

// Create a new review
route.post("/reviews", createReview);

// Get all reviews
route.get("/reviews", getAllReviews);

// Get reviews by event type
route.get("/reviews/:eventType", getReviewsByEventType);

// Get average rating
route.get("/reviews/stats/average", getAverageRating);

export default route; 