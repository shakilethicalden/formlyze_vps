'use client'
import Link from 'next/link';
import React, { useState } from 'react';
import { FiBell, FiCheck, FiChevronLeft, FiFilter, FiSearch } from 'react-icons/fi';


const Notification = () => {
    // Sample notification data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'New form submission',
            message: 'You have received a new submission on your "Contact Us" form from john.doe@example.com',
            time: '10 minutes ago',
            read: false,
            icon: '📝',
            category: 'submission'
        },
        {
            id: 2,
            title: 'Weekly report ready',
            message: 'Your weekly analytics report for March 1-7 is now available',
            time: '2 hours ago',
            read: false,
            icon: '📊',
            category: 'report'
        },
        {
            id: 3,
            title: 'Account updated',
            message: 'Your profile information has been updated successfully',
            time: '1 day ago',
            read: true,
            icon: '✅',
            category: 'account'
        },
        {
            id: 4,
            title: 'Payment received',
            message: 'Your subscription payment of $9.99 has been processed',
            time: '2 days ago',
            read: true,
            icon: '💳',
            category: 'payment'
        },
        {
            id: 5,
            title: 'New feature available',
            message: 'Try our new form analytics dashboard with advanced insights',
            time: '3 days ago',
            read: true,
            icon: '✨',
            category: 'feature'
        },
    ]);

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter notifications based on active filter and search query
    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = activeFilter === 'all' || notification.category === activeFilter;
        const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             notification.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Mark notification as read
    const markAsRead = (id) => {
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({
            ...notification,
            read: true
        })));
    };

    // Get unique categories for filter
    const categories = ['all', ...new Set(notifications.map(n => n.category))];

    return (
        <div className="min-h-screen mt-28  ">
            {/* Header */}
            {/* <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <FiChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiBell className="mr-2" /> Notifications
                        </h1>
                    </div>
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Mark all as read
                    </button>
                </div>
            </header> */}

            {/* Main Content */}
            <main className=" mx-auto px-4 py-6">
                {/* Search and Filter */}
                {/* <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveFilter(category)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                    activeFilter === category 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Notifications List */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {filteredNotifications.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredNotifications.map(notification => (
                                <li 
                                    key={notification.id} 
                                    className={`px-4 py-4 hover:bg-gray-50 transition-colors ${
                                        !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-1 text-xl">
                                            {notification.icon}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm font-medium ${
                                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <button 
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                        title="Mark as read"
                                                    >
                                                        <FiCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-12 text-center">
                            <FiBell className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchQuery || activeFilter !== 'all' 
                                    ? "Try changing your search or filter criteria" 
                                    : "You're all caught up!"}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notification;