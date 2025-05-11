import React from 'react';

const Banner = () => {
    return (
        <div className="bg-[#0A0018] relative  flex items-center justify-center">
            {/* Overlay */}
            <div className="overlay absolute"></div>

            {/* Hero Section */}
            <section className="relative z-10 text-white text-center">
                <div className="w-full flex flex-col items-center px-4 py-16 md:w-[60%] mx-auto md:py-40 ">
                    <h1 className="text-4xl font-bold leading-none sm:text-5xl 
               bg-gradient-to-r from-[#CCCAEC] to-[#8886CD] 
               bg-clip-text text-transparent">
                      Simplify Data <br />
                      Collection with fromlzye
                    </h1>
                    <p className="px-8 mt-6 mb-12 text-lg">
                    Effortlessly create, share, and analyze forms with fromlzye. Whether for surveys, registrations, or feedback, our intuitive platform makes data collection seamless and efficient.!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-3 text-lg font-semibold rounded btn-primary cursor-pointer">
                        Request a Call
                        </button>
                        <button className="px-8 py-3 text-lg border border-[#1A1466] rounded-md cursor-pointer text-white ">
                        Get Start it's Free
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Banner;
