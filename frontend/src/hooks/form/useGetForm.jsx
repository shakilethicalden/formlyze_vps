import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import usePublicAxios from '../usePublicAxios';

const useGetForm = (status) => {
  const { data: sessionData } = useSession();
  const user_id = sessionData?.user?.id;
  const publicAxios = usePublicAxios();

  return useQuery({
    enabled: !!user_id,
    queryKey: ['getForms', user_id, status], 
    queryFn: async () => {
      const queryString = status
        ? `form/list/?title=&created_by=${user_id}&status=${status}`
        : `form/list/?title=&created_by=${user_id}`;
      const response = await publicAxios.get(queryString);
      return response.data;
    },
  });
};

export default useGetForm;
