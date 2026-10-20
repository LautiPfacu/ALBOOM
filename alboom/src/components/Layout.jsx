// Estructura de todas las pantallas con sesión.

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TabBar from './TabBar';
import ToastViewport from './ToastViewport';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      <TabBar />
      <ToastViewport />
    </div>
  );
}
