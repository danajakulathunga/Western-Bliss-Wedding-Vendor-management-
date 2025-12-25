import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import AddService from './components/AddService.jsx';
import ServiceList from './components/ServiceList.jsx';
import SignIn from './components/auth/SignIn.jsx';
import SignUp from './components/auth/SignUp.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ManageReviews from './components/reviews/ManageReviews';
import ScheduleList from './components/schedule/ScheduleList';

import CustomizePackage from "./customizePackage.jsx";
import AdminPackages from "./adminPack/AdminPackage.jsx";// Your global styles
import AddNewPackage from "./adminPack/AddNew.jsx";
import OurPackages from "./ourPackages/ourPackages.jsx";
import AddUser from "../schedule/src/adduser/AddUser.jsx";
import User from "../schedule/src/getuser/User.jsx";
import Update from "../schedule/src/updateuser/Update.jsx";
;

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && typeof parsedUser === 'object') {
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } else {
                    // Invalid user data, clear it
                    localStorage.removeItem('user');
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            // Clear invalid data
            localStorage.removeItem('user');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="app h-screen w-screen">
                {isAuthenticated && (
                    <nav className="bg-gradient-to-r from-pink-500 to-rose-500 p-4">
                        <div className="container mx-auto flex justify-between items-center">
                            <Link to="/dashboard" className="text-white text-xl font-bold">
                                Western Bliss Wedding
                            </Link>
                            <div className="flex items-center space-x-4">
                                <span className="text-white">Welcome, {user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-pink-500 px-4 py-2 rounded-lg hover:bg-pink-100 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>
                )}

                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/register" element={<SignUp />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />}>
                            <Route
                                index
                                element={
                                    <div className="flex justify-center items-center h-full w-full mx-auto py-2">
                                        <div
                                            className="text-center bg-pink-100 bg-opacity-90 shadow-lg rounded-xl w-full border border-pink-200"
                                            style={{
                                                maxWidth: "calc(72rem + 6cm)"
                                            }}
                                        >
                                            {/* Decorative top element */}
                                            <div className="flex items-center justify-center mt-4">
                                                <div className="h-px w-32 bg-pink-300"></div>
                                                <div className="mx-3 text-pink-400 text-xl">❤</div>
                                                <div className="h-px w-32 bg-pink-300"></div>
                                            </div>

                                            {/* Main heading with elegant typography - decreased size */}
                                            <h1 className="text-3xl font-serif text-rose-800 mt-2 mb-1 leading-tight">
                                                Welcome to
                                                <span className="text-4xl font-medium italic block my-1">Western Bliss</span>
                                                Wedding Vendor Management
                                            </h1>

                                            {/* Divider with floral motif */}
                                            <div className="flex items-center justify-center my-2">
                                                <div className="h-px w-24 bg-pink-200"></div>
                                                <div className="mx-2 text-pink-400 text-base">✿ ✿ ✿</div>
                                                <div className="h-px w-24 bg-pink-200"></div>
                                            </div>

                                            {/* Welcome message - decreased size */}
                                            <p
                                                className="text-base text-gray-700 leading-relaxed mx-auto mb-4 px-8"
                                                style={{ maxWidth: "calc(56rem + 6cm)" }}
                                            >
                                                Transform your wedding planning experience with our elegant vendor management platform.
                                                Create, organize, and manage all your wedding services in one beautiful space.
                                            </p>

                                            {/* Image Carousel - INCREASED height */}
                                            <div className="mx-auto px-8 mb-4" style={{ maxWidth: "calc(64rem + 6cm)" }}>
                                                <ImageCarousel />
                                            </div>

                                            {/* Footer decoration */}
                                            <div className="flex items-center justify-center my-2 mb-4">
                                                <div className="h-px w-24 bg-pink-200"></div>
                                                <div className="mx-3 text-pink-400 font-serif italic text-xs">Making wedding dreams come true</div>
                                                <div className="h-px w-24 bg-pink-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />


                        </Route>
                    </Route>
                    <Route path="/add-service" element={<AddService />} />
                    <Route path="/services" element={<ServiceList />} />
                    <Route path="/packages" element={<OurPackages/>}></Route>
                    <Route path="/cus" element={<CustomizePackage/>}></Route>
                    <Route path="/admin" element={<AdminPackages/>}></Route>
                    <Route path="/add" element={<AddNewPackage/>}></Route>
                    <Route
                        path="/admin-dashboard"
                        element={

                                <AdminDashboard />

                        }
                    />
                    <Route path="/adduser" element={<AddUser/>}></Route>
                    <Route path="/getuser" element={<User/>}></Route>
                    <Route path="/updateuser/:id" element={<Update/>}></Route>
                    <Route path="/manage-reviews" element={<ManageReviews />} />
                    <Route path="/schedule" element={<ScheduleList />} />
                </Routes>
            </div>
        </Router>
    );
}

// Image Carousel Component with INCREASED height
function ImageCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Image placeholder URLs - in a real application, these would be your actual wedding images
    const images = [
        {
            src: "../public/WH3.jpg",
            alt: "Wedding venue decoration",
            caption: "Elegant Venue Decorations"
        },
        {
            src: "../public/WD5.jpg",
            alt: "Wedding flower arrangement",
            caption: "Beautiful Decorations"
        },
        {
            src: "../public/WC2.jpg",
            alt: "Wedding catering display",
            caption: "Exquisite Catering Options"
        },
        {
            src: "../public/WV3.jpg",
            alt: "Wedding Vehicle",
            caption: "Cruise into romance on your big day"
        },
        {
            src: "../public/WE3.jpg",
            alt: "Wedding entertainment",
            caption: "Memorable Entertainment"
        }
    ];

    // Auto-advance the slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    // Navigate to previous slide
    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    // Navigate to next slide
    const goToNext = () => {
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
    };

    // Go to a specific slide
    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="relative w-full p-2 rounded-xl" style={{
            background: "linear-gradient(45deg, #c81e51, #e63973, #f77da3, #e63973)",
            backgroundSize: "300% 300%",
            animation: "gradientBorder 6s ease infinite",
        }}>

        {/* Actual carousel container with white background */}
            <div className="relative w-full h-140 bg-white rounded-lg shadow-md overflow-hidden">
                {/* Main image container with smooth transition - INCREASED height */}
                <div className="w-full h-130 relative">
                    <img
                        src={images[currentIndex].src}
                        alt={images[currentIndex].alt}
                        className="w-full h-full object-cover transition-opacity duration-500"
                    />

                    {/* Caption overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-pink-600 bg-opacity-40 text-white p-2 text-center">
                        <p className="text-base font-medium">{images[currentIndex].caption}</p>
                    </div>
                </div>

                {/* Previous and Next buttons - adjusted position for taller carousel */}
                <button
                    onClick={goToPrevious}
                    className="absolute top-1/3 left-2 text-white bg-pink-500 bg-opacity-50 hover:bg-opacity-60 rounded-full p-2 transition-all"
                    aria-label="Previous image"
                >
                    ❮
                </button>
                <button
                    onClick={goToNext}
                    className="absolute top-1/3 right-2 text-white bg-pink-500 bg-opacity-50 hover:bg-opacity-60 rounded-full p-2 transition-all"
                    aria-label="Next image"
                >
                    ❯
                </button>

                {/* Indicator dots */}
                <div className="flex justify-center items-center p-1">
                    {images.map((_, slideIndex) => (
                        <div
                            key={slideIndex}
                            onClick={() => goToSlide(slideIndex)}
                            className={`mx-1 cursor-pointer text-xl ${
                                currentIndex === slideIndex ? "text-pink-500" : "text-pink-200"
                            }`}
                        >
                            •
                        </div>
                    ))}
                </div>
            </div>

            {/* Add keyframes animation to App.css */}
            <style jsx>{`
                @keyframes gradientBorder {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}

export default App;