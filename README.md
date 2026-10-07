# TecnoStore — Tienda en Línea (Tarea 4)

**Integrante:** Sergio Gualberto Morales Sanchinelli — **Carnet:** 9490-23-14510

| | |
|---|---|
| Rama de esta entrega | `Tarea4` |
| Frontend desplegado (Netlify) |  |
| Backend desplegado (Render/Railway) | |
| Estado global | **Opción A: Context API + useReducer** |

## Descripción

TecnoStore evolucionó en cuatro entregas:

1. **Tarea 1:** sitio estático en HTML.
2. **Tarea 2:** SPA con React, React Router y React-Bootstrap.
3. **Tarea 3:** estado global de sesión (Login / Logout / Perfil) con `useContext` + `useReducer`.
4. **Tarea 4 (esta):** la interfaz deja de usar datos y autenticación simulados y consume una **API REST propia** (Node.js + Express) que guarda usuarios y productos en **MongoDB Atlas** con Mongoose.

## Tecnologías

- **Frontend:** React 18, Vite, React Router DOM, React-Bootstrap, `fetch`.
- **Backend:** Node.js, Express 5, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`.
- **Base de datos:** MongoDB Atlas (clúster gratuito).

## Arquitectura de carpetas

```
tienda_online/
├── public/_redirects            # Netlify: rutas de la SPA (/productos, /perfil...)
├── src/                         # ---------- FRONTEND (React) ----------
│   ├── context/AuthContext.jsx  # AuthProvider + reducer (LOGIN, LOGOUT, UPDATE_USER, SET_LOADING) + hooks
│   ├── services/api.js          # Cliente fetch: authApi y productosApi
│   ├── hooks/useAsync.js        # useAsync (loading/error/data) y useDebounce
│   ├── components/              # Navbar dinámico, Footer, ProductCard, RutaProtegida, Estados
│   ├── pages/                   # Home, Productos, ProductoDetalle, Carrito, Login,
│   │                            # Registro, Perfil, AdminProductos, Contacto
│   └── utils/formato.js
└── server/                      # ---------- BACKEND (Node + Express) ----------
    ├── .env.example             # plantilla de variables de entorno
    └── src/
        ├── server.js            # arranque: conecta a Mongo y luego escucha
        ├── app.js               # middlewares globales y montaje de rutas
        ├── config/db.js         # conexión a MongoDB Atlas (Mongoose)
        ├── models/              # User.js, Producto.js
        ├── routes/              # auth.routes.js, producto.routes.js
        ├── controllers/         # auth.controller.js, producto.controller.js
        ├── middleware/          # auth.js (JWT + roles), errorHandler.js
        ├── utils/asyncHandler.js
        └── seed/                # seed.js + productos.data.js (carga inicial)
```

## Modelos (MongoDB)

**User** — `nombreCompleto`, `correo` (único), `password` (hash bcrypt, nunca se devuelve), `rol` (`admin` | `cliente`), `membresia`, `fechaNacimiento`, `genero`, `pais`, `suscripcion`, `createdAt`, `updatedAt`.

**Producto** (entidad de negocio) — `nombre`, `categoria`, `marca`, `precio`, `disponibilidad`, `imagenColor`, `descripcion`, `caracteristicas[]`, `colores[]`, `creadoPor` (→ User), `createdAt`, `updatedAt`.

## Endpoints

Base: `{API_URL}/api`. Los endpoints de producto también responden en `/api/recursos` (nombre genérico del enunciado).

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado del servicio |
| POST | `/auth/register` | público | Registra un usuario (siempre con rol `cliente`) |
| POST | `/auth/login` | público | Valida credenciales; devuelve `{ user, token }` |
| GET | `/auth/me` | token | Datos actuales del usuario autenticado |
| GET | `/productos` | público | Lista con filtros: `q`, `categoria`, `precioMin`, `precioMax`, `disponibilidad`, `creadoPor`, `orden` |
| GET | `/productos/categorias` | público | Categorías distintas |
| GET | `/productos/:id` | público | Detalle de un producto |
| POST | `/productos` | admin | Crea un producto |
| PUT / PATCH | `/productos/:id` | admin | Actualiza un producto |
| DELETE | `/productos/:id` | admin | Elimina un producto |

Códigos de error usados: `400` datos inválidos, `401` sin sesión / credenciales inválidas, `403` sin permisos, `404` no encontrado, `409` correo duplicado.

### Ejemplos de payload

```jsonc
// POST /api/auth/register
{ "nombreCompleto": "Ana Pérez", "correo": "ana@correo.com", "password": "secreto1",
  "pais": "Guatemala", "suscripcion": true }

// POST /api/auth/login  ->  200 { "user": {...}, "token": "eyJ..." }
{ "correo": "ana@correo.com", "password": "secreto1" }

// POST /api/productos   (Authorization: Bearer <token de admin>)
{ "nombre": "Monitor 27\"", "categoria": "Monitores", "marca": "ViewMax", "precio": 1800,
  "disponibilidad": "En stock", "imagenColor": "#7c8cf8",
  "descripcion": "Monitor 4K IPS.", "caracteristicas": ["4K", "IPS"], "colores": ["Negro"] }
```

La colección lista para importar está en [`docs/tecnostore.postman_collection.json`](docs/tecnostore.postman_collection.json) (Postman o Thunder Client).

## Cómo ejecutarlo en local

Requisitos: Node 18+ y un clúster gratuito en MongoDB Atlas. Paso a paso detallado en [`docs/GUIA_TAREA4.md`](docs/GUIA_TAREA4.md).

```bash
# 1) Backend
cd server
cp .env.example .env        # completa MONGODB_URI y JWT_SECRET
npm install
npm run seed                # crea el admin y carga el catálogo
npm run dev                 # http://localhost:5000

# 2) Frontend (en otra terminal, desde la raíz)
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173
```

Usuario administrador del seed (cámbialo en `server/.env` antes de correr el seed): `admin@tecnostore.com` / `Admin12345`.

## Seguridad

- Credenciales y cadena de conexión solo en `.env` (ignorado por Git); se versiona únicamente `.env.example`.
- Contraseñas con hash `bcrypt`; el campo `password` nunca sale en las respuestas.
- El rol no se acepta desde el registro (nadie puede crearse como `admin`).
- Escritura del catálogo protegida con JWT + rol `admin`; lista blanca de campos en crear/actualizar.
- Mensaje único `Credenciales inválidas` (no revela qué correos existen), `helmet`, CORS restringido a `CLIENT_URL` y límite de intentos en `/auth`.

## Participación

| Integrante | Carnet | Secciones, endpoints y componentes |
|---|---|---|
| Sergio Gualberto Morales Sanchinelli | 9490-23-14510 | Todo el proyecto: backend completo (modelos, rutas, controladores, auth, seed), `AuthContext`, Navbar, Login, Registro, Perfil, Productos, Detalle, AdminProductos, Home y documentación. |
