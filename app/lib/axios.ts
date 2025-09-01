import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
    baseURL: API_BASE_URL,
    // You can add headers or interceptors here if needed
});

export default api; 