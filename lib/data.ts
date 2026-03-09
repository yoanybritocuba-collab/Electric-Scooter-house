import type { Product, SliderItem, ContactInfo } from './types'

export const products: Product[] = [
  // ... (todo igual, no cambia)
]

export const sliderItems: SliderItem[] = [
  {
    id: '1',
    image: '/images/slider/hero-1.jpg',
    title: {
      en: 'Experience Electric Freedom',
      es: 'Experimenta la Libertad Eléctrica',
      it: 'Vivi la Libertà Elettrica',
      el: 'Ζήστε την Ηλεκτρική Ελευθερία',
    },
    subtitle: {
      en: 'Discover our premium collection of electric motorcycles',
      es: 'Descubre nuestra colección premium de motos eléctricas',
      it: 'Scopri la nostra collezione premium di moto elettriche',
      el: 'Ανακαλύψτε την premium συλλογή ηλεκτρικών μοτοσικλετών μας',
    },
    buttonText: {
      en: 'Shop Motorcycles',
      es: 'Comprar Motos',
      it: 'Acquista Moto',
      el: 'Δείτε τις Μοτοσικλέτες',
    },
    buttonLink: '/products/motorcycles',
    order: 1,
  },
  {
    id: '2',
    image: '/images/slider/hero-2.jpg',
    title: {
      en: 'Urban Mobility Redefined',
      es: 'Movilidad Urbana Redefinida',
      it: 'Mobilità Urbana Ridefinita',
      el: 'Αστική Κινητικότητα Επαναπροσδιορισμένη',
    },
    subtitle: {
      en: 'Compact, powerful, and eco-friendly scooters for city life',
      es: 'Patinetes compactos, potentes y ecológicos para la vida urbana',
      it: 'Scooter compatti, potenti ed ecologici per la vita in città',
      el: 'Συμπαγή, ισχυρά και οικολογικά πατίνια για την αστική ζωή',
    },
    buttonText: {
      en: 'Explore Scooters',
      es: 'Explorar Patinetes',
      it: 'Esplora Scooter',
      el: 'Εξερευνήστε τα Πατίνια',
    },
    buttonLink: '/products/scooters',
    order: 2,
  },
  {
    id: '3',
    image: '/images/slider/hero-3.jpg',
    title: {
      en: 'Adventure Awaits',
      es: 'La Aventura Te Espera',
      it: 'L\'Avventura Ti Aspetta',
      el: 'Η Περιπέτεια Περιμένει',
    },
    subtitle: {
      en: 'Electric bicycles for every terrain and every rider',
      es: 'Bicicletas eléctricas para cada terreno y cada ciclista',
      it: 'Biciclette elettriche per ogni terreno e ogni ciclista',
      el: 'Ηλεκτρικά ποδήλατα για κάθε έδαφος και κάθε αναβάτη',
    },
    buttonText: {
      en: 'View E-Bikes',
      es: 'Ver E-Bikes',
      it: 'Vedi E-Bike',
      el: 'Δείτε τα Ηλ. Ποδήλατα',
    },
    buttonLink: '/products/bicycles',
    order: 3,
  },
]

export const contactInfo: ContactInfo = {
  address: {
    en: '123 Electric Avenue, Athens, Greece 10557',
    es: '123 Avenida Eléctrica, Atenas, Grecia 10557',
    it: '123 Viale Elettrico, Atene, Grecia 10557',
    el: 'Ηλεκτρική Λεωφόρος 123, Αθήνα, Ελλάδα 10557',
  },
  phone: '+30 210 123 4567',
  email: 'info@electricscooterhouse.gr',
  hours: {
    en: 'Mon-Fri: 9:00-20:00, Sat: 10:00-18:00',
    es: 'Lun-Vie: 9:00-20:00, Sáb: 10:00-18:00',
    it: 'Lun-Ven: 9:00-20:00, Sab: 10:00-18:00',
    el: 'Δευ-Παρ: 9:00-20:00, Σάβ: 10:00-18:00',
  },
  socialLinks: {
    facebook: 'https://facebook.com/electricscooterhouse',
    instagram: 'https://instagram.com/electricscooterhouse',
    youtube: 'https://youtube.com/electricscooterhouse',
  },
}

// Helper functions
export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function searchProducts(query: string, lang: 'en' | 'es' | 'it' | 'el'): Product[] {
  const lowerQuery = query.toLowerCase()
  return products.filter((p) => {
    const name = p.name[lang]?.toLowerCase() || p.name.en.toLowerCase()
    const description = p.description[lang]?.toLowerCase() || p.description.en.toLowerCase()
    const category = p.category.toLowerCase()
    const features = (p.features[lang] || p.features.en).join(' ').toLowerCase()
    
    return (
      name.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      category.includes(lowerQuery) ||
      features.includes(lowerQuery)
    )
  })
}