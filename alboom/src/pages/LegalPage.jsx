// Términos y condiciones / Política de privacidad: páginas simples de texto.

import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './LegalPage.css';

const CONTENT = {
  terminos: {
    title: 'Términos y condiciones',
    sections: [
      {
        heading: 'Qué es ALBOOM',
        text: 'ALBOOM es un diario de discos hecho como trabajo práctico de Desarrollo Frontend II (UADE). Podés guardar discos, puntuarlos, reseñarlos y descubrir música nueva.',
      },
      {
        heading: 'Tu cuenta',
        text: 'Sos responsable de lo que publicás con tu cuenta. No compartas tu contraseña. Podés eliminar tu cuenta cuando quieras desde Perfil y ajustes.',
      },
      {
        heading: 'Reseñas públicas',
        text: 'Las reseñas que mostrás en la comunidad las pueden leer otras personas con cuenta. No publiques contenido ofensivo ni datos personales de otras personas.',
      },
      {
        heading: 'Datos de Spotify',
        text: 'Las portadas, nombres y canciones vienen de Spotify y pertenecen a sus dueños. Cada disco tiene un link para abrirlo en Spotify.',
      },
    ],
  },
  privacidad: {
    title: 'Política de privacidad',
    sections: [
      {
        heading: 'Qué guardamos',
        text: 'Tu nombre, tu email, tu nombre de usuario, tus géneros, el tema elegido y tu biblioteca (discos, puntajes, reseñas y fechas de escucha). Todo se guarda en Firebase.',
      },
      {
        heading: 'Quién lo ve',
        text: 'Tu biblioteca es privada. Solo se ven en la comunidad las reseñas con «Mostrar en la comunidad» activado, junto con tu nombre y tu nombre de usuario.',
      },
      {
        heading: 'Tus derechos',
        text: 'Podés descargar todos tus datos en un archivo y eliminar tu cuenta desde Perfil y ajustes → Privacidad y seguridad. Al eliminarla, borramos tus documentos.',
      },
    ],
  },
};

export default function LegalPage({ kind }) {
  const { title, sections } = CONTENT[kind];

  return (
    <div className="legal">
      <header className="legal__bar">
        <div className="page">
          <Link to="/" className="legal__logo">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="legal__content page">
        <h1 className="legal__title">{title}</h1>
        {sections.map((section) => (
          <section key={section.heading} className="legal__section">
            <h2 className="legal__heading">{section.heading}</h2>
            <p className="legal__text">{section.text}</p>
          </section>
        ))}
        <Link to="/ajustes/ayuda" className="text-link">
          ← Volver a la ayuda
        </Link>
      </main>
    </div>
  );
}
