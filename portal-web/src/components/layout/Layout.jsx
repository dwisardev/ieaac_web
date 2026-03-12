import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ComunicadosFloat from '../ui/ComunicadosFloat';

/**
 * Layout principal que envuelve todas las páginas
 * Incluye Navbar y Footer fijos
 */
export default function Layout() {
  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="main-content content-spacing" style={{ flex: '1' }}>
        <Outlet />
      </main>

      <Footer />
      <ComunicadosFloat />
    </div>
  );
}