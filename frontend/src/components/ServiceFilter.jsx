import React, { useState } from "react";

const ServiceFilter = ({ services, setFilteredServices }) => {
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = [
        { id: "all", name: "All Services" },
        { id: "Wedding hall", name: "Wedding Halls" },
        { id: "Wedding dresses", name: "Wedding Dresses" },
        { id: "Vehicles", name: "Vehicles" },
        { id: "Decorations", name: "Decorations" },
        { id: "Entertainment", name: "Entertainment" },
        { id: "Catering", name: "Catering" }
    ];

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);

        if (categoryId === "all") {
            setFilteredServices(services);
        } else {
            const filtered = services.filter(service => service.category === categoryId);
            setFilteredServices(filtered);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mb-8">
            {/* Menu bar with enhanced wedding-themed gradient styling */}
            <div className="bg-gradient-to-r from-rose-100 via-pink-200 to-purple-100 rounded-2xl shadow-md overflow-hidden border border-pink-100">
                <div className="flex items-center justify-center py-2 px-4 overflow-x-auto scrollbar-hide">
                    {categories.map((category) => {
                        const isActive = activeCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`group relative px-5 py-2 mx-1.5 rounded-xl transition-all duration-300 focus:outline-none flex-shrink-0 ${
                                    isActive
                                        ? "bg-gradient-to-r from-rose-400 via-pink-400 to-rose-600 text-white shadow-md"
                                        : "hover:bg-white hover:bg-opacity-70"
                                }`}
                            >
                                <span className={`font-medium ${isActive ? "text-white" : "text-pink-800"}`}>
                                    {category.name}
                                </span>

                                {/* Elegant active indicator */}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-white rounded-full"></span>
                                )}

                                {/* Refined hover effect */}
                                {!isActive && (
                                    <span className="absolute inset-0 rounded-xl bg-pink-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Enhanced decorative divider with gradient matching menubar */}
            <div className="w-full flex justify-center mt-4">
                <div className="w-48 h-0.5 bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300"></div>
            </div>

            {/* Decorative wedding elements */}
            <div className="absolute -z-10 left-2 top-1/2 transform -translate-y-1/2 opacity-5">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                </svg>
            </div>
            <div className="absolute -z-10 right-2 top-1/2 transform -translate-y-1/2 opacity-5">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
};

export default ServiceFilter;