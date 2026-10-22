// Cliente HTTP centralizado de TecnoStore: TODAS las peticiones a la API pasan por aquí.
//  - Adjunta automáticamente "Authorization: Bearer <token>" cuando hay sesión.
//  - Hace de interceptor de respuestas: ante un 401 con sesión activa avisa al
//    AuthProvider (configurarClienteHttp) para cerrar la sesión y redirigir al login.
// La URL del backend viene de la variable de entorno VITE_API_URL
// (en local: http://localhost:5000; en producción: la URL de Render/Railway).
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, codigo) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo // ej. "token_expired" (viene en el campo "error" del backend)
  }
}

// El AuthProvider registra aquí cómo leer el token vigente y qué hacer cuando
// la sesión deja de ser válida. Así este módulo no depende de React.
let obtenerToken = () => null
let alSesionExpirada = () => {}

export function configurarClienteHttp({ getToken, onSesionExpirada }) {
  obtenerToken = getToken ?? (() => null)
  alSesionExpirada = onSesionExpirada ?? (() => {})
}

async function request(ruta, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  // Inyección automática del JWT en cada petición
  const token = obtenerToken()
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
    // Interceptor de sesión: un 401 en una petición que SÍ llevaba token significa
    // que el JWT expiró (token_expired, a los 5 min) o ya no es válido. Un 401 de
    // un login fallido no lleva token, así que no dispara el cierre de sesión.
    if (respuesta.status === 401 && token) alSesionExpirada(datos)

    // El backend responde { error, message } en los 401 de JWT y { mensaje } en el resto
    throw new ApiError(
      datos.message || datos.mensaje || `Error ${respuesta.status} del servidor`,
      respuesta.status,
      datos.error,
    )
  }
  return datos
}

// ---------- Autenticación ----------
export const authApi = {
  register: (datos) => request('/auth/register', { method: 'POST', body: datos }),
  login: (correo, password) =>
    request('/auth/login', { method: 'POST', body: { correo, password } }),
  me: (signal) => request('/auth/me', { signal }),
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
  crear: (datos) => request('/productos', { method: 'POST', body: datos }),
  actualizar: (id, datos) => request(`/productos/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
}
