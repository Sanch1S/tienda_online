import { Col, Container, Row } from 'react-bootstrap'

const integrantes = [
  {
    nombre: 'Sergio Gualberto Morales Sanchinelli',
    carnet: '9490-23-14510',
    modulos:
      'Estructura del proyecto (React + Vite), enrutamiento, Navbar, Footer, Home, Productos, Detalle de producto, Carrito, Registro y Contacto.',
  },
]

function Footer() {
  return (
    <footer className="ts-footer py-4 mt-5">
      <Container>
        <Row className="gy-3">
          {integrantes.map((integrante) => (
            <Col md={12} key={integrante.carnet}>
              <p className="mb-1">
                <strong>{integrante.nombre}</strong> &mdash; Carnet:{' '}
                {integrante.carnet}
              </p>
              <p className="mb-0 small">{integrante.modulos}</p>
            </Col>
          ))}
        </Row>
        <hr className="border-secondary" />
        <p className="mb-0 small text-center">
          &copy; {new Date().getFullYear()} TecnoStore. Proyecto académico —
          Tarea 2, Desarrollo Web.
        </p>
      </Container>
    </footer>
  )
}

export default Footer
