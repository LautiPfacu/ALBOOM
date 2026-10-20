// Perfil → Tema de la app: el cambio se aplica al instante y se guarda en users/{uid}.theme.

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { THEMES } from '../data/themes';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { profileErrorMessage, updateTheme } from '../services/profile';
import ProfileSection from './ProfileSection';
import ThemeCard from './ThemeCard';
import './ThemeSection.css';

export default function ThemeSection() {
  const { user } = useAuth();
  const { userTheme } = useTheme();
  const { showToast } = useToast();
  const { run, pending } = useAsyncAction((theme) => updateTheme(user.uid, theme));

  async function choose(theme) {
    if (theme === userTheme) return;
    try {
      // Firestore actualiza el perfil en local enseguida: el tema cambia sin esperar al servidor.
      await run(theme);
    } catch (error) {
      showToast({ type: 'error', message: profileErrorMessage(error) });
    }
  }

  return (
    <ProfileSection
      id="tema"
      title="Tema de la app"
      subtitle="Cambia los colores y las texturas de toda la app. Tus discos y reseñas no cambian."
    >
      <div className="theme-section__grid" role="group" aria-label="Temas">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            size="small"
            selected={theme.id === userTheme}
            badge={theme.id === userTheme ? 'Tema actual' : null}
            disabled={pending}
            onSelect={choose}
          />
        ))}
      </div>
    </ProfileSection>
  );
}
