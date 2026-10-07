import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { errorHandler, noEncontrado } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import productoRoutes from './routes/producto.routes.js'

const app = express()

// Render/Railway ponen un proxy delante: necesario para que el rate limit
// vea la IP real del cliente.
app.set('trust proxy', 1)

app.use(helmet())

// CORS: solo el frontend autorizado (CLIENT_URL admite varias URLs separadas por coma)
const origenesPermitidos = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean)
app.use(cors({ origin: origenesPermitidos }))

app.use(express.json({ limit: '10kb' }))

// Límite de intentos en login/registro (protege contra fuerza bruta)
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
})

app.get('/api/health', (_req, res) => {
  res.json({ estado: 'ok', servicio: 'TecnoStore API' })
})

app.use('/api/auth', limitadorAuth, authRoutes)
app.use('/api/productos', productoRoutes)
// Alias con el nombre genérico que pide el enunciado de la tarea
app.use('/api/recursos', productoRoutes)

app.use('/api', noEncontrado)
app.use(errorHandler)

export default app
