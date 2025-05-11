'use client'
import Image from 'next/image';
import React from 'react';
import logoImg from '@/assets/images/logo/formlazy white logo.png'

import { IoIosNotificationsOutline } from "react-icons/io";

import { FaRegCircleUser } from "react-icons/fa6";


import Link from 'next/link';
import { usePathname } from 'next/navigation';
const FrontNavbar = () => {
    const pathname = usePathname();
    // if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
    //     return null;
    // }if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
    // return null;
    // }

    // if (pathname.includes('/frontend') || pathname.includes('/sign-up')) {
    //     return null;
    //     }

    return (
        <div className='flex font-outfit py-4 z-40 px-4 sticky  top-0 md:px-8 mx-auto bg-[#0A0018] items-center justify-between'>
     
     {/* logo */}
      <section>

<Image alt='logo' height={180} width={180} src={logoImg}/>
      </section>
      <section>
<ul className='text-white flex gap-8'>

    <Link href={'/'}>Home</Link>
    <Link href={'/how-its-works'}>{`How it's Work`}</Link>
    
    <Link href={'/feature'}>Feature</Link>
    <Link href={'/templates'}>Templates</Link>
    <Link href={'/pricing'}>Pricing</Link>
    <Link href={'/my-form'}>My Form</Link>
</ul>

      </section>
      <section className='flex items-center justify-between '>

      {/* <IoIosNotificationsOutline className='text-[40px] text-white font-semibold' />
      <FaRegCircleUser  className='text-[40px] text-white '/> */}

      <div className='border-2 border-[#1A1466] pl-8  rounded-md flex gap-4'>
        <button className='text-white'>
            Log in
        </button>

        <button className='btn-primary rounded-md py-3 px-6'>
            Sign UP
        </button>
      </div>
      </section>
        </div>
    );
};

export default FrontNavbar;