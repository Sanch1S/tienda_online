import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    nombreCompleto: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede superar los 100 caracteres'],
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido'],
    },
    // select: false => la contraseña (hash) NUNCA sale en las consultas
    // a menos que se pida explícitamente con .select('+password').
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },
    rol: {
      type: String,
      enum: { values: ['admin', 'cliente'], message: 'Rol no válido' },
      default: 'cliente',
    },
    membresia: {
      type: String,
      enum: ['Estándar', 'Plus', 'Premium'],
      default: 'Estándar',
    },
    // Datos opcionales del formulario de registro
    fechaNacimiento: { type: Date },
    genero: { type: String, enum: ['masculino', 'femenino', 'otro', ''], default: '' },
    pais: { type: String, trim: true, default: 'Guatemala' },
    suscripcion: { type: Boolean, default: false },
  },
  { timestamps: true }, // createdAt / updatedAt automáticos
)

// Antes de guardar, si la contraseña cambió, se guarda su hash (nunca el texto plano).
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.compararPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password)
}

// Al convertir a JSON: expone "id", y oculta password y __v.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.password
    return ret
  },
})

export default mongoose.model('User', userSchema)
