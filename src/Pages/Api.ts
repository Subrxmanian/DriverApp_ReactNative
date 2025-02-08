import axios from 'axios';


const apiUrl = 'https://u-turn-be-dev.vercel.app/api';

const api = axios.create({
    baseURL: apiUrl,
});

export default api;
