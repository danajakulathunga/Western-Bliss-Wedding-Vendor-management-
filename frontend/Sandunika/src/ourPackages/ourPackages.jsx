import { useState } from "react";
import { Link } from "react-router-dom";

const PackagesApp = () => {
    const [categories] = useState([
        {
            id: 1,
            wedding_type: "Luxury",
            price: 3000000,
            preview_image: "/superlux.jpg",
            features: ["5-Star Hall-Avendra","Elegant Decorations-Nora Decos", "Full Catering Service-Repa Catering", "Live Band-News", "Luxury Vehicle-Benz"],
        },
        {
            id: 2,
            wedding_type: "Classic",
            price: 1500000,
            preview_image: "/classic.jpg",
            features: ["3-Star Hall-Araliya","Normal Decorations-Lassana flora","Basic Catering-Anglis","DJ & Sound System-BDJ Premium", "Luxury Vehicle-Axio"],
        },
        {
            id: 3,
            wedding_type: "Budget-Friendly",
            price: 1000000,
            preview_image: "/budget.jpg",
            features: ["3-Star Hall-Hotel Grand", "Simple Decorations-new flora", "Basic Catering-Rathna Catering", "DJ & Sound System-BDJ Standard","Luxury Vehicle-Fit"],
        },
    ]);

    // Function to handle booking with Fetch API
    const handleBookNow = async (category) => {
        try {
            const response = await fetch("http://localhost:5000/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(category),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Booking successful!");
                console.log("Booking Response:", data);
            } else {
                const errorData = await response.json();
                console.error("Error:", errorData.message);
                alert("Failed to book the package.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error. Please try again.");
        }
    };

    return (
        <div className="w-screen bg-gradient-to-b from-pink-100 to-pink-200 flex flex-col items-center py-10">
            <div className="text-center mb-8">
                <h3 className="text-2xl uppercase text-pink-600 font-semibold">Our Packages</h3>
                <h2 className="text-4xl md:text-5xl uppercase font-extrabold text-pink-800">
                    Select Your Dream Wedding Package
                </h2>
            </div>

            {/* Package List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:shadow-2xl transition-transform transform hover:scale-105 border border-pink-300"
                    >
                        <img
                            src={category.preview_image}
                            alt="Package Preview"
                            className="w-full h-60 object-cover rounded-xl mb-4"
                        />
                        <h3 className="text-2xl font-bold text-pink-700 mb-2">{category.wedding_type} Package</h3>
                        <p className="text-lg font-semibold text-pink-500">Rs. {category.price.toLocaleString()}</p>
                        <ul className="list-disc list-inside text-gray-700 mt-3">
                            {category.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                        <div className="mt-6 flex gap-3 w-full">
                            <button
                                onClick={() => handleBookNow(category)}
                                className="w-1/2 bg-gray-200 text-black text-center font-bold py-3 rounded-lg shadow-md hover:bg-gray-300 transition-all"
                            >
                                Book Now
                            </button>
                            <Link
                                to={`/package/${category.id}`}
                                className="w-1/2 bg-gray-200 text-black text-center font-bold py-3 rounded-lg shadow-md hover:bg-gray-300 transition-all"
                            >
                                More Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customize Package Button */}
            <div className="mt-12">
                <Link
                    to="/cus"
                    className="bg-white text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:bg-gray-200 transition-all"
                >
                    Customize Your Own Package
                </Link>
            </div>
        </div>
    );
};

export default PackagesApp;
