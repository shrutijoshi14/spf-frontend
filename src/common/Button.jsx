import './button.css';

const Button = ({
  text,
  variant = 'primary',
  onClick,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={`app-btn ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {text}
    </button>
  );
};

export default Button;
