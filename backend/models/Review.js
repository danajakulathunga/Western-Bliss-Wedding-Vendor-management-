import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Check if the model already exists before creating it
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review; 