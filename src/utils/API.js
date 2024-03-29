import axios from 'axios';
/* 

REACT_APP_BASE_SERVER_URL is set during build time 
as per the priority defined here 
https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use

yarn start # picks up .env.development
yarn build # picks up .env.production

*/

const instance = axios.create({
  baseURL: process.env.REACT_APP_BASE_SERVER_URL,
});
export default instance;
