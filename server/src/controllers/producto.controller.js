import mongoose from 'mongoose'
import Producto from '../models/Producto.js'
import { asyncHandler, HttpError } from '../utils/asyncHandler.js'

// Campos que el cliente puede enviar (lista blanca): evita que se
// sobrescriban campos internos como creadoPor, _id o timestamps.
const CAMPOS_PERMITIDOS = [
  'nombre',
  'categoria',
  'marca',
  'precio',
  'disponibilidad',
  'imagenColor',
  'descripcion',
  'caracteristicas',
  'colores',
]

const filtrarCampos = (body) =>
  Object.fromEntries(
    Object.entries(body).filter(([clave]) => CAMPOS_PERMITIDOS.includes(clave)),
  )

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ORDENES = {
  precio_asc: { precio: 1 },
  precio_desc: { precio: -1 },
  nombre: { nombre: 1 },
  recientes: { createdAt: -1 },
}

const validarId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'El ID no es válido')
}

// GET /api/productos?q=laptop&categoria=Accesorios&precioMin=100&precioMax=500&orden=precio_asc
export const listarProductos = asyncHandler(async (req, res) => {
  const { q, categoria, disponibilidad, precioMin, precioMax, creadoPor, orden } = req.query
  const filtro = {}

  // Solo se aceptan strings: así ?categoria[$ne]=x no se convierte en operador de Mongo.
  if (typeof q === 'string' && q.trim()) {
    const regex = new RegExp(escaparRegex(q.trim()), 'i')
    filtro.$or = [{ nombre: regex }, { marca: regex }]
  }
  if (typeof categoria === 'string' && categoria && categoria !== 'todas') {
    filtro.categoria = categoria
  }
  if (typeof disponibilidad === 'string' && disponibilidad) {
    filtro.disponibilidad = disponibilidad
  }
  if (typeof creadoPor === 'string' && mongoose.isValidObjectId(creadoPor)) {
    filtro.creadoPor = creadoPor
  }

  const precio = {}
  if (precioMin !== undefined && precioMin !== '' && !Number.isNaN(Number(precioMin))) {
    precio.$gte = Number(precioMin)
  }
  if (precioMax !== undefined && precioMax !== '' && !Number.isNaN(Number(precioMax))) {
    precio.$lte = Number(precioMax)
  }
  if (Object.keys(precio).length) filtro.precio = precio

  const productos = await Producto.find(filtro).sort(ORDENES[orden] || { createdAt: 1 })

  res.json({ total: productos.length, productos })
})

// GET /api/productos/categorias -> lista de categorías distintas (para el filtro)
export const listarCategorias = asyncHandler(async (_req, res) => {
  const categorias = await Producto.distinct('categoria')
  res.json({ categorias: categorias.sort((a, b) => a.localeCompare(b, 'es')) })
})

// GET /api/productos/:id
export const obtenerProducto = asyncHandler(async (req, res) => {
  validarId(req.params.id)
  const producto = await Producto.findById(req.params.id)
  if (!producto) throw new HttpError(404, 'Producto no encontrado')
  res.json({ producto })
})

// POST /api/productos  (admin)
export const crearProducto = asyncHandler(async (req, res) => {
  const producto = await Producto.create({
    ...filtrarCampos(req.body),
    creadoPor: req.user._id,
  })
  res.status(201).json({ mensaje: 'Producto creado', producto })
})

// PUT/PATCH /api/productos/:id  (admin)
export const actualizarProducto = asyncHandler(async (req, res) => {
  validarId(req.params.id)
  const producto = await Producto.findByIdAndUpdate(
    req.params.id,
    filtrarCampos(req.body),
    { new: true, runValidators: true },
  )
  if (!producto) throw new HttpError(404, 'Producto no encontrado')
  res.json({ mensaje: 'Producto actualizado', producto })
})

// DELETE /api/productos/:id  (admin)
export const eliminarProducto = asyncHandler(async (req, res) => {
  validarId(req.params.id)
  const producto = await Producto.findByIdAndDelete(req.params.id)
  if (!producto) throw new HttpError(404, 'Producto no encontrado')
  res.json({ mensaje: 'Producto eliminado', id: req.params.id })
})
