// utils/api.ts
export const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Browser should use relative path
        return '';
    }
    if (process.env.VERCEL_URL) {
        // Reference for vercel.com
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
        // Use API URL if defined
        return process.env.NEXT_PUBLIC_API_URL;
    }
    // Fallback to localhost
    return `http://localhost:${process.env.PORT || 3000}`;
};

// Create a utility function for API calls
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    return response;
};