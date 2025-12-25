import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaExclamationCircle, FaEnvelope, FaEdit, FaTrash, FaPlus, FaTimes, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const ScheduleList = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        fetchSchedules();
        const storedEmail = sessionStorage.getItem('scheduleEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/schedule');
            if (!response.ok) throw new Error('Failed to fetch schedules');
            const data = await response.json();
            setSchedules(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        sessionStorage.setItem('scheduleEmail', newEmail);
    };

    const handleSendEmail = (schedule) => {
        setSelectedSchedule(schedule);
        setShowEmailModal(true);
    };

    const sendEmail = async () => {
        if (!selectedSchedule) {
            alert('No schedule selected');
            return;
        }

        const recipientEmail = sessionStorage.getItem('scheduleEmail');
        if (!recipientEmail) {
            alert('No email address found in session');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: recipientEmail,
                    subject: `Schedule Update: ${selectedSchedule.title}`,
                    text: `Your schedule for ${selectedSchedule.title} on ${new Date(selectedSchedule.date).toLocaleDateString()} at ${selectedSchedule.time} has been updated.`
                })
            });

            if (response.ok) {
                alert('Email sent successfully!');
                setShowEmailModal(false);
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        }
    };

    const handleEdit = (schedule) => {
        setEditedSchedule({ ...schedule });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/schedule/${editedSchedule._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedSchedule)
            });

            if (response.ok) {
                fetchSchedules();
                setShowEditModal(false);
                alert('Schedule updated successfully!');
            } else {
                throw new Error('Failed to update schedule');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule. Please try again.');
        }
    };

    const handleDelete = async (scheduleId) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/schedule/${scheduleId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchSchedules();
                    alert('Schedule deleted successfully!');
                } else {
                    throw new Error('Failed to delete schedule');
                }
            } catch (error) {
                console.error('Error deleting schedule:', error);
                alert('Failed to delete schedule. Please try again.');
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-green-500/10 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const filteredSchedules = schedules.filter(schedule => {
        const matchesSearch = 
            schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || schedule.priority === filterPriority;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    //Download PDF
    const downloadScheduleReport = async () => {
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
                <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">Schedule Report</h1>
                <p style="font-size: 14px; color: #666666;">Generated on: ${new Date().toLocaleDateString()}</p>
            `;
            reportContainer.appendChild(titleDiv);

            // Add summary section
            const summaryDiv = document.createElement('div');
            summaryDiv.style.marginBottom = '20px';
            summaryDiv.style.padding = '15px';
            summaryDiv.style.backgroundColor = '#f8f9fa';
            summaryDiv.style.borderRadius = '5px';
            
            // Calculate statistics
            const totalSchedules = schedules.length;
            const completedSchedules = schedules.filter(s => s.status === 'completed').length;
            const pendingSchedules = schedules.filter(s => s.status === 'pending').length;
            const cancelledSchedules = schedules.filter(s => s.status === 'cancelled').length;
            
            // Count schedules by priority
            const priorityCounts = {
                high: schedules.filter(s => s.priority === 'high').length,
                medium: schedules.filter(s => s.priority === 'medium').length,
                low: schedules.filter(s => s.priority === 'low').length
            };

            summaryDiv.innerHTML = `
                <h2 style="font-size: 18px; margin-bottom: 10px; color: #333;">Summary</h2>
                <p style="margin-bottom: 5px;">Total Schedules: ${totalSchedules}</p>
                <p style="margin-bottom: 5px;">Completed: ${completedSchedules}</p>
                <p style="margin-bottom: 5px;">Pending: ${pendingSchedules}</p>
                <p style="margin-bottom: 5px;">Cancelled: ${cancelledSchedules}</p>
                <div style="margin-bottom: 10px;">
                    <h3 style="font-size: 16px; margin-bottom: 5px; color: #333;">Priority Distribution:</h3>
                    <p style="margin-bottom: 3px;">High Priority: ${priorityCounts.high}</p>
                    <p style="margin-bottom: 3px;">Medium Priority: ${priorityCounts.medium}</p>
                    <p style="margin-bottom: 3px;">Low Priority: ${priorityCounts.low}</p>
                </div>
                <p>Report Generated: ${new Date().toLocaleString()}</p>
            `;
            reportContainer.appendChild(summaryDiv);

            // Create a table for the schedules
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '20px';
            
            // Add table headers
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Title</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Date</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Time</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Priority</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Status</th>
                </tr>
            `;
            table.appendChild(thead);

            // Add table body
            const tbody = document.createElement('tbody');
            schedules.forEach(schedule => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #dee2e6';
                tr.innerHTML = `
                    <td style="padding: 10px;">${schedule.title}</td>
                    <td style="padding: 10px;">${new Date(schedule.date).toLocaleDateString()}</td>
                    <td style="padding: 10px;">${schedule.time}</td>
                    <td style="padding: 10px;">${schedule.priority}</td>
                    <td style="padding: 10px;">${schedule.status}</td>
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
            pdf.save('schedule-report.pdf');
            
            // Update toast to success
            toast.success('Report downloaded successfully', { id: 'report-loading' });
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report', { id: 'report-loading' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-pink-100 text-lg font-light">Loading schedules...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-red-500 max-w-md">
                    <div className="flex items-center justify-center mb-4">
                        <FaExclamationCircle className="h-12 w-12 text-red-400" />
                    </div>
                    <h2 className="text-red-400 text-xl font-bold mb-2 text-center">Error</h2>
                    <p className="text-gray-300 text-center mb-4">{error}</p>
                    <button 
                        onClick={fetchSchedules}
                        className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
                            Schedule Manager
                        </h1>
                        <p className="text-gray-400 mt-2">Organize and track your appointments</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadScheduleReport}
                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all"
                        >
                            <FaDownload className="text-sm" />
                            <span>Download Report</span>
                        </motion.button>
                        <div className="relative">
                            <div className="flex-shrink-0 absolute left-3 top-3">
                                <FaEnvelope className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter notification email"
                                className="w-full md:w-64 px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 mb-2">Search Schedules</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by title or description..."
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Priority</label>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredSchedules.length === 0 ? (
                    <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
                        <div className="text-gray-500 mb-4">No schedules found</div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterPriority('all');
                            }}
                            className="px-4 py-2 text-pink-400 hover:text-pink-300 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredSchedules.map(schedule => (
                                <motion.div
                                    key={schedule._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-gray-800/70 hover:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 hover:border-pink-500/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-white mb-1">{schedule.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(schedule.priority)}`}>
                                            {schedule.priority}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-gray-400">
                                            <FaCalendarAlt className="mr-2 text-pink-400" />
                                            <span>{new Date(schedule.date).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-400">
                                            <FaClock className="mr-2 text-pink-400" />
                                            <span>{schedule.time}</span>
                                        </div>
                                        
                                        <p className="text-gray-300 mt-2">{schedule.description}</p>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(schedule.status)}`}>
                                            {schedule.status}
                                        </span>
                                        
                                        <div className="flex space-x-3">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleSendEmail(schedule)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="Send Email"
                                            >
                                                <FaEnvelope />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleEdit(schedule)}
                                                className="text-green-400 hover:text-green-300 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDelete(schedule._id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Email Modal */}
                <AnimatePresence>
                    {showEmailModal && selectedSchedule && (
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
                                        <h3 className="text-xl font-semibold text-white">Send Email Notification</h3>
                                        <button
                                            onClick={() => setShowEmailModal(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <p className="text-gray-300">Send schedule details to:</p>
                                        <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                                            <p className="text-pink-400 font-medium">{sessionStorage.getItem('scheduleEmail')}</p>
                                        </div>
                                        
                                        <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600">
                                            <h4 className="text-white font-medium mb-2">{selectedSchedule.title}</h4>
                                            <p className="text-gray-400 text-sm">
                                                {new Date(selectedSchedule.date).toLocaleDateString()} at {selectedSchedule.time}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setShowEmailModal(false)}
                                            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </motion.button>
                                        <a
                                            href={`mailto:${sessionStorage.getItem('scheduleEmail')}?subject=Schedule Update: ${selectedSchedule.title}&body=Your schedule for ${selectedSchedule.title} on ${new Date(selectedSchedule.date).toLocaleDateString()} at ${selectedSchedule.time} has been updated.`}
                                            className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg shadow-md transition-colors"
                                            onClick={sendEmail}
                                        >
                                            Send Notification
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && editedSchedule && (
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
                                        <h3 className="text-xl font-semibold text-white">Edit Schedule</h3>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={editedSchedule.title}
                                                    onChange={(e) => setEditedSchedule({ ...editedSchedule, title: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={editedSchedule.date}
                                                        onChange={(e) => setEditedSchedule({ ...editedSchedule, date: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                                                    <input
                                                        type="time"
                                                        value={editedSchedule.time}
                                                        onChange={(e) => setEditedSchedule({ ...editedSchedule, time: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                                <textarea
                                                    value={editedSchedule.description}
                                                    onChange={(e) => setEditedSchedule({ ...editedSchedule, description: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    rows="3"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                                                    <select
                                                        value={editedSchedule.priority}
                                                        onChange={(e) => setEditedSchedule({ ...editedSchedule, priority: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    >
                                                        <option value="high">High</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="low">Low</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                                    <select
                                                        value={editedSchedule.status}
                                                        onChange={(e) => setEditedSchedule({ ...editedSchedule, status: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end space-x-3">
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => setShowEditModal(false)}
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
                                                Update Schedule
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

export default ScheduleList;