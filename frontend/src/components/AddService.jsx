import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddService = () => {
  const [service, setService] = useState({
    name: "",
    description: "",
    ownerName: "",
    email: "",
    contact: "",
    address: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [contactError, setContactError] = useState("");
  const navigate = useNavigate();

  const categories = [
    "Wedding hall",
    "Wedding dresses",
    "Vehicles",
    "Decorations",
    "Entertainment",
    "Catering"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      // Allow only digits and limit to 10 characters
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;

      // Clear error when user is typing
      setContactError("");
    }

    setService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const validateContact = () => {
    if (service.contact.length !== 10) {
      setContactError("Contact number must be exactly 10 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate contact number
    if (!validateContact()) {
      return;
    }

    if (!service.name || !service.description || !image || !service.ownerName || !service.email || !service.contact || !service.address || !service.category) {
      alert("Please fill in all fields, including the service category.");
      return;
    }

    const formData = new FormData();
    formData.append("name", service.name);
    formData.append("description", service.description);
    formData.append("ownerName", service.ownerName);
    formData.append("email", service.email);
    formData.append("contact", service.contact);
    formData.append("address", service.address);
    formData.append("category", service.category);
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/services/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.statusText} - ${errorText}`);
      }

      alert("Service added successfully!");
      navigate("/services");

    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to add service. Check console for details.");
    }
  };

  return (
      <div className="min-w-300 bg-gradient-to-b from-pink-600 to-pink-200 p-4 rounded-lg">
        <div className="max-w-300 mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="py-6 px-8 bg-pink-300">
            <h2 className="text-4xl font-bold text-pink-800">Add Vendor Service</h2>
            <p className="text-pink-600 text-1xl">Add a new wedding vendor service</p>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Service Name</label>
                  <input
                      type="text"
                      name="name"
                      value={service.name}
                      onChange={handleChange}
                      required
                      placeholder="Service Name"
                      className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Service Category</label>
                  <div className="relative">
                    <select
                        name="category"
                        value={service.category}
                        onChange={handleChange}
                        required
                        className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 appearance-none bg-white text-pink-800 font-medium cursor-pointer"
                    >
                      <option value="" className="text-gray-400">Select a category</option>
                      {categories.map((category, index) => (
                          <option key={index} value={category} className="py-1 text-pink-800 hover:bg-pink-50">
                            {category}
                          </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pink-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Service Description</label>
                  <textarea
                      name="description"
                      value={service.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe the service..."
                      rows="2"
                      className="w-full h-30 px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Owner's Name</label>
                  <input
                      type="text"
                      name="ownerName"
                      value={service.ownerName}
                      onChange={handleChange}
                      required
                      placeholder="Owner's Name"
                      className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Owner's Email</label>
                  <input
                      type="email"
                      name="email"
                      value={service.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                      className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Service Image</label>
                  <div className="mt-1 flex flex-col items-center justify-center py-4 border-2 border-pink-300 border-dashed rounded-lg">
                    {imagePreview ? (
                        <div className="text-center">
                          <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-24 mx-auto mb-2 rounded-md"
                          />
                          <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setImage(null);
                              }}
                              className="text-xs text-pink-600 hover:text-pink-800 font-medium"
                          >
                            Remove image
                          </button>
                        </div>
                    ) : (
                        <div className="space-y-1 text-center">
                          {/* Pink Image Icon */}
                          <svg
                              className="mx-auto h-10 w-10 text-pink-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                            <path d="M3 16l5-5 2 2 5-5 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                          </svg>

                          {/* Upload text */}
                          <div className="flex flex-col items-center">
                            <label
                                htmlFor="image-upload"
                                className="relative cursor-pointer font-medium text-pink-500 hover:text-pink-600 focus-within:outline-none"
                            >
                              <span className="text-lg">Upload an image</span>
                              <input
                                  id="image-upload"
                                  name="image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  required
                                  className="sr-only"
                              />
                            </label>
                            <p className="text-gray-500">or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Contact Number</label>
                  <input
                      type="tel"
                      name="contact"
                      value={service.contact}
                      onChange={handleChange}
                      required
                      placeholder="10 digit number"
                      maxLength="10"
                      className={`w-full px-2 py-1 rounded-lg border-2 ${
                          contactError ? "border-red-500" : "border-pink-200"
                      } focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50`}
                  />
                  {contactError && (
                      <span className="text-red-500 text-xs">{contactError}</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Enter exactly 10 digits</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Address</label>
                  <textarea
                      name="address"
                      value={service.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your address"
                      rows="2"
                      className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-between mt-4">
              <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center text-sm"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>

              <button
                  type="submit"
                  className="px-3 py-1 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center shadow-md text-sm"
              >
                Submit
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AddService;