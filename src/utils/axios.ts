import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_HOST_API,
});

export default axiosInstance;
