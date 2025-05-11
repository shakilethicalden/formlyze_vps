'use client'
import UpdateForm from '@/app/pages/auhtantication/update-form/UpdateForm';
import useGetForm from '@/hooks/form/useGetViewForm';
import { useParams } from 'next/navigation';
import React from 'react';

const page = () => {

    const params = useParams();
    const token = params?.token;
    const {data, isLoading, error} = useGetForm(token)
    return (
        <div>
           <UpdateForm data={data} isLoading={isLoading} error={error}/> 
        </div>
    );
};

export default page;