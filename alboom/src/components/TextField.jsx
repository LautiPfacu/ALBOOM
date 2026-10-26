// Campo de formulario: label arriba, input y mensaje de error enlazado.
//
//   <TextField id="email" label="Email" value={email} onChange={...} error={errors.email} ref={emailRef} />
//
// children se dibuja dentro del campo, a la derecha (por ejemplo, el botón "Mostrar").
// En React 19, ref llega como una prop más y la pasamos al <input>.

import { useT } from '../i18n/LanguageContext';
import './TextField.css';

export default function TextField({ id, label, error, ref, children, placeholder, ...inputProps }) {
  const t = useT();
  const errorId = `${id}-error`;

  return (
    <div className="text-field">
      <label className="text-field__label" htmlFor={id}>
        {t(label)}
      </label>
      <div className={`text-field__box${error ? ' text-field__box--error' : ''}`}>
        <input
          id={id}
          ref={ref}
          className="text-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={t(placeholder)}
          {...inputProps}
        />
        {children}
      </div>
      {error && (
        <p className="text-field__error" id={errorId}>
          {t(error)}
        </p>
      )}
    </div>
  );
}
