// import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
// import axios from "axios";
// import { CHROME_STORAGE_KEYS } from "../consts/appConsts";





// export abstract class JWTSecuredAppGuard {

//     protected securedApi(baseURL: string): AxiosInstance {
//         // Создаем базовый экземпляр Axios
//         const api = axios.create({
//             baseURL,
//             headers: {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json"
//             }
//         });

//         // Добавляем перехватчик запросов для автоматического добавления токена
//         api.interceptors.request.use(
//             async (config: InternalAxiosRequestConfig) => {
//                 try {
//                     // Асинхронно получаем токен из storage
//                     let tokens: { accessToken: string; refreshToken: string } | null = null;

//                     // Проверяем наличие chrome API
//                     if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
//                         const result = await chrome.storage.local.get([CHROME_STORAGE_KEYS["jwt-tokens"]]);
//                         tokens = result["jwt-tokens"];
//                     }

//                     if (tokens) {
//                         config.headers.Authorization = `Bearer ${tokens.accessToken}`;
//                     } else {
//                         console.warn('JWT token not found in storage');
//                     }
//                 } catch (error) {
//                     console.error('Error getting token from storage:', error);
//                 }

//                 return config;
//             },
//             error => Promise.reject(error)
//         );

//         api.interceptors.response.use(
//             response => response,
//             async (error: AxiosError) => {
//                 const originalRequest = error.config
//                 // If the error status is 401 and there is no originalRequest._retry flag,
//                 // it means the token has expired and we need to refresh it
//                 // @ts-ignore
//                 if (error.response.status === 401 && !originalRequest._retry) {
//                     // @ts-ignore
//                     originalRequest._retry = true
//                     try {

//                         let oldTokens: { accessToken: string; refreshToken: string } | null = null;

//                         // Проверяем наличие chrome API
//                         if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
//                             const result = await chrome.storage.local.get([CHROME_STORAGE_KEYS["jwt-tokens"]]);
//                             oldTokens = result["jwt-tokens"];
//                         }

//                         if (!oldTokens) {
//                             return Promise.reject(error)
//                         }

//                         axios.post('http://localhost:3000/jwt-token/refreshToken', {
//                             refreshToken: oldTokens.refreshToken
//                         }).then(response => {
//                             chrome.storage.local.set({ [CHROME_STORAGE_KEYS["jwt-tokens"]]: response.data });
//                             // Update the original request headers with the new token
//                             // Retry the original request with the new token
//                             // @ts-ignore
//                             originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
//                             // @ts-ignore
//                             return axios(originalRequest)
//                         })




//                     } catch (error) {
//                         // Cookies.remove('accessToken')
//                         // Cookies.remove('refreshToken')
//                         // originalRequest._retry = false
//                         // if (typeof window !== 'undefined') {
//                         //     window.location.href = APP_ROUTES.LOGIN_PAGE
//                         // }
//                     }
//                 }
//                 return Promise.reject(error)
//             }
//         );

//         return api;
//     }

// }