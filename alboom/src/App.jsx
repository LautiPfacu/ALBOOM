import { Route, Routes } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import AlbumPage from './pages/AlbumPage';
import ProfilePage from './pages/ProfilePage';
import ProfileSectionPage from './pages/ProfileSectionPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Solo sin sesión: con sesión, /login redirige a la app */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Con sesión. LibraryProvider envuelve al Layout: una sola suscripción a la biblioteca */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <LibraryProvider>
              <Layout />
            </LibraryProvider>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="explorar" element={<ExplorePage />} />
          <Route path="biblioteca" element={<LibraryPage />} />
          <Route path="disco/:albumId" element={<AlbumPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="perfil/:section" element={<ProfileSectionPage />} />
        </Route>
        {/* La primera vez no tiene barra de navegación */}
        <Route path="bienvenida" element={<OnboardingPage />} />
      </Route>

      <Route path="/terminos" element={<LegalPage kind="terminos" />} />
      <Route path="/privacidad" element={<LegalPage kind="privacidad" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
