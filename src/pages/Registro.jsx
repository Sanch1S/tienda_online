import { useState } from 'react'
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap'

function Registro() {
  const [enviado, setEnviado] = useState(false)

  const enviar = (evento) => {
    evento.preventDefault()
    setEnviado(true)
  }

  return (
    <Container className="py-5">
      <h2 className="ts-section-title">Regístrate en TecnoStore</h2>
      <div className="ts-divider mb-3" />
      <p className="text-secondary">
        Completa el siguiente formulario para crear tu cuenta. (Este
        formulario no procesa datos, es solo un prototipo).
      </p>

      {enviado && (
        <Alert variant="success" onClose={() => setEnviado(false)} dismissible>
          Cuenta creada correctamente (simulación).
        </Alert>
      )}

      <Form className="ts-panel p-4" onSubmit={enviar}>
        <Row>
          <Col md={6}>
            <fieldset className="mb-4">
              <legend className="fs-6 fw-semibold mb-3">Datos personales</legend>

              <Form.Group className="mb-3" controlId="primer_nombre">
                <Form.Label>Primer nombre</Form.Label>
                <Form.Control type="text" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="apellido">
                <Form.Label>Apellido</Form.Label>
                <Form.Control type="text" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="fecha_nacimiento">
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control type="date" />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Género</Form.Label>
                <div>
                  <Form.Check inline type="radio" name="genero" label="Masculino" id="masculino" />
                  <Form.Check inline type="radio" name="genero" label="Femenino" id="femenino" />
                  <Form.Check inline type="radio" name="genero" label="Otro" id="otro" />
                </div>
              </Form.Group>
            </fieldset>
          </Col>

          <Col md={6}>
            <fieldset className="mb-4">
              <legend className="fs-6 fw-semibold mb-3">Datos de la cuenta</legend>

              <Form.Group className="mb-3" controlId="correo">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control type="email" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="usuario">
                <Form.Label>Nombre de usuario</Form.Label>
                <Form.Control type="text" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control type="password" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmar_password">
                <Form.Label>Confirmar contraseña</Form.Label>
                <Form.Control type="password" required />
              </Form.Group>
            </fieldset>
          </Col>
        </Row>

        <fieldset className="mb-4">
          <legend className="fs-6 fw-semibold mb-3">Preferencias</legend>

          <Form.Group className="mb-3" controlId="pais" style={{ maxWidth: '320px' }}>
            <Form.Label>País</Form.Label>
            <Form.Select defaultValue="guatemala">
              <option value="guatemala">Guatemala</option>
              <option value="mexico">México</option>
              <option value="el_salvador">El Salvador</option>
              <option value="honduras">Honduras</option>
              <option value="otro_pais">Otro</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            id="suscripcion"
            label="Deseo recibir promociones por correo"
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            id="terminos"
            label="Acepto los términos y condiciones"
            required
          />
        </fieldset>

        <div className="d-flex gap-2">
          <Button type="submit" variant="info">
            Crear cuenta
          </Button>
          <Button type="reset" variant="outline-light">
            Limpiar formulario
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default Registro
