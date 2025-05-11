
import axios from 'axios';



const publicAxios = axios.create({
    baseURL:'https://formlyze.mrshakil.com/api',
    headers: {
        'Content-Type': 'application/json',
      }
})
const usePublicAxios = () => {
 return publicAxios;
};

export default usePublicAxios;