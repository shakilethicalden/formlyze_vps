import React from 'react';
import Favorites from '../pages/favorites/favorites';


const page = () => {
    return (
      <div className='w-full overflow-x-scroll'>
                 <div className='max-w-screen mx-auto'>
                 <Favorites/>                            
                 </div>
             </div>
    );
};

export default page;