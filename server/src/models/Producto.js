import mongoose from 'mongoose'

// Entidad de negocio de TecnoStore: el producto del catálogo.
// Mantiene los mismos campos que usaba src/data/productos.js en la Tarea 2,
// por eso los componentes de React casi no cambian.
const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [120, 'El nombre no puede superar los 120 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    marca: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    disponibilidad: {
      type: String,
      enum: {
        values: ['En stock', 'Pocas unidades', 'Agotado'],
        message: 'Disponibilidad no válida',
      },
      default: 'En stock',
    },
    imagenColor: {
      type: String,
      match: [/^#[0-9a-fA-F]{6}$/, 'El color debe ser hexadecimal (ej. #2dd4c4)'],
      default: '#2dd4c4',
    },
    descripcion: { type: String, trim: true, default: '' },
    caracteristicas: { type: [String], default: [] },
    colores: { type: [String], default: [] },
    // Relación con el usuario que creó el producto
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

// Índice de texto para búsquedas rápidas por nombre/marca
productoSchema.index({ nombre: 'text', marca: 'text' })

productoSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Producto', productoSchema)
