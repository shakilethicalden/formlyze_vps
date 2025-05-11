'use client'
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import logoImg from '@/assets/images/logo/formlazy white logo.png'
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiLogOut, FiUser } from "react-icons/fi";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import usePublicAxios from '@/hooks/usePublicAxios';
import { FaUser, FaUserCircle } from 'react-icons/fa';
import useGetNotification from '@/hooks/notification/userGetNotification';
import { IoReload } from 'react-icons/io5';

const Navbar = () => {
    // Hooks and state
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);
    const session = useSession();
    const user = session?.data?.user;
    const publicAxios = usePublicAxios();
    const { data: notifications, refetch } = useGetNotification();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    // const forgerPassword = async () => {

    //     const resp = await publicAxios.post('/users/forgot-password/',{email:user?.email});
    //     console.log(resp,'resp');
    // }




    // Auto-refetch notifications every 3 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 3 * 60 * 1000); // 3 minutes in milliseconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [refetch]);

    // Handle logout functionality
    const handleLogout = async () => {
        try {
            const resp = await publicAxios.post('/users/logout/', null, {
                headers: { 'Authorization': `Token ${user?.token}` }
            });
            
            if(resp?.status === 200) {
                await signOut({ redirect: false });
                window.location.href = '/sign-in';
            }
        } catch (error) {
            console.error('Logout error:', error);
            await signOut({ redirect: false });
            window.location.href = '/sign-in';
        }
    };

    // Mark notification as read and delete it
    const markAsRead = async (id) => {
        try {
            await publicAxios.post(`/notification/read/${id}`, null, {
                headers: { 'Authorization': `Token ${user?.token}` }
            });
            refetch(); // Refetch notifications to update the list
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications?.filter(n => !n.read) || [];
            const promises = unreadNotifications.map(n => 
                publicAxios.post(`/notification/read/${n.id}`, null, {
                    headers: { 'Authorization': `Token ${user?.token}` }
                })
            );
            await Promise.all(promises);
            refetch();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    if(pathname.includes('/view-single-response') && !user){
        return null;
    }

    if(pathname.includes('/formView') && !user){
        return null;
    }

    if (pathname.includes('/sign-in') || pathname.includes('/sign-up') || pathname.includes('/frontend')  || pathname.includes('/reset-password') ) {
        return null;
    }

    // Calculate unread count
    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    return (
        <header className='flex custom-navbar-shadow font-outfit py-4 z-50 px-2 sticky top-0 md:px-8 mx-auto custom-bg-navbar items-center justify-between'>
            {/* Logo Section */}
            <div>
                <Link href={'/'} className='cursor-pointer mt-16 lg:mt-0 ml-32 lg:ml-0'>
                    <Image 
                        alt='FormLazy Logo' 
                        height={180} 
                        width={180} 
                        src={logoImg} 
                        className={`w-24 ${user ? '-mt-[24px]' : '-mt-[28px]'} lg:-mt-0 ml-16 lg:ml-0 lg:w-auto`}
                        priority
                    />
                </Link>
            </div>
            
            {/* Navigation Links */}
            <nav>
                {/* Navigation links commented out as per original */}
            </nav>
            
            {/* Icons Section */}
            {user ? (
                <div className='flex z-50 relative items-center gap-6'>
                    {/* Notification Button with Dropdown */}
                    <div className='relative' ref={notificationRef}>
                        <button 
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className='relative p-1'
                            aria-label='Notifications'
                        >
                            <IoIosNotificationsOutline className='text-[30px]  z-40 lg:text-[40px] text-white cursor-pointer hover:text-primary-200 transition-colors' />
                            {unreadCount > 0 && (
                                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className='absolute  -right-6 lg:right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-30 overflow-hidden border border-gray-200'>
                                <div className='p-4 border-b border-gray-100 flex justify-between items-center'>
                                    <h3 className='font-semibold text-gray-800'>Notifications</h3>
                                    <div className='flex items-center gap-2'>
                                        <button 
                                            onClick={() => refetch()}
                                            className='text-sm text-blue-500 hover:text-blue-700 flex items-center'
                                            aria-label='Refresh notifications'
                                        >
                                            <IoReload className='text-lg mr-1' />
                                            Refresh
                                        </button>
                                        <button 
                                            onClick={markAllAsRead}
                                            className='text-xs text-blue-500 hover:text-blue-700'
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                </div>
                                
                                <div className='max-h-96 overflow-y-auto'>
                                    {notifications?.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div 
                                                key={notification.id}
                                                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                            >
                                                <div className='flex items-start gap-3'>
                                                    <span className='text-xl mt-1'>📝</span>
                                                    <div className='flex-1'>
                                                        <div className='flex justify-between items-start'>
                                                            <div>
                                                                <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                    Form Submission
                                                                </h4>
                                                                <p className='text-sm text-gray-600 mt-1'>{notification.message}</p>
                                                                <p className='text-xs text-gray-400 mt-2'>
                                                                    {new Date(notification.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className='text-xs text-blue-500 hover:text-blue-700 font-medium'
                                                                >
                                                                    Mark as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='px-4 py-6 text-center text-gray-500'>
                                            No notifications available
                                        </div>
                                    )}
                                </div>
                                
                                {/* <div className='p-3 border-t border-gray-100 text-center'>
                                    <Link 
                                        href="/notifications" 
                                        className='text-sm text-blue-500 hover:text-blue-700 font-medium'
                                        onClick={() => setIsNotificationOpen(false)}
                                    >
                                        View all notifications
                                    </Link>
                                </div> */}
                            </div>
                        )}
                    </div>
                    
                    {/* Profile Dropdown */}
                    <div className='relative' ref={profileRef}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className='flex items-center gap-1 focus:outline-none'
                            aria-label='User profile'
                        >
                            <FaUserCircle className='text-[30px] lg:text-[40px] text-white hover:text-primary-200 cursor-pointer transition-colors' />
                        </button>
                        
                        {isProfileOpen && (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-100'>
                                <div className='py-1'>
                                    <div className='px-4 py-3 border-b border-gray-100'>
                                        <p className='text-sm font-medium text-gray-800'>{user?.username}</p>
                                        <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
                                        {/* <p 
                                        
                                        onClick={forgerPassword}
                                        className='text-xs cursor-pointer text-gray-500 truncate'>Forget password</p> */}
                                   
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className='w-full flex cursor-pointer items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                                    >
                                        <FiLogOut className='mr-3 text-gray-500' />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className='flex items-center '>
                    <Link 
                        href="/sign-in" 
                        className='px-5 py-2.5 rounded-md border-[#1A1466] text-white font-medium rounded-r-none border-r-0 hover:bg-opacity-10 transition-colors whitespace-nowrap border btn-primary  border-opacity-20'
                    >
                        Log in
                    </Link>
                    
                    <Link 
                        href="/sign-up" 
                        className='px-5 py-2.5 border-[#1A1466] rounded-md rounded-l-none  font-medium bg-third text-[#1A1466] hover:bg-opacity-90 transition-colors whitespace-nowrap shadow-md'
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </header>
    );
};

export default Navbar;