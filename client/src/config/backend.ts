import axios from 'axios';
import config from '@/config/env';

export const backend = axios.create({
    baseURL: config.PUBLIC_BACKEND_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
