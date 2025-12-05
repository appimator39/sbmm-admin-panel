import axios from 'axios';

const ENV = (import.meta as any)?.env || {};
const axiosInstance = axios.create({
  baseURL: ENV.VITE_HOST_API,
});

export default axiosInstance;
