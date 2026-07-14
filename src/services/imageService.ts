// src/services/imageService.ts
// Servicio para optimizar imágenes de Firebase Storage

// 📐 Tamaños predefinidos para diferentes usos
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },  // Miniaturas
  small: { width: 300, height: 300 },      // Listas de productos
  medium: { width: 500, height: 500 },     // Detalle de producto
  large: { width: 800, height: 800 },      // Ampliadas
  hero: { width: 1200, height: 600 },      // Portada
};

type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * 🔥 Optimiza una imagen de Firebase Storage añadiendo parámetros a la URL
 * @param url - URL original de la imagen
 * @param size - Tamaño deseado (thumbnail, small, medium, large, hero)
 * @param format - Formato (webp o jpg)
 * @returns URL optimizada
 */
export const optimizarImagen = (
  url: string | null,
  size: ImageSize = 'medium',
  format: 'webp' | 'jpg' = 'webp'
): string => {
  // Si no hay URL, devolver placeholder
  if (!url) return '/placeholder.jpg';
  
  // Si ya es una URL optimizada, no volver a optimizar
  if (url.includes('&format=webp') || url.includes('?format=webp')) {
    return url;
  }
  
  const { width, height } = IMAGE_SIZES[size];
  const separator = url.includes('?') ? '&' : '?';
  
  // Añadir parámetros de optimización a la URL
  return `${url}${separator}width=${width}&height=${height}&format=${format}`;
};

/**
 * 🖼️ Obtiene la imagen optimizada de un producto
 * @param producto - Objeto del producto
 * @param size - Tamaño deseado
 * @param index - Índice de la imagen (si tiene varias)
 * @returns URL optimizada de la imagen
 */
export const getProductImage = (
  producto: any,
  size: ImageSize = 'medium',
  index: number = 0
): string => {
  if (!producto) return '/placeholder.jpg';
  
  // Buscar imágenes en diferentes campos posibles
  const imagenes = producto.imagenes || producto.fotos || producto.images || [];
  
  if (!imagenes || imagenes.length === 0) {
    return '/placeholder.jpg';
  }
  
  const imageUrl = imagenes[index] || imagenes[0];
  return optimizarImagen(imageUrl, size);
};

/**
 * 📸 Obtiene la imagen de portada optimizada
 */
export const getHeroImage = (url: string | null): string => {
  return optimizarImagen(url, 'hero');
};

export default {
  optimizarImagen,
  getProductImage,
  getHeroImage,
};