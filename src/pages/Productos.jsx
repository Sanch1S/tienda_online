import { useMemo, useState } from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import ProductCard from '../components/ProductCard.jsx'
import { productos } from '../data/productos.js'

function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [precioMax, setPrecioMax] = useState('')

  const categorias = useMemo(
    () => ['todas', ...new Set(productos.map((p) => p.categoria))],
    [],
  )

  const resultados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())
    const coincideCategoria =
      categoria === 'todas' || producto.categoria === categoria
    const coincidePrecio =
      precioMax === '' || producto.precio <= Number(precioMax)
    return coincideBusqueda && coincideCategoria && coincidePrecio
  })

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('todas')
    setPrecioMax('')
  }

  return (
    <Container className="py-5">
      <h2 className="ts-section-title">Nuestros productos</h2>
      <div className="ts-divider mb-3" />
      <p className="text-secondary mb-4">
        Selecciona un producto para ver más detalles, o usa los filtros para
        encontrar justo lo que buscas.
      </p>

      <Row className="gy-4">
        <Col lg={3}>
          <Form className="ts-panel p-3">
            <fieldset>
              <legend className="fs-6 fw-semibold mb-3">
                Búsqueda y filtros
              </legend>

              <Form.Group className="mb-3" controlId="buscar">
                <Form.Label>Buscar producto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Laptop"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="categoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  {categorias.map((cat) => (
                    <option value={cat} key={cat}>
                      {cat === 'todas' ? 'Todas' : cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="precio_max">
                <Form.Label>Precio máximo (Q)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              </div>
            </fieldset>
          </Form>
        </Col>

        <Col lg={9}>
          {resultados.length === 0 ? (
            <p className="text-secondary">
              No se encontraron productos con esos filtros.
            </p>
          ) : (
            <Row className="gy-4">
              {resultados.map((producto) => (
                <Col md={4} sm={6} key={producto.id}>
                  <ProductCard producto={producto} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default Productos
