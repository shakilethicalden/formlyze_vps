import { usePathname } from 'next/navigation';
import React from 'react';

const DashBoardLayout = () => {

     const pathname = usePathname();
        if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
            return null;
        }if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
        return null;
        }
    return (
        <div>
         <div className="flex justify-between">
<Sidebar/>
<div className="flex-1 relative">
<SubNavbar/>
<div className=" mt-24 overflow-y-auto h-[calc(100vh-12rem)]">
{children}
</div>
</div>

</div>   
        </div>
    );
};

export default DashBoardLayout;