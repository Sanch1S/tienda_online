import { useState } from 'react'
import { Alert, Badge, Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap'
import { Cargando, ErrorApi } from '../components/Estados.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { productosApi } from '../services/api.js'
import { formatoQuetzales } from '../utils/formato.js'

const DISPONIBILIDADES = ['En stock', 'Pocas unidades', 'Agotado']

const formularioVacio = {
  nombre: '',
  categoria: '',
  marca: '',
  precio: '',
  disponibilidad: 'En stock',
  imagenColor: '#2dd4c4',
  descripcion: '',
  caracteristicasTexto: '', // una característica por línea
  coloresTexto: '', // separados por coma
}

// De producto (API) a valores del formulario
const aFormulario = (p) => ({
  nombre: p.nombre,
  categoria: p.categoria,
  marca: p.marca,
  precio: String(p.precio),
  disponibilidad: p.disponibilidad,
  imagenColor: p.imagenColor,
  descripcion: p.descripcion ?? '',
  caracteristicasTexto: (p.caracteristicas ?? []).join('\n'),
  coloresTexto: (p.colores ?? []).join(', '),
})

// De valores del formulario al body que espera la API
const aPayload = (f) => ({
  nombre: f.nombre.trim(),
  categoria: f.categoria.trim(),
  marca: f.marca.trim(),
  precio: Number(f.precio),
  disponibilidad: f.disponibilidad,
  imagenColor: f.imagenColor,
  descripcion: f.descripcion.trim(),
  caracteristicas: f.caracteristicasTexto.split('\n').map((l) => l.trim()).filter(Boolean),
  colores: f.coloresTexto.split(',').map((c) => c.trim()).filter(Boolean),
})

function AdminProductos() {
  const { data, loading, error, recargar } = useAsync((signal) => productosApi.listar({}, signal), [])
  const productos = data?.productos ?? []

  const [editando, setEditando] = useState(null) // null | 'nuevo' | producto
  const [formulario, setFormulario] = useState(formularioVacio)
  const [validado, setValidado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const [aviso, setAviso] = useState(null) // { variante, texto }

  const abrirNuevo = () => {
    setFormulario(formularioVacio)
    setErrorForm('')
    setValidado(false)
    setEditando('nuevo')
  }

  const abrirEdicion = (producto) => {
    setFormulario(aFormulario(producto))
    setErrorForm('')
    setValidado(false)
    setEditando(producto)
  }

  const cerrarFormulario = () => !guardando && setEditando(null)

  const cambiar = (campo) => (e) => setFormulario((prev) => ({ ...prev, [campo]: e.target.value }))

  // Crear (POST) o actualizar (PUT) según el modo del modal
  const guardar = async (evento) => {
    evento.preventDefault()
    setValidado(true)
    if (!evento.currentTarget.checkValidity()) return

    setGuardando(true)
    setErrorForm('')
    try {
      const payload = aPayload(formulario)
      if (editando === 'nuevo') {
        await productosApi.crear(payload)
        setAviso({ variante: 'success', texto: `Producto "${payload.nombre}" creado correctamente.` })
      } else {
        await productosApi.actualizar(editando.id, payload)
        setAviso({ variante: 'success', texto: `Producto "${payload.nombre}" actualizado.` })
      }
      setEditando(null)
      recargar()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar (DELETE) tras confirmar
  const confirmarEliminacion = async () => {
    setEliminando(true)
    try {
      await productosApi.eliminar(porEliminar.id)
      setAviso({ variante: 'success', texto: `Producto "${porEliminar.nombre}" eliminado.` })
      setPorEliminar(null)
      recargar()
    } catch (err) {
      setAviso({ variante: 'danger', texto: err.message })
      setPorEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  const categoriasExistentes = [...new Set(productos.map((p) => p.categoria))]

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="ts-section-title mb-0">Administrar productos</h2>
        <Button variant="info" onClick={abrirNuevo}>
          + Nuevo producto
        </Button>
      </div>
      <div className="ts-divider mb-4 mt-2" />

      {aviso && (
        <Alert variant={aviso.variante} dismissible onClose={() => setAviso(null)}>
          {aviso.texto}
        </Alert>
      )}
      {error && <ErrorApi error={error} onReintentar={recargar} />}
      {loading && !data && <Cargando texto="Cargando catálogo..." />}

      {data && (
        <Table responsive hover className="ts-table" bordered>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Disponibilidad</th>
              <th style={{ width: 170 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-secondary">
                  No hay productos. Crea el primero con el botón "Nuevo producto".
                </td>
              </tr>
            )}
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.marca}</td>
                <td>{formatoQuetzales(p.precio)}</td>
                <td>
                  <Badge bg={p.disponibilidad === 'Agotado' ? 'danger' : 'info'} text="dark">
                    {p.disponibilidad}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-info" onClick={() => abrirEdicion(p)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setPorEliminar(p)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal crear / editar */}
      <Modal show={editando !== null} onHide={cerrarFormulario} centered size="lg" className="ts-modal">
        <Form noValidate validated={validado} onSubmit={guardar}>
          <Modal.Header closeButton>
            <Modal.Title>{editando === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errorForm && <Alert variant="danger">{errorForm}</Alert>}
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="adm_nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control required minLength={3} maxLength={120} value={formulario.nombre} onChange={cambiar('nombre')} />
                  <Form.Control.Feedback type="invalid">Mínimo 3 caracteres.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="adm_precio">
                  <Form.Label>Precio (Q)</Form.Label>
                  <Form.Control type="number" required min="0" step="0.01" value={formulario.precio} onChange={cambiar('precio')} />
                  <Form.Control.Feedback type="invalid">Ingresa un precio válido.</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="adm_categoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control required list="adm_categorias" value={formulario.categoria} onChange={cambiar('categoria')} />
                  <datalist id="adm_categorias">
                    {categoriasExistentes.map((c) => (
                      <option value={c} key={c} />
                    ))}
                  </datalist>
                  <Form.Control.Feedback type="invalid">Indica la categoría.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="adm_marca">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control required value={formulario.marca} onChange={cambiar('marca')} />
                  <Form.Control.Feedback type="invalid">Indica la marca.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="adm_disponibilidad">
                  <Form.Label>Disponibilidad</Form.Label>
                  <Form.Select value={formulario.disponibilidad} onChange={cambiar('disponibilidad')}>
                    {DISPONIBILIDADES.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="adm_descripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} value={formulario.descripcion} onChange={cambiar('descripcion')} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="adm_caracteristicas">
                  <Form.Label>Características (una por línea)</Form.Label>
                  <Form.Control as="textarea" rows={4} value={formulario.caracteristicasTexto} onChange={cambiar('caracteristicasTexto')} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="adm_colores">
                  <Form.Label>Colores (separados por coma)</Form.Label>
                  <Form.Control placeholder="Negro, Blanco, Azul" value={formulario.coloresTexto} onChange={cambiar('coloresTexto')} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="adm_color">
                  <Form.Label>Color de la tarjeta</Form.Label>
                  <Form.Control type="color" value={formulario.imagenColor} onChange={cambiar('imagenColor')} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-light" onClick={cerrarFormulario} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" variant="info" disabled={guardando}>
              {guardando ? 'Guardando...' : editando === 'nuevo' ? 'Crear producto' : 'Guardar cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={porEliminar !== null} onHide={() => !eliminando && setPorEliminar(null)} centered className="ts-modal">
        <Modal.Header closeButton>
          <Modal.Title>Eliminar producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que quieres eliminar <strong>{porEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-light" onClick={() => setPorEliminar(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminacion} disabled={eliminando}>
            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AdminProductos
