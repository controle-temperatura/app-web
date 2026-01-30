const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean
    _retry?: boolean 
}

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function refreshToken(): Promise<void> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("Token refresh failed")
            }

            return
        } finally {
            isRefreshing = false
            refreshPromise = null
        }
    })()

    return refreshPromise
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { requiresAuth = true, headers, _retry = false, ...restOptions } = options

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
        credentials: "include",
    })

    if (response.status === 401 && requiresAuth && !_retry) {
        try {
            await refreshToken()
            
            return apiRequest<T>(endpoint, { ...options, _retry: true })
        } catch (refreshError) {
            const error = await response.json().catch(() => ({
                message: "Sessão expirada. Por favor, faça login novamente.",
            }))
            throw new Error(error.message || "Unauthorized")
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Erro na requisição",
        }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
}

export async function apiDownload(
    endpoint: string,
    options: RequestOptions = {}
): Promise<Response> {
    const { requiresAuth = true, headers, _retry = false, ...restOptions } = options

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: {
            ...headers,
        },
        credentials: "include",
    })

    if (response.status === 401 && requiresAuth && !_retry) {
        await refreshToken()
        return apiDownload(endpoint, { ...options, _retry: true })
    }

    if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            const error = await response.json().catch(() => ({
                message: "Erro na requisição",
            }))
            throw new Error(error.message || `HTTP error! status: ${response.status}`)
        }

        const text = await response.text().catch(() => "")
        throw new Error(text || `HTTP error! status: ${response.status}`)
    }

    return response
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: "DELETE" }),

    patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    download: (endpoint: string, options?: RequestOptions) =>
        apiDownload(endpoint, { ...options, method: "GET" }),
}
