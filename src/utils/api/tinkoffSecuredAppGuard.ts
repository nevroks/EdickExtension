// import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
// import axios from "axios";
// import { CHROME_STORAGE_KEYS } from "../consts/appConsts";

// export abstract class TinkoffSecuredAppGuard {
    
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
//                     let token: string | null = null;

//                     // Проверяем наличие chrome API
//                     if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
//                         const result = await chrome.storage.local.get(CHROME_STORAGE_KEYS["T-key"]);
//                         token = result["T-key"];
//                     }

//                     if (token) {
//                         config.headers.Authorization = `Bearer ${token}`;
//                     } else {
//                         console.warn('Tinkoff token not found in storage');
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
//             error => {
//                 // Обработка ошибок авторизации (например, 401)
//                 if (error.response && error.response.status === 401) {
//                     console.error('Authentication error - token may be invalid or expired');
//                     // Здесь можно добавить логику обновления токена или перенаправления на авторизацию
//                 }
//                 return Promise.reject(error);
//             }
//         );

//         return api;
//     }

//     /**
//      * Универсальный метод для получения токена из различных источников
//      * Можно переопределить в дочерних классах для кастомной логики
//      */
//     // protected async getToken(): Promise<string | null> {
//     //     try {
//     //         // Приоритет: chrome.storage
//     //         if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
//     //             const result = await chrome.storage.local.get(["T-key"]);
//     //             return result["T-key"] || null;
//     //         }
            
//     //         // Запасной вариант: localStorage
//     //         if (typeof localStorage !== 'undefined') {
//     //             return localStorage.getItem("T-key");
//     //         }
            
//     //         return null;
//     //     } catch (error) {
//     //         console.error('Error retrieving token:', error);
//     //         return null;
//     //     }
//     // }
// }