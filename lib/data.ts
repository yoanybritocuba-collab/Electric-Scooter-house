import type { Product, SliderItem, ContactInfo } from './types'

export const products: Product[] = [
  {
    id: '1',
    slug: 'thunder-x1-electric-motorcycle',
    name: {
      en: 'Thunder X1 Electric Motorcycle',
      el: 'Thunder X1 Ηλεκτρική Μοτοσικλέτα',
    },
    description: {
      en: 'Experience the raw power of electric performance with the Thunder X1. This premium electric motorcycle combines cutting-edge technology with aggressive styling for riders who demand the best.',
      el: 'Ζήστε την ακατέργαστη δύναμη της ηλεκτρικής απόδοσης με το Thunder X1. Αυτή η premium ηλεκτρική μοτοσικλέτα συνδυάζει τεχνολογία αιχμής με επιθετικό στυλ για αναβάτες που απαιτούν το καλύτερο.',
    },
    category: 'motorcycles',
    price: 8999,
    images: [
      '/images/products/motorcycle-1.jpg',
      '/images/products/motorcycle-1-2.jpg',
      '/images/products/motorcycle-1-3.jpg',
    ],
    specs: {
      motor: '15kW Hub Motor',
      battery: '72V 60Ah Lithium',
      range: '150km',
      topSpeed: '120 km/h',
      chargingTime: '4-5 hours',
      weight: '145kg',
      maxLoad: '200kg',
      brakes: 'Dual Disc Hydraulic',
      tires: '17" Tubeless',
      suspension: 'Front Telescopic, Rear Mono-shock',
      lights: 'Full LED System',
      display: '7" TFT Color Display',
      waterResistance: 'IP65',
      warranty: '3 Years',
    },
    features: {
      en: [
        'Regenerative braking system',
        'Smart connectivity with mobile app',
        'GPS navigation built-in',
        'Keyless ignition',
        'Multiple riding modes',
        'Anti-theft alarm system',
      ],
      el: [
        'Σύστημα αναγεννητικής πέδησης',
        'Έξυπνη συνδεσιμότητα με εφαρμογή κινητού',
        'Ενσωματωμένη πλοήγηση GPS',
        'Εκκίνηση χωρίς κλειδί',
        'Πολλαπλές λειτουργίες οδήγησης',
        'Σύστημα συναγερμού κατά της κλοπής',
      ],
    },
    inStock: true,
    featured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    slug: 'city-cruiser-e-scooter',
    name: {
      en: 'City Cruiser E-Scooter',
      el: 'City Cruiser Ηλεκτρικό Πατίνι',
    },
    description: {
      en: 'The perfect urban companion. The City Cruiser offers unmatched portability and performance for daily commuters. Fold it, carry it, ride it anywhere.',
      el: 'Ο τέλειος αστικός σύντροφος. Το City Cruiser προσφέρει απαράμιλλη φορητότητα και απόδοση για καθημερινές μετακινήσεις. Διπλώστε το, μεταφέρετέ το, οδηγήστε το οπουδήποτε.',
    },
    category: 'scooters',
    price: 699,
    images: [
      '/images/products/scooter-1.jpg',
      '/images/products/scooter-1-2.jpg',
    ],
    specs: {
      motor: '500W Brushless',
      battery: '48V 15Ah Lithium',
      range: '45km',
      topSpeed: '35 km/h',
      chargingTime: '5-6 hours',
      weight: '18kg',
      maxLoad: '120kg',
      brakes: 'Front E-ABS + Rear Disc',
      tires: '10" Pneumatic',
      suspension: 'Front & Rear Spring',
      lights: 'LED Headlight & Taillight',
      display: 'LCD Display',
      waterResistance: 'IP54',
      warranty: '2 Years',
    },
    features: {
      en: [
        'Foldable design (3 seconds)',
        'Triple braking system',
        'Cruise control',
        'LED ambient lighting',
        'Bluetooth speaker',
        'USB charging port',
      ],
      el: [
        'Αναδιπλούμενος σχεδιασμός (3 δευτερόλεπτα)',
        'Τριπλό σύστημα φρένων',
        'Tempomat',
        'LED φωτισμός περιβάλλοντος',
        'Ηχείο Bluetooth',
        'Θύρα φόρτισης USB',
      ],
    },
    inStock: true,
    featured: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    slug: 'mountain-beast-e-bike',
    name: {
      en: 'Mountain Beast E-Bike',
      el: 'Mountain Beast Ηλεκτρικό Ποδήλατο',
    },
    description: {
      en: 'Conquer any terrain with the Mountain Beast. Built for adventure seekers who want to explore beyond the paved roads. Powerful motor and rugged construction for the ultimate off-road experience.',
      el: 'Κατακτήστε κάθε έδαφος με το Mountain Beast. Κατασκευασμένο για λάτρεις της περιπέτειας που θέλουν να εξερευνήσουν πέρα από τους ασφαλτοστρωμένους δρόμους.',
    },
    category: 'bicycles',
    price: 2499,
    images: [
      '/images/products/ebike-1.jpg',
      '/images/products/ebike-1-2.jpg',
    ],
    specs: {
      motor: '750W Mid-Drive Bafang',
      battery: '48V 17.5Ah Samsung',
      range: '80km',
      topSpeed: '45 km/h',
      chargingTime: '4-5 hours',
      weight: '28kg',
      maxLoad: '150kg',
      brakes: 'Hydraulic Disc Tektro',
      tires: '27.5" x 2.8" Fat Tires',
      suspension: 'Full Suspension 150mm Travel',
      lights: 'Integrated LED',
      display: 'Colorful LCD',
      waterResistance: 'IP65',
      warranty: '2 Years',
    },
    features: {
      en: [
        '9-speed Shimano gears',
        '5 pedal assist levels',
        'Walk assist mode',
        'Removable battery',
        'Hydraulic lock-out fork',
        'Quick-release wheels',
      ],
      el: [
        '9 ταχύτητες Shimano',
        '5 επίπεδα υποβοήθησης πεντάλ',
        'Λειτουργία υποβοήθησης περπατήματος',
        'Αφαιρούμενη μπαταρία',
        'Υδραυλικό πιρούνι με κλείδωμα',
        'Τροχοί γρήγορης αποδέσμευσης',
      ],
    },
    inStock: true,
    featured: true,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: '4',
    slug: 'pro-helmet-carbon',
    name: {
      en: 'Pro Helmet Carbon',
      el: 'Pro Helmet Carbon',
    },
    description: {
      en: 'Premium carbon fiber helmet designed for electric vehicle riders. Lightweight yet incredibly strong, with advanced ventilation and integrated Bluetooth.',
      el: 'Premium κράνος από ανθρακονήματα σχεδιασμένο για αναβάτες ηλεκτρικών οχημάτων. Ελαφρύ αλλά απίστευτα ανθεκτικό, με προηγμένο αερισμό και ενσωματωμένο Bluetooth.',
    },
    category: 'accessories',
    price: 249,
    images: [
      '/images/products/helmet-1.jpg',
    ],
    specs: {
      weight: '1.2kg',
      warranty: '5 Years',
    },
    features: {
      en: [
        'Carbon fiber shell',
        'Bluetooth 5.0 integrated',
        'Sun visor',
        'Removable liner',
        'DOT & ECE certified',
      ],
      el: [
        'Κέλυφος από ανθρακονήματα',
        'Ενσωματωμένο Bluetooth 5.0',
        'Αντιηλιακό γείσο',
        'Αφαιρούμενη επένδυση',
        'Πιστοποίηση DOT & ECE',
      ],
    },
    inStock: true,
    featured: false,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
  },
  {
    id: '5',
    slug: 'volt-racer-electric-motorcycle',
    name: {
      en: 'Volt Racer Electric Motorcycle',
      el: 'Volt Racer Ηλεκτρική Μοτοσικλέτα',
    },
    description: {
      en: 'The Volt Racer redefines what an electric motorcycle can be. Track-ready performance meets street-legal practicality in this stunning machine.',
      el: 'Το Volt Racer επαναπροσδιορίζει το τι μπορεί να είναι μια ηλεκτρική μοτοσικλέτα. Απόδοση έτοιμη για πίστα συναντά πρακτικότητα για τον δρόμο.',
    },
    category: 'motorcycles',
    price: 12999,
    images: [
      '/images/products/motorcycle-2.jpg',
    ],
    specs: {
      motor: '20kW Liquid Cooled',
      battery: '96V 50Ah Lithium',
      range: '200km',
      topSpeed: '160 km/h',
      chargingTime: '3-4 hours (fast charge)',
      weight: '165kg',
      maxLoad: '180kg',
      brakes: 'Brembo Racing Calipers',
      tires: '17" Racing Compound',
      suspension: 'Ohlins Adjustable',
      lights: 'Adaptive LED Matrix',
      display: '10" Touch Display',
      waterResistance: 'IP67',
      warranty: '5 Years',
    },
    features: {
      en: [
        'Track mode with traction control',
        'Launch control',
        'Carbon fiber body panels',
        'Quick-swap battery system',
        'OTA software updates',
        'Premium sound system',
      ],
      el: [
        'Λειτουργία πίστας με έλεγχο πρόσφυσης',
        'Έλεγχος εκκίνησης',
        'Πάνελ αμαξώματος από ανθρακονήματα',
        'Σύστημα γρήγορης αλλαγής μπαταρίας',
        'Ενημερώσεις λογισμικού OTA',
        'Premium ηχοσύστημα',
      ],
    },
    inStock: true,
    featured: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '6',
    slug: 'urban-glide-scooter',
    name: {
      en: 'Urban Glide Scooter',
      el: 'Urban Glide Πατίνι',
    },
    description: {
      en: 'Sleek, silent, and sophisticated. The Urban Glide is engineered for style-conscious commuters who refuse to compromise on performance.',
      el: 'Κομψό, αθόρυβο και εκλεπτυσμένο. Το Urban Glide είναι σχεδιασμένο για commuters με αίσθηση στυλ που δεν συμβιβάζονται στην απόδοση.',
    },
    category: 'scooters',
    price: 549,
    images: [
      '/images/products/scooter-2.jpg',
    ],
    specs: {
      motor: '350W Brushless',
      battery: '36V 10.4Ah Lithium',
      range: '30km',
      topSpeed: '25 km/h',
      chargingTime: '4 hours',
      weight: '12kg',
      maxLoad: '100kg',
      brakes: 'Rear Foot Brake + E-brake',
      tires: '8.5" Solid',
      lights: 'Front LED',
      display: 'LED Dashboard',
      waterResistance: 'IP54',
      warranty: '1 Year',
    },
    features: {
      en: [
        'Ultra-lightweight design',
        'One-click folding',
        'Puncture-proof tires',
        'Regenerative braking',
        'App connectivity',
      ],
      el: [
        'Υπερελαφρύς σχεδιασμός',
        'Αναδίπλωση με ένα κλικ',
        'Ελαστικά ανθεκτικά σε τρυπήματα',
        'Αναγεννητική πέδηση',
        'Συνδεσιμότητα εφαρμογής',
      ],
    },
    inStock: true,
    featured: false,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '7',
    slug: 'city-commuter-e-bike',
    name: {
      en: 'City Commuter E-Bike',
      el: 'City Commuter Ηλεκτρικό Ποδήλατο',
    },
    description: {
      en: 'The perfect blend of comfort and efficiency. Navigate city streets with ease on this elegantly designed electric bicycle.',
      el: 'Ο τέλειος συνδυασμός άνεσης και αποδοτικότητας. Πλοηγηθείτε στους δρόμους της πόλης με ευκολία σε αυτό το κομψά σχεδιασμένο ηλεκτρικό ποδήλατο.',
    },
    category: 'bicycles',
    price: 1699,
    images: [
      '/images/products/ebike-2.jpg',
    ],
    specs: {
      motor: '500W Rear Hub',
      battery: '48V 13Ah LG',
      range: '60km',
      topSpeed: '32 km/h',
      chargingTime: '5-6 hours',
      weight: '24kg',
      maxLoad: '130kg',
      brakes: 'Mechanical Disc',
      tires: '26" City Tires',
      suspension: 'Front Fork',
      lights: 'Front & Rear LED',
      display: 'LCD with USB',
      waterResistance: 'IP54',
      warranty: '2 Years',
    },
    features: {
      en: [
        'Step-through frame',
        '7-speed Shimano',
        'Rear cargo rack',
        'Integrated fenders',
        'Comfort saddle',
        'Kickstand included',
      ],
      el: [
        'Χαμηλό πλαίσιο για εύκολη ανάβαση',
        '7 ταχύτητες Shimano',
        'Πίσω σχάρα αποσκευών',
        'Ενσωματωμένα φτερά',
        'Άνετη σέλα',
        'Σταντ περιλαμβάνεται',
      ],
    },
    inStock: false,
    featured: false,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z',
  },
  {
    id: '8',
    slug: 'smart-lock-pro',
    name: {
      en: 'Smart Lock Pro',
      el: 'Smart Lock Pro',
    },
    description: {
      en: 'Secure your electric vehicle with military-grade encryption. The Smart Lock Pro features fingerprint recognition and GPS tracking.',
      el: 'Ασφαλίστε το ηλεκτρικό σας όχημα με κρυπτογράφηση στρατιωτικού επιπέδου. Το Smart Lock Pro διαθέτει αναγνώριση δακτυλικού αποτυπώματος και παρακολούθηση GPS.',
    },
    category: 'accessories',
    price: 89,
    images: [
      '/images/products/lock-1.jpg',
    ],
    specs: {
      weight: '0.8kg',
      warranty: '2 Years',
    },
    features: {
      en: [
        'Fingerprint unlock',
        'GPS tracking',
        'App notifications',
        'Cut-resistant cable',
        'Rechargeable battery',
      ],
      el: [
        'Ξεκλείδωμα με δακτυλικό αποτύπωμα',
        'Παρακολούθηση GPS',
        'Ειδοποιήσεις εφαρμογής',
        'Καλώδιο ανθεκτικό σε κοπή',
        'Επαναφορτιζόμενη μπαταρία',
      ],
    },
    inStock: true,
    featured: false,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
]

export const sliderItems: SliderItem[] = [
  {
    id: '1',
    image: '/images/slider/hero-1.jpg',
    title: {
      en: 'Experience Electric Freedom',
      el: 'Ζήστε την Ηλεκτρική Ελευθερία',
    },
    subtitle: {
      en: 'Discover our premium collection of electric motorcycles',
      el: 'Ανακαλύψτε την premium συλλογή ηλεκτρικών μοτοσικλετών μας',
    },
    buttonText: {
      en: 'Shop Motorcycles',
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
      el: 'Αστική Κινητικότητα Επαναπροσδιορισμένη',
    },
    subtitle: {
      en: 'Compact, powerful, and eco-friendly scooters for city life',
      el: 'Συμπαγή, ισχυρά και οικολογικά πατίνια για την αστική ζωή',
    },
    buttonText: {
      en: 'Explore Scooters',
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
      el: 'Η Περιπέτεια Περιμένει',
    },
    subtitle: {
      en: 'Electric bicycles for every terrain and every rider',
      el: 'Ηλεκτρικά ποδήλατα για κάθε έδαφος και κάθε αναβάτη',
    },
    buttonText: {
      en: 'View E-Bikes',
      el: 'Δείτε τα Ηλ. Ποδήλατα',
    },
    buttonLink: '/products/bicycles',
    order: 3,
  },
]

export const contactInfo: ContactInfo = {
  address: {
    en: '123 Electric Avenue, Athens, Greece 10557',
    el: 'Ηλεκτρική Λεωφόρος 123, Αθήνα, Ελλάδα 10557',
  },
  phone: '+30 210 123 4567',
  email: 'info@electricscooterhouse.gr',
  hours: {
    en: 'Mon-Fri: 9:00-20:00, Sat: 10:00-18:00',
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

export function searchProducts(query: string, lang: 'en' | 'el'): Product[] {
  const lowerQuery = query.toLowerCase()
  return products.filter((p) => {
    const name = p.name[lang].toLowerCase()
    const description = p.description[lang].toLowerCase()
    const category = p.category.toLowerCase()
    const features = p.features[lang].join(' ').toLowerCase()
    
    return (
      name.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      category.includes(lowerQuery) ||
      features.includes(lowerQuery)
    )
  })
}
