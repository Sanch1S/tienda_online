import { Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

// Barra de navegación global y responsiva.
// Aportado por: Sergio Gualberto Morales Sanchinelli (9490-23-14510)
function NavbarComponent() {
  return (
    <Navbar expand="lg" className="ts-navbar" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          Tecno<span className="brand-dot">Store</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="ts-navbar-nav" />
        <Navbar.Collapse id="ts-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos">
              Productos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/carrito">
              Carrito
            </Nav.Link>
            <Nav.Link as={NavLink} to="/registro">
              Crear cuenta
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">
              Contacto
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarComponent
