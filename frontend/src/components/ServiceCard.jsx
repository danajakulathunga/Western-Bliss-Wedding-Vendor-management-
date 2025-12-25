import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UpdateService from "./UpdateService";

const ServiceCard = ({ service, onDelete, onUpdate }) => {
    useNavigate();
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const handleUpdate = async (serviceId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
                method: "PUT",
                body: updatedData, // FormData object is already prepared
            });

            if (!response.ok) {
                throw new Error("Failed to update service");
            }

            // If parent component provided an onUpdate handler, call it
            if (onUpdate) {
                onUpdate(serviceId, updatedData);
            }

            // Close the modal
            setShowUpdateModal(false);

            // Show success message
            alert("Service updated successfully!");

            // Reload the page to show updated data
            window.location.reload();

        } catch (error) {
            console.error("Error updating service:", error);
            alert("Failed to update service. Please try again.");
        }
    };

    return (
        <>
            <div className="bg-rose-300 shadow-2xl rounded-2xl overflow-hidden border border-pink-600 transform transition-transform duration-300 hover:shadow-2xl hover:scale-105 relative max-w-xs drop-shadow-2xl z-10">
                {/* Decorative elements - smaller size */}
                <div className="absolute top-0 left-0 w-8 h-8 bg-pink-50 rounded-br-full opacity-70"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-pink-50 rounded-tl-full opacity-70"></div>

                {/* Top decorative border */}
                <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-00 to-pink-200"></div>

                {/* Category badge with elegant styling */}
                <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-pink-700 to-rose-600 text-white text-xs px-2 py-px rounded-full font-serif shadow-sm text-xs">
                        {service.category}
                    </span>
                </div>

                {/* Service Image with overlay effect - reduced height */}
                <div className="w-full h-36 bg-pink-50 flex items-center justify-center overflow-hidden relative">
                    {service.image ? (
                        <img
                            src={`http://localhost:5000/uploads/${service.image}`}
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/fallback-image.png";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
                            <span className="text-sm italic font-serif text-rose-300">No Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900 to-transparent opacity-30"></div>
                </div>

                {/* Service Details with elegant wedding styling - reduced padding */}
                <div className="p-3 flex flex-col gap-2 relative">
                    {/* Decorative divider */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-10 h-px bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200 rounded-full"></div>
                    </div>

                    <h4 className="text-lg font-serif text-rose-700 text-center relative pb-2">
                        {service.name}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-px bg-pink-200"></div>
                    </h4>

                    <p className="text-xs font-medium text-gray-700 text-center">By: {service.ownerName}</p>

                    {/*Service Details*/}
                    <div className="bg-pink-200 p-2 rounded-lg shadow-inner mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <span className="font-serif italic text-rose-500">Contact:</span>
                            <span>{service.contact}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <span className="font-serif italic text-rose-500">Email:</span>
                            <span>{service.email}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <span className="font-serif italic text-rose-500">Address:</span>
                            <span>{service.address}</span>
                        </div>


                    </div>

                    {/* Description with scroll decoration - reduced height */}
                    <div className="mt-2 text-2 text-rose-700 max-h-16 overflow-hidden overflow-y-auto p-2 ">
                        <p className="font-serif leading-relaxed text-center">{service.description}</p>
                    </div>
                </div>

                {/* Action Buttons with elegant wedding styling - smaller buttons */}
                <div className="flex justify-center gap-2 p-3 bg-rose-200">
                    <button
                        onClick={() => setShowUpdateModal(true)}
                        className="flex items-center gap-1 px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full hover:from-pink-500 hover:to-rose-600 transition-all duration-300 shadow-md font-serif text-xs"
                    >
                        <FaEdit className="text-xs" /> Update
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        className="flex items-center gap-1 px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md font-serif text-xs"
                    >
                        <FaTrash className="text-xs" /> Remove
                    </button>
                </div>

                {/* Bottom decorative border */}
                <div className="h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200"></div>
            </div>

            {/* Update Service Modal - Rendered at root level, not inside the card */}
            {showUpdateModal && (
                <UpdateService
                    service={service}
                    onUpdate={handleUpdate}
                    onClose={() => setShowUpdateModal(false)}
                />
            )}
        </>
    );
};

export default ServiceCard;