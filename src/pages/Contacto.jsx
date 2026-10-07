import { useState } from 'react'
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap'

function Contacto() {
  const [enviado, setEnviado] = useState(false)

  const enviar = (evento) => {
    evento.preventDefault()
    setEnviado(true)
  }

  return (
    <Container className="py-5">
      <h2 className="ts-section-title">Ponte en contacto con nosotros</h2>
      <div className="ts-divider mb-3" />
      <p className="text-secondary">
        ¿Tienes dudas sobre un producto o tu pedido? Escríbenos y te
        responderemos lo antes posible.
      </p>

      <Row className="gy-4">
        <Col md={5}>
          <div className="ts-panel p-4">
            <h5>TecnoStore</h5>
            <address className="mb-0 text-secondary">
              Ciudad de Guatemala, Guatemala
              <br />
              Teléfono: 2222-2222
              <br />
              Correo: contacto@tecnostore.com
            </address>

            <h6 className="mt-4">Síguenos</h6>
            <ul className="list-unstyled d-flex gap-3 mb-0">
              <li>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.x.com" target="_blank" rel="noreferrer">
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </Col>

        <Col md={7}>
          {enviado && (
            <Alert variant="success" onClose={() => setEnviado(false)} dismissible>
              Mensaje enviado (simulación). ¡Gracias por escribirnos!
            </Alert>
          )}

          <Form className="ts-panel p-4" onSubmit={enviar}>
            <legend className="fs-6 fw-semibold mb-3">
              Información del remitente
            </legend>

            <Form.Group className="mb-3" controlId="nombre_contacto">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control type="text" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="correo_contacto">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control type="email" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="asunto">
              <Form.Label>Asunto</Form.Label>
              <Form.Select defaultValue="soporte">
                <option value="soporte">Soporte técnico</option>
                <option value="pedido">Estado de mi pedido</option>
                <option value="devolucion">Devoluciones</option>
                <option value="otro">Otro</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="mensaje">
              <Form.Label>Mensaje</Form.Label>
              <Form.Control as="textarea" rows={5} required />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="info">
                Enviar mensaje
              </Button>
              <Button type="reset" variant="outline-light">
                Limpiar
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default Contacto
