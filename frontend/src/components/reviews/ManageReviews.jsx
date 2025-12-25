import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaStar, FaPlus, FaTimes, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        title: '',
        review: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/reviews');
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingReview 
                ? `http://localhost:5000/api/reviews/${editingReview._id}`
                : 'http://localhost:5000/api/reviews';
            
            const method = editingReview ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save review');
            
            await fetchReviews();
            setShowModal(false);
            setEditingReview(null);
            setFormData({
                name: '',
                email: '',
                rating: 5,
                title: '',
                review: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setFormData({
            name: review.name,
            email: review.email,
            rating: review.rating,
            title: review.title,
            review: review.review
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/reviews/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete review');
            
            await fetchReviews();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = 
            review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.review.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRating = filterRating === 0 || review.rating >= filterRating;
        
        return matchesSearch && matchesRating;
    });

    const downloadReviewsReport = async () => {
        try {
            // Show loading state
            toast.loading('Generating Report...', { id: 'report-loading' });

            // Create a container for the report content
            const reportContainer = document.createElement('div');
            reportContainer.style.padding = '20px';
            reportContainer.style.backgroundColor = '#ffffff';
            reportContainer.style.maxWidth = '800px';
            reportContainer.style.margin = '0 auto';

            // Add title and date
            const titleDiv = document.createElement('div');
            titleDiv.style.marginBottom = '20px';
            titleDiv.style.textAlign = 'center';
            titleDiv.innerHTML = `
                <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">Reviews Report</h1>
                <p style="font-size: 14px; color: #666666;">Generated on: ${new Date().toLocaleDateString()}</p>
            `;
            reportContainer.appendChild(titleDiv);

            // Add summary section
            const summaryDiv = document.createElement('div');
            summaryDiv.style.marginBottom = '20px';
            summaryDiv.style.padding = '15px';
            summaryDiv.style.backgroundColor = '#f8f9fa';
            summaryDiv.style.borderRadius = '5px';
            
            // Calculate average rating
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : 0;
            
            // Count reviews by rating
            const ratingCounts = {};
            reviews.forEach(review => {
                ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
            });

            summaryDiv.innerHTML = `
                <h2 style="font-size: 18px; margin-bottom: 10px; color: #333;">Summary</h2>
                <p style="margin-bottom: 5px;">Total Reviews: ${reviews.length}</p>
                <p style="margin-bottom: 5px;">Average Rating: ${avgRating} stars</p>
                <div style="margin-bottom: 10px;">
                    <h3 style="font-size: 16px; margin-bottom: 5px; color: #333;">Rating Distribution:</h3>
                    ${Object.entries(ratingCounts).map(([rating, count]) => `
                        <p style="margin-bottom: 3px;">${rating} stars: ${count} reviews</p>
                    `).join('')}
                </div>
                <p>Report Generated: ${new Date().toLocaleString()}</p>
            `;
            reportContainer.appendChild(summaryDiv);

            // Create a table for the reviews
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '20px';
            
            // Add table headers
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Name</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Rating</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Title</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Date</th>
                </tr>
            `;
            table.appendChild(thead);

            // Add table body
            const tbody = document.createElement('tbody');
            reviews.forEach(review => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #dee2e6';
                tr.innerHTML = `
                    <td style="padding: 10px;">${review.name}</td>
                    <td style="padding: 10px;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</td>
                    <td style="padding: 10px;">${review.title}</td>
                    <td style="padding: 10px;">${new Date(review.createdAt).toLocaleDateString()}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            reportContainer.appendChild(table);

            // Add the container to the document temporarily
            document.body.appendChild(reportContainer);

            // Generate canvas from the container
            const canvas = await html2canvas(reportContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add the image to PDF
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

            // Remove the temporary container
            document.body.removeChild(reportContainer);

            // Save the PDF
            pdf.save('reviews-report.pdf');
            
            // Update toast to success
            toast.success('Report downloaded successfully', { id: 'report-loading' });
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report', { id: 'report-loading' });
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-pink-100 text-lg font-light">Loading reviews...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-red-500 max-w-md">
                <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
                <p className="text-gray-300">{error}</p>
                <button 
                    onClick={fetchReviews}
                    className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white transition-all"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
                            Review Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Manage and analyze customer feedback</p>
                    </div>
                    
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadReviewsReport}
                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all"
                        >
                            <FaDownload className="text-sm" />
                            <span>Download Report</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setEditingReview(null);
                                setFormData({
                                    name: '',
                                    email: '',
                                    rating: 5,
                                    title: '',
                                    review: ''
                                });
                                setShowModal(true);
                            }}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg hover:shadow-pink-500/30 transition-all"
                        >
                            <FaPlus className="text-sm" />
                            <span>Add New Review</span>
                        </motion.button>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 mb-2">Search Reviews</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name, title or content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Filter by Rating</label>
                            <select
                                value={filterRating}
                                onChange={(e) => setFilterRating(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                            >
                                <option value={0}>All Ratings</option>
                                <option value={5}>5 Stars Only</option>
                                <option value={4}>4+ Stars</option>
                                <option value={3}>3+ Stars</option>
                                <option value={2}>2+ Stars</option>
                                <option value={1}>1+ Stars</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredReviews.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-500 mb-4">No reviews found</div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterRating(0);
                            }}
                            className="px-4 py-2 text-pink-400 hover:text-pink-300 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredReviews.map(review => (
                                <motion.div
                                    key={review._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-800/70 hover:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 hover:border-pink-500/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-1">{review.title}</h3>
                                            <p className="text-pink-400">{review.name}</p>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                aria-label="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                aria-label="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-600'} text-lg`}
                                            />
                                        ))}
                                        <span className="ml-2 text-gray-400 text-sm">{review.rating}.0</span>
                                    </div>
                                    <p className="text-gray-300 mb-4">{review.review}</p>
                                    <div className="text-xs text-gray-500">
                                        {review.email} • {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-white">
                                            {editingReview ? 'Edit Review' : 'Add New Review'}
                                        </h2>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-400 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 mb-1">Rating</label>
                                                <div className="flex space-x-2">
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setFormData({...formData, rating: num})}
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${formData.rating >= num ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 mb-1">Review</label>
                                                <textarea
                                                    name="review"
                                                    value={formData.review}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    rows="4"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <motion.button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg shadow-md transition-colors"
                                            >
                                                {editingReview ? 'Update' : 'Add'} Review
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManageReviews;