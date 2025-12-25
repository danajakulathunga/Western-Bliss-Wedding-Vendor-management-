import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddNewPackage = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState(""); // "success" or "error"

    const [formData, setFormData] = useState({
        pckCode: "",
        packageName: "",
        price: "",
        description: "",
        image: ""
    });

    const [errors, setErrors] = useState({
        pckCode: "",
        packageName: "",
        price: "",
        description: "",
        image: "",
        server: "" // For general server errors
    });


    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const showModal = (message, type) => {
        setModalMessage(message);
        setModalType(type);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);

        // If it was a success message, navigate after closing
        if (modalType === "success") {
            navigate("/admin");
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        // Validate package code
        if (!formData.pckCode.trim()) {
            newErrors.pckCode = "Package code is required";
            isValid = false;
        }

        // Validate package name
        if (!formData.packageName.trim()) {
            newErrors.packageName = "Package name is required";
            isValid = false;
        }

        // Validate price
        if (!formData.price) {
            newErrors.price = "Price is required";
            isValid = false;
        } else if (Number(formData.price) <= 0) {
            newErrors.price = "Price must be greater than zero";
            isValid = false;
        }

        // Validate description
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
            isValid = false;
        }

        // Validate image URL
        if (!formData.image.trim()) {
            newErrors.image = "Image URL is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("New Package Details:", formData);

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/addPack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showModal("Package Added Successfully!", "success");

                // Reset form after successful submission
                setFormData({
                    pckCode: "",
                    packageName: "",
                    price: "",
                    description: "",
                    image: ""
                });
                setErrors({
                    pckCode: "",
                    packageName: "",
                    price: "",
                    description: "",
                    image: "",
                    server: ""
                });
            } else {
                // Handle field-specific errors from the server if available
                if (data.fieldErrors && typeof data.fieldErrors === 'object') {
                    setErrors({ ...errors, ...data.fieldErrors });
                } else {
                    // Fallback to server error if no field-specific errors
                    setErrors({ ...errors, server: data.error || "Failed to add package" });
                    showModal(data.error || "Failed to Add!", "error");
                }
            }
        } catch (error) {
            setErrors({ ...errors, server: "Server error, please try again later" });
            showModal("Server error, please try again later!", "error");
        }

        setLoading(false);
    };

    return (
        <div
            className="w-screen h-screen flex flex-col items-center justify-center p-10"
            style={{
                backgroundImage: "url('https://i.pinimg.com/736x/45/9e/af/459eaf078d0ae6709baa08fe88d6858e.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-lg w-full max-w-3xl">
                <h2 className="text-4xl font-bold text-pink-700 mb-6 text-center">Add New Wedding Package</h2>

                {/* Display server error at the top if exists */}
                {errors.server && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errors.server}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            name="pckCode"
                            placeholder="Package Code"
                            value={formData.pckCode}
                            onChange={handleChange}
                            className={`p-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full ${errors.pckCode ? 'border-red-500' : ''}`}
                        />
                        {errors.pckCode && <p className="text-red-500 text-sm mt-1">{errors.pckCode}</p>}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="packageName"
                            placeholder="Package Name"
                            value={formData.packageName}
                            onChange={handleChange}
                            className={`p-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full ${errors.packageName ? 'border-red-500' : ''}`}
                        />
                        {errors.packageName && <p className="text-red-500 text-sm mt-1">{errors.packageName}</p>}
                    </div>

                    <div>
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={formData.price}
                            onChange={handleChange}
                            className={`p-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div>
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`p-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 w-full ${errors.description ? 'border-red-500' : ''}`}
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="image"
                            placeholder="Image URL"
                            value={formData.image}
                            onChange={handleChange}
                            className={`p-3 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full ${errors.image ? 'border-red-500' : ''}`}
                        />
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    <button
                        type="submit"
                        className="bg-pink-600 text-black font-semibold p-3 rounded-lg hover:bg-pink-700 transition-all duration-300 w-50 mt-5 ml-60"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Package"}
                    </button>
                </form>

                {/* Modal for success messages only */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-50 shadow-2xl flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <div className={`text-center mb-4 ${modalType === "success" ? "text-green-600" : "text-red-600"}`}>
                                <h3 className="text-xl font-bold">{modalType === "success" ? "Success" : "Error"}</h3>
                                <p className="mt-2">{modalMessage}</p>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={closeModal}
                                    className="text-orange-950 px-4 py-2 rounded hover:bg-pink-700 transition-all duration-300"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddNewPackage;