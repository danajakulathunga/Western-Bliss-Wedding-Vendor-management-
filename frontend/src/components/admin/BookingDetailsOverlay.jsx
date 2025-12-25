import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const BookingDetailsOverlay = ({ isOpen, onClose, booking, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBooking, setEditedBooking] = useState(booking);
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        setEditedBooking(booking);
        setPhoneError('');
    }, [booking]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            // Only allow numbers
            const numericValue = value.replace(/\D/g, '');

            // Validate phone number length
            if (numericValue.length > 10) {
                setPhoneError('Phone number cannot exceed 10 digits');
            } else {
                setPhoneError('');
            }

            // Update the state with valid numeric value
            setEditedBooking(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setEditedBooking(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleUpdate = async () => {
        // Check for validation errors before submission
        if (phoneError) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedBooking)
            });

            if (response.ok) {
                onUpdate(editedBooking);
                setIsEditing(false);
            } else {
                alert('Failed to update booking');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('An error occurred while updating the booking');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    onDelete(booking._id);
                    onClose();
                } else {
                    alert('Failed to delete booking');
                }
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert('An error occurred while deleting the booking');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="space-y-4">
                    {isEditing ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Package Type</label>
                                <input
                                    type="text"
                                    name="wedding_type"
                                    value={editedBooking.wedding_type}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={editedBooking.price}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editedBooking.email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={editedBooking.phoneNumber}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                    maxLength={10}
                                    placeholder="Enter 10-digit phone number"
                                />
                                {phoneError && (
                                    <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Package Type</p>
                                    <p className="text-lg text-gray-900">{booking.wedding_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Price</p>
                                    <p className="text-lg text-gray-900">Rs. {booking.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-lg text-gray-900">{booking.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                    <p className="text-lg text-gray-900">{booking.phoneNumber}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Features</p>
                                <ul className="mt-1 list-disc list-inside">
                                    {booking.features.map((feature, index) => (
                                        <li key={index} className="text-gray-900">{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
                                disabled={phoneError !== ''}
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                            >
                                <FaEdit className="mr-2" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                            >
                                <FaTrash className="mr-2" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsOverlay;