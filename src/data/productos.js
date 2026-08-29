// Catálogo de productos de TecnoStore.
// Centralizado aquí para que Home, Productos, ProductoDetalle y Carrito
// consuman la misma fuente de datos (evita duplicar información).

export const productos = [
  {
    id: 1,
    nombre: 'Laptop TecnoPro 15"',
    categoria: 'Computadoras',
    marca: 'TecnoPro',
    precio: 6500.0,
    disponibilidad: 'En stock',
    imagenColor: '#2dd4c4',
    descripcion:
      'Laptop de 15 pulgadas ideal para trabajo y estudio. Cuenta con procesador de última generación, 16 GB de memoria RAM y 512 GB de almacenamiento SSD.',
    caracteristicas: [
      'Pantalla de 15.6 pulgadas Full HD',
      'Procesador Intel Core i7',
      '16 GB RAM / 512 GB SSD',
      'Batería de hasta 10 horas',
      'Incluye garantía de 1 año',
    ],
    colores: ['Gris espacial', 'Plateado', 'Negro'],
  },
  {
    id: 2,
    nombre: 'Mouse Inalámbrico X200',
    categoria: 'Accesorios',
    marca: 'X200',
    precio: 150.0,
    disponibilidad: 'En stock',
    imagenColor: '#ffb454',
    descripcion:
      'Mouse inalámbrico ergonómico con sensor óptico de alta precisión y conexión estable de largo alcance.',
    caracteristicas: [
      'Conexión inalámbrica 2.4 GHz',
      'Sensor óptico de 1600 DPI',
      'Batería de larga duración',
      'Diseño ambidiestro',
    ],
    colores: ['Negro', 'Blanco'],
  },
  {
    id: 3,
    nombre: 'Teclado Mecánico RGB',
    categoria: 'Accesorios',
    marca: 'TecnoPro',
    precio: 350.0,
    disponibilidad: 'En stock',
    imagenColor: '#7c8cf8',
    descripcion:
      'Teclado mecánico retroiluminado con switches táctiles, ideal para trabajo y gaming.',
    caracteristicas: [
      'Switches mecánicos táctiles',
      'Iluminación RGB personalizable',
      'Estructura de aluminio',
      'Teclas anti-ghosting',
    ],
    colores: ['Negro'],
  },
  {
    id: 4,
    nombre: 'Smartphone Galaxy Nova',
    categoria: 'Celulares',
    marca: 'Galaxy',
    precio: 3200.0,
    disponibilidad: 'Pocas unidades',
    imagenColor: '#ff7a8a',
    descripcion:
      'Smartphone de gama media-alta con cámara triple, pantalla AMOLED y carga rápida.',
    caracteristicas: [
      'Pantalla AMOLED 6.5"',
      'Cámara triple 108 MP',
      '128 GB de almacenamiento',
      'Carga rápida 33W',
    ],
    colores: ['Negro medianoche', 'Verde esmeralda', 'Violeta'],
  },
  {
    id: 5,
    nombre: 'Audífonos Bluetooth SoundMax',
    categoria: 'Accesorios',
    marca: 'SoundMax',
    precio: 275.0,
    disponibilidad: 'En stock',
    imagenColor: '#2dd4c4',
    descripcion:
      'Audífonos inalámbricos con cancelación de ruido activa y hasta 20 horas de batería.',
    caracteristicas: [
      'Cancelación de ruido activa (ANC)',
      'Bluetooth 5.2',
      '20 horas de batería',
      'Estuche de carga incluido',
    ],
    colores: ['Negro', 'Blanco', 'Azul'],
  },
]

export function getProductoPorId(id) {
  return productos.find((p) => p.id === Number(id))
}

export function formatoQuetzales(valor) {
  return `Q ${valor.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
}
