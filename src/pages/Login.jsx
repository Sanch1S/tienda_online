import { useState } from 'react'
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const { isAuthenticated, loading, login } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [validado, setValidado] = useState(false)

  // Mensaje que llega desde el registro ("Cuenta creada, ya puedes iniciar sesión")
  const mensajeRegistro = ubicacion.state?.mensaje
  const destino = ubicacion.state?.desde || '/perfil'

  // Si ya hay sesión, no tiene sentido ver el formulario
  if (isAuthenticated) return <Navigate to={destino} replace />

  const enviar = async (evento) => {
    evento.preventDefault()
    setError('')

    // Validación nativa de HTML5 (required, type="email", minLength)
    if (!evento.currentTarget.checkValidity()) {
      setValidado(true)
      return
    }

    try {
      await login(correo.trim(), password)
      navigate(destino, { replace: true })
    } catch (err) {
      // 401 -> credenciales inválidas; 0 -> servidor caído; etc.
      setError(err.message)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <h2 className="ts-section-title">Iniciar sesión</h2>
          <div className="ts-divider mb-3" />

          {mensajeRegistro && !error && <Alert variant="success">{mensajeRegistro}</Alert>}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Form className="ts-panel p-4" noValidate validated={validado} onSubmit={enviar}>
            <Form.Group className="mb-3" controlId="login_correo">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                required
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Ingresa un correo válido.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="login_password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                La contraseña debe tener al menos 6 caracteres.
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="info" disabled={loading}>
                {loading ? 'Verificando...' : 'Entrar'}
              </Button>
            </div>
          </Form>

          <p className="text-secondary mt-3 mb-0">
            ¿No tienes cuenta? <Link to="/registro">Crea una aquí</Link>
          </p>
        </Col>
      </Row>
    </Container>
  )
}

export default Login
