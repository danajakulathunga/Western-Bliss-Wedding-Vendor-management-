import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReviewsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Fetch reviews
                const reviewsResponse = await fetch('http://localhost:5000/api/reviews');
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);

                // Fetch statistics
                const statsResponse = await fetch('http://localhost:5000/api/reviews/stats/average');
                const statsData = await statsResponse.json();
                setStats(statsData);

                setLoading(false);
            } catch (err) {
                setError('Failed to load reviews');
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const StarRating = ({ rating }) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Section */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Customer Reviews
                    </h2>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="text-4xl font-bold text-pink-600">
                            {stats.averageRating.toFixed(1)}
                        </div>
                        <div className="text-left">
                            <StarRating rating={Math.round(stats.averageRating)} />
                            <p className="text-gray-600 mt-1">
                                Based on {stats.totalReviews} reviews
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {review.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                                    {review.eventType}
                                </div>
                            </div>

                            <div className="mb-4">
                                <StarRating rating={review.rating} />
                            </div>

                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {review.title}
                            </h4>

                            <p className="text-gray-600">
                                {review.review}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {reviews.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsSection; 