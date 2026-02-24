import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Full-size image preview overlay. Renders a close (X) in the top-right.
 * Clicking the backdrop or the X closes the lightbox.
 */
export function ImageLightbox({ src, alt = "", onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        aria-label="Close preview"
      >
        <X size={18} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/**
 * Clickable image that shows a thumbnail with object-contain (adapts to container).
 * Clicking opens the ImageLightbox at full size.
 */
export function ImageWithPreview({ src, alt, className, placeholder }) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const hasImage = src && src.startsWith("data:");

  if (!hasImage && placeholder) {
    return placeholder;
  }

  if (!hasImage) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        aria-label={`View full size: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          className={`max-h-full max-w-full object-contain ${className || ""}`}
        />
      </button>
      {lightboxOpen && (
        <ImageLightbox src={src} alt={alt} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
