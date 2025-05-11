'use client'
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import formImg from '@/assets/images/myform/classic.png';
import Image from 'next/image';
import { template } from '@/data/template/template';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const ClassicFormContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [templates, setTemplates] = useState(template);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Memoize categories to prevent recreation on every render
    const categories = useMemo(() => ['all', ...new Set(
        template
            .map(item => item.category)
            .filter(cat => cat != null)
    )].sort(), []);

    // Handle category change
    const handleCategoryChange = (category) => {
        setFilter(category);
        setCurrentPage(1);
        
        // Update URL without page reload
        const params = new URLSearchParams(searchParams);
        if (category === 'all') {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // Get initial category from URL params
    useEffect(() => {
        const categoryFromParams = searchParams.get('category');
        if (categoryFromParams && categories.includes(categoryFromParams)) {
            setFilter(categoryFromParams);
        }
    }, [searchParams, categories]);

    // Filter and search logic
    useEffect(() => {
        let filtered = template;
        
        // Apply category filter if it's not 'all'
        if (filter && filter !== 'all') {
            filtered = filtered.filter(item => item.category === filter);
        }
        
        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(query) || 
                (item.category && item.category.toLowerCase().includes(query))
            );
        }
        
        setTemplates(filtered);
    }, [filter, searchQuery]);

    // Calculate pagination
    const totalPages = Math.ceil(templates.length / itemsPerPage);
    const currentTemplates = templates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formData = [
        {
            img: formImg,
            heading: 'New patient Registration Form',
            description: 'A New Customer Registration Form is a form template designed to streamline the process of collecting personal and contact information'
        },
    ];

    return (
        <div className='lg:px-8 px-4 lg:pr-8 mt-28  '>
            {/* Search and Filter Container */}
            <div className='flex flex-col md:flex-row gap-4 mb-8 p-4 bg-third rounded-lg shadow-sm'>
                {/* Search Input */}
                <div className='flex-1 text-black'>
                    <input
                        type='text'
                        placeholder='Search by name or category...'
                        className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A1466]'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {/* Filter Select and Button */}
                <div className='flex gap-2'>
                    <select 
                        className='p-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A1466]'
                        value={filter}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                        {categories.map((category, idx) => (
                            <option key={idx} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                    <button 
                        className='bg-[#1A1466] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors'
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div>
                <section className='custom-grid gap-8'>
                    {currentTemplates.length > 0 ? (
                        currentTemplates.map((data, idx) => (
                            <div key={idx} className='mt-4 space-y-2.5 custom-shadow px-3 py-4 bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
                                <Image 
                                    src={formData[0].img} 
                                    alt={data.title} 
                                    className='flex w-full justify-center text-center mx-auto' 
                                />
                                <h1 className='text-primary text-xl h-[50px] font-semibold'>
                                    {data.title.slice(0, 32)}{data.title.length > 32 ? '..' : ''}
                                </h1>
                                <p className='text-[#000000] h-24 text-[16px]'>
                                    {data.description.slice(0,100)}
                                </p>
                                <button className='bg-gray-300 dark:bg-gray-300 text-black px-6 w-full py-2 rounded-md cursor-pointer hover:bg-[#1A1466] hover:text-white duration-300 mt-4'>
                                    <Link className='w-full' href={`/create-form/?id=${data.id}`}>
                                        Use Template
                                    </Link>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className='col-span-full text-center py-10'>
                            <p className='text-xl text-gray-500'>No templates found matching your criteria</p>
                        </div>
                    )}
                </section>

                {/* Pagination Controls */}
                {templates.length > 0 && (
                    <div className="flex justify-center mt-8 mb-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border bg-primary rounded-md disabled:opacity-50"
                            >
                           {'<<'}
                            </button>
                            
                            {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 text-sm md:text-lg py-2 border rounded-md ${
                                            currentPage === pageNum ? 'bg-[#1A1466] text-white' : 'text-black'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border bg-primary rounded-md disabled:opacity-50"
                            >
                                {">>"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom responsive styling */}
            <style jsx>{`
                .custom-grid {
                    display: grid;
                    grid-template-columns: repeat(1,1fr);
                }

                @media (min-width: 900px) {
                    .custom-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .custom-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (min-width: 1280px) {
                    .custom-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (min-width: 1680px) {
                    .custom-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};


const ClassicForm = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClassicFormContent />
        </Suspense>
    );
};


export default ClassicForm;