'use client'
import Response from '@/app/pages/response/Response';
import useGetForm from '@/hooks/form/useGetForm';
import useGetResponse from '@/hooks/responses/useGetResponse';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react';

const page = () => {
    const params = useParams();
    const id = params.id;
    console.log(id);

    const {data, isLoading, error} = useGetResponse(id);
    const searchParams = useSearchParams();
    const title= searchParams.get('title') || 'null'



    return (
        <div className='overflow-hidden max-w-screen'>
        <Response data={data} isLoading={isLoading} error={error} title={title} id={id}/>
        </div>
    );
};

export default page;