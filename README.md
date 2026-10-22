# TecnoStore — Tienda en Línea (Tarea 5: seguridad con JWT)

**Integrante:** Sergio Gualberto Morales Sanchinelli — **Carnet:** 9490-23-14510

| | |
|---|---|
| Rama de esta entrega | `Tarea5` |
| Frontend desplegado (Netlify) | https://tarea4sgms.netlify.app/ |
| Backend desplegado (Render) |https://tienda-online-lioj.onrender.com/ |
| Estado global | **Opción A: Context API + useReducer** |
| Colección Postman | [`docs/tecnostore_tarea5.postman_collection.json`](docs/tecnostore_tarea5.postman_collection.json) |

## Descripción

TecnoStore evolucionó en cuatro entregas:

1. **Tarea 1:** sitio estático en HTML.
2. **Tarea 2:** SPA con React, React Router y React-Bootstrap.
3. **Tarea 3:** estado global de sesión (Login / Logout / Perfil) con `useContext` + `useReducer`.
4. **Tarea 4:** la interfaz deja de usar datos y autenticación simulados y consume una **API REST propia** (Node.js + Express) que guarda usuarios y productos en **MongoDB Atlas** con Mongoose.
5. **Tarea 5 (esta):** seguridad *stateless* con **JSON Web Tokens** que expiran a los **5 minutos**; el frontend inyecta el token en cada petición y, si caduca, cierra la sesión, avisa al usuario y lo redirige a `/login`.

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

## Autenticación con JWT (Tarea 5)

### Cómo se configuró la expiración en el backend

- **Variables de entorno** (`server/.env`, nunca en Git; el repo solo trae `server/.env.example`): `JWT_SECRET` (clave de firma) y `JWT_EXPIRES_IN=5m`.
- **Generación:** `POST /api/auth/login` valida el correo y la contraseña (bcrypt) y firma el token en `server/src/controllers/auth.controller.js` con `jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '5m' })`. La opción `expiresIn` agrega el claim `exp` = `iat + 300 s`, es decir, **exactamente 5 minutos**.
- **Middleware reutilizable:** `proteger` (`server/src/middleware/auth.js`) lee `Authorization: Bearer <token>`, verifica la firma con `JWT_SECRET` (`jwt.verify` también comprueba `exp`) y deja el usuario en `req.user`. Se aplica a las rutas protegidas: `POST`, `PUT/PATCH` y `DELETE` de `/api/productos` (junto a `soloAdmin`) y a la consulta privada `GET /api/auth/me`.
- **Respuestas 401** (siempre JSON `{ error, message }`):

| Situación | `error` |
|---|---|
| No hay cabecera `Authorization` o no trae token | `token_missing` |
| El token superó los 5 min (`TokenExpiredError`) | `token_expired` |
| Firma incorrecta, token mal formado o usuario inexistente | `token_invalid` |

```json
{
  "error": "token_expired",
  "message": "La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente."
}
```

### Cómo el frontend intercepta la expiración y redirige

1. **Persistencia y estado global:** al iniciar sesión, `AuthContext` (`useReducer`) guarda `{ user, token }` en el estado y en `localStorage`, y mantiene `isAuthenticated` sincronizado.
2. **Cliente HTTP centralizado:** `src/services/api.js` es el único punto por donde salen las peticiones. Lee el token vigente y adjunta `Authorization: Bearer <token>` automáticamente (las páginas ya no pasan el token a mano).
3. **Interceptor de respuestas:** en ese mismo cliente, si la API responde **401 a una petición que llevaba token**, se llama a `onSesionExpirada` (registrado por `AuthProvider` con `configurarClienteHttp`). Un 401 de un login fallido no lleva token, así que no lo activa. Si varias peticiones fallan a la vez, solo se procesa la primera.
4. **Qué hace al detectar la expiración:** despacha la acción `LOGOUT` (borra token y usuario del estado y de `localStorage`) y ejecuta `navigate('/login', { replace: true, state: { sesionExpirada: true, desde } })` con `useNavigate`.
5. **Aviso al usuario:** `Login.jsx` muestra un `<Alert variant="warning">` de React-Bootstrap con el texto *"Su sesión ya no es válida o ha caducado. Por favor, inicie sesión nuevamente."*. Tras volver a iniciar sesión, regresa a la página donde estaba (`desde`).
6. **Al recargar la página** con un token vencido guardado, la validación inicial (`GET /api/auth/me`) pasa por el mismo interceptor y produce el mismo resultado.

### Cómo probarlo

1. Importa la colección de Postman/Thunder Client y ejecuta **1. Login** (guarda el token) y luego **2. Endpoint protegido** → `200`.
2. Espera 5 minutos y ejecuta **3. Token vencido** → `401` con `token_expired`.
3. En la app: inicia sesión, espera 5 minutos y realiza una acción protegida (p. ej. crear/editar un producto en *Administrar*, o recargar *Mi perfil*): se muestra el aviso y se redirige a `/login`.

## Modelos (MongoDB)

**User** — `nombreCompleto`, `correo` (único), `password` (hash bcrypt, nunca se devuelve), `rol` (`admin` | `cliente`), `membresia`, `fechaNacimiento`, `genero`, `pais`, `suscripcion`, `createdAt`, `updatedAt`.

**Producto** (entidad de negocio) — `nombre`, `categoria`, `marca`, `precio`, `disponibilidad`, `imagenColor`, `descripcion`, `caracteristicas[]`, `colores[]`, `creadoPor` (→ User), `createdAt`, `updatedAt`.

## Endpoints

Base: `{API_URL}/api`. Los endpoints de producto también responden en `/api/recursos` (nombre genérico del enunciado).

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado del servicio |
| POST | `/auth/register` | público | Registra un usuario (siempre con rol `cliente`) |
| POST | `/auth/login` | público | Valida credenciales; devuelve `{ user, token }` (JWT de 5 min) |
| GET | `/auth/me` | token | Datos actuales del usuario autenticado (consulta privada) |
| GET | `/productos` | público | Lista con filtros: `q`, `categoria`, `precioMin`, `precioMax`, `disponibilidad`, `creadoPor`, `orden` |
| GET | `/productos/categorias` | público | Categorías distintas |
| GET | `/productos/:id` | público | Detalle de un producto |
| POST | `/productos` | admin | Crea un producto |
| PUT / PATCH | `/productos/:id` | admin | Actualiza un producto |
| DELETE | `/productos/:id` | admin | Elimina un producto |

Códigos de error usados: `400` datos inválidos, `401` sin sesión / credenciales inválidas / token expirado, `403` sin permisos, `404` no encontrado, `409` correo duplicado.

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

La colección lista para importar está en [`docs/tecnostore_tarea5.postman_collection.json`](docs/tecnostore_tarea5.postman_collection.json) (Postman o Thunder Client).

## Cómo ejecutarlo en local

Requisitos: Node 18+ y un clúster gratuito en MongoDB Atlas.

```bash
# 1) Backend
cd server
cp .env.example .env        # completa MONGODB_URI y JWT_SECRET (JWT_EXPIRES_IN=5m)
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
- Sesión *stateless* con JWT de 5 minutos; `JWT_SECRET` y el tiempo de expiración viven solo en el `.env` del backend (o en las variables de entorno de Render/Railway).
- Escritura del catálogo protegida con JWT + rol `admin`; lista blanca de campos en crear/actualizar.
- Mensaje único `Credenciales inválidas` (no revela qué correos existen), `helmet`, CORS restringido a `CLIENT_URL` y límite de intentos en `/auth`.

## Participación

| Integrante | Carnet | Secciones, endpoints y componentes |
|---|---|---|
| Sergio Gualberto Morales Sanchinelli | 9490-23-14510 | Todo el proyecto: backend completo (modelos, rutas, controladores, seed), **Tarea 5:** generación del JWT de 5 min en el login, middleware `proteger` con errores `token_missing` / `token_expired` / `token_invalid`, `.env.example`; frontend: `AuthContext`, cliente HTTP con inyección de token e interceptor 401, aviso de sesión caducada en `Login`, redirección con `useNavigate`, colección Postman y documentación. |
