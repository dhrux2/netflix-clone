import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Details } from '../pages/Details';

export function TitlePreview() {
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="preview-dialog"
      aria-label="Title preview"
      onCancel={(event) => {
        event.preventDefault();
        navigate(-1);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) navigate(-1);
      }}
    >
      <div className="preview-content">
        <button
          className="preview-close round-button"
          aria-label="Close title preview"
          onClick={() => navigate(-1)}
        >
          <X size={21} />
        </button>
        <Details />
      </div>
    </dialog>
  );
}
