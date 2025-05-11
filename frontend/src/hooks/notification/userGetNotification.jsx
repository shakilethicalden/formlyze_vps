import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import usePublicAxios from '../usePublicAxios';

const useGetNotification = () => {
  const { data: sessionData } = useSession();
  const user_id = sessionData?.user?.id;
  const publicAxios = usePublicAxios();

  return useQuery({
    enabled: !!user_id,
    queryKey: ['getNotification', user_id], 
    queryFn: async () => {
      const queryString =  `notification/list/?user=${user_id}`;
      
      const response = await publicAxios.get(queryString);
      return response.data;
    },
  });
};

export default useGetNotification;
