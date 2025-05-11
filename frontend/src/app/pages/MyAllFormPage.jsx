'use client'
import ErrorPage from '@/components/shared/ErrorPage';
import LoadingPage from '@/components/shared/Loader';
import NoDataAvailable from '@/components/shared/NoDataAvailable';
import useGetForm from '@/hooks/form/useGetForm';
import usePublicAxios from '@/hooks/usePublicAxios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaChartBar, FaTrashAlt, FaArchive } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa6';
import { LiaClone } from "react-icons/lia";
import Swal from 'sweetalert2';
import { IoCheckmarkDone } from "react-icons/io5";
import useUpdateFormStatus from '@/hooks/form/useUpdateFormStatus';
import { IoIosStar } from 'react-icons/io';

const MyAllFormPage = () => {
    const { data, isLoading, error, refetch } = useGetForm();
    const [copiedId, setCopiedId] = useState(null);
    const [checkedId, setCheckedId] = useState([]);
    const publicAxios = usePublicAxios();
    const router = useRouter();

    // Filter out forms that are in trash or archived
    const filteredForms = data?.filter(form => !form.is_trash && !form.is_archive) || [];

    const copyFormLink = async (id, token) => {
        const formLink = `${window.location.origin}/formView/${token}`;
        await navigator.clipboard.writeText(formLink);
        setCopiedId(id);
        setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    };

    const deleteForm = async (id) => {
        try {
            const resp = await publicAxios.delete(`/form/list/${id}/`);
            if (resp.status === 204) {
                refetch();
                Swal.fire({
                    title: "Deleted!",
                    text: "Your form has been deleted.",
                    icon: "success"
                });
            }
        } catch (err) {
            Swal.fire({
                title: "Error!",
                text: "Failed to delete form.",
                icon: "error"
            });
        }
    };

    const toggleOperation = async (id, toggle) => {
        const resp = await publicAxios.post(`/form/toggle-${toggle}/${id}`);
        console.log(resp, 'toggle operation response');
        if (resp.data.success) {
            refetch();
            Swal.fire({
                title: "Moved!",
                text: toggle === 'favorite' 
                    ? "Your form favorite status has been updated." 
                    : `Your form has been moved to ${toggle}.`,
                icon: "success"
            });
        }
    };

    const handleToggle = async (id, toggle) => {
        if (toggle === 'favorite') {
            await toggleOperation(id, toggle);
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: `Are you sure you want to move this to ${toggle}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Move it!"
        }).then((result) => {
            if (result.isConfirmed) {
                toggleOperation(id, toggle);
            }
        });
    };

    const checkboxHandle = (e) => {
        const formId = Number(e.target.name);
        const isChecked = e.target.checked;
        setCheckedId(prev =>
            isChecked ? [...prev, formId] : prev.filter(id => id !== formId)
        );
    };

    if (isLoading) return <LoadingPage />;
    if (error) return <ErrorPage message='Something went wrong! Please refresh this page or login again!' />;
    if (filteredForms.length < 1) return <NoDataAvailable message="No form available..." />;

    return (
        <div className={` ${checkedId ? 'lg:ml-[8%] xl:ml-0' : 'lg:-ml-[8%] xl:-ml-0'} xl:m mt-24 px-1 min-h-[calc(100vh-2rem)]`}>
            <div className='w-full overflow-x-auto'>
                <div className='min-w-max'>
                    <div className='space-y-4'>
                        {filteredForms.map((form) => (
                            <div key={form.id} className='flex items-center dark:bg-white cursor-pointer border-b-[#00000059] border-b border-[#00000059] px-6 py-3 hover:bg-gray-50 transition-colors '>
                                {/* Left side - Form title and actions */}
                                <div className=' mr-4 flex items-center md:min-w-[250px] xl:min-w-[400px] max-w-[150px]'>
                                    <div className='flex items-center space-x-3 w-full'>
                                        <input
                                            type="checkbox"
                                            onChange={checkboxHandle}
                                            name={form.id}
                                            id={form.id}
                                            className='rounded text-lg cursor-pointer flex-shrink-0'
                                        />

                                        <div className='flex-shrink-0'>
                                            {!form.is_favorite ? (
                                                <FaRegStar 
                                                    onClick={() => handleToggle(form.id, 'favorite')}
                                                    className='text-[#000000] w-4 h-4 hover:text-amber-500' 
                                                />
                                            ) : (
                                                <IoIosStar
                                                    onClick={() => handleToggle(form.id, 'favorite')}
                                                    className='text-amber-500 w-4 h-4' 
                                                />
                                            )}
                                        </div>
                                        
                                        <Link 
                                            href={`formView/${form.unique_token}`}  
                                            className='text-sm md:text-lg cursor-pointer text-black  hover:text-primary transition-colors  flex-1  min-w-[150px]'
                                            title={form.title}
                                        >
                                            {form.title}
                                        </Link>

                                        <div className='relative flex-shrink-0'>
                                            {copiedId !== form.id ? (
                                                <button
                                                    onClick={() => copyFormLink(form.id, form.unique_token)}
                                                    className='ml-2 text-gray-500 hover:text-primary transition-colors'
                                                    aria-label="Copy form link"
                                                >
                                                    <LiaClone className='inline' />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => copyFormLink(form.id, form.unique_token)}
                                                    className='ml-2 text-green-500 transition-colors'
                                                    aria-label="Copy form link"
                                                >
                                                    <IoCheckmarkDone />
                                                </button>
                                            )}

                                            {copiedId === form.id && (
                                                <span className='absolute left-0 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
                                                    Copied!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Action buttons */}
                                <div className='ml-28 md:ml-auto flex gap-4 items-center flex-shrink-0'>
                                    {checkedId.includes(form.id) && (
                                        <>
                                            <button
                                                onClick={() => handleToggle(form.id, 'archive')}
                                                className='flex cursor-pointer items-center gap-2 px-3 py-2 bg-gray-100 text-sm lg:text-lg hover:bg-gray-200 text-gray-700 rounded transition-colors'
                                            >
                                                <FaArchive className='text-sm' />
                                                <span>Archive</span>
                                            </button>

                                            <button
                                                onClick={() => handleToggle(form.id, 'trash')}
                                                className='flex items-center gap-2 px-3 py-2 bg-gray-100 text-sm lg:text-lg cursor-pointer hover:bg-gray-200 text-gray-700 rounded transition-colors'
                                            >
                                                <FaTrashAlt className='text-sm' />
                                                <span>Trash</span>
                                            </button>

                                            <button
                                                onClick={() => deleteForm(form.id)}
                                                className='bg-red-500 flex items-center gap-2 text-white cursor-pointer  mr-6 ml-auto px-4 text-sm lg:text-lg py-2 rounded'
                                            >
                                                <FaTrashAlt className='text-sm' />



                                                <span>Delete</span>
                                            </button>
                                        </>
                                    )}

                                    <Link
                                        href={`/view-responses/${form.id}?title=${form.title}`}
                                        className="flex text-sm lg:text-lg items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                                    >
                                        <FaChartBar />
                                        <span>Responses</span>
                                    </Link>

                                    <Link 
                                        href={`/update-form/${form?.unique_token}`} 
                                        className='bg-primary text-sm lg:text-lg text-white rounded px-4 py-2 hover:bg-primary-dark transition-colors'
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAllFormPage;