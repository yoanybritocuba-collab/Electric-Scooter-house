import { useState } from 'react';

interface ProductHoverZoomProps {
  src: string;
  alt: string;
}

const ProductHoverZoom = ({ src, alt }: ProductHoverZoomProps) => {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShowZoom(true)}
      onTouchEnd={() => setShowZoom(false)}
      onTouchMove={handleTouchMove}
      onTouchCancel={() => setShowZoom(false)}
    >
      {/* Imagen principal */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />

      {/* Lupa de zoom - visible en móvil al tocar */}
      {showZoom && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: '250%',
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

export default ProductHoverZoom;