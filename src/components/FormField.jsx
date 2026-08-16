export default function FormField({
  label,
  htmlFor,
  required,
  hint,
  className = '',
  children,
}) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}