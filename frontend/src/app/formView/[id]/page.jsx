'use client'
import ViewForm from '@/app/pages/view-form/ViewForm';
import LoadingPage from '@/components/shared/Loader';
import Navbar from '@/components/shared/Navbar';
import useGetForm from '@/hooks/form/useGetViewForm';
import { useParams } from 'next/navigation';
import React from 'react';

const page = () => {
    const params = useParams();
    console.log(params?.id, 'parmas');
    const id = params?.id;

const {data, isLoading, error} = useGetForm(id);
console.log(data, 'data chole asca');
if(isLoading){
    return <LoadingPage/>
}
    return (
        <div className=''>
      
      <ViewForm data={data} isLoading={isLoading} error={error} id={id} />
        </div>
    );
};

export default page;