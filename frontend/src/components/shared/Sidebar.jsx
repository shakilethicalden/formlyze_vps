'use client'

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useState, Suspense } from 'react';
import { FaPlus, FaTrash, FaArchive, FaStar, FaQuestionCircle, FaShieldAlt } from 'react-icons/fa';
import { 
    MdOutlineKeyboardArrowDown, 
    MdOutlineKeyboardArrowRight,
    MdDashboard,
    MdFormatListBulleted,
    MdLibraryBooks
} from "react-icons/md";
import { HiTemplate } from 'react-icons/hi';
import { BiSupport } from 'react-icons/bi';
import { useSession } from 'next-auth/react';
import { IoCheckboxOutline, IoClose } from 'react-icons/io5';
import { template } from '@/data/template/template';
import { IoIosMenu } from 'react-icons/io';

const SidebarContent = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [openMenu, setOpenMenu] = useState(null);
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenuIcon = () => {
        setShowMenu(!showMenu);
    }

    const toggleMenu = (idx) => {
        setOpenMenu(prev => prev === idx ? null : idx);
    };

    const session = useSession();
    const user = session?.data?.user;

    if(pathname.includes('/formView') && !user){
        return null;
    }

    if(pathname.includes('/view-single-response') && !user){
        return null;
    }

    if(pathname.includes('/sign-in') || pathname.includes('/sign-up')   || pathname.includes('/reset-password') || pathname.includes('/forgot-password')){
        return null;}

    // Get unique categories from templates
    const categories = [...new Set(
        template
            .map(item => item.category)
            .filter(cat => cat != null && cat !== 'Classic-form') 
    )].sort();

    const isActive = (path) => {
        const [basePath, queryString] = path.split('?');
        
        // Check if base path matches
        if (pathname !== basePath) return false;
        
        // If there's a query string, check those params
        if (queryString) {
            const queryParams = new URLSearchParams(queryString);
            
            // Check each query parameter
            for (const [key, value] of queryParams.entries()) {
                if (searchParams.get(key) !== value) {
                    return false;
                }
            }
        }
        
        return true;
    };

    const menu = [
        { 
            id: 1,
            menuName: 'My All Form',
            link: '/my-all-form',
            icon: <MdDashboard className="text-lg" />
        },
        { 
            id: 2,
            menuName: 'Template',
            link: '/template',
            icon: <HiTemplate className="text-lg" />,
            submenu: [
                {
                    menuName: 'Classic Form',
                    link: '/classic-form?category=all',
                    icon: <MdFormatListBulleted className="text-sm" />
                },
                ...categories.map(category => ({
                    menuName: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
                    link: `/classic-form?category=${category}`,
                    icon: <MdFormatListBulleted className="text-sm" />
                }))
            ]
        },
        { 
            id: 4,
            menuName: 'Favorites',
            link: '/favorites',
            icon: <FaStar className="text-lg" />
        },
        {
            id: 5,
            menuName: 'Archive',
            link: '/archive',
            icon: <FaArchive className="text-lg" />
        },
        {
            id: 6,
            menuName: 'Trash',
            link: '/trash',
            icon: <FaTrash className="text-lg" />
        },
    ];

    return (
        <>
            {!showMenu ? (
                <div className='fixed duration-1000 top-1 left-0 z-50 lg:hidden  h-[60px] flex items-center justify-between px-4'>
                    <IoIosMenu 
                        onClick={toggleMenuIcon}
                        className='text-5xl'
                    />
                </div>
            ) : (  
                <div className='fixed top-1 duration-1000 z-50 left-0  lg:hidden  h-[60px] flex items-center justify-between px-4'>
                    <IoClose
                        onClick={toggleMenuIcon}
                        className='text-5xl'
                    />
                </div>
            )}
            
            <div className={`
                inset-y-0 fixed ${user ? 'mt-[66px] xl:[66.5px]' : 'mt-[81.5px] '} lg:mt-[84px] left-0 z-40
                w-[240px] lg:w-[240px]
                bg-third
                flex flex-col
                transform transition-all duration-300 ease-in-out
                ${showMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${showMenu ? 'opacity-100' : 'opacity-0 lg:opacity-100'}
            `}>
                {/* Fixed header section */}
                <div className='px-7 py-[20.5px] bg-third'>
                    <Link href={'/create-form'} className='btn-primary gap-2 cursor-pointer flex items-center text-sm m rounded-[10px] px-6 py-3 w-full'>
                        <FaPlus className="text-white" />  
                        <span className="text-white whitespace-nowrap">Create a new form</span>
                    </Link>
                    <div className='border-b border-[#00000059] mt-[17.5px] xl:mt-[18.5px] left-0 w-full absolute z-50 h-1'></div>
                </div>

                {/* Scrollable content section */}
                <div className='flex-1 overflow-y-auto px-7'>
                    <div className='mr-2 mt-4 text-gray-700 space-y-1'>
                        {menu.map((menuItem, idx) => (
                            menuItem.submenu ? 
                                <div key={idx} className=''>
                                    <li
                                        onClick={() => toggleMenu(menuItem.id)}
                                        className={`items-center flex font-semibold w-[185px]   px-2 py-2 rounded transition-colors cursor-pointer ${
                                            isActive(menuItem.link) || 
                                            menuItem.submenu.some(sub => isActive(sub.link)) 
                                                ? 'menu-bg' 
                                                : 'hover-menu-bg'
                                        }`}
                                    >
                                        <span className="mr-3">{menuItem.icon}</span>
                                        {menuItem.menuName}
                                        <span className="ml-auto">
                                            {openMenu === menuItem.id ? 
                                                <MdOutlineKeyboardArrowDown className='font-semibold text-xl'/> : 
                                                <MdOutlineKeyboardArrowRight className='font-semibold text-xl'/>
                                            }
                                        </span>
                                    </li>

                                    {openMenu === menuItem.id && menuItem.submenu.map((Item, idx) => (
                                        <Link href={Item.link} key={idx}>
                                            <div className={`flex items-center gap-2 pl-[35px] py-2 transition-colors ${
                                                isActive(Item.link) ? 'menu-bg' : 'hover:bg-opacity-80 hover-menu-bg'
                                            }`}>
                                                <span className="text-gray-900">
                                                    <IoCheckboxOutline />    
                                                </span>
                                                <p className="text-sm">{Item.menuName}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            :  
                            <Link 
                                href={menuItem.link} 
                                key={idx}
                                className={`flex items-center font-semibold px-2 py-2 w-[185px] rounded transition-colors ${
                                    isActive(menuItem.link) ? 'menu-bg' : 'hover-menu-bg'
                                }`}
                            >
                                <span className="mr-3">{menuItem.icon}</span>
                                {menuItem.menuName}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

const Sidebar = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SidebarContent />
        </Suspense>
    );
};

export default Sidebar;