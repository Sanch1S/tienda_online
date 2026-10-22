import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler, HttpError } from '../utils/asyncHandler.js'

// Respuesta 401 uniforme para el frontend: { error, message }.
// "error" es un código estable que el cliente puede evaluar; "message" es legible.
const noAutorizado = (res, error, message) => res.status(401).json({ error, message })

// Middleware de autenticación reutilizable.
// Extrae el token de "Authorization: Bearer <token>", verifica la firma con
// JWT_SECRET y deja el usuario autenticado en req.user (y el payload en req.auth).
//
//   401 token_missing  -> no hay cabecera Authorization o no trae token
//   401 token_expired  -> el token superó su tiempo de vida (5 min)
//   401 token_invalid  -> firma incorrecta, token mal formado, usuario inexistente
export const proteger = asyncHandler(async (req, res, next) => {
  const cabecera = req.headers.authorization || ''
  const [esquema, token] = cabecera.split(' ')

  if (esquema !== 'Bearer' || !token) {
    return noAutorizado(
      res,
      'token_missing',
      'No autenticado: falta el token de acceso (Authorization: Bearer <token>).',
    )
  }

  let payload
  try {
    // Verifica la firma y también el vencimiento (claim "exp")
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return noAutorizado(
        res,
        'token_expired',
        'La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente.',
      )
    }
    return noAutorizado(res, 'token_invalid', 'El token no es válido. Inicie sesión nuevamente.')
  }

  const usuario = await User.findById(payload.id)
  if (!usuario) {
    return noAutorizado(res, 'token_invalid', 'El usuario de este token ya no existe.')
  }

  req.auth = payload
  req.user = usuario
  next()
})

// Solo deja pasar a los usuarios con rol "admin" (usar después de proteger).
export const soloAdmin = (req, _res, next) => {
  if (req.user?.rol !== 'admin') {
    return next(new HttpError(403, 'Acceso denegado: se requiere rol de administrador'))
  }
  next()
}
