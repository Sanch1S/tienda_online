import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Barra de navegación global y responsiva.
// Reacciona en tiempo real al estado de la sesión (estado global).
// Aportado por: Sergio Gualberto Morales Sanchinelli (9490-23-14510)
function NavbarComponent() {
  const { isAuthenticated, user, esAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  return (
    <Navbar expand="lg" className="ts-navbar" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          Tecno<span className="brand-dot">Store</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="ts-navbar-nav" />
        <Navbar.Collapse id="ts-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={NavLink} to="/" end>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos">
              Productos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/carrito">
              Carrito
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">
              Contacto
            </Nav.Link>

            {isAuthenticated ? (
              <>
                {esAdmin && (
                  <Nav.Link as={NavLink} to="/admin/productos">
                    Administrar
                  </Nav.Link>
                )}
                <Nav.Link as={NavLink} to="/perfil" className="d-flex align-items-center gap-2">
                  <span>{user?.nombreCompleto?.split(' ')[0]}</span>
                  <Badge bg={esAdmin ? 'warning' : 'info'} text="dark">
                    {user?.rol}
                  </Badge>
                </Nav.Link>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="ms-lg-2 mt-2 mt-lg-0"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/registro">
                  Crear cuenta
                </Nav.Link>
                <Button
                  as={NavLink}
                  to="/login"
                  variant="info"
                  size="sm"
                  className="ms-lg-2 mt-2 mt-lg-0"
                >
                  Iniciar sesión
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarComponent
