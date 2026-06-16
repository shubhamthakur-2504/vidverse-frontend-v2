"use client"
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 120000,
    withCredentials: true,
})

const plainAxios: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 120000,
    withCredentials: false,
})

export const noAuthRedirectClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 120000,
    withCredentials: true,
})

let isRefreshing = false

type FailedRequestQueueItem = {
    resolve: (value?: unknown) => void
    reject: (error: AxiosError) => void
}

let failedQueue: FailedRequestQueueItem[] = []

const processQueue = (error: unknown, response?: unknown) => {
    failedQueue.forEach(({ reject, resolve }) => {
        if (error) reject(error as AxiosError)
        else resolve(response)
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryAxiosRequestConfig

        if (!originalRequest) {
            return Promise.reject(error)
        }

        const isRefreshRequest = originalRequest.url?.includes("/user/refreshaccess")
        const isAuthRequest = originalRequest.url?.includes("/user/login") || originalRequest.url?.includes("/user/register")

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isAuthRequest) {
            originalRequest._retry = true
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then(() => apiClient(originalRequest))
                    .catch(err => Promise.reject(err))
            }

            isRefreshing = true

            try {
                await plainAxios.post("/user/refreshaccess")

                processQueue(null)

                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError);
                const currentPath = window.location.pathname + window.location.search;
                if (!window.location.pathname.startsWith("/auth")) {
                    window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
