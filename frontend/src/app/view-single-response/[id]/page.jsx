'use client'
import SingleResponse from '@/app/pages/response/SingleResponse';
import ErrorPage from '@/components/shared/ErrorPage';
import LoadingPage from '@/components/shared/Loader';
import useGetSingleResponse from '@/hooks/responses/useGetSingleResponse';
import { useParams } from 'next/navigation';
import React from 'react';

const page = () => {
    const params = useParams();
    const id = params?.id;
    const {data, isLoading, error} = useGetSingleResponse(id);
    if(isLoading){
        return <LoadingPage/>
    }
    if(error){
        return <ErrorPage message='Something went wrong! Please refresh this page'/>
    }
    
    return (
        <div className='px-2 lg:px-8'>
            <SingleResponse data={data}/>
        </div>
    );
};

export default page;