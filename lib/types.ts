export type Category = 'motorcycles' | 'scooters' | 'bicycles' | 'accessories'

export type Language = 'en' | 'el'

export interface Product {
  id: string
  slug: string
  name: Record<Language, string>
  description: Record<Language, string>
  category: Category
  price: number
  images: string[]
  specs: {
    motor?: string
    battery?: string
    range?: string
    topSpeed?: string
    chargingTime?: string
    weight?: string
    maxLoad?: string
    brakes?: string
    tires?: string
    suspension?: string
    lights?: string
    display?: string
    waterResistance?: string
    warranty?: string
    [key: string]: string | undefined
  }
  features: Record<Language, string[]>
  inStock: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface SliderItem {
  id: string
  image: string
  title: Record<Language, string>
  subtitle: Record<Language, string>
  buttonText: Record<Language, string>
  buttonLink: string
  order: number
}

export interface ContactInfo {
  address: Record<Language, string>
  phone: string
  email: string
  hours: Record<Language, string>
  socialLinks: {
    facebook?: string
    instagram?: string
    youtube?: string
  }
}

export interface Translations {
  nav: {
    home: string
    products: string
    motorcycles: string
    scooters: string
    bicycles: string
    accessories: string
    about: string
    contact: string
    search: string
    admin: string
  }
  hero: {
    title: string
    subtitle: string
    cta: string
  }
  products: {
    viewAll: string
    viewDetails: string
    outOfStock: string
    inStock: string
    addToCart: string
    specifications: string
    features: string
    relatedProducts: string
    noProducts: string
    searchPlaceholder: string
  }
  categories: {
    motorcycles: string
    scooters: string
    bicycles: string
    accessories: string
  }
  footer: {
    about: string
    quickLinks: string
    contact: string
    followUs: string
    rights: string
  }
  admin: {
    dashboard: string
    products: string
    sliders: string
    settings: string
    addProduct: string
    editProduct: string
    deleteProduct: string
    save: string
    cancel: string
    login: string
    logout: string
    username: string
    password: string
  }
}
