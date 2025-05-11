'use client'
import ErrorPage from '@/components/shared/ErrorPage';
import LoadingPage from '@/components/shared/Loader';
import NoDataAvailable from '@/components/shared/NoDataAvailable';
import useGetForm from '@/hooks/form/useGetForm';
import usePublicAxios from '@/hooks/usePublicAxios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaChartBar, FaTrashAlt, FaRedo, FaStar } from 'react-icons/fa';
import { LiaClone } from "react-icons/lia";
import Swal from 'sweetalert2';
import { IoCheckmarkDone } from "react-icons/io5";

const Trash = () => {
    const { data, isLoading, error, refetch } = useGetForm("trash");
    const [copiedId, setCopiedId] = useState(null);
    const [checkedId, setCheckedId] = useState([]);
    const publicAxios = usePublicAxios();
    const router = useRouter();

    const toggleOperation = async (id, toggle) => {
        const resp = await publicAxios.post(`/form/toggle-${toggle}/${id}`);
        if (resp.data.success) {
            refetch();
            Swal.fire({
                title: "Success!",
                text: toggle === 'trash' 
                    ? "Form restored to active" 
                    : `Form moved to ${toggle}`,
                icon: "success"
            });
        }
    };

    const handleAction = async (id, action) => {
        if (action === 'restore') {
            await toggleOperation(id, 'trash');
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: action === 'delete' 
                ? "Permanently delete this form?" 
                : "Restore this form to active?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: action === 'delete' ? "#d33" : "#3085d6",
            cancelButtonColor: "#1A1466",
            confirmButtonText: `Yes, ${action} it!`
        }).then((result) => {
            if (result.isConfirmed) {
                if (action === 'delete') {
                    deleteFormPermanently(id);
                } else {
                    toggleOperation(id, 'trash');
                }
            }
        });
    };

    const copyFormLink = async (id, token) => {
        const formLink = `${window.location.origin}/formView/${token}`;
        await navigator.clipboard.writeText(formLink);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const deleteFormPermanently = async (id) => {
        try {
            const resp = await publicAxios.delete(`/form/list/${id}/`);
            if (resp.status === 204) {
                refetch();
                Swal.fire({
                    title: "Deleted!",
                    text: "Form permanently deleted",
                    icon: "success"
                });
            }
        } catch (err) {
            Swal.fire({
                title: "Error!",
                text: "Failed to delete form",
                icon: "error"
            });
        }
    };

    // const emptyTrash = async () => {
    //     Swal.fire({
    //         title: "Empty Trash?",
    //         text: "This will permanently delete ALL forms in trash",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#d33",
    //         cancelButtonColor: "#1A1466",
    //         confirmButtonText: "Yes, empty trash!"
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             try {
    //                 const resp = await publicAxios.post('/form/empty-trash/');
    //                 if (resp.status === 200) {
    //                     refetch();
    //                     Swal.fire({
    //                         title: "Emptied!",
    //                         text: "Trash has been cleared",
    //                         icon: "success"
    //                     });
    //                 }
    //             } catch (err) {
    //                 Swal.fire({
    //                     title: "Error!",
    //                     text: "Failed to empty trash",
    //                     icon: "error"
    //                 });
    //             }
    //         }
    //     });
    // };

    const checkboxHandle = (e) => {
        const formId = Number(e.target.name);
        const isChecked = e.target.checked;
        setCheckedId(prev => isChecked ? [...prev, formId] : prev.filter(id => id !== formId));
    };

    if (isLoading) return <LoadingPage />;
    if (error) return <ErrorPage message='Something went wrong! Please refresh this page or login again!' />;
    if (data?.length < 1) return <NoDataAvailable message="Trash is empty..." />;

    return (
        <div className={` ${checkedId ? 'lg:ml-[8%] xl:ml-0' : 'lg:-ml-[8%] xl:-ml-0'} xl:m mt-24 px-1 min-h-[calc(100vh-2rem)]`}>
            <div className='w-full overflow-x-auto'>
                <div className='min-w-max'>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl text-black font-semibold">Trash</h2>
                        {/* <button
                            onClick={emptyTrash}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            <FaTrashAlt />
                            <span>Empty Trash</span>
                        </button> */}
                    </div>

                    <div className='space-y-4'>
                        {data && data.map((form) => (
                            <div key={form.id} className='flex items-center dark:bg-white cursor-pointer border-b-[#00000059] border-b border-[#00000059] px-6 py-3 hover:bg-gray-50 transition-colors '>
                                {/* Left side - Form title and actions */}
                                <div className='flex-1 mr-4 flex items-center lg:min-w-[250px] md:min-w-[250px] xl:min-w-[400px] max-w-[150px]'>
                                    <div className='flex items-center space-x-3 w-full'>
                                        <input
                                            type="checkbox"
                                            onChange={checkboxHandle}
                                            name={form.id}
                                            id={form.id}
                                            className='rounded text-lg cursor-pointer flex-shrink-0'
                                        />

                                        <div className='flex-shrink-0'>
                                            <FaTrashAlt className='text-gray-500 w-4 h-4' />
                                        </div>
                                        
                                        <span 
                                            className='text-sm md:text-lg cursor-pointer text-black truncate flex-1 min-w-[150px]'
                                            title={form.title}
                                        >
                                            {form.title}
                                        </span>

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
                                                onClick={() => handleAction(form.id, 'restore')}
                                                className='flex cursor-pointer items-center gap-2 px-3 py-2 bg-gray-100 text-sm lg:text-lg hover:bg-gray-200 text-gray-700 rounded transition-colors'
                                            >
                                                <FaRedo className='text-sm' />
                                                <span>Restore</span>
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

                                    <button
                                        onClick={() => handleAction(form.id, 'restore')}
                                        className="flex text-sm lg:text-lg items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                                    >
                                        <FaRedo />
                                        <span>Restore</span>
                                    </button>

                                    {/* <button
                                        onClick={() => handleAction(form.id, 'delete')}
                                        className='bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition-colors'
                                    >
                                        <FaTrashAlt />
                                    </button> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trash;