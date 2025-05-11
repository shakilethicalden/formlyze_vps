import { useQuery } from '@tanstack/react-query';

import usePublicAxios from '../usePublicAxios';

const useGetSingleResponse= (id) => {


  const publicAxios = usePublicAxios();

  return useQuery({
    enabled: !!id,
    queryKey: ['getResponseSingle', id],
    queryFn: async () => {
      const response = await publicAxios.get(`form/response/${id}/`);
      return response.data;
    },
  });
};

export default useGetSingleResponse;
