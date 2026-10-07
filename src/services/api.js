// Cliente HTTP de TecnoStore: todas las peticiones a la API pasan por aquí.
// La URL del backend viene de la variable de entorno VITE_API_URL
// (en local: http://localhost:5000; en producción: la URL de Render/Railway).
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(ruta, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}/api${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    // fetch solo lanza error si no hay red, el servidor está caído o CORS bloquea
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
      0,
    )
  }

  // Algunas respuestas de error pueden no traer JSON (ej. 502 del proxy)
  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new ApiError(datos.mensaje || `Error ${respuesta.status} del servidor`, respuesta.status)
  }
  return datos
}

// ---------- Autenticación ----------
export const authApi = {
  register: (datos) => request('/auth/register', { method: 'POST', body: datos }),
  login: (correo, password) =>
    request('/auth/login', { method: 'POST', body: { correo, password } }),
  me: (token, signal) => request('/auth/me', { token, signal }),
}

// ---------- Productos (entidad de negocio) ----------
export const productosApi = {
  listar: (filtros = {}, signal) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== '' && valor !== undefined && valor !== null) params.set(clave, valor)
    })
    const query = params.toString()
    return request(`/productos${query ? `?${query}` : ''}`, { signal })
  },
  categorias: (signal) => request('/productos/categorias', { signal }),
  obtener: (id, signal) => request(`/productos/${id}`, { signal }),
  crear: (datos, token) => request('/productos', { method: 'POST', body: datos, token }),
  actualizar: (id, datos, token) =>
    request(`/productos/${id}`, { method: 'PUT', body: datos, token }),
  eliminar: (id, token) => request(`/productos/${id}`, { method: 'DELETE', token }),
}
