const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://immigrtion-case-management-production.up.railway.app/api';
  }
  return 'http://127.0.0.1:5001/api';
};

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  body?: any;
  isMultipart?: boolean;
}

const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const baseUrl = getBaseUrl();
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let url: string;
  if (baseUrl.endsWith('/api') && formattedEndpoint.startsWith('/api/')) {
    url = `${baseUrl}${formattedEndpoint.substring(4)}`;
  } else {
    url = `${baseUrl}${formattedEndpoint}`;
  }

  if (!params) return url;
  
  const query = Object.entries(params)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
    .join('&');
  
  return query ? `${url}?${query}` : url;
};

const getHeaders = (isMultipart = false, hasBody = false): Record<string, string> => {
  const token = localStorage.getItem('jwt_token');
  const overrideRole = localStorage.getItem('override_user_role');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (overrideRole) {
    headers['X-User-Role'] = overrideRole;
  }
  
  if (!isMultipart && hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

const performTokenRefresh = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('jwt_token', data.token);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Failed to auto-refresh token:', err);
    return false;
  }
};

const requestWithRetry = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  options?: { body?: any; params?: Record<string, string | number>; isMultipart?: boolean }
): Promise<any> => {
  const url = buildUrl(endpoint, options?.params);
  const isMultipart = options?.isMultipart || false;
  const hasBody = method !== 'GET' && options?.body !== undefined;

  const fetchOptions: RequestInit = {
    method,
    headers: getHeaders(isMultipart, hasBody),
    body: hasBody ? (isMultipart ? options?.body : JSON.stringify(options?.body)) : undefined
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    console.warn('Authentication token expired/invalid. Attempting background token refresh...');
    const refreshSuccess = await performTokenRefresh();
    if (refreshSuccess) {
      console.log('Token refresh successful. Retrying request...');
      fetchOptions.headers = getHeaders(isMultipart);
      response = await fetch(url, fetchOptions);
    } else {
      console.error('Token refresh failed. Directing to login...');
      localStorage.removeItem('jwt_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  const contentType = response.headers.get('content-type');
  let data: any = {};
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { success: response.ok };
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  get: async (endpoint: string, params?: Record<string, string | number>): Promise<any> => {
    return requestWithRetry('GET', endpoint, { params });
  },

  post: async (endpoint: string, body: any, isMultipart = false): Promise<any> => {
    return requestWithRetry('POST', endpoint, { body, isMultipart });
  },

  put: async (endpoint: string, body: any): Promise<any> => {
    return requestWithRetry('PUT', endpoint, { body });
  },

  patch: async (endpoint: string, body: any): Promise<any> => {
    return requestWithRetry('PATCH', endpoint, { body });
  },

  delete: async (endpoint: string): Promise<any> => {
    return requestWithRetry('DELETE', endpoint);
  }
};
