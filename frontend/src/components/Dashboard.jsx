import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import ReviewOverlay from "./InquiryOverlay";
import ReviewsSection from "./ReviewsSection";
import ScheduleOverlay from "./ScheduleOverlay";
import { FaCalendarAlt } from 'react-icons/fa';

const Dashboard = () => {
    const [showReview, setShowReview] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
                {/* Sidebar on the left */}
                <div className="w-64 fixed left-0 top-0 h-full">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 ml-64 p-6">
                    <Outlet />
                </div>
            </div>

            {/* Reviews Section */}
            <div className="ml-64">
                <ReviewsSection />
            </div>

            {/* Floating Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col space-y-4">
                {/* Schedule Button */}
                <button
                    onClick={() => setShowSchedule(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2 z-50"
                >
                    <FaCalendarAlt className="w-5 h-5" />
                    <span>Schedule</span>
                </button>

                {/* Review Button */}
                <button
                    onClick={() => setShowReview(true)}
                    className="bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-700 transition-colors duration-200 flex items-center space-x-2 z-50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Write a Review</span>
                </button>
            </div>

            {/* Review Overlay */}
            <ReviewOverlay isOpen={showReview} onClose={() => setShowReview(false)} />

            {/* Schedule Overlay */}
            <ScheduleOverlay isOpen={showSchedule} onClose={() => setShowSchedule(false)} />
        </div>
    );
};

export default Dashboard;
