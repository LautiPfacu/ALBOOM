import Button from '../components/Button';
import './NotFoundPage.css';
import { useT } from '../i18n/LanguageContext';

export default function NotFoundPage() {
  const t = useT();
  return (
    <main className="not-found">
      <h1 className="not-found__title">{t('Este lado del disco está vacío')}</h1>
      <p className="not-found__text">{t('La página que buscás no existe.')}</p>
      <Button to="/">Volver al inicio</Button>
    </main>
  );
}
