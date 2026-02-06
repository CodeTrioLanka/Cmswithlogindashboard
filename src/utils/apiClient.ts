

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'https://nature-escape-web-back.vercel.app') + '/api';

interface RequestOptions extends RequestInit {
    data?: any;
    skipAuth?: boolean;
}

class ApiClient {
    private async refreshToken(): Promise<string | null> {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) return null;

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ refreshToken: storedRefreshToken }),
            });

            if (!response.ok) throw new Error('Refresh failed');

            const data = await response.json();

            if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

            return data.accessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return null;
        }
    }

    private logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { data, skipAuth, headers: customHeaders, ...config } = options;

        let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

        const headers: HeadersInit = { ...customHeaders };
        const accessToken = localStorage.getItem('accessToken');

        if (!skipAuth && accessToken) {
            (headers as any)['Authorization'] = `Bearer ${accessToken}`;
        }

        const fetchConfig: RequestInit = {
            ...config,
            headers,
            credentials: 'include',
        };

        if (data) {
            if (data instanceof FormData) {
                // Let browser set Content-Type for FormData
                fetchConfig.body = data;
            } else {
                (headers as any)['Content-Type'] = 'application/json';
                fetchConfig.body = JSON.stringify(data);
            }
        }

        let response = await fetch(url, fetchConfig);

        if (response.status === 401 && !skipAuth) {
            const newToken = await this.refreshToken();
            if (newToken) {
                (fetchConfig.headers as any)['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, fetchConfig);
            }
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) return {} as T;

        return response.json();
    }

    get<T = any>(url: string, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    post<T = any>(url: string, data?: any, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: 'POST', data });
    }

    put<T = any>(url: string, data?: any, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: 'PUT', data });
    }

    patch<T = any>(url: string, data?: any, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: 'PATCH', data });
    }

    delete<T = any>(url: string, options?: RequestOptions) {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
