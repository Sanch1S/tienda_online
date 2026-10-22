import { useEffect } from 'react'
import { Badge, Button, Card, Col, Container, ListGroup, Row, Table } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { Cargando, ErrorApi } from '../components/Estados.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { authApi, productosApi } from '../services/api.js'
import { formatoFecha, formatoFechaHora, formatoQuetzales } from '../utils/formato.js'

function Perfil() {
  const { user, token, esAdmin, fechaAcceso, logout, actualizarUsuario } = useAuth()
  const navigate = useNavigate()

  // Datos frescos del usuario autenticado, leídos de MongoDB (GET /api/auth/me)
  const perfil = useAsync((signal) => authApi.me(signal), [token])

  // Se sincroniza el estado global con lo que dice la base de datos
  useEffect(() => {
    if (perfil.data?.user) actualizarUsuario(perfil.data.user)
  }, [perfil.data, actualizarUsuario])

  // Productos creados por este usuario (GET /api/productos?creadoPor=<id>)
  const misProductos = useAsync(
    (signal) => (esAdmin ? productosApi.listar({ creadoPor: user.id }, signal) : Promise.resolve(null)),
    [esAdmin, user?.id],
  )

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  return (
    <Container className="py-5">
      <h2 className="ts-section-title">Mi perfil</h2>
      <div className="ts-divider mb-4" />

      {perfil.error && <ErrorApi error={perfil.error} onReintentar={perfil.recargar} />}
      {perfil.loading && !user && <Cargando texto="Cargando tu perfil..." />}

      {user && (
        <Row className="gy-4">
          <Col lg={5}>
            <Card className="ts-card h-100">
              <Card.Body>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 72,
                    height: 72,
                    background: 'var(--ts-accent-dim)',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                  }}
                  aria-hidden="true"
                >
                  {user.nombreCompleto?.charAt(0).toUpperCase()}
                </div>
                <Card.Title as="h3" className="h4">
                  {user.nombreCompleto}
                </Card.Title>
                <Card.Subtitle className="text-secondary mb-3">{user.correo}</Card.Subtitle>

                <div className="d-flex gap-2 flex-wrap mb-4">
                  <Badge bg={esAdmin ? 'warning' : 'info'} text="dark">
                    Rol: {user.rol}
                  </Badge>
                  <Badge bg="secondary">Membresía {user.membresia}</Badge>
                  {user.suscripcion && <Badge bg="success">Suscrito a promociones</Badge>}
                </div>

                <Button variant="outline-danger" onClick={cerrarSesion}>
                  Cerrar sesión
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="ts-card h-100">
              <Card.Header className="fw-semibold">Datos de la cuenta (guardados en MongoDB)</Card.Header>
              <ListGroup variant="flush" className="ts-list-group">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-secondary">País</span>
                  <span>{user.pais || '—'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-secondary">Fecha de nacimiento</span>
                  <span>{formatoFecha(user.fechaNacimiento)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-secondary">Miembro desde</span>
                  <span>{formatoFecha(user.createdAt)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-secondary">Última actualización</span>
                  <span>{formatoFechaHora(user.updatedAt)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-secondary">Inicio de sesión actual</span>
                  <span>{formatoFechaHora(fechaAcceso)}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          <Col xs={12}>
            <Card className="ts-card">
              <Card.Header className="fw-semibold d-flex justify-content-between align-items-center">
                <span>{esAdmin ? 'Productos que has creado' : 'Tu actividad'}</span>
                {esAdmin && (
                  <Button as={Link} to="/admin/productos" size="sm" variant="info">
                    Administrar catálogo
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                {!esAdmin && (
                  <p className="text-secondary mb-0">
                    Aún no tienes pedidos registrados. Explora el{' '}
                    <Link to="/productos">catálogo</Link> y encuentra algo para ti.
                  </p>
                )}

                {esAdmin && misProductos.loading && <Cargando texto="Cargando productos..." />}
                {esAdmin && misProductos.error && (
                  <ErrorApi error={misProductos.error} onReintentar={misProductos.recargar} />
                )}
                {esAdmin && misProductos.data && (
                  <Table responsive className="ts-table mb-0" bordered>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Disponibilidad</th>
                        <th>Creado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misProductos.data.productos.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-secondary">
                            Todavía no has creado productos.
                          </td>
                        </tr>
                      )}
                      {misProductos.data.productos.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <Link to={`/productos/${p.id}`}>{p.nombre}</Link>
                          </td>
                          <td>{p.categoria}</td>
                          <td>{formatoQuetzales(p.precio)}</td>
                          <td>
                            <Badge bg={p.disponibilidad === 'Agotado' ? 'danger' : 'info'} text="dark">
                              {p.disponibilidad}
                            </Badge>
                          </td>
                          <td>{formatoFecha(p.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Perfil
