import Button from '../components/Button';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <h1 className="not-found__title">Este lado del disco está vacío</h1>
      <p className="not-found__text">La página que buscás no existe.</p>
      <Button to="/">Volver al inicio</Button>
    </main>
  );
}
