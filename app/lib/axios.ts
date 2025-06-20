import axios from 'axios';

const api = axios.create({
    baseURL: 'https://staging.telelink.wosler.ca/api/',
    // You can add headers or interceptors here if needed
});

export default api; 