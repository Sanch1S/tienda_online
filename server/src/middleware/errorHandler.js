// Rutas /api que no existen
export const noEncontrado = (req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}

// Manejador central de errores: traduce errores de Mongoose/JWT a respuestas
// HTTP claras para que el frontend pueda mostrar un mensaje al usuario.
export const errorHandler = (err, _req, res, _next) => {
  // Validaciones del esquema de Mongoose => 400
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ mensaje: errores.join('. '), errores })
  }

  // ID con formato inválido => 400
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: `Valor no válido para "${err.path}"` })
  }

  // Valor duplicado en un campo unique (ej. correo) => 409
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || {})[0] || 'campo'
    return res.status(409).json({ mensaje: `Ya existe un registro con ese ${campo}` })
  }

  // JSON mal formado en el body => 400
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' })
  }

  const status = err.status || 500
  if (status === 500) console.error('💥 Error no controlado:', err)

  res.status(status).json({
    mensaje: status === 500 ? 'Error interno del servidor' : err.message,
  })
}
