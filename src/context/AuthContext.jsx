import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, configurarClienteHttp } from '../services/api.js'

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
  const navigate = useNavigate()

  // Persistir cada cambio de sesión
  useEffect(() => {
    guardarSesion(estado)
  }, [estado])

  // Referencia al token vigente: el cliente HTTP (services/api.js) la lee en cada
  // petición para adjuntar "Authorization: Bearer <token>".
  const tokenRef = useRef(estado.token)
  tokenRef.current = estado.token

  // Conecta el cliente HTTP con el estado global. Es un layout effect para que
  // quede registrado ANTES de los useEffect de las páginas que piden datos.
  useLayoutEffect(() => {
    configurarClienteHttp({
      getToken: () => tokenRef.current,

      // Interceptor de sesión expirada: se ejecuta cuando la API responde 401
      // a una petición que llevaba token (el JWT de 5 minutos ya caducó).
      onSesionExpirada: () => {
        // Varias peticiones pueden fallar a la vez: solo se procesa la primera.
        if (!tokenRef.current) return
        tokenRef.current = null

        // 1) Elimina token y datos del usuario (reducer + localStorage) -> LOGOUT
        dispatch({ type: ACCIONES.LOGOUT })

        // 2) Redirige a /login con el aviso; "desde" permite volver a la página
        //    donde estaba el usuario después de iniciar sesión de nuevo.
        const desde = window.location.pathname
        navigate('/login', {
          replace: true,
          state: { sesionExpirada: true, desde: desde === '/login' ? undefined : desde },
        })
      },
    })
  }, [navigate])

  // Al abrir la app con una sesión guardada, se valida el token contra la API
  // y se refrescan los datos del usuario desde MongoDB. Si el token ya expiró,
  // el interceptor del cliente HTTP cierra la sesión y redirige al login.
  const tokenGuardado = estado.token
  useEffect(() => {
    if (!tokenGuardado) return undefined
    const controlador = new AbortController()

    authApi
      .me(controlador.signal)
      .then(({ user }) => dispatch({ type: ACCIONES.UPDATE_USER, payload: user }))
      .catch(() => {
        // 401 -> ya lo gestionó el interceptor. Error de red -> se conserva la sesión.
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
