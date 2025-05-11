import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import usePublicAxios from '../usePublicAxios';

const useGetResponse= (id) => {
  // const { data: sessionData } = useSession();
  // const user_id = sessionData?.user?.id;
  const publicAxios = usePublicAxios();

  return useQuery({
    enabled: !!id,
    queryKey: ['getForms',id],
    queryFn: async () => {
      const response = await publicAxios.get(`form/response/?form=${id}`);
      return response.data;
    },
  });
};

export default useGetResponse;
