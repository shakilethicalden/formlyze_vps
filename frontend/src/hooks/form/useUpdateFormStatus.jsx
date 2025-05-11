import React from 'react';
import usePublicAxios from '../usePublicAxios';

const useUpdateFormStatus = (id, status) => {

    const publicAxios = usePublicAxios();
    let data;
    const updateForm = async()=>{

        const resp = await publicAxios.post(`/form/toggle-${status}/${id}`);
      
        data = resp?.data
    }
    return data;
};

export default useUpdateFormStatus;