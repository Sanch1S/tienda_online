import { useState } from 'react'
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
} from 'react-bootstrap'
import { formatoQuetzales } from '../utils/formato.js'

const itemsIniciales = [
  { id: 1, nombre: 'Laptop TecnoPro 15"', cantidad: 1, precio: 6500.0 },
  { id: 2, nombre: 'Mouse Inalámbrico X200', cantidad: 2, precio: 150.0 },
  { id: 5, nombre: 'Audífonos Bluetooth SoundMax', cantidad: 1, precio: 275.0 },
]

function Carrito() {
  const [items, setItems] = useState(itemsIniciales)
  const [metodoPago, setMetodoPago] = useState('tarjeta')
  const [confirmado, setConfirmado] = useState(false)

  const actualizarCantidad = (id, cantidad) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: Math.max(1, cantidad) } : item,
      ),
    )
  }

  const eliminarItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const total = items.reduce(
    (acumulado, item) => acumulado + item.cantidad * item.precio,
    0,
  )

  const confirmarCompra = (evento) => {
    evento.preventDefault()
    setConfirmado(true)
  }

  return (
    <Container className="py-5">
      <h2 className="ts-section-title">Mi carrito</h2>
      <div className="ts-divider mb-4" />

      {items.length === 0 ? (
        <p className="text-secondary">Tu carrito está vacío.</p>
      ) : (
        <Table responsive className="ts-table" bordered>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td style={{ maxWidth: '110px' }}>
                  <Form.Control
                    type="number"
                    min="1"
                    size="sm"
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarCantidad(item.id, Number(e.target.value))
                    }
                  />
                </td>
                <td>{formatoQuetzales(item.precio)}</td>
                <td>{formatoQuetzales(item.cantidad * item.precio)}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => eliminarItem(item.id)}
                  >
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3}>Total estimado</th>
              <th colSpan={2} className="ts-price">
                {formatoQuetzales(total)}
              </th>
            </tr>
          </tfoot>
        </Table>
      )}

      <h3 className="ts-section-title mt-5">Finalizar compra (prototipo)</h3>
      <div className="ts-divider mb-4" />

      {confirmado && (
        <Alert variant="success" onClose={() => setConfirmado(false)} dismissible>
          ¡Gracias por tu compra! Este es solo un prototipo, no se procesó
          ningún pago real.
        </Alert>
      )}

      <Form className="ts-panel p-4" onSubmit={confirmarCompra}>
        <Row>
          <Col md={6}>
            <fieldset className="mb-4">
              <legend className="fs-6 fw-semibold mb-3">Datos de envío</legend>

              <Form.Group className="mb-3" controlId="nombre_envio">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control type="text" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="direccion">
                <Form.Label>Dirección de envío</Form.Label>
                <Form.Control as="textarea" rows={3} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="telefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control type="tel" />
              </Form.Group>
            </fieldset>
          </Col>

          <Col md={6}>
            <fieldset>
              <legend className="fs-6 fw-semibold mb-3">Método de pago</legend>

              <Form.Check
                type="radio"
                id="tarjeta"
                name="metodo_pago"
                label="Tarjeta de crédito/débito"
                checked={metodoPago === 'tarjeta'}
                onChange={() => setMetodoPago('tarjeta')}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                id="contra_entrega"
                name="metodo_pago"
                label="Pago contra entrega"
                checked={metodoPago === 'contra_entrega'}
                onChange={() => setMetodoPago('contra_entrega')}
                className="mb-3"
              />

              {metodoPago === 'tarjeta' && (
                <Form.Group className="mb-3" controlId="numero_tarjeta">
                  <Form.Label>Número de tarjeta</Form.Label>
                  <Form.Control type="text" maxLength={16} placeholder="•••• •••• •••• ••••" />
                </Form.Group>
              )}
            </fieldset>
          </Col>
        </Row>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit" variant="info">
            Confirmar compra
          </Button>
          <Button
            type="button"
            variant="outline-light"
            onClick={() => setItems(itemsIniciales)}
          >
            Restablecer carrito
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default Carrito
