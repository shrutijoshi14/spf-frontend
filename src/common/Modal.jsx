import { useEffect, useState } from 'react';
import '../styles/modal.css';

const Modal = ({ open, onClose, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300); // Match CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible && !open) return null;

  return (
    <div className={`modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={onClose}>
      <div
        className={`modal-box ${className} ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
