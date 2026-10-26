const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export async function apiRequest(path, options = {}) {
  const requestOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg).join(' ')
      : data.detail
    throw new Error(detail ?? '요청을 처리하지 못했습니다.')
  }

  return data
}

export const getCurrentUser = () => apiRequest('/auth/me')

export const register = (payload) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const login = (payload) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateNickname = (nickname) =>
  apiRequest('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  })
