import { Alert, Container } from 'react-bootstrap'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Envuelve las páginas que requieren sesión (y opcionalmente rol admin).
//   <RutaProtegida><Perfil /></RutaProtegida>
//   <RutaProtegida soloAdmin><AdminProductos /></RutaProtegida>
function RutaProtegida({ children, soloAdmin = false }) {
  const { isAuthenticated, esAdmin } = useAuth()
  const ubicacion = useLocation()

  if (!isAuthenticated) {
    // Se guarda la página que quería visitar para volver a ella tras el login
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (soloAdmin && !esAdmin) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          No tienes permisos para ver esta página. Se requiere una cuenta de administrador.
        </Alert>
        <Link to="/" className="btn btn-outline-info">
          Volver al inicio
        </Link>
      </Container>
    )
  }

  return children
}

export default RutaProtegida
