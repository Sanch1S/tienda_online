import { Router } from 'express'
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarCategorias,
  listarProductos,
  obtenerProducto,
} from '../controllers/producto.controller.js'
import { proteger, soloAdmin } from '../middleware/auth.js'

const router = Router()

// Lectura pública: cualquier visitante puede ver el catálogo
router.get('/', listarProductos)
router.get('/categorias', listarCategorias) // antes de '/:id' para que no lo confunda con un ID
router.get('/:id', obtenerProducto)

// Escritura: solo administradores autenticados
router.post('/', proteger, soloAdmin, crearProducto)
router.put('/:id', proteger, soloAdmin, actualizarProducto)
router.patch('/:id', proteger, soloAdmin, actualizarProducto)
router.delete('/:id', proteger, soloAdmin, eliminarProducto)

export default router
