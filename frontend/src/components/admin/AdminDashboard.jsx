import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaChartLine, FaCog, FaSignOutAlt, FaList, FaEye, FaDownload, FaStar, FaPlus, FaCalendarAlt, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BookingDetailsOverlay from './BookingDetailsOverlay';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isHeaderVisible, setIsHeaderVisible] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalPackages: 0,
        totalServices: 0,
        totalUsers: 0
    });
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: 'all',
        packageType: 'all',
        search: ''
    });
    const tableRef = useRef(null);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchBookings();
        fetchSchedules();
        fetchUsers();

        // Add event listener for mouse movement
        const handleMouseMove = (e) => {
            // Show header when mouse is within 50px from the top
            setIsHeaderVisible(e.clientY < 50);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch bookings count
            const bookingsResponse = await fetch('http://localhost:5000/api/bookings');
            const bookingsData = await bookingsResponse.json();

            // Fetch packages count
            const packagesResponse = await fetch('http://localhost:5000/api/getpck');
            const packagesData = await packagesResponse.json();

            // Fetch services count
            const servicesResponse = await fetch('http://localhost:5000/api/services');
            const servicesData = await servicesResponse.json();

            setStats({
                totalBookings: bookingsData.data?.length || 0,
                totalPackages: packagesData.data?.length || 0,
                totalServices: servicesData.length || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/bookings');
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data = await response.json();
            setBookings(data.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/schedule');
            if (!response.ok) {
                throw new Error('Failed to fetch schedules');
            }
            const data = await response.json();
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
            setStats(prev => ({
                ...prev,
                totalUsers: data.length
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setIsUsersLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleBookingUpdate = (updatedBooking) => {
        setBookings(bookings.map(booking =>
            booking._id === updatedBooking._id ? updatedBooking : booking
        ));
    };

    const handleBookingDelete = (bookingId) => {
        setBookings(bookings.filter(booking => booking._id !== bookingId));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = filters.status === 'all' || booking.status === filters.status;
        const matchesPackageType = filters.packageType === 'all' || booking.wedding_type === filters.packageType;
        const matchesSearch = filters.search === '' ||
            booking.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            booking.wedding_type.toLowerCase().includes(filters.search.toLowerCase());

        // Date range filtering
        const bookingDate = new Date(booking.bookedAt);
        const now = new Date();
        let matchesDateRange = true;

        if (filters.dateRange === 'today') {
            matchesDateRange = bookingDate.toDateString() === now.toDateString();
        } else if (filters.dateRange === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            matchesDateRange = bookingDate >= weekAgo;
        } else if (filters.dateRange === 'month') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            matchesDateRange = bookingDate >= monthAgo;
        }

        return matchesStatus && matchesPackageType && matchesSearch && matchesDateRange;
    });

        //Create PDF
    const downloadPDF = async () => {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Add title and date
            pdf.setFontSize(16);
            pdf.text('Bookings Report', 20, 20);
            pdf.setFontSize(10);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

            // Add filter information
            let y = 40;
            if (filters.status !== 'all') {
                pdf.text(`Status: ${filters.status}`, 20, y);
                y += 10;
            }
            if (filters.dateRange !== 'all') {
                pdf.text(`Date Range: ${filters.dateRange}`, 20, y);
                y += 10;
            }
            if (filters.packageType !== 'all') {
                pdf.text(`Package Type: ${filters.packageType}`, 20, y);
                y += 10;
            }
            if (filters.search) {
                pdf.text(`Search: ${filters.search}`, 20, y);
                y += 10;
            }

            // Add table headers
            pdf.setFontSize(12);
            const headers = ['Package Type', 'Price', 'Email', 'Date', 'Status'];
            const columnWidths = [40, 30, 50, 30, 30];
            let x = 20;

            // Draw headers
            headers.forEach((header, i) => {
                pdf.text(header, x, y);
                x += columnWidths[i];
            });

            // Add table rows
            pdf.setFontSize(10);
            y += 10;

            filteredBookings.forEach(booking => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                    x = 20;
                    headers.forEach((header, i) => {
                        pdf.text(header, x, y);
                        x += columnWidths[i];
                    });
                    y += 10;
                }

                x = 20;
                const weddingType = String(booking.wedding_type || 'N/A');
                const price = String(booking.price ? `Rs. ${booking.price.toLocaleString()}` : 'N/A');
                const email = String(booking.email || 'N/A');
                const date = String(booking.bookedAt ? new Date(booking.bookedAt).toLocaleDateString() : 'N/A');
                const status = String(booking.status || 'N/A');

                pdf.text(weddingType, x, y);
                x += columnWidths[0];
                pdf.text(price, x, y);
                x += columnWidths[1];
                pdf.text(email, x, y);
                x += columnWidths[2];
                pdf.text(date, x, y);
                x += columnWidths[3];
                pdf.text(status, x, y);

                y += 10;
            });

            pdf.save('bookings-report.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    const handleSendEmail = async (schedule) => {
        setSelectedSchedule(schedule);
        setShowEmailModal(true);
    };

    const sendEmail = async () => {
        if (!selectedSchedule) {
            alert('No schedule selected');
            return;
        }

        // Get email from session storage
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

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            setUsers(users.filter(user => user._id !== userId));
            setStats(prev => ({
                ...prev,
                totalUsers: prev.totalUsers - 1
            }));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    //user pdf
    const downloadUsersPDF = async () => {
        try {
            // Show loading state
            toast.loading('Generating PDF...', { id: 'pdf-loading' });

            const element = document.getElementById('users-table');
            if (!element) {
                toast.error('Could not find users table');
                return;
            }

            // Create a container for the PDF content
            const pdfContainer = document.createElement('div');
            pdfContainer.style.padding = '20px';
            pdfContainer.style.backgroundColor = '#ffffff';

            // Add title and date
            const titleDiv = document.createElement('div');
            titleDiv.style.marginBottom = '20px';
            titleDiv.style.textAlign = 'center';
            titleDiv.innerHTML = `
                <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">Users List</h1>
                <p style="font-size: 14px; color: #666666;">Generated on: ${new Date().toLocaleDateString()}</p>
            `;
            pdfContainer.appendChild(titleDiv);

            // Clone the table and add it to the container
            const tableClone = element.cloneNode(true);
            tableClone.style.width = '100%';
            tableClone.style.borderCollapse = 'collapse';
            pdfContainer.appendChild(tableClone);

            // Add the container to the document temporarily
            document.body.appendChild(pdfContainer);

            // Generate canvas from the container
            const canvas = await html2canvas(pdfContainer, {
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
            document.body.removeChild(pdfContainer);

            // Save the PDF
            pdf.save('users-list.pdf');
            
            // Update toast to success
            toast.success('PDF downloaded successfully', { id: 'pdf-loading' });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF', { id: 'pdf-loading' });
        }
    };

    const downloadReport = async () => {
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
                <h1 style="font-size: 24px; margin-bottom: 10px; color: #000000;">Users Report</h1>
                <p style="font-size: 14px; color: #666666;">Generated on: ${new Date().toLocaleDateString()}</p>
            `;
            reportContainer.appendChild(titleDiv);

            // Add summary section
            const summaryDiv = document.createElement('div');
            summaryDiv.style.marginBottom = '20px';
            summaryDiv.style.padding = '15px';
            summaryDiv.style.backgroundColor = '#f8f9fa';
            summaryDiv.style.borderRadius = '5px';
            summaryDiv.innerHTML = `
                <h2 style="font-size: 18px; margin-bottom: 10px; color: #333;">Summary</h2>
                <p style="margin-bottom: 5px;">Total Users: ${users.length}</p>
                <p style="margin-bottom: 5px;">Active Users: ${users.filter(user => user.status === 'active').length}</p>
                <p>Report Generated: ${new Date().toLocaleString()}</p>
            `;
            reportContainer.appendChild(summaryDiv);

            // Add table
            const tableClone = document.getElementById('users-table').cloneNode(true);
            tableClone.style.width = '100%';
            tableClone.style.borderCollapse = 'collapse';
            tableClone.style.marginTop = '20px';
            reportContainer.appendChild(tableClone);

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
            pdf.save('users-report.pdf');
            
            // Update toast to success
            toast.success('Report downloaded successfully', { id: 'report-loading' });
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report', { id: 'report-loading' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <header className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transition-transform duration-300 ${
                isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                                Western Bliss Wedding
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/manage-reviews"
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                            >
                                <FaStar className="text-sm" />
                                <span>Manage Reviews</span>
                            </Link>
                            <Link
                                to="/schedule"
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                            >
                                <FaCalendarAlt className="text-sm" />
                                <span>Schedule</span>
                            </Link>
                            <Link
                                to="/admin"
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                            >
                                <FaBox className="text-sm" />
                                <span>Packages</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                            >
                                <FaSignOutAlt className="text-sm" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Bookings</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalBookings}</h3>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Packages</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalPackages}</h3>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Services</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalServices}</h3>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Users</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
                            </div>
                            <div className="bg-pink-100 p-3 rounded-full">
                                <FaUsers className="w-6 h-6 text-pink-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Users</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => downloadUsersPDF()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Download PDF
                            </button>
                            <button
                                onClick={() => downloadReport()}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Download Report
                            </button>
                            <Link
                                to="/adduser"
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                            >
                                <FaUserPlus className="text-sm" />
                                <span>Add User</span>
                            </Link>
                        </div>
                    </div>

                    <div id="users-table">
                        {isUsersLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.contactNumber || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.serviceName || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        to={`/updateuser/${user._id}`}
                                                        className="text-pink-600 hover:text-pink-900 mr-4"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this user?')) {
                                                                handleDeleteUser(user._id);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedules List */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Schedules</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {schedules.map((schedule) => (
                                    <tr key={schedule._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(schedule.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{schedule.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{schedule.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleSendEmail(schedule)}
                                                className="text-pink-600 hover:text-pink-900 flex items-center"
                                            >
                                                <FaEnvelope className="mr-1" />
                                                Send Email
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={downloadPDF}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select
                                name="dateRange"
                                value={filters.dateRange}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                            <select
                                name="packageType"
                                value={filters.packageType}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                            >
                                <option value="all">All Packages</option>
                                {[...new Set(bookings.map(b => b.wedding_type))].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search by email or type"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading bookings...</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto" ref={tableRef}>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.wedding_type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Rs. {booking.price.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(booking.bookedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsOverlayOpen(true);
                                                    }}
                                                    className="text-pink-600 hover:text-pink-900 flex items-center"
                                                >
                                                    <FaEye className="mr-1" />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Email Modal */}
            {showEmailModal && selectedSchedule && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Send Email</h3>
                        <p className="mb-4">Send email to: {sessionStorage.getItem('scheduleEmail')}</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <a
                                href={`mailto:${sessionStorage.getItem('scheduleEmail')}?subject=Schedule Update: ${selectedSchedule.title}&body=Your schedule for ${selectedSchedule.title} on ${new Date(selectedSchedule.date).toLocaleDateString()} at ${selectedSchedule.time} has been updated.`}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                                onClick={sendEmail}
                            >
                                Send
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Details Overlay */}
            <BookingDetailsOverlay
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                booking={selectedBooking}
                onUpdate={handleBookingUpdate}
                onDelete={handleBookingDelete}
            />
        </div>
    );
};

export default AdminDashboard;