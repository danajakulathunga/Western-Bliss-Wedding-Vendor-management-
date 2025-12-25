import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaPlus, FaList, FaHome, FaUsers, FaHeart, FaBuilding, FaTshirt, FaCar, FaGem, FaMusic, FaUtensils, FaCalendarAlt, FaCamera, FaGift, FaGlassCheers, FaBox } from 'react-icons/fa';
import weddingLogo from '../../assets/logo.png';

const Sidebar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-rose-300 via-pink-200 to-rose-300 text-gray-800 p-6 flex flex-col shadow-lg overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-30">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-pink-700">
                    <path d="M50,0 C55,30 70,50 100,50 C70,55 55,70 50,100 C45,70 30,55 0,50 C30,45 45,30 50,0"></path>
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-pink-700">
                    <path d="M50,0 C55,30 70,50 100,50 C70,55 55,70 50,100 C45,70 30,55 0,50 C30,45 45,30 50,0"></path>
                </svg>
            </div>

            {/* Logo Section - with centered title */}
            <div className="flex flex-col items-center mb-8 relative w-full">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent top-0"></div>
                <img src={weddingLogo} alt="Western Bliss Wedding" className="w-24 h-24 mb-3 mt-4 drop-shadow-md" />
                <div className="text-center w-full">
                    <h2 className="text-3xl font-script text-pink-800 font-bold">Western Bliss Wedding</h2>
                    <p className="text-2 text-pink-600 italic mt-1">Your perfect day awaits</p>
                </div>
                <div className="mt-3 w-full flex items-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
                    <FaHeart className="mx-2 text-pink-500" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-400 to-transparent"></div>
                </div>
            </div>

            {/* Sidebar Menu */}
            <ul className="space-y-3 flex-1 overflow-y-auto">
                <li>
                    <Link to="/dashboard" className="flex items-center space-x-3 text-gray-700 hover:text-pink-800 p-3 bg-gradient-to-l from-rose-300 to-pink-200 bg-opacity-60 rounded-lg hover:bg-white hover:bg-opacity-80 transition-all duration-200 border-l-4 border-pink-400 group">
                        <div className="p-2 bg-white bg-opacity-70 rounded-full group-hover:bg-pink-100 transition-all">
                            <FaHome className="text-pink-600" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                </li>

                <li>
                    <Link to="/packages" className="flex items-center space-x-3 text-gray-700 hover:text-pink-800 p-3 bg-gradient-to-l from-rose-300 to-pink-200 bg-opacity-60 rounded-lg hover:bg-white hover:bg-opacity-80 transition-all duration-200 border-l-4 border-pink-400 group">
                        <div className="p-2 bg-white bg-opacity-70 rounded-full group-hover:bg-pink-100 transition-all">
                            <FaBox className="text-pink-600" />
                        </div>
                        <span className="font-medium">Packages</span>
                    </Link>
                </li>

                <li>
                    <div
                        className="flex items-center justify-between cursor-pointer p-3 bg-gradient-to-l from-rose-300 to-pink-200 bg-opacity-60 rounded-lg hover:bg-white hover:bg-opacity-80 transition-all duration-200 border-l-4 border-pink-400 group"
                        onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white bg-opacity-70 rounded-full group-hover:bg-pink-100 transition-all">
                                <FaHeart className="text-pink-600" />
                            </div>
                            <span className="font-medium">My Services</span>
                        </div>
                        {dropdownOpen ? <FaChevronUp className="text-pink-600" /> : <FaChevronDown className="text-pink-600" />}
                    </div>

                    {/* My Services Dropdown */}
                    {dropdownOpen && (
                        <ul className="ml-7 mt-2 space-y-2 border-l-2 border-pink-300 pl-2">
                            <li>
                                <Link
                                    to="/add-service"
                                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-pink-800 transition-all duration-200 group">
                                    <span className="h-6 w-6 flex items-center justify-center bg-pink-100 rounded-full group-hover:bg-pink-200 transition-all">
                                        <FaPlus className="text-pink-500 text-xs" />
                                    </span>
                                    <span>Add New Service</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-pink-800 transition-all duration-200 group">
                                    <span className="h-6 w-6 flex items-center justify-center bg-pink-100 rounded-full group-hover:bg-pink-200 transition-all">
                                        <FaList className="text-pink-500 text-xs" />
                                    </span>
                                    <span>Added Services</span>
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>

            <div className="mt-auto pt-6">
                <div className="p-4 bg-gradient-to-l from-rose-300 to-pink-200 bg-opacity-100 rounded-lg shadow-sm relative overflow-hidden">
                    <div className="absolute -top-1 -right-1">
                        <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current text-pink-500 opacity-20">
                            <path d="M20,0 C22,10 28,18 38,20 C28,22 22,28 20,38 C18,28 12,22 2,20 C12,18 18,10 20,0"></path>
                        </svg>
                    </div>
                    <div className="absolute -bottom-1 -left-1">
                        <svg width="30" height="30" viewBox="0 0 30 30" className="fill-current text-pink-500 opacity-20">
                            <path d="M15,0 C16.5,7.5 21,13.5 28.5,15 C21,16.5 16.5,21 15,28.5 C13.5,21 9,16.5 1.5,15 C9,13.5 13.5,7.5 15,0"></path>
                        </svg>
                    </div>
                    <div className="flex items-center mb-2">
                        <div className="h-px flex-1 bg-pink-400"></div>
                        <FaGlassCheers className="mx-2 text-pink-500" />
                        <div className="h-px flex-1 bg-pink-400"></div>
                    </div>
                    <p className="text-sm text-center text-pink-700 italic relative z-10">"Every love story is beautiful, but yours should be unique."</p>
                    <div className="flex items-center mt-2">
                        <div className="h-px flex-1 bg-pink-400"></div>
                        <FaHeart className="mx-2 text-pink-500" />
                        <div className="h-px flex-1 bg-pink-400"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;