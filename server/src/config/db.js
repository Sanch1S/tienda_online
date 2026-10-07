import mongoose from 'mongoose'

// Conexión persistente a MongoDB Atlas con control de errores.
// Mongoose mantiene un pool de conexiones y reconecta solo si se cae la red,
// así que basta con llamar a connectDB() una vez al arrancar el servidor.
export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('Falta la variable MONGODB_URI. Revisa tu archivo .env')
  }

  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB conectado (base de datos: ${mongoose.connection.name})`)
  })
  mongoose.connection.on('error', (error) => {
    console.error('❌ Error en la conexión con MongoDB:', error.message)
  })
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB desconectado')
  })

  // Si Atlas no responde en 10 s (IP no autorizada, credenciales malas...)
  // falla rápido con un mensaje claro en lugar de quedarse colgado.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
