import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

function CustomizePackage() {
    const navigate = useNavigate();
    const [customPackage, setCustomPackage] = useState({
        Hall: "",
        catering: "",
        music: "",
        decorations: "",
        Vehicle: "",
        price: 0
    });

    const [discountCode, setDiscountCode] = useState("");
    const [discountMessage, setDiscountMessage] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);

    // Predefined discount codes
    const discountCodes = {
        "SAVE2023": 5,
        "DREAM123": 10,
        "WEDDING15": 15
    };

    const validateDiscountCode = () => {
        // Reset previous discount and message
        setDiscountMessage("");
        setAppliedDiscount(0);

        // Check if cart is empty
        if (customPackage.price === 0) {
            setDiscountMessage("Please select items before applying a discount code");
            return;
        }

        const code = discountCode.trim().toUpperCase();

        // Validate code length
        if (!code) {
            setDiscountMessage("Please enter a discount code");
            return;
        }

        // Check if code exists
        const discount = discountCodes[code];
        if (discount) {
            setAppliedDiscount(discount);
            setDiscountMessage(`${discount}% discount applied successfully!`);
        } else {
            setDiscountMessage("Invalid discount code");
        }
    };

    const calculateFinalPrice = () => {
        const finalPrice = appliedDiscount > 0
            ? customPackage.price * (1 - appliedDiscount / 100)
            : customPackage.price;
        return Math.round(finalPrice);
    };

    const options = {
        Hall: [
            { label: "5-Star Hall-Avendra", price: 200000 },
            { label: "3-Star Hall-Araliya", price: 150000 },
            { label: "3-Star Hall-Hotel Grand", price: 100000 },
        ],
        catering: [
            { label: "Full Catering Service-Repa Catering", price: 120000 },
            { label: "Basic Catering-Anglis", price: 80000 },  // Fixed price from 800000
            { label: "Basic Catering-Rathna Catering", price: 100000 },  // Fixed price from 1000000
        ],
        music: [
            { label: "Live Band-News", price: 80000 },
            { label: "DJ & Sound System-BDJ Premium", price: 60000 },
            { label: "DJ & Sound System-BDJ Standard", price: 40000 },
        ],
        decorations: [
            { label: "Elegant Decorations-Nora Decos", price: 100000 },
            { label: "Normal Decorations-Lassana flora", price: 50000 },  // Fixed price from 500000
            { label: "Simple Decorations-new flora", price: 20000 },  // Fixed price from 200000
        ],
        Vehicle: [
            { label: "Luxury Vehicle-Benz", price: 100000 },
            { label: "Luxury Vehicle-Axio", price: 50000 },  // Fixed price from 500000
            { label: "Luxury Vehicle-Fit", price: 20000 },  // Fixed price from 200000
        ]
    };

    const handleSelection = (category, value) => {
        const selectedOption = options[category].find((opt) => opt.label === value);
        if (!selectedOption) return; // Guard clause for undefined selection

        setCustomPackage((prev) => {
            const previousOptionPrice = prev[category]
                ? (options[category].find((opt) => opt.label === prev[category])?.price || 0)
                : 0;

            return {
                ...prev,
                [category]: value,
                price: prev.price - previousOptionPrice + selectedOption.price
            };
        });
    };

    const handleBookPackage = async () => {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please login to book a package');
            navigate('/login');
            return;
        }

        // Check if any service is selected
        if (customPackage.price === 0) {
            alert('Please select at least one service to book');
            return;
        }

        try {
            const bookingData = {
                packageId: 'custom',
                wedding_type: 'Custom Package',
                price: calculateFinalPrice(),
                preview_image: 'custom-package.jpg',
                features: Object.entries(customPackage)
                    .filter(([key, value]) => key !== 'price' && value)
                    .map(([key, value]) => value),
                phoneNumber: user.phoneNumber || '',
                email: user.email
            };

            const response = await fetch('http://localhost:5000/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                alert('Package booked successfully!');
                navigate('/dashboard');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to book package');
            }
        } catch (error) {
            console.error('Error booking package:', error);
            alert('An error occurred while booking the package');
        }
    };

    return (
        <div className="w-screen h-screen bg-pink-50 flex flex-col justify-center items-center p-10 overflow-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl uppercase text-pink-500">Customize Package</h3>
                <h2 className="text-5xl uppercase font-extrabold text-pink-700">Build Your Dream Wedding</h2>
            </div>

            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-4xl border border-pink-200 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(options).map((category) => (
                        <div key={category} className="flex flex-col">
                            <label className="font-semibold text-pink-700 capitalize">{category}</label>
                            <select
                                className="border border-pink-300 p-3 rounded-lg shadow-sm text-pink-700 focus:ring focus:ring-pink-300"
                                onChange={(e) => handleSelection(category, e.target.value)}
                                value={customPackage[category]}
                            >
                                <option value="">Select {category}</option>
                                {options[category].map((option) => (
                                    <option key={option.label} value={option.label}>
                                        {option.label} (Rs.{option.price.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-pink-100 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-pink-600">Selected Features:</h3>
                    <ul className="list-disc list-inside text-pink-700">
                        {Object.keys(customPackage).map(
                            (category) =>
                                category !== "price" && customPackage[category] && (
                                    <li key={category} className="py-1">{customPackage[category]}</li>
                                )
                        )}
                    </ul>
                </div>

                {/* Discount Code Section */}
                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                        <input
                            type="text"
                            placeholder="Enter discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                            className="border border-pink-300 p-3 rounded-lg shadow-sm text-pink-700 focus:ring focus:ring-pink-300 flex-1"
                            maxLength={8}
                        />
                        <button
                            onClick={validateDiscountCode}
                            disabled={!discountCode.trim()}
                            className={`text-black  px-4 py-3 rounded-lg shadow-md text-sm font-bold transition-all ${
                                discountCode.trim()
                                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                                    : 'bg-pink-600 text-black-500 cursor-not-allowed'
                            }`}
                        >
                            Apply
                        </button>
                    </div>

                    {/* Discount message display */}
                    {discountMessage && (
                        <div
                            className={`text-sm ${
                                appliedDiscount > 0 ? 'text-green-600' : 'text-red-600'
                            } font-medium`}
                            role="alert"
                        >
                            {discountMessage}
                        </div>
                    )}
                </div>

                {/* Price Display */}
                <div className="mt-6 text-center">
                    {appliedDiscount > 0 && (
                        <div className="text-lg text-gray-500 line-through">
                            Original Price: Rs. {customPackage.price.toLocaleString()}
                        </div>
                    )}
                    <div className="text-2xl font-extrabold text-pink-700">
                        Final Price: Rs. {calculateFinalPrice().toLocaleString()}
                    </div>
                </div>

                <div className="sticky bottom-0 left-0 w-full bg-white py-4 flex justify-center border-t border-pink-200 mt-6">
                    <button 
                        onClick={handleBookPackage}
                        className="bg-pink-600 text-white px-8 py-3 rounded-lg shadow-md text-lg font-bold hover:bg-pink-700 transition-all"
                    >
                        Book Custom Package
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomizePackage;
