import React from 'react';
import img from '@/assets/images/home/Annotations.png'
import Image from 'next/image';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa6';

const HomePage = () => {
    return (
        <div className=' mt-24  min-h-screen flex justify-center py-20 flex-col'>
           
<Image alt='image' src={img} className='mx-auto text-center'/>

 <Link href={'/create-form'} className='btn-primary gap-2 cursor-pointer flex items-center w-[200px] mx-auto rounded-[10px] whitespace-nowrap px-6 py-3 '>
          <FaPlus/>  Create a new form
        </Link>
        </div>
    );
};

export default HomePage;