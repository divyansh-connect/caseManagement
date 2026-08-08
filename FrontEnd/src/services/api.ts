const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  body?: any;
  isMultipart?: boolean;
}

const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const url = `${BASE_URL}${endpoint}`;
  if (!params) return url;
  
  const query = Object.entries(params)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
    .join('&');
  
  return query ? `${url}?${query}` : url;
};

const getHeaders = (isMultipart = false): Record<string, string> => {
  const token = localStorage.getItem('jwt_token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

const handleResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    // If we are not on login page, reload to trigger auth state reset
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
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
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  get: async (endpoint: string, params?: Record<string, string | number>): Promise<any> => {
    const url = buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, body: any, isMultipart = false): Promise<any> => {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(isMultipart),
      body: isMultipart ? body : JSON.stringify(body)
    });
    return handleResponse(response);
  },

  patch: async (endpoint: string, body: any): Promise<any> => {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string): Promise<any> => {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};
