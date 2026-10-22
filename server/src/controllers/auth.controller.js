import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler, HttpError } from '../utils/asyncHandler.js'

// Firma el JWT con la clave secreta del servidor (JWT_SECRET, solo en .env).
// Payload: identidad mínima del usuario (id, email, role).
// Expiración estricta: JWT_EXPIRES_IN (en .env), por defecto exactamente 5 minutos.
export const firmarToken = (usuario) =>
  jwt.sign(
    { id: usuario._id, email: usuario.correo, role: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '5m' },
  )

// POST /api/auth/register
// Crea un usuario nuevo. El rol SIEMPRE es "cliente": nunca se acepta el rol
// desde el body (si no, cualquiera podría registrarse como admin).
export const register = asyncHandler(async (req, res) => {
  const {
    nombreCompleto,
    correo,
    password,
    fechaNacimiento,
    genero,
    pais,
    suscripcion,
  } = req.body

  if (!nombreCompleto || !correo || !password) {
    throw new HttpError(400, 'Nombre completo, correo y contraseña son obligatorios')
  }

  // typeof evita que lleguen objetos (inyección NoSQL: { "$ne": "" })
  if ([nombreCompleto, correo, password].some((v) => typeof v !== 'string')) {
    throw new HttpError(400, 'Los datos enviados no son válidos')
  }

  const existente = await User.findOne({ correo: correo.toLowerCase().trim() })
  if (existente) throw new HttpError(409, 'Ya existe una cuenta con ese correo')

  const usuario = await User.create({
    nombreCompleto,
    correo,
    password,
    fechaNacimiento: fechaNacimiento || undefined,
    genero,
    pais,
    suscripcion: Boolean(suscripcion),
  })

  res.status(201).json({ mensaje: 'Cuenta creada correctamente', user: usuario })
})

// POST /api/auth/login
// Valida credenciales contra MongoDB y devuelve el usuario verificado + token.
export const login = asyncHandler(async (req, res) => {
  const { correo, password } = req.body

  if (!correo || !password || typeof correo !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Correo y contraseña son obligatorios')
  }

  // +password porque en el esquema está con select:false
  const usuario = await User.findOne({ correo: correo.toLowerCase().trim() }).select(
    '+password',
  )

  // Mismo mensaje si el correo no existe o la contraseña falla:
  // así no se revela qué correos están registrados.
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new HttpError(401, 'Credenciales inválidas')
  }

  res.json({
    mensaje: 'Inicio de sesión exitoso',
    user: usuario, // toJSON() quita el password
    token: firmarToken(usuario),
  })
})

// GET /api/auth/me  (requiere token)
// Devuelve los datos ACTUALES del usuario autenticado leídos de la base de datos.
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})
