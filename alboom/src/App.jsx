import { Route, Routes } from 'react-router-dom';
import { FollowProvider } from './context/FollowContext';
import { LibraryProvider } from './context/LibraryContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CommunityPage from './pages/CommunityPage';
import LibraryPage from './pages/LibraryPage';
import AlbumPage from './pages/AlbumPage';
import MyProfilePage from './pages/MyProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import PostPage from './pages/PostPage';
import SettingsPage from './pages/SettingsPage';
import SettingsSectionPage from './pages/SettingsSectionPage';
import SpotifyCallbackPage from './pages/SpotifyCallbackPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Solo sin sesión: con sesión, /login redirige a la app */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Con sesión. Los providers envuelven al Layout: una sola suscripción a la biblioteca
          y a "a quién seguís" para toda la sesión. */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <LibraryProvider>
              <FollowProvider>
                <Layout />
              </FollowProvider>
            </LibraryProvider>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="explorar" element={<ExplorePage />} />
          <Route path="comunidad" element={<CommunityPage />} />
          <Route path="biblioteca" element={<LibraryPage />} />
          <Route path="disco/:albumId" element={<AlbumPage />} />
          <Route path="perfil" element={<MyProfilePage />} />
          <Route path="u/:username" element={<UserProfilePage />} />
          <Route path="post/:postId" element={<PostPage />} />
          <Route path="ajustes" element={<SettingsPage />} />
          <Route path="ajustes/:section" element={<SettingsSectionPage />} />
        </Route>
        {/* La primera vez y la vuelta de Spotify no tienen barra de navegación */}
        <Route path="bienvenida" element={<OnboardingPage />} />
        <Route path="spotify/callback" element={<SpotifyCallbackPage />} />
      </Route>

      <Route path="/terminos" element={<LegalPage kind="terminos" />} />
      <Route path="/privacidad" element={<LegalPage kind="privacidad" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
