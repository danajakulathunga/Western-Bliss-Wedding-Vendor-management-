import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const PackagesApp = () => {
    // Hardcoded packages
    const [hardcodedPackages] = useState([
        {
            id: 1,
            wedding_type: "Luxury",
            price: 3000000,
            preview_image: "https://th.bing.com/th/id/OIP.fNtFnt_KRPNUg6jeUi8wngHaEK?w=327&h=183&c=7&r=0&o=5&dpr=1.3&pid=1.7",
            features: ["5-Star Hall-Avendra","Elegant Decorations-Nora Decos", "Full Catering Service-Repa Catering", "Live Band-News", "Luxury Vehicle-Benz"],
            description: "Experience the epitome of luxury with our premium wedding package. Perfect for couples who want nothing but the best on their special day.",
            additional_details: {
                venue: "Avendra 5-Star Hotel",
                capacity: "Up to 500 guests",
                duration: "Full day event",
                includes: ["Premium decorations", "Professional photography", "Videography", "Wedding cake", "Bridal suite"]
            }
        },
        {
            id: 2,
            wedding_type: "Classic",
            price: 1500000,
            preview_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_3DnmPBEXtxbf9gU8DVdI9bN56FkUocvIqw&s",
            features: ["3-Star Hall-Araliya","Normal Decorations-Lassana flora","Basic Catering-Anglis","DJ & Sound System-BDJ Premium", "Luxury Vehicle-Axio"],
            description: "A timeless classic package that combines elegance with affordability. Perfect for couples who want a beautiful wedding without breaking the bank.",
            additional_details: {
                venue: "Araliya 3-Star Hotel",
                capacity: "Up to 300 guests",
                duration: "Full day event",
                includes: ["Classic decorations", "Professional photography", "Wedding cake", "Bridal suite"]
            }
        },
        {
            id: 3,
            wedding_type: "Budget-Friendly",
            price: 1000000,
            preview_image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/235196806.jpg?k=7ff48bd4cd49ac5ee4391b0f45780a8187a7814d791007f4d484e0e050dcf83f&o=&hp=1",
            features: ["3-Star Hall-Hotel Grand", "Simple Decorations-new flora", "Basic Catering-Rathna Catering", "DJ & Sound System-BDJ Standard","Luxury Vehicle-Fit"],
            description: "A budget-friendly package that doesn't compromise on quality. Ideal for couples who want a beautiful wedding while staying within their budget.",
            additional_details: {
                venue: "Hotel Grand",
                capacity: "Up to 200 guests",
                duration: "Full day event",
                includes: ["Basic decorations", "Professional photography", "Wedding cake"]
            }
        },
    ]);

    // State for fetched packages
    const [fetchedPackages, setFetchedPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getpck');
                if (!response.ok) {
                    throw new Error('Failed to fetch packages');
                }
                const result = await response.json();
                if (result.success) {
                    // Map the API response to our expected format
                    const mappedPackages = result.data.map(pkg => ({
                        id: pkg._id,
                        wedding_type: pkg.packageName,
                        price: pkg.price,
                        preview_image: pkg.image,
                        description: pkg.description,
                        features: [], // Since features are not in the API response
                        additional_details: {
                            venue: "Not specified",
                            capacity: "Not specified",
                            duration: "Not specified",
                            includes: []
                        }
                    }));
                    setFetchedPackages(mappedPackages);
                } else {
                    throw new Error('Failed to fetch packages');
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handleBookNow = async (category) => {
        setSelectedPackage(category);
        setShowBookingModal(true);
    };

    const handleMoreDetails = (category) => {
        setSelectedPackage(category);
        setShowDetailsModal(true);
    };

    const handleConfirmBooking = async () => {
        if (!phoneNumber) {
            alert("Please enter your phone number");
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                alert("Please login to make a booking");
                return;
            }

            const bookingData = {
                packageId: selectedPackage.id,
                wedding_type: selectedPackage.wedding_type,
                price: selectedPackage.price,
                preview_image: selectedPackage.preview_image,
                features: selectedPackage.features,
                phoneNumber: phoneNumber,
                email: user.email
            };

            const response = await fetch("http://localhost:5000/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Booking successful!");
                setShowBookingModal(false);
                setPhoneNumber("");
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

    const handleDeletePackage = async (packageId) => {
        if (window.confirm("Are you sure you want to delete this package?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/deletepck/${packageId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setFetchedPackages(prevPackages =>
                        prevPackages.filter(pkg => pkg.id !== packageId)
                    );
                    toast.success("Package deleted successfully");
                } else {
                    throw new Error('Failed to delete package');
                }
            } catch (error) {
                console.error("Error deleting package:", error);
                toast.error("Failed to delete package");
            }
        }
    };

    return (
        <div className="w-screen min-h-screen bg-gradient-to-b from-pink-200 to-pink-100 flex flex-col items-center py-10 relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-contain bg-no-repeat opacity-30" style={{ backgroundImage: "url('/floral-corner.png')" }}></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-contain bg-no-repeat transform rotate-90 opacity-30" style={{ backgroundImage: "url('/floral-corner.png')" }}></div>

            <div className="text-center mb-8 relative">
                <h3 className="text-2xl uppercase text-rose-600 font-serif italic">Our Packages</h3>
                <h2 className="text-4xl md:text-5xl uppercase font-serif text-rose-800 relative pb-2">
                    Select Your Dream Wedding Package
                </h2>
                <div className="w-64 h-1 bg-rose-300 mx-auto mt-2"></div>
                <p className="text-gray-600 mt-3 text-xl font-light">Find the perfect package for your special day</p>
            </div>

            {/* Hardcoded Packages Section */}
            <div className="w-full max-w-6xl mb-16">
                <h2 className="text-3xl font-serif text-rose-800 mb-8 text-center italic">Premium Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hardcodedPackages.map((category) => (
                        <div
                            key={category.id}
                            className="bg-rose-300 shadow-2xl rounded-2xl overflow-hidden border border-pink-600 transform transition-transform duration-300 hover:shadow-2xl hover:scale-105 relative"
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-8 h-8 bg-pink-50 rounded-br-full opacity-70"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-pink-50 rounded-tl-full opacity-70"></div>

                            {/* Top decorative border */}
                            <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-500 to-pink-200"></div>

                            <div className="relative h-48">
                                <img
                                    src={category.preview_image}
                                    alt={category.wedding_type}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-pink-900 to-transparent opacity-30"></div>
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-700 to-rose-600 text-white px-3 py-1 rounded-full font-serif shadow-sm">
                                    {category.wedding_type}
                                </div>
                            </div>

                            <div className="p-6 bg-rose-200">
                                <h3 className="text-xl font-serif text-rose-700 text-center relative pb-2">
                                    {category.wedding_type} Package
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-px bg-pink-300"></div>
                                </h3>
                                <p className="text-2xl font-bold text-rose-600 mb-4 text-center">Rs. {category.price.toLocaleString()}</p>

                                <div className="space-y-2 mb-6 bg-pink-200 p-3 rounded-lg shadow-inner">
                                    {category.features.map((feature, index) => (
                                        <div key={index} className="flex items-center text-gray-700 text-sm">
                                            <svg className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="font-serif">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Description - removed max-h-16 and overflow-y-auto */}
                                <div className="mt-2 text-sm text-rose-700 p-2">
                                    <p className="font-serif leading-relaxed text-center">{category.description}</p>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleBookNow(category)}
                                        className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white py-2 px-4 rounded-full font-serif text-sm hover:from-pink-500 hover:to-rose-600 transition-all duration-300 shadow-md"
                                    >
                                        Book Now
                                    </button>
                                    <button
                                        onClick={() => handleMoreDetails(category)}
                                        className="flex-1 bg-gradient-to-r from-pink-300 to-rose-400 text-white py-2 px-4 rounded-full font-serif text-sm hover:from-pink-400 hover:to-rose-500 transition-all duration-300 shadow-md"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>

                            {/* Bottom decorative border */}
                            <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-500 to-pink-200"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Customize Package Button */}
            <div className="mt-6 mb-10">
                <Link
                    to="/cus"
                    className="bg-gradient-to-r from-pink-400 to-rose-500 text-white px-8 py-4 rounded-full text-lg font-serif shadow-lg hover:from-pink-500 hover:to-rose-600 transition-all transform hover:scale-105"
                >
                    Customize Your Own Package
                </Link>
            </div>

            {/* Decorative divider */}
            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent my-6"></div>

            {/* Fetched Packages Section */}
            <div className="mt-6 w-full max-w-6xl">
                <h2 className="text-3xl font-serif text-rose-800 mb-8 text-center italic">Additional Packages</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600 p-4 bg-pink-100 rounded-lg border border-red-300">
                        <p>Error: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 font-serif"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {fetchedPackages.map((category) => (
                            <div
                                key={category?.id || Math.random()}
                                className="bg-rose-300 shadow-2xl rounded-2xl overflow-hidden border border-pink-600 transform transition-transform duration-300 hover:shadow-2xl hover:scale-105 relative"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-8 h-8 bg-pink-50 rounded-br-full opacity-70"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-pink-50 rounded-tl-full opacity-70"></div>

                                {/* Top decorative border */}
                                <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-500 to-pink-200"></div>

                                <div className="relative h-48">
                                    <img
                                        src={category?.preview_image || 'https://via.placeholder.com/300x200'}
                                        alt={category?.wedding_type || 'Package'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900 to-transparent opacity-30"></div>
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-700 to-rose-600 text-white px-3 py-1 rounded-full font-serif shadow-sm">
                                        {category?.wedding_type || 'Package'}
                                    </div>
                                </div>

                                <div className="p-6 bg-rose-200">
                                    <h3 className="text-xl font-serif text-rose-700 text-center relative pb-2">
                                        {category?.wedding_type || 'Package'} Package
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-px bg-pink-300"></div>
                                    </h3>
                                    <p className="text-2xl font-bold text-rose-600 mb-4 text-center">
                                        Rs. {(category?.price || 0).toLocaleString()}
                                    </p>

                                    <div className="space-y-2 mb-6 bg-pink-200 p-3 rounded-lg shadow-inner min-h-16">
                                        {(category?.features || []).length > 0 ?
                                            (category.features.map((feature, index) => (
                                                <div key={index} className="flex items-center text-gray-700 text-sm">
                                                    <svg className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="font-serif">{feature}</span>
                                                </div>
                                            ))) :
                                            <p className="text-center text-gray-500 font-serif italic text-sm">Features not specified</p>
                                        }
                                    </div>

                                    {/* Description - removed max-h-16 and overflow-y-auto */}
                                    <div className="mt-2 text-sm text-rose-700 p-2">
                                        <p className="font-serif leading-relaxed text-center">
                                            {category?.description || 'No description available'}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => handleBookNow(category)}
                                            className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white py-2 px-4 rounded-full font-serif text-sm hover:from-pink-500 hover:to-rose-600 transition-all duration-300 shadow-md"
                                        >
                                            Book Now
                                        </button>
                                        <button
                                            onClick={() => handleMoreDetails(category)}
                                            className="flex-1 bg-gradient-to-r from-pink-300 to-rose-400 text-white py-2 px-4 rounded-full font-serif text-sm hover:from-pink-400 hover:to-rose-500 transition-all duration-300 shadow-md"
                                        >
                                            Details
                                        </button>
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <Link
                                            to={`/editpck/${category.id}`}
                                            className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-4 rounded-full font-serif text-sm hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-md text-center"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePackage(category.id)}
                                            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 px-4 rounded-full font-serif text-sm hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom decorative border */}
                                <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-500 to-pink-200"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Decorative footer element */}
            <div className="h-12 w-full flex justify-center mt-16">
                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-pink-100 p-8 rounded-2xl max-w-md w-full border border-pink-300 shadow-2xl">
                        <h3 className="text-2xl font-serif text-rose-700 mb-4 text-center">Confirm Booking</h3>
                        <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200 mb-4"></div>
                        <p className="mb-4 text-center font-serif">You are booking the {selectedPackage?.wedding_type || 'Package'} Package</p>
                        <div className="mb-4">
                            <label className="block text-rose-600 mb-2 font-serif">Phone Number</label>
                            <input
                                type="number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setPhoneNumber("");
                                }}
                                className="px-6 py-2 bg-gray-200 rounded-full text-gray-700 font-serif hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full font-serif hover:from-pink-500 hover:to-rose-600 transition-all"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-pink-100 p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-300 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-serif text-rose-700">
                                {selectedPackage?.wedding_type || 'Package'} Package Details
                            </h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200 mb-6"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="rounded-lg overflow-hidden shadow-lg">
                                    <img
                                        src={selectedPackage?.preview_image || 'https://via.placeholder.com/300x200'}
                                        alt="Package Preview"
                                        className="w-full h-64 object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-lg text-gray-700 mb-4 font-serif">
                                    {selectedPackage?.description || 'No description available'}
                                </p>
                                <div className="space-y-4 bg-pink-50 p-4 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-rose-600 font-serif">Venue</h4>
                                        <p className="font-serif">{selectedPackage?.additional_details?.venue || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-rose-600 font-serif">Capacity</h4>
                                        <p className="font-serif">{selectedPackage?.additional_details?.capacity || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-rose-600 font-serif">Duration</h4>
                                        <p className="font-serif">{selectedPackage?.additional_details?.duration || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-pink-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-rose-600 mb-2 font-serif">Includes</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(selectedPackage?.additional_details?.includes || []).map((item, index) => (
                                    <li key={index} className="flex items-center text-gray-700">
                                        <svg className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-serif">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-semibold text-rose-600 mb-2 font-serif">Features</h4>
                            <div className="bg-pink-50 p-4 rounded-lg">
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(selectedPackage?.features || []).map((feature, index) => (
                                        <li key={index} className="flex items-center text-gray-700">
                                            <svg className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="font-serif">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setShowBookingModal(true);
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full hover:from-pink-500 hover:to-rose-600 transition-all shadow-lg transform hover:scale-105 font-serif"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagesApp;