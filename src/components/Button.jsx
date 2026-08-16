import { Link } from 'react-router-dom';

export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type,
  ...props
}) {
  const classes = `button button-${variant} button-${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type || 'button'} className={classes} {...props}>
      {children}
    </button>
  );
}