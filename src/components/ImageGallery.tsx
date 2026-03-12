import { useEffect, useRef } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface ImageGalleryProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageGallery = ({ images, initialIndex, isOpen, onClose }: ImageGalleryProps) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !galleryRef.current) return;

    // Limpiar instancia anterior si existe
    if (lightboxRef.current) {
      lightboxRef.current.destroy();
    }

    // Inicializar PhotoSwipe
    const lightbox = new PhotoSwipeLightbox({
      gallery: galleryRef.current,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      initialZoomLevel: 'fit',
      secondaryZoomLevel: 2,
      maxZoomLevel: 4,
      bgOpacity: 0.98,
      loop: true,
      closeOnVerticalDrag: true,
      arrowKeys: true,
      preload: [1, 2],
    });

    // Manejar cierre
    lightbox.on('close', () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      onClose();
    });

    lightbox.init();
    lightboxRef.current = lightbox;

    // Abrir en el índice seleccionado
    setTimeout(() => {
      lightbox.loadAndOpen(initialIndex);
    }, 0);

    // Bloquear scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.destroy();
        lightboxRef.current = null;
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, images, initialIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={galleryRef} style={{ display: 'none' }}>
      {images.map((src, index) => (
        <a
          key={index}
          href={src}
          data-pswp-width="1920"
          data-pswp-height="1080"
          target="_blank"
          rel="noreferrer"
        >
          Imagen {index + 1}
        </a>
      ))}
    </div>
  );
};

export default ImageGallery;