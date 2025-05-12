import ErrorPage from '@/components/shared/ErrorPage';
import LoadingPage from '@/components/shared/Loader';
import NoDataAvailable from '@/components/shared/NoDataAvailable';
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { FiSearch, FiChevronDown, FiClock, FiMail, FiGrid, FiList, FiEye, FiDownload } from 'react-icons/fi';

import ExcelJS from 'exceljs';
import usePublicAxios from '@/hooks/usePublicAxios';
import { redirect } from 'next/dist/server/api-utils';

const Response = ({ data = [], isLoading, error, title,id }) => {
    // State hooks
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [viewMode, setViewMode] = useState('card');
    const [showExportButton, setShowExportButton] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile device
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show export button only when data is available
    useEffect(() => {
        setShowExportButton(data && data.length > 0);
    }, [data]);

    // Auto search on mobile when typing
    useEffect(() => {
        if (isMobile && searchTerm) {
            setShowSearchResults(true);
        } else if (isMobile && !searchTerm) {
            setShowSearchResults(false);
        }
    }, [searchTerm, isMobile]);

    const publicAxios = usePublicAxios();

    const exportToExcel = async () => {
        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `https://formlyze.mrshakil.com/api/form/response/${id}/export/`;
        document.body.appendChild(iframe);
        
        // Remove the iframe after a short delay
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Memoized filtered and sorted data
    const filteredResponses = useMemo(() => {
        if (showSearchResults) {
            return data.filter(response => 
                response?.responder_email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return data;
    }, [data, searchTerm, showSearchResults]);

    const sortedResponses = useMemo(() => {
        return [...filteredResponses].sort((a, b) => {
            const dateA = new Date(a?.created_at);
            const dateB = new Date(b?.created_at);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [filteredResponses, sortOrder]);

    const tableData = useMemo(() => {
        return sortedResponses.map((item, index) => ({
            id: item?.id || index + 1,
            email: item?.responder_email,
            submitted_at: formatDate(item?.created_at),
            originalDate: item?.created_at
        }));
    }, [sortedResponses]);

    // DataTable custom styles
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#1A1466',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
            },
        },
        headCells: {
            style: {
                paddingLeft: '6px',
                paddingRight: '6px',
                '&:first-of-type': {
                    paddingLeft: '12px',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '0.875rem',
                '&:first-of-type': {
                    paddingLeft: '24px',
                },
            },
        },
        rows: {
            style: {
                '&:not(:last-of-type)': {
                    borderBottom: '1px solid #e5e7eb',
                },
                '&:hover': {
                    backgroundColor: '#f9fafb',
                },
            },
        },
        pagination: {
            style: {
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                borderTop: '1px solid #e5e7eb',
            },
        },
    };

    // DataTable columns configuration
    const columns = [
        {
            name: '#',
            selector: row => tableData.findIndex(item => item.id === row.id) + 1,
            sortable: true,
            width: '80px',
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            width: '250px',
            cell: row => (
                <div className="flex items-center gap-2">
                    <FiMail className="text-primary" size={14} />
                    <span className="truncate">{row.email}</span>
                </div>
            ),
            style: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            },
        },
        {
            name: 'Submitted At',
            selector: row => row.originalDate,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-2">
                    <FiClock className="text-primary" size={14} />
                    {row.submitted_at}
                </div>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <Link 
                    href={`/view-single-response/${row.id}`}
                    className="flex items-center gap-2 text-primary hover:text-primary-dark btn-primary p-2 rounded transition-colors"
                >
                    <FiEye size={16} />
                    <span>View Details</span>
                </Link>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px',
        }
    ];

    // Search handlers
    const handleSearch = () => {
        setShowSearchResults(true);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setShowSearchResults(false);
    };

    // Loading and error states
    if (isLoading) return <LoadingPage />;
    if (error) return <ErrorPage message='Something went wrong...please refresh this page' />;
    if (!data || data.length === 0) return <NoDataAvailable message='No responses yet!' />;

    return (
        <div className=" mt-28 px-4 lg:px-16 py-8">
            {/* Header Section */}
            <div className="flex flex-col mb-8">
                <div className='flex items-center justify-between'>
                    <h1 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                        Responses for: <span className="text-primary">{title}</span>
                    </h1>

                    {showExportButton && (
                        <button 
                            onClick={exportToExcel}
                            className='btn-primary text-sm lg:text-lg  cursor-pointer p-3 rounded flex whitespace-nowrap items-center gap-2'
                        >
                            <FiDownload /> Export as Excel
                        </button>
                    )}
                </div>
                <p className="text-gray-900 mb-6">{data.length} total responses</p>
                
                {/* Controls Section */}
                <div className="flex flex-col justify-between sm:flex-row gap-4 w-full">
                    {/* View Mode Toggle */}
                    <div className="flex gap-2 mr-16">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`flex cursor-pointer whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg border ${viewMode === 'card' ? 'btn-primary' : 'bg-transparent border-[#1A1466] text-black'}`}
                        >
                            <FiGrid /> Card View
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex cursor-pointer whitespace-nowrap items-center gap-2 px-4 xl:py-2 rounded-lg border ${viewMode === 'table' ? 'btn-primary' : 'bg-transparent border-[#1A1466] text-black'}`}
                        >
                            <FiList /> Table View
                        </button>
                    </div>
                    
                    {/* Desktop Search and Sort */}
                    {!isMobile && (
                        <>
                            {/* Search with Button */}
                            <div className="hidden xl:flex gap-2">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by email..."
                                        className="pl-10 pr-4 py-2 w-full border border-[#1A1466] text-black placeholder:text-black rounded-lg focus:outline-none transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <button 
                                    onClick={handleSearch}
                                    className="btn mr-2 btn-primary cursor-pointer px-4 py-2 rounded-lg"
                                >
                                    Search
                                </button>
                                {showSearchResults && (
                                    <button 
                                        onClick={handleClearSearch}
                                        className="btn bg-red-700 px-4 py-2 cursor-pointer rounded-lg text-white hover:bg-red-400 transition"
                                    >
                                        Clear
                                    </button>
                                )}


                            </div>
                            
                            {/* Dropdown Sort */}
                            <div className="relative w-[200px] md:w-auto whitespace-nowrap">
                                <button 
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-black transition w-full md:w-auto"
                                >
                                    <FiClock />
                                    {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                    <FiChevronDown className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isSortOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setSortOrder('newest');
                                                    setIsSortOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'newest' ? 'bg-primary-50 whitespace-nowrap text-primary' : 'text-black'}`}
                                            >
                                                Newest First
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortOrder('oldest');
                                                    setIsSortOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'oldest' ? 'bg-primary-50 text-primary' : 'text-black'}`}
                                            >
                                                Oldest First
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Search and Sort */}
                {isMobile && (
                    <div className="flex  md:flex-row gap-4 mt-4 w-full">
                        {/* Search Bar - Auto search on mobile */}
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                className="pl-10 pr-4 py-2 w-full border border-[#1A1466] text-black placeholder:text-black rounded-lg focus:outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* Sort Dropdown - Moved to the left on mobile */}
                        <div className="relative  text-sm md:text-lg md:w-auto">
                            <button 
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex items-center  gap-2 px-4 py-[10.5px] md:py-2 bg-gray-100 rounded-lg text-sm md:text-lg hover:bg-gray-200 text-black transition w-full"
                            >
                                <FiClock />
                                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                <FiChevronDown className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isSortOpen && (
                                <div className="absolute text-sm md:text-lg left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setSortOrder('newest');
                                                setIsSortOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'newest' ? 'bg-primary-50 text-sm md:text-lg whitespace-nowrap text-primary' : 'text-black'}`}
                                        >
                                            Newest First
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSortOrder('oldest');
                                                setIsSortOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'oldest' ? 'bg-primary-50 text-sm md:text-lg text-primary' : 'text-black'}`}
                                        >
                                            Oldest First
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Response Display */}
            {sortedResponses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-900 text-lg">No responses found matching your search</p>
                    <button 
                        onClick={handleClearSearch}
                        className="mt-4 text-primary hover:underline"
                    >
                        Clear search and show all
                    </button>
                </div>
            ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {sortedResponses.map((response, idx) => (
                        <div 
                            key={idx} 
                            className="bg-[#0C0A2B] rounded-lg shadow-md p-6 transition-all duration-300 flex flex-col hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary-100 p-3 rounded-full">
                                    <FiMail className="text-primary text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-100 line-clamp-1">
                                        {response.responder_email}
                                    </h3>
                                    <p className="text-sm text-gray-100">
                                        Response #{sortedResponses.length - idx}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-100 flex items-center gap-1">
                                        <FiClock size={14} />
                                        {formatDate(response.created_at)}
                                    </span>
                                    <Link 
                                        href={`/view-single-response/${response.id}`}
                                        className="btn btn-primary text-sm px-3 py-3 cursor-pointer rounded-md"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white max-w-[calc(100vw-20px)] rounded-lg shadow-md overflow-scroll">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        customStyles={customStyles}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50]}
                        highlightOnHover
                        pointerOnHover
                        responsive
                        noDataComponent={
                            <div className="py-8 text-center text-gray-500">
                                No responses found matching your criteria
                            </div>
                        }
                    />
                </div>
            )}

            {/* Results Count */}
            {showSearchResults && (
                <div className="mt-6 text-sm text-gray-900 text-center">
                    Showing {sortedResponses.length} results for your search
                </div>
            )}
        </div>
    );
};

export default Response;