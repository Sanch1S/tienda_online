import { useState } from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import { Cargando, ErrorApi } from '../components/Estados.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useAsync, useDebounce } from '../hooks/useAsync.js'
import { productosApi } from '../services/api.js'

function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [precioMax, setPrecioMax] = useState('')

  // Se espera a que el usuario deje de escribir antes de consultar la API
  const busquedaRetrasada = useDebounce(busqueda)
  const precioRetrasado = useDebounce(precioMax)

  // Categorías disponibles (GET /api/productos/categorias)
  const { data: dataCategorias } = useAsync((signal) => productosApi.categorias(signal), [])
  const categorias = ['todas', ...(dataCategorias?.categorias ?? [])]

  // Listado filtrado en el servidor (GET /api/productos?q=...&categoria=...&precioMax=...)
  const { data, loading, error, recargar } = useAsync(
    (signal) =>
      productosApi.listar(
        {
          q: busquedaRetrasada,
          categoria: categoria === 'todas' ? '' : categoria,
          precioMax: precioRetrasado,
        },
        signal,
      ),
    [busquedaRetrasada, categoria, precioRetrasado],
  )
  const resultados = data?.productos ?? []

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
          <Form className="ts-panel p-3" onSubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend className="fs-6 fw-semibold mb-3">Búsqueda y filtros</legend>

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
                <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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
          {error && <ErrorApi error={error} onReintentar={recargar} />}
          {loading && <Cargando texto="Cargando productos..." />}

          {!loading && !error && resultados.length === 0 && (
            <p className="text-secondary">No se encontraron productos con esos filtros.</p>
          )}

          {!error && resultados.length > 0 && (
            <>
              <p className="text-secondary small mb-3">
                {data.total} producto{data.total === 1 ? '' : 's'} encontrado
                {data.total === 1 ? '' : 's'}
              </p>
              <Row className="gy-4" style={{ opacity: loading ? 0.5 : 1 }}>
                {resultados.map((producto) => (
                  <Col md={4} sm={6} key={producto.id}>
                    <ProductCard producto={producto} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default Productos
