'use client'
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { IoIosSearch } from 'react-icons/io';

const SubNavbar = () => {
    const session = useSession();
    const pathname = usePathname();
    const user = session?.data?.user;

    if (pathname.includes('/formView') && !user) {
        return null;
    }
    if (pathname.includes('/view-single-response') && !user) {
        return null;
    }

    if (pathname.includes('/sign-in') || pathname.includes('/sign-up') || pathname.includes('/reset-password') || pathname.includes('/forgot-password')) {
        return null;
    }
    
    if (pathname.includes('/frontend')) {
        return null;
    }

    return (
        <div className=''>
            <div className='px-4 bg-white z-30 flex justify-between items-center py-6 border-b fixed w-full border-[#00000059]'>
                {/* Left section - can be empty or contain other elements */}
                <section className='flex-1'></section>
                
                {/* Search section - aligned to the right */}
                <section className='flex justify-end lg:mr-72'>
                    <div className="relative">
                        <input
                            className="px-4 text-[#1A1466] placeholder:text-[#1A1466] border-primary py-2 border border-border rounded-[10px] w-[300px] pl-[40px] outline-none focus:border-[#1A1466]"
                            placeholder="Search my form" 
                        />
                        <IoIosSearch className="absolute top-[9px] left-2 text-[1.5rem] rounded-md text-[#adadad]"/>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SubNavbar;