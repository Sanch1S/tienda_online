import 'dotenv/config'
import { connectDB, disconnectDB } from '../config/db.js'
import Producto from '../models/Producto.js'
import User from '../models/User.js'
import { productosIniciales } from './productos.data.js'

// Uso:
//   npm run seed          -> crea el admin (si no existe) y carga el catálogo si está vacío
//   npm run seed:reset    -> borra TODOS los productos y los vuelve a cargar
const reset = process.argv.includes('--reset')

async function sembrar() {
  await connectDB()

  // 1) Usuario administrador (para poder crear/editar/eliminar productos)
  const correoAdmin = (process.env.ADMIN_EMAIL || 'admin@tecnostore.com').toLowerCase()
  let admin = await User.findOne({ correo: correoAdmin })

  if (!admin) {
    admin = await User.create({
      nombreCompleto: process.env.ADMIN_NOMBRE || 'Administrador TecnoStore',
      correo: correoAdmin,
      password: process.env.ADMIN_PASSWORD || 'Admin12345',
      rol: 'admin',
      membresia: 'Premium',
    })
    console.log(`👤 Admin creado: ${correoAdmin}`)
  } else {
    console.log(`👤 El admin ya existía: ${correoAdmin}`)
  }

  // 2) Catálogo de productos
  if (reset) {
    const { deletedCount } = await Producto.deleteMany({})
    console.log(`🗑️  Productos eliminados: ${deletedCount}`)
  }

  const total = await Producto.countDocuments()
  if (total === 0) {
    await Producto.insertMany(
      productosIniciales.map((p) => ({ ...p, creadoPor: admin._id })),
    )
    console.log(`📦 Productos insertados: ${productosIniciales.length}`)
  } else {
    console.log(`📦 Ya hay ${total} productos; no se insertó nada (usa seed:reset para reiniciar).`)
  }
}

sembrar()
  .catch((error) => {
    console.error('❌ Error en el seed:', error.message)
    process.exitCode = 1
  })
  .finally(disconnectDB)
