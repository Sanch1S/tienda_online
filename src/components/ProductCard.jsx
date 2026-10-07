import { Badge, Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatoQuetzales } from '../utils/formato.js'

// Tarjeta de producto reutilizable, usada en Home y en el catálogo.
function ProductCard({ producto }) {
  return (
    <Card className="ts-card">
      <div
        style={{
          height: '150px',
          background: `linear-gradient(135deg, ${producto.imagenColor}55, ${producto.imagenColor}15)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '2.2rem' }} aria-hidden="true">
          🖥️
        </span>
      </div>
      <Card.Body className="d-flex flex-column">
        <Badge bg="" style={{ backgroundColor: 'var(--ts-accent-dim)' }} className="mb-2 align-self-start">
          {producto.categoria}
        </Badge>
        <Card.Title>{producto.nombre}</Card.Title>
        <Card.Text className="text-secondary small flex-grow-1">
          {producto.marca} · {producto.disponibilidad}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="ts-price">{formatoQuetzales(producto.precio)}</span>
          <Button
            as={Link}
            to={`/productos/${producto.id}`}
            variant="outline-info"
            size="sm"
          >
            Ver detalle
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
