import { useState } from 'react'
import {
  Accordion,
  Badge,
  Button,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Row,
  Table,
} from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { formatoQuetzales, getProductoPorId } from '../data/productos.js'

function ProductoDetalle() {
  const { id } = useParams()
  const producto = getProductoPorId(id)

  const [cantidad, setCantidad] = useState(1)
  const [color, setColor] = useState(producto?.colores[0] ?? '')
  const [mostrarModal, setMostrarModal] = useState(false)

  if (!producto) {
    return (
      <Container className="py-5">
        <h2>Producto no encontrado</h2>
        <p className="text-secondary">
          El producto que buscas no existe o fue removido del catálogo.
        </p>
        <Link to="/productos" className="btn btn-outline-info">
          Volver al catálogo
        </Link>
      </Container>
    )
  }

  const agregarAlCarrito = (evento) => {
    evento.preventDefault()
    setMostrarModal(true)
  }

  return (
    <Container className="py-5">
      <Row className="gy-4">
        <Col lg={7}>
          <Badge bg="" style={{ backgroundColor: 'var(--ts-accent-dim)' }} className="mb-2">
            {producto.categoria}
          </Badge>
          <h2 className="ts-section-title">{producto.nombre}</h2>

          <Table responsive className="ts-table mt-3" bordered>
            <tbody>
              <tr>
                <th>Marca</th>
                <td>{producto.marca}</td>
              </tr>
              <tr>
                <th>Categoría</th>
                <td>{producto.categoria}</td>
              </tr>
              <tr>
                <th>Precio</th>
                <td className="ts-price">{formatoQuetzales(producto.precio)}</td>
              </tr>
              <tr>
                <th>Disponibilidad</th>
                <td>{producto.disponibilidad}</td>
              </tr>
            </tbody>
          </Table>

          <Accordion defaultActiveKey="0" className="ts-accordion">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Descripción</Accordion.Header>
              <Accordion.Body>{producto.descripcion}</Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Características</Accordion.Header>
              <Accordion.Body>
                <ListGroup variant="flush" className="ts-list-group">
                  {producto.caracteristicas.map((caracteristica) => (
                    <ListGroup.Item key={caracteristica}>
                      {caracteristica}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Link to="/productos" className="d-inline-block mt-4">
            &larr; Volver al catálogo
          </Link>
        </Col>

        <Col lg={5}>
          <Form className="ts-panel p-4" onSubmit={agregarAlCarrito}>
            <legend className="fs-6 fw-semibold mb-3">
              Agregar al carrito
            </legend>

            <Form.Group className="mb-3" controlId="cantidad">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="color">
              <Form.Label>Color</Form.Label>
              <Form.Select
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                {producto.colores.map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="info">
                Agregar al carrito
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      <Modal
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        centered
        className="ts-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Producto agregado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Se agregó <strong>{cantidad}</strong> x {producto.nombre} (color:{' '}
          {color}) a tu carrito. Este es un prototipo, revisa la página
          "Carrito" para ver un ejemplo de carrito ya cargado.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-light" onClick={() => setMostrarModal(false)}>
            Seguir viendo
          </Button>
          <Button as={Link} to="/carrito" variant="info">
            Ir al carrito
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ProductoDetalle
