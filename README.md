# TecnoStore — Tienda en Línea (Tarea 2)

Sergio Gualberto Morales Sanchinelli
**Carnet:** 9490-23-14510

> Enlace del sitio publicado: https://tarea2sgms.netlify.app/

## Descripción del proyecto

Este proyecto es la evolución de la Tienda en Línea desarrollada en la Tarea 1
(HTML estático). En esta Tarea 2 el sitio fue reconstruido como una aplicación
web de una sola página (SPA) utilizando **React**, **React Router** y
**React-Bootstrap**, conservando la misma arquitectura de información
(Inicio, Productos, Detalle de producto, Carrito, Crear cuenta y Contacto),
pero ahora componentizada, modular y completamente responsiva.

### Componentes y páginas principales

| Página / Componente | Descripción | Componentes de Bootstrap usados |
|---|---|---|
| `NavbarComponent` | Barra de navegación global y responsiva, presente en todas las páginas | `Navbar`, `Nav` |
| `Footer` | Pie de página reutilizable con los datos de los integrantes | `Container`, `Row`, `Col` |
| `Home` | Bienvenida, carrusel de promociones y cuadrícula de productos destacados | `Carousel`, `Card`, `Row`/`Col` |
| `Productos` | Catálogo con filtros funcionales (nombre, categoría, precio máximo) | `Form`, `Card` |
| `ProductoDetalle` | Ficha técnica del producto con especificaciones y formulario de compra | `Table`, `Accordion`, `ListGroup`, `Badge`, `Modal` |
| `Carrito` | Carrito editable (cantidades, eliminar ítems) y formulario de checkout | `Table`, `Form`, `Alert` |
| `Registro` | Formulario de creación de cuenta (prototipo) | `Form` |
| `Contacto` | Datos de contacto y formulario de mensajes | `Form` |

Todos los datos de productos se centralizan en `src/data/productos.js` para
que las páginas de Inicio, Productos, Detalle y Carrito compartan la misma
fuente de información.

## Tecnologías

- React 18 + Vite
- React Router DOM (enrutamiento entre páginas)
- React-Bootstrap + Bootstrap 5 (componentes y diseño responsivo)

## Rama de la tarea

Este trabajo se encuentra en la rama `Tarea2`.
