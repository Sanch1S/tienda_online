import { useState } from 'react'
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authApi } from '../services/api.js'

const formularioInicial = {
  primerNombre: '',
  apellido: '',
  fechaNacimiento: '',
  genero: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  pais: 'Guatemala',
  suscripcion: false,
  terminos: false,
}

function Registro() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState(formularioInicial)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [validado, setValidado] = useState(false)

  if (isAuthenticated) return <Navigate to="/perfil" replace />

  const cambiar = (campo) => (e) =>
    setDatos((prev) => ({
      ...prev,
      [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const passwordsCoinciden = datos.password === datos.confirmarPassword

  const enviar = async (evento) => {
    evento.preventDefault()
    setError('')
    setValidado(true)

    if (!evento.currentTarget.checkValidity() || !passwordsCoinciden) return

    setEnviando(true)
    try {
      // POST /api/auth/register -> se guarda el usuario en MongoDB Atlas
      await authApi.register({
        nombreCompleto: `${datos.primerNombre.trim()} ${datos.apellido.trim()}`,
        correo: datos.correo.trim(),
        password: datos.password,
        fechaNacimiento: datos.fechaNacimiento,
        genero: datos.genero,
        pais: datos.pais,
        suscripcion: datos.suscripcion,
      })
      navigate('/login', {
        state: { mensaje: '¡Cuenta creada correctamente! Ya puedes iniciar sesión.' },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Container className="py-5">
      <h2 className="ts-section-title">Regístrate en TecnoStore</h2>
      <div className="ts-divider mb-3" />
      <p className="text-secondary">
        Completa el siguiente formulario para crear tu cuenta. Tus datos se guardan en nuestra
        base de datos. ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>.
      </p>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Form className="ts-panel p-4" noValidate validated={validado} onSubmit={enviar}>
        <Row>
          <Col md={6}>
            <fieldset className="mb-4">
              <legend className="fs-6 fw-semibold mb-3">Datos personales</legend>

              <Form.Group className="mb-3" controlId="primer_nombre">
                <Form.Label>Primer nombre</Form.Label>
                <Form.Control
                  type="text"
                  required
                  minLength={2}
                  value={datos.primerNombre}
                  onChange={cambiar('primerNombre')}
                />
                <Form.Control.Feedback type="invalid">Ingresa tu nombre.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="apellido">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  required
                  minLength={2}
                  value={datos.apellido}
                  onChange={cambiar('apellido')}
                />
                <Form.Control.Feedback type="invalid">Ingresa tu apellido.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="fecha_nacimiento">
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  value={datos.fechaNacimiento}
                  onChange={cambiar('fechaNacimiento')}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Género</Form.Label>
                <div>
                  {[
                    ['masculino', 'Masculino'],
                    ['femenino', 'Femenino'],
                    ['otro', 'Otro'],
                  ].map(([valor, etiqueta]) => (
                    <Form.Check
                      inline
                      type="radio"
                      name="genero"
                      key={valor}
                      id={valor}
                      label={etiqueta}
                      checked={datos.genero === valor}
                      onChange={() => setDatos((prev) => ({ ...prev, genero: valor }))}
                    />
                  ))}
                </div>
              </Form.Group>
            </fieldset>
          </Col>

          <Col md={6}>
            <fieldset className="mb-4">
              <legend className="fs-6 fw-semibold mb-3">Datos de la cuenta</legend>

              <Form.Group className="mb-3" controlId="correo">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  required
                  autoComplete="email"
                  value={datos.correo}
                  onChange={cambiar('correo')}
                />
                <Form.Control.Feedback type="invalid">
                  Ingresa un correo válido.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={datos.password}
                  onChange={cambiar('password')}
                />
                <Form.Control.Feedback type="invalid">
                  Mínimo 6 caracteres.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmar_password">
                <Form.Label>Confirmar contraseña</Form.Label>
                <Form.Control
                  type="password"
                  required
                  autoComplete="new-password"
                  value={datos.confirmarPassword}
                  onChange={cambiar('confirmarPassword')}
                  isInvalid={validado && !passwordsCoinciden}
                />
                <Form.Control.Feedback type="invalid">
                  Las contraseñas no coinciden.
                </Form.Control.Feedback>
              </Form.Group>
            </fieldset>
          </Col>
        </Row>

        <fieldset className="mb-4">
          <legend className="fs-6 fw-semibold mb-3">Preferencias</legend>

          <Form.Group className="mb-3" controlId="pais" style={{ maxWidth: '320px' }}>
            <Form.Label>País</Form.Label>
            <Form.Select value={datos.pais} onChange={cambiar('pais')}>
              <option value="Guatemala">Guatemala</option>
              <option value="México">México</option>
              <option value="El Salvador">El Salvador</option>
              <option value="Honduras">Honduras</option>
              <option value="Otro">Otro</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            id="suscripcion"
            label="Deseo recibir promociones por correo"
            className="mb-2"
            checked={datos.suscripcion}
            onChange={cambiar('suscripcion')}
          />
          <Form.Check
            type="checkbox"
            id="terminos"
            label="Acepto los términos y condiciones"
            required
            checked={datos.terminos}
            onChange={cambiar('terminos')}
            feedback="Debes aceptar los términos para continuar."
            feedbackType="invalid"
          />
        </fieldset>

        <div className="d-flex gap-2">
          <Button type="submit" variant="info" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <Button
            type="button"
            variant="outline-light"
            onClick={() => {
              setDatos(formularioInicial)
              setValidado(false)
              setError('')
            }}
          >
            Limpiar formulario
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default Registro
