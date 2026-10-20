// Primera vez (/bienvenida): 3 pasos — géneros, últimos discos y tema.
// Siempre se ve en Historieta (lo fuerza ThemeContext). Al terminar, ProtectedRoute lleva al inicio.

import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { suggestTheme } from '../data/genres';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { addAlbumsToLibrary, libraryErrorMessage } from '../services/library';
import { completeOnboarding, profileErrorMessage } from '../services/profile';
import AlbumsStep from '../components/AlbumsStep';
import GenreStep from '../components/GenreStep';
import OnboardingHeader from '../components/OnboardingHeader';
import ThemeStep from '../components/ThemeStep';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const { user, profile, displayName } = useAuth();
  const [step, setStep] = useState(1);
  const [genres, setGenres] = useState(() => profile?.genres ?? []);
  const [picks, setPicks] = useState([]);
  const [chosenTheme, setChosenTheme] = useState(null); // null = todavía no tocó ninguno: vale el sugerido
  const [error, setError] = useState(null);

  // El tema sugerido se recalcula si cambian los géneros (dato derivado).
  const suggestion = useMemo(() => suggestTheme(genres), [genres]);
  const theme = chosenTheme ?? suggestion.theme;

  const albumsAction = useAsyncAction((albums) => addAlbumsToLibrary(user.uid, albums));
  const finishAction = useAsyncAction(() => completeOnboarding(user.uid, { genres, theme, displayName }));

  function goTo(nextStep) {
    setError(null);
    setStep(nextStep);
  }

  // Paso 2 → 3: guarda los discos elegidos (si hay) antes de seguir.
  async function handleAlbumsNext(albums) {
    setError(null);
    if (albums.length === 0) {
      goTo(3);
      return;
    }
    try {
      await albumsAction.run(albums);
      setPicks([]);
      goTo(3);
    } catch (saveError) {
      setError(libraryErrorMessage(saveError));
    }
  }

  // "Entrar a ALBOOM": géneros, tema y onboardingDone en una sola escritura.
  async function handleFinish() {
    setError(null);
    try {
      await finishAction.run();
      // No navegamos: cuando el perfil dice onboardingDone, ProtectedRoute manda al inicio.
    } catch (finishError) {
      setError(profileErrorMessage(finishError));
    }
  }

  return (
    <div className="onboarding">
      <OnboardingHeader step={step} />
      {step === 1 && <GenreStep selected={genres} onChange={setGenres} onNext={() => goTo(2)} />}
      {step === 2 && (
        <AlbumsStep
          genres={genres}
          picks={picks}
          onChange={setPicks}
          onBack={() => goTo(1)}
          onNext={handleAlbumsNext}
          saving={albumsAction.pending}
          error={error}
        />
      )}
      {step === 3 && (
        <ThemeStep
          suggestion={suggestion}
          theme={theme}
          onChange={setChosenTheme}
          onBack={() => goTo(2)}
          onFinish={handleFinish}
          saving={finishAction.pending}
          error={error}
          name={displayName}
        />
      )}
    </div>
  );
}
