import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { authApi } from '../services/api.js'

// ---------------------------------------------------------------------------
// Estado global de autenticación: Context API + useReducer (Opción A)
// ---------------------------------------------------------------------------

const CLAVE_SESION = 'tecnostore_sesion'

// Acciones que entiende el reducer
export const ACCIONES = {
  LOGIN: 'LOGIN', // guarda usuario + token y marca isAuthenticated = true
  LOGOUT: 'LOGOUT', // limpia la sesión y marca isAuthenticated = false
  UPDATE_USER: 'UPDATE_USER', // refresca los datos del usuario (desde MongoDB)
  SET_LOADING: 'SET_LOADING', // indica que hay una petición de auth en curso
}

const estadoVacio = {
  user: null,
  token: null,
  isAuthenticated: false,
  fechaAcceso: null,
  loading: false,
}

// Recupera la sesión guardada para que no se pierda al recargar la página.
function leerSesionGuardada() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_SESION))
    if (guardada?.user && guardada?.token) {
      return { ...estadoVacio, ...guardada, isAuthenticated: true }
    }
  } catch {
    /* localStorage no disponible o JSON dañado: se ignora */
  }
  return estadoVacio
}

function guardarSesion(estado) {
  try {
    if (estado.isAuthenticated) {
      const { user, token, fechaAcceso } = estado
      localStorage.setItem(CLAVE_SESION, JSON.stringify({ user, token, fechaAcceso }))
    } else {
      localStorage.removeItem(CLAVE_SESION)
    }
  } catch {
    /* sin localStorage la sesión solo dura mientras la pestaña esté abierta */
  }
}

export function authReducer(estado, accion) {
  switch (accion.type) {
    case ACCIONES.LOGIN:
      return {
        user: accion.payload.user,
        token: accion.payload.token,
        isAuthenticated: true,
        fechaAcceso: accion.payload.fechaAcceso ?? new Date().toISOString(),
        loading: false,
      }
    case ACCIONES.LOGOUT:
      return { ...estadoVacio }
    case ACCIONES.UPDATE_USER:
      return { ...estado, user: { ...estado.user, ...accion.payload } }
    case ACCIONES.SET_LOADING:
      return { ...estado, loading: accion.payload }
    default:
      return estado
  }
}

// Dos contextos separados: los componentes que solo despachan acciones
// no se vuelven a renderizar cuando cambia el estado.
const AuthStateContext = createContext(null)
const AuthDispatchContext = createContext(null)

export function AuthProvider({ children }) {
  const [estado, dispatch] = useReducer(authReducer, undefined, leerSesionGuardada)

  // Persistir cada cambio de sesión
  useEffect(() => {
    guardarSesion(estado)
  }, [estado])

  // Al abrir la app con una sesión guardada, se valida el token contra la API
  // y se refrescan los datos del usuario desde MongoDB. Si el token ya no sirve
  // (expiró, el usuario fue eliminado...) se cierra la sesión.
  const tokenGuardado = estado.token
  useEffect(() => {
    if (!tokenGuardado) return undefined
    const controlador = new AbortController()

    authApi
      .me(tokenGuardado, controlador.signal)
      .then(({ user }) => dispatch({ type: ACCIONES.UPDATE_USER, payload: user }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        if (error.status === 401) dispatch({ type: ACCIONES.LOGOUT })
        // Si es un error de red se conserva la sesión guardada
      })

    return () => controlador.abort()
    // Solo al montar: el token no cambia mientras la sesión sea la misma
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthStateContext.Provider value={estado}>
      <AuthDispatchContext.Provider value={dispatch}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hooks personalizados
// ---------------------------------------------------------------------------

export function useAuthState() {
  const contexto = useContext(AuthStateContext)
  if (contexto === null) throw new Error('useAuthState debe usarse dentro de <AuthProvider>')
  return contexto
}

export function useAuthDispatch() {
  const contexto = useContext(AuthDispatchContext)
  if (contexto === null) throw new Error('useAuthDispatch debe usarse dentro de <AuthProvider>')
  return contexto
}

// Hook de conveniencia: estado + acciones listas para usar en los componentes.
export function useAuth() {
  const estado = useAuthState()
  const dispatch = useAuthDispatch()

  // Llama a POST /api/auth/login y, si responde bien, despacha LOGIN.
  // Si el servidor responde con error (401, 400...) lo relanza para que el
  // formulario muestre el mensaje con un <Alert>.
  const login = useCallback(
    async (correo, password) => {
      dispatch({ type: ACCIONES.SET_LOADING, payload: true })
      try {
        const { user, token } = await authApi.login(correo, password)
        dispatch({ type: ACCIONES.LOGIN, payload: { user, token } })
        return user
      } catch (error) {
        dispatch({ type: ACCIONES.SET_LOADING, payload: false })
        throw error
      }
    },
    [dispatch],
  )

  const logout = useCallback(() => dispatch({ type: ACCIONES.LOGOUT }), [dispatch])

  const actualizarUsuario = useCallback(
    (datos) => dispatch({ type: ACCIONES.UPDATE_USER, payload: datos }),
    [dispatch],
  )

  return useMemo(
    () => ({
      ...estado,
      esAdmin: estado.user?.rol === 'admin',
      login,
      logout,
      actualizarUsuario,
      dispatch,
    }),
    [estado, login, logout, actualizarUsuario, dispatch],
  )
}
