import React, { useState } from 'react';

const UpdateService = ({ service, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: service.name || '',
    description: service.description || '',
    ownerName: service.ownerName || '',
    email: service.email || '',
    contact: service.contact || '',
    address: service.address || '',
    category: service.category || '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(
      service.image ? `http://localhost:5000/uploads/${service.image}` : null
  );

  const categories = [
    "Wedding hall",
    "Wedding dresses",
    "Vehicles",
    "Decorations",
    "Entertainment",
    "Catering"
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'contact') {
      // Allow only digits and limit to 10 characters
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;

      // Clear contact error when user is typing
      if (errors.contact) {
        setErrors({
          ...errors,
          contact: ''
        });
      }
    }

    if (name === 'image') {
      if (files && files[0]) {
        setFormData({
          ...formData,
          image: files[0]
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Service name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.ownerName?.trim()) newErrors.ownerName = "Owner's name is required";
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.contact?.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (formData.contact.length !== 10) {
      newErrors.contact = 'Contact number must be exactly 10 digits';
    }
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const data = new FormData();

        Object.keys(formData).forEach(key => {
          if (key === 'image') {
            if (formData[key]) {
              data.append(key, formData[key]);
            }
          } else {
            data.append(key, formData[key]);
          }
        });

        onUpdate(service._id, data);
      } catch (error) {
        console.error('Error updating service:', error);
        setErrors({ submit: 'Failed to update service. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
      // Modal overlay - Fixed position, covers the entire viewport
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-pink-700 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal container - centered */}
        <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
          {/* Added gradient wrapper */}
          <div className="relative min-w-300 bg-gradient-to-b from-pink-600 to-pink-200 p-4 rounded-lg">
            {/* Modal panel - Updated to match width of AddService */}
            <div className="relative max-w-300 mx-auto bg-white rounded-lg text-left overflow-hidden shadow-lg transform transition-all">
              {/* Modal header */}
              <div className="py-6 px-8 bg-pink-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-4xl font-bold text-pink-800">Update Vendor Service</h2>
                    <p className="text-pink-600 text-1xl">Update your wedding vendor service</p>
                  </div>
                  <button
                      onClick={onClose}
                      className="text-pink-800 hover:text-pink-900 focus:outline-none p-1 rounded-full hover:bg-pink-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-4">
                {errors.submit && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                      {errors.submit}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Service Name</label>
                      <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Service Name"
                          className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Service Category</label>
                      <div className="relative">
                        <select
                            name="category"
                            value={formData.category}
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
                      {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Service Description</label>
                      <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          placeholder="Describe the service..."
                          rows="2"
                          className="w-full h-30 px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      ></textarea>
                      {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Owner's Name</label>
                      <input
                          type="text"
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleChange}
                          required
                          placeholder="Owner's Name"
                          className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      {errors.ownerName && <span className="text-red-500 text-xs">{errors.ownerName}</span>}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Owner's Email</label>
                      <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="email@example.com"
                          className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Service Image</label>
                      <div className="mt-1 flex flex-col items-center justify-center py-4 border-2 border-pink-300 border-dashed rounded-lg">
                        {previewImage ? (
                            <div className="text-center">
                              <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="h-24 mx-auto mb-2 rounded-md"
                              />
                              <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewImage(null);
                                    setFormData({...formData, image: null});
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
                                    htmlFor="image-upload-update"
                                    className="relative cursor-pointer font-medium text-pink-500 hover:text-pink-600 focus-within:outline-none"
                                >
                                  <span className="text-lg">Upload an image</span>
                                  <input
                                      id="image-upload-update"
                                      name="image"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleChange}
                                      className="sr-only"
                                  />
                                </label>
                                <p className="text-gray-500">or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                        )}
                      </div>
                      {!formData.image && !previewImage && service.image && (
                          <p className="text-xs text-gray-500 mt-1 text-center">Current image will be kept if none selected</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Contact Number</label>
                      <input
                          type="tel"
                          name="contact"
                          value={formData.contact}
                          onChange={handleChange}
                          required
                          placeholder="10 digit number"
                          maxLength="10"
                          className={`w-full px-2 py-1 rounded-lg border-2 ${
                              errors.contact ? "border-red-500" : "border-pink-200"
                          } focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50`}
                      />
                      {errors.contact && <span className="text-red-500 text-xs">{errors.contact}</span>}
                      <p className="text-xs text-gray-500 mt-1">Enter exactly 10 digits</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-700 mb-1">Address</label>
                      <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          placeholder="Enter your address"
                          rows="2"
                          className="w-full px-2 py-1 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      ></textarea>
                      {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
                    </div>
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex justify-between mt-4">
                  <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center text-sm"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Cancel
                  </button>

                  <button
                      type="submit"
                      className="px-3 py-1 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center shadow-md text-sm"
                      disabled={isLoading}
                  >
                    {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                    ) : (
                        <>
                          Submit
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UpdateService;