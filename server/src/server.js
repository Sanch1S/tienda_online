import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

async function iniciar() {
  if (!process.env.JWT_SECRET) {
    console.error('❌ Falta la variable JWT_SECRET. Revisa tu archivo .env')
    process.exit(1)
  }

  try {
    // Primero la base de datos; el servidor solo escucha si la conexión funcionó.
    await connectDB()
    app.listen(PORT, () => {
      console.log(`🚀 API de TecnoStore escuchando en el puerto ${PORT}`)
    })
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message)
    process.exit(1)
  }
}

iniciar()
