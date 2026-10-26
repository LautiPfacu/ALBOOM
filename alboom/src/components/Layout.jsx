// Estructura de todas las pantallas con sesión.
// Además, mantiene al día dos cosas en segundo plano:
//   - la copia pública de tu perfil (profiles/{uid})
//   - lo que escuchaste en Spotify, si lo conectaste (cada 30 minutos como máximo)
//   - si completaste la primera tarea (puntuar y reseñar un disco)

import { Outlet } from 'react-router-dom';
import { useFirstTaskWatcher } from '../hooks/useFirstTaskWatcher';
import { usePublicProfileSync } from '../hooks/usePublicProfileSync';
import { useSpotifySync } from '../hooks/useSpotifySync';
import Navbar from './Navbar';
import TabBar from './TabBar';
import ToastViewport from './ToastViewport';
import './Layout.css';

export default function Layout() {
  usePublicProfileSync();
  useSpotifySync();
  useFirstTaskWatcher();

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
