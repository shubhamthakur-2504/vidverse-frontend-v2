"use client"
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"
import { API_PREFIX } from "../origin"

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

const apiClient: AxiosInstance = axios.create({
    baseURL: API_PREFIX,
    timeout: 120000,
    withCredentials: true,
})

// Requests go to this app's own /api (rewritten to the API server by next.config), so the auth cookies are
// first-party. The refresh client never goes through the 401 interceptors below.
const refreshClient: AxiosInstance = axios.create({
    baseURL: API_PREFIX,
    timeout: 120000,
    withCredentials: true,
})

// same as apiClient, but a failed refresh does not redirect to login (used for "who am I" on page load)
export const noAuthRedirectClient: AxiosInstance = axios.create({
    baseURL: API_PREFIX,
    timeout: 120000,
    withCredentials: true,
})

// single-flight refresh: concurrent 401s all wait on the same request instead of each refreshing
let refreshPromise: Promise<void> | null = null

export const refreshSession = (): Promise<void> => {
    if (!refreshPromise) {
        refreshPromise = refreshClient
            .post("/auth/refresh")
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

const shouldTryRefresh = (error: AxiosError): error is AxiosError & { config: RetryAxiosRequestConfig } => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined
    if (!originalRequest || originalRequest._retry || error.response?.status !== 401) return false

    const url = originalRequest.url ?? ""
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")
    return !isAuthRequest
}

const retryAfterRefresh = (client: AxiosInstance, redirectOnFailure: boolean) =>
    async (error: AxiosError) => {
        if (!shouldTryRefresh(error)) {
            return Promise.reject(error)
        }

        const originalRequest = error.config
        originalRequest._retry = true

        try {
            await refreshSession()
        } catch (refreshError) {
            if (redirectOnFailure && !window.location.pathname.startsWith("/auth")) {
                const currentPath = window.location.pathname + window.location.search
                window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
            }
            return Promise.reject(refreshError)
        }

        return client(originalRequest)
    }

apiClient.interceptors.response.use((response) => response, retryAfterRefresh(apiClient, true))
noAuthRedirectClient.interceptors.response.use((response) => response, retryAfterRefresh(noAuthRedirectClient, false))

export default apiClient
