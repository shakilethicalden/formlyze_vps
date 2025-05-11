import React from 'react';
import usePublicAxios from '../usePublicAxios';


const useGetFormByStatus = (status, user_id) => {

    const publicAxios = usePublicAxios()
    const getFormByStatus = async()=>{
        const resp = await publicAxios.get(`/form/list/?status=${status}&created_by=${user_id}`);
        return resp?.data;

    }
    return getFormByStatus;
};

export default useGetFormByStatus;