import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler, HttpError } from '../utils/asyncHandler.js'

// Verifica el token JWT del encabezado "Authorization: Bearer <token>"
// y deja el usuario autenticado en req.user.
export const proteger = asyncHandler(async (req, _res, next) => {
  const cabecera = req.headers.authorization || ''
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null

  if (!token) throw new HttpError(401, 'No autenticado: falta el token')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new HttpError(401, 'Token inválido o expirado')
  }

  const usuario = await User.findById(payload.id)
  if (!usuario) throw new HttpError(401, 'El usuario de este token ya no existe')

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
