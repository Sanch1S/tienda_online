import { Alert, Button, Spinner } from 'react-bootstrap'

// Indicador de carga reutilizable mientras se espera la respuesta de la API.
export function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-secondary py-4" role="status">
      <Spinner animation="border" size="sm" variant="info" />
      <span>{texto}</span>
    </div>
  )
}

// Mensaje de error reutilizable, con botón opcional para reintentar.
export function ErrorApi({ error, onReintentar }) {
  return (
    <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-3">
      <span>{error?.message || 'Ocurrió un error inesperado.'}</span>
      {onReintentar && (
        <Button variant="outline-danger" size="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </Alert>
  )
}
