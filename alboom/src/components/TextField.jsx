// Campo de formulario: label arriba, input y mensaje de error enlazado.
//
//   <TextField id="email" label="Email" value={email} onChange={...} error={errors.email} ref={emailRef} />
//
// children se dibuja dentro del campo, a la derecha (por ejemplo, el botón "Mostrar").
// En React 19, ref llega como una prop más y la pasamos al <input>.

import './TextField.css';

export default function TextField({ id, label, error, ref, children, ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div className="text-field">
      <label className="text-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`text-field__box${error ? ' text-field__box--error' : ''}`}>
        <input
          id={id}
          ref={ref}
          className="text-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {children}
      </div>
      {error && (
        <p className="text-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
