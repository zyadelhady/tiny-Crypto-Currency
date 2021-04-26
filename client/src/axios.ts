import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:600' : '',
});

export default instance;
