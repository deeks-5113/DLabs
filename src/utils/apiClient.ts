const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errText}`);
  }
  
  if (response.status === 204) {
    return null as any;
  }
  
  return response.json();
}
