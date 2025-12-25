import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import ServiceFilter from "./ServiceFilter"; // Import the enhanced filter component
import { FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const ServiceList = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Fetch services from backend
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/services");
                if (!response.ok) {
                    throw new Error("Failed to fetch services");
                }
                const data = await response.json();
                setServices(data);
                setFilteredServices(data); // Initialize filtered services with all services
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [refreshTrigger]);

    // Delete service function
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/services/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete service");
            }

            const updatedServices = services.filter((service) => service._id !== id);
            setServices(updatedServices);
            setFilteredServices(updatedServices);
            alert("Service deleted successfully!");
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Failed to delete service.");
        }
    };

    // Update service function
    const handleUpdate = async () => {
        try {
            // Note: The actual API call is handled in the ServiceCard component
            // This function is passed down to trigger a refresh of the service list
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error updating service:", error);
        }
    };

    // Function to handle navigation to the add service page
    const navigateToAddService = () => {
        navigate("/add-service"); // Make sure this matches your route configuration
    };

    //Create PDF
    const downloadServicesReport = async () => {
        try {
            toast.loading('Generating Report...', { id: 'report-loading' });
            const reportContainer = document.createElement('div');
            reportContainer.style.padding = '20px';
            reportContainer.style.backgroundColor = '#ffffff';
            reportContainer.style.maxWidth = '800px';
            reportContainer.style.margin = '0 auto';

            const titleDiv = document.createElement('div');
            titleDiv.style.marginBottom = '20px';
            titleDiv.style.textAlign = 'center';
            titleDiv.innerHTML = `
                <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">Wedding Services Report</h1>
                <p style="font-size: 14px; color: #666666;">Generated on: ${new Date().toLocaleDateString()}</p>
            `;
            reportContainer.appendChild(titleDiv);

            const summaryDiv = document.createElement('div');
            summaryDiv.style.marginBottom = '20px';
            summaryDiv.style.padding = '15px';
            summaryDiv.style.backgroundColor = '#f8f9fa';
            summaryDiv.style.borderRadius = '5px';
            
            const totalServices = services.length;
            const activeServices = services.filter(service => service.status === 'active').length;
            const inactiveServices = totalServices - activeServices;

            summaryDiv.innerHTML = `
                <h2 style="font-size: 18px; margin-bottom: 10px; color: #333;">Summary</h2>
                <p style="margin-bottom: 5px;">Total Services: ${totalServices}</p>
                <p style="margin-bottom: 5px;">Active Services: ${activeServices}</p>
                <p style="margin-bottom: 5px;">Inactive Services: ${inactiveServices}</p>
                <p>Report Generated: ${new Date().toLocaleString()}</p>
            `;
            reportContainer.appendChild(summaryDiv);

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '20px';
            
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Service Name</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Category</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Status</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Description</th>
                </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            services.forEach(service => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #dee2e6';
                tr.innerHTML = `
                    <td style="padding: 10px;">${service.name}</td>
                    <td style="padding: 10px;">${service.category}</td>
                    <td style="padding: 10px;">${service.status}</td>
                    <td style="padding: 10px;">${service.description}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            reportContainer.appendChild(table);

            document.body.appendChild(reportContainer);
            const canvas = await html2canvas(reportContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            document.body.removeChild(reportContainer);
            pdf.save('services-report.pdf');
            toast.success('Report downloaded successfully', { id: 'report-loading' });
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report', { id: 'report-loading' });
        }
    };

    const handleConfirmBooking = async () => {
        // Phone number validation
        const phoneRegex = /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\d)\d{6}$/;
        
        if (!phoneNumber) {
            toast.error("Please enter your phone number");
            return;
        }

        if (!phoneRegex.test(phoneNumber)) {
            toast.error("Please enter a valid Sri Lankan phone number");
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                toast.error("Please login to make a booking");
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
                toast.success("Booking successful!");
                setShowBookingModal(false);
                setPhoneNumber("");
            } else {
                const errorData = await response.json();
                console.error("Error:", errorData.message);
                toast.error("Failed to book the package");
            }
        } catch (error) {
            console.error("Network error:", error);
            toast.error("Network error. Please try again.");
        }
    };

    return (
        <div className="min-w-300 bg-gradient-to-b from-pink-200 to-pink-100 p-4 rounded-lg">
        {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-contain bg-no-repeat" style={{ backgroundImage: "url('/floral-corner.png')" }}></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-contain bg-no-repeat transform rotate-90" style={{ backgroundImage: "url('/floral-corner.png')" }}></div>

            {/* Header with elegant styling */}
            <div className="text-center mb-6">
                <h2 className="text-5xl font-serif text-rose-800 mb-2 italic">Wedding Services</h2>
                <div className="w-64 h-1 bg-rose-300 mx-auto"></div>
                <p className="text-gray-600 mt-3 text-2xl font-light">Find the perfect services for your special day</p>
            </div>

            {/* Filter Component */}
            {!loading && services.length > 0 && (
                <ServiceFilter
                    services={services}
                    setFilteredServices={setFilteredServices}
                />
            )}

            {/* Loading state */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
                </div>
            ) : (
                <>
                    {/* Service Count */}
                    <div className="text-center mb-6">
                        <p className="text-pink-600 font-serif">
                            {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                        </p>
                    </div>

                    {/* Service Grid using ServiceCard component */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 mx-auto max-w-6xl">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                                <ServiceCard
                                    key={service._id}
                                    service={service}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 bg-white bg-opacity-70 rounded-lg">
                                <p className="text-gray-600 text-xl font-light">
                                    {services.length > 0
                                        ? "No services found in this category."
                                        : "No services found."}
                                </p>
                                <button
                                    className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition shadow-md"
                                    onClick={navigateToAddService}
                                >
                                    Add a New Service
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Action Buttons */}
            <div className="mt-12 text-center">
                <button
                    className="px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium mr-4"
                    onClick={navigateToAddService}
                >
                    Add New Service
                </button>
                <button
                    onClick={downloadServicesReport}
                    className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium mr-4"
                >
                    <FaDownload className="inline-block mr-2" />
                    Download Report
                </button>
                <button
                    className="px-8 py-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
                    onClick={() => navigate("/dashboard")}
                >
                    Return to Dashboard
                </button>
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
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    // Remove any non-digit characters
                                    const value = e.target.value.replace(/\D/g, '');
                                    // Limit to 10 digits
                                    if (value.length <= 10) {
                                        setPhoneNumber(value);
                                    }
                                }}
                                className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                placeholder="Enter your phone number (e.g., 0771234567)"
                                required
                                pattern="[0-9]{10}"
                                maxLength={10}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Format: 10 digits (e.g., 0771234567)
                            </p>
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

            {/* Decorative footer element */}
            <div className="h-12 w-full flex justify-center mt-16">
                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
            </div>
        </div>
    );
};

export default ServiceList;