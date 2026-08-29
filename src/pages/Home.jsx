import { Carousel, Col, Container, Row } from 'react-bootstrap'
import ProductCard from '../components/ProductCard.jsx'
import { productos } from '../data/productos.js'

const promociones = [
  {
    id: 1,
    titulo: 'Hasta 20% en laptops',
    texto: 'Equípate para el semestre con nuestra línea TecnoPro.',
    color: '#0f766e',
  },
  {
    id: 2,
    titulo: 'Envío gratis a todo el país',
    texto: 'En compras mayores a Q 500.00, sin excepciones.',
    color: '#334155',
  },
  {
    id: 3,
    titulo: 'Accesorios desde Q 150.00',
    texto: 'Mouse, teclados y audífonos para tu setup ideal.',
    color: '#1d4ed8',
  },
]

function Home() {
  const destacados = productos.slice(0, 3)

  return (
    <>
      <section className="ts-hero py-5">
        <Container>
          <Row className="align-items-center gy-4">
            <Col lg={7}>
              <p className="ts-eyebrow mb-2">Tienda en línea de tecnología</p>
              <h1 className="display-5 fw-bold mb-3">
                Bienvenido a TecnoStore
              </h1>
              <p className="text-secondary fs-5">
                Encuentra los mejores productos de tecnología al mejor precio.
                Explora nuestro catálogo, agrega productos a tu carrito y
                regístrate para disfrutar de promociones exclusivas.
              </p>
            </Col>
            <Col lg={5}>
              <Carousel className="ts-carousel" fade>
                {promociones.map((promo) => (
                  <Carousel.Item key={promo.id}>
                    <div
                      className="ts-slide"
                      style={{ backgroundColor: promo.color }}
                    >
                      <h3>{promo.titulo}</h3>
                      <p className="mb-0">{promo.texto}</p>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <div className="mb-4">
          <h2 className="ts-section-title">¿Por qué comprar con nosotros?</h2>
          <div className="ts-divider mb-3" />
        </div>
        <Row className="gy-3 mb-5">
          {[
            'Envíos a todo el país',
            'Garantía en todos nuestros productos',
            'Atención al cliente personalizada',
            'Múltiples formas de pago',
          ].map((beneficio) => (
            <Col md={3} sm={6} key={beneficio}>
              <div className="ts-panel p-3 h-100 text-center">
                <span className="fs-4">✓</span>
                <p className="mb-0 mt-2 small">{beneficio}</p>
              </div>
            </Col>
          ))}
        </Row>

        <div className="mb-4">
          <h2 className="ts-section-title">Productos destacados</h2>
          <div className="ts-divider mb-3" />
        </div>
        <Row className="gy-4">
          {destacados.map((producto) => (
            <Col lg={4} md={6} key={producto.id}>
              <ProductCard producto={producto} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  )
}

export default Home
