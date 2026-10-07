# Guía paso a paso — Tarea 4 (React + Node/Express + MongoDB Atlas)

> Esta guía acompaña el código de la rama `Tarea4`. El repositorio que tenías (`Tarea2`) no incluía lo de la Tarea 3, así que esta rama **ya integra las dos cosas**: el estado global de sesión (Context + useReducer) y la conexión real con MongoDB.

## 0. Qué cambió respecto a la Tarea 2

| Antes (Tarea 2) | Ahora (Tarea 4) |
|---|---|
| Catálogo en `src/data/productos.js` | Colección `productos` en MongoDB, consumida con `fetch` |
| Registro que no guardaba nada | `POST /api/auth/register` guarda el usuario (contraseña con hash) |
| Sin login | `POST /api/auth/login` + `AuthContext` (LOGIN/LOGOUT/UPDATE_USER/SET_LOADING) |
| Navbar fijo | Navbar que cambia según la sesión (Iniciar sesión / nombre + Perfil + Cerrar sesión) |
| — | `Perfil` (Card, Badge, ListGroup, Table) con datos leídos de MongoDB |
| — | `AdminProductos`: crear, editar y eliminar productos desde la UI |
| Carpeta única | Frontend en la raíz + backend en `server/` |

---

## 1. Crear la rama `Tarea4`

```bash
git clone https://github.com/Sanch1S/tienda_online.git
cd tienda_online
git checkout Tarea2            # parte de tu trabajo actual
git checkout -b Tarea4         # nueva rama (copia los archivos de esta entrega aquí)
```

Copia a tu repo las carpetas/archivos de esta entrega (`server/`, `src/`, `public/`, `docs/`, `README.md`, `.env.example`, `.gitignore`, `package.json`) y continúa con el paso 2.

## 2. Crear el clúster gratuito en MongoDB Atlas

1. Entra a <https://www.mongodb.com/cloud/atlas/register> y crea una cuenta.
2. **Create → Deploy a cluster → M0 (Free)**. Elige un proveedor/región cercanos (por ejemplo AWS · N. Virginia) y crea el clúster.
3. **Database Access → Add New Database User**
   - Método: *Password*. Usuario, por ejemplo, `tecnostore_user` y una contraseña segura.
   - Rol: *Read and write to any database* (o *Atlas admin* para la tarea).
   - Si la contraseña tiene símbolos (`@ : / ? # %`), conviértelos a formato URL (`@` → `%40`) o usa una contraseña solo con letras y números.
4. **Network Access → Add IP Address**
   - Para desarrollo: *Add Current IP Address*.
   - Para que **Render/Railway** pueda conectarse: *Allow access from anywhere* (`0.0.0.0/0`). Es lo normal en el plan gratuito, porque Render no tiene IP fija.
5. **Database → Connect → Drivers → Node.js** y copia la cadena de conexión:

   ```
   mongodb+srv://tecnostore_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

   Reemplaza `<password>` y **agrega el nombre de la base de datos** antes del `?`:

   ```
   mongodb+srv://tecnostore_user:MiClave123@cluster0.xxxxx.mongodb.net/tecnostore?retryWrites=true&w=majority
   ```

## 3. Configurar y ejecutar el backend

```bash
cd server
cp .env.example .env     # en Windows (PowerShell): copy .env.example .env
```

Edita `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://tecnostore_user:MiClave123@cluster0.xxxxx.mongodb.net/tecnostore?retryWrites=true&w=majority
JWT_SECRET=<una clave larga y aleatoria>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NOMBRE=Administrador TecnoStore
ADMIN_EMAIL=admin@tecnostore.com
ADMIN_PASSWORD=Admin12345
```

Genera el `JWT_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Instala, siembra los datos y arranca:

```bash
npm install
npm run seed      # crea el usuario admin y migra los 5 productos de la Tarea 2 a MongoDB
npm run dev       # API en http://localhost:5000
```

Si todo va bien verás:

```
✅ MongoDB conectado (base de datos: tecnostore)
🚀 API de TecnoStore escuchando en el puerto 5000
```

Comprueba en Atlas (**Database → Browse Collections**) que existen las colecciones `users` y `productos`. Abre <http://localhost:5000/api/health> en el navegador: debe responder `{"estado":"ok",...}`.

> `npm run seed:reset` borra todos los productos y los vuelve a cargar. Úsalo solo si quieres reiniciar el catálogo.

## 4. Probar los endpoints (antes de tocar React)

Importa `docs/tecnostore.postman_collection.json` en **Postman** (Import) o **Thunder Client** (Collections → Import). La colección tiene las variables `baseUrl` y `token`; la petición **Login admin** guarda el token automáticamente para las demás.

Orden sugerido: `Health` → `Registro` → `Login cliente` → `Me` → `Login admin` → `Crear producto` → `Listar` → `Detalle` → `Actualizar` → `Eliminar`. Pruebas de error útiles: login con contraseña mala (**401**), crear producto con token de cliente (**403**), registrar un correo repetido (**409**).

## 5. Ejecutar el frontend

En otra terminal, desde la raíz del proyecto:

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm install
npm run dev              # http://localhost:5173
```

Recorrido para validar la tarea:

1. **Crear cuenta** → se guarda en MongoDB y te lleva a **Iniciar sesión**.
2. Inicia sesión con credenciales incorrectas → `Alert` rojo con *Credenciales inválidas* (401).
3. Inicia sesión bien → el Navbar muestra tu nombre, un badge con el rol, **Perfil** y **Cerrar sesión**.
4. **Perfil** → datos leídos de la base de datos (Card, Badge, ListGroup). Recarga la página: la sesión persiste.
5. **Productos** → carga con indicador de *loading*; el filtro de texto, categoría y precio se resuelve en el servidor. Apaga el backend y recarga: debe verse el mensaje de error con botón **Reintentar**.
6. Entra con el **admin** (`admin@tecnostore.com`) → aparece **Administrar** → crea, edita y elimina un producto, y compruébalo en Atlas.

## 6. Subir el código a GitHub

```bash
git status                # verifica que NO aparezca ningún archivo .env
git add .
git commit -m "Tarea 4: backend Node/Express + MongoDB Atlas e integración con React"
git push -u origin Tarea4
```

Si por error subiste una contraseña o cadena de conexión: cámbiala en Atlas (Database Access) **de inmediato**, porque el historial de Git conserva el valor aunque lo borres después.

## 7. Desplegar el backend en Render

1. <https://render.com> → **New → Web Service** → conecta el repositorio y elige la rama `Tarea4`.
2. Configuración:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
3. **Environment** → agrega: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, y `CLIENT_URL` (la URL de Netlify del paso 8; puedes dejarla provisional y actualizarla luego). **No** definas `PORT`: Render lo asigna.
4. Cuando termine, prueba `https://<tu-servicio>.onrender.com/api/health`.
5. Corre el seed contra Atlas una sola vez desde tu computadora (ya lo hiciste en el paso 3: la base de datos es la misma).

> En el plan gratuito, Render duerme el servicio tras ~15 min sin tráfico; la primera petición puede tardar 30–60 s. Menciónalo al calificador o abre la URL antes de la revisión.

## 8. Desplegar el frontend en Netlify

1. **Add new site → Import from Git** → repositorio y rama `Tarea4`.
2. **Build command:** `npm run build` · **Publish directory:** `dist`.
3. **Site configuration → Environment variables:** `VITE_API_URL=https://<tu-servicio>.onrender.com` (sin `/` al final ni `/api`).
4. Despliega. El archivo `public/_redirects` hace que recargar `/productos` o `/perfil` no dé error 404.
5. Vuelve a Render y pon en `CLIENT_URL` la URL exacta de Netlify (`https://tu-sitio.netlify.app`, sin `/` final). Si no coincide, el navegador bloqueará las peticiones por CORS.

## 9. Checklist de entrega

| Requisito del enunciado | Dónde está |
|---|---|
| Rama `Tarea4` | `git branch` |
| Atlas + variables de entorno, sin credenciales en el repo | `server/.env.example`, `.gitignore` |
| Conexión con Mongoose y control de errores | `server/src/config/db.js`, `server/src/server.js` |
| Modelo `User` (nombre, correo, password, rol, timestamps) | `server/src/models/User.js` |
| Modelo de la entidad de negocio | `server/src/models/Producto.js` |
| `POST /api/auth/register`, `POST /api/auth/login` | `server/src/controllers/auth.controller.js` |
| CRUD completo + filtros por query params | `server/src/controllers/producto.controller.js` |
| Estructura rutas / controladores / modelos / config | `server/src/` |
| Login conectado a la API + acción `LOGIN` | `src/pages/Login.jsx`, `src/context/AuthContext.jsx` |
| Errores (401) con `Alert` | `src/pages/Login.jsx` |
| GET desde la API con loading y errores | `src/pages/Productos.jsx`, `Home.jsx`, `ProductoDetalle.jsx`, `src/components/Estados.jsx` |
| Crear / editar / eliminar desde la UI | `src/pages/AdminProductos.jsx` |
| Perfil con datos desde la base de datos (Card, Badge, ListGroup, Table) | `src/pages/Perfil.jsx` |
| Enlaces desplegados | `README.md` (completa los dos enlaces) |
| Colección de pruebas | `docs/tecnostore.postman_collection.json` |
| Arquitectura de carpetas | `README.md` |
| Nombre y carné con lo desarrollado | `README.md` (sección Participación) |

Si trabajan en grupo, repartan y actualicen la tabla **Participación** del README y el arreglo `integrantes` de `src/components/Footer.jsx`.

## 10. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `bad auth : authentication failed` | Usuario/contraseña de `MONGODB_URI` incorrectos, o contraseña con símbolos sin codificar. |
| `Server selection timed out` / `ENOTFOUND` | Tu IP no está en *Network Access*, o el nombre del clúster en la URI está mal. |
| `Falta la variable MONGODB_URI` | No existe `server/.env` o estás corriendo el comando desde otra carpeta. |
| En el navegador: *blocked by CORS policy* | `CLIENT_URL` no coincide exactamente con la URL del frontend. |
| *No se pudo conectar con el servidor* | `VITE_API_URL` mal escrita, backend apagado o dormido (Render). Las variables `VITE_` se leen al **construir**: tras cambiarlas, vuelve a desplegar. |
| 404 al recargar `/perfil` en Netlify | Falta `public/_redirects`. |
| 403 al crear un producto | Estás con un usuario `cliente`. Entra con el admin del seed. |
