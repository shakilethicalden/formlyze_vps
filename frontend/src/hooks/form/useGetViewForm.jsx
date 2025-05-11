import { useQuery } from '@tanstack/react-query';
import usePublicAxios from '../usePublicAxios';


const useGetForm = (id) => {

  const publicAxios = usePublicAxios();

  return useQuery({
    enabled: !!id,
    queryKey: ['getSingleForm', id],
    queryFn: async () => {
      const response = await publicAxios.get(`form/${id}/`);
      return response.data;
    },
  });
};

export default useGetForm;
