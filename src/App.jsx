import { Route, Routes } from 'react-router-dom'
import NavbarComponent from './components/NavbarComponent.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Productos from './pages/Productos.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import Carrito from './pages/Carrito.jsx'
import Registro from './pages/Registro.jsx'
import Contacto from './pages/Contacto.jsx'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavbarComponent />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
