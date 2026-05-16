export const apiFetch = async (path: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`/.netlify/functions${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && path !== '/auth') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  return response.json();
};
