
import axios from 'axios';



const publicAxios = axios.create({
    baseURL:'http://168.231.68.138/api',
    headers: {
        'Content-Type': 'application/json',
      }
})
const usePublicAxios = () => {
 return publicAxios;
};

export default usePublicAxios;