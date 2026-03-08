'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/lib/language-context'
import { Zap, Users, Award, MapPin } from 'lucide-react'

export default function AboutPage() {
  const { language } = useLanguage()

  const stats = [
    {
      value: '500+',
      label: { en: 'Happy Customers', el: 'Ευχαριστημένοι Πελάτες' },
    },
    {
      value: '50+',
      label: { en: 'Vehicle Models', el: 'Μοντέλα Οχημάτων' },
    },
    {
      value: '5',
      label: { en: 'Years Experience', el: 'Χρόνια Εμπειρίας' },
    },
    {
      value: '24/7',
      label: { en: 'Customer Support', el: 'Υποστήριξη Πελατών' },
    },
  ]

  const values = [
    {
      icon: Zap,
      title: { en: 'Innovation', el: 'Καινοτομία' },
      description: {
        en: 'We constantly seek the latest advancements in electric mobility technology to bring you cutting-edge vehicles.',
        el: 'Αναζητούμε συνεχώς τις τελευταίες εξελίξεις στην τεχνολογία ηλεκτρικής κινητικότητας για να σας φέρνουμε οχήματα αιχμής.',
      },
    },
    {
      icon: Users,
      title: { en: 'Customer Focus', el: 'Εστίαση στον Πελάτη' },
      description: {
        en: 'Your satisfaction is our priority. We provide personalized service and support throughout your journey.',
        el: 'Η ικανοποίησή σας είναι η προτεραιότητά μας. Παρέχουμε εξατομικευμένη εξυπηρέτηση και υποστήριξη σε όλη τη διαδρομή σας.',
      },
    },
    {
      icon: Award,
      title: { en: 'Quality', el: 'Ποιότητα' },
      description: {
        en: 'We partner with premium brands and thoroughly test every vehicle to ensure the highest standards.',
        el: 'Συνεργαζόμαστε με premium brands και δοκιμάζουμε διεξοδικά κάθε όχημα για να διασφαλίσουμε τα υψηλότερα standards.',
      },
    },
    {
      icon: MapPin,
      title: { en: 'Local Expertise', el: 'Τοπική Εξειδίκευση' },
      description: {
        en: 'Based in Athens, we understand the unique needs of Greek urban mobility and terrain.',
        el: 'Με έδρα την Αθήνα, κατανοούμε τις μοναδικές ανάγκες της ελληνικής αστικής κινητικότητας και του εδάφους.',
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
                {language === 'en' ? 'About Us' : 'Σχετικά με εμάς'}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {language === 'en'
                  ? 'Electric Scooter House is Greece\'s premier destination for premium electric vehicles. Founded with a passion for sustainable mobility, we\'ve been helping riders embrace the electric revolution since 2019.'
                  : 'Το Electric Scooter House είναι ο κορυφαίος προορισμός της Ελλάδας για premium ηλεκτρικά οχήματα. Ιδρύθηκε με πάθος για τη βιώσιμη κινητικότητα και βοηθάμε αναβάτες να αγκαλιάσουν την ηλεκτρική επανάσταση από το 2019.'}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold text-primary-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-primary-foreground/80">
                    {stat.label[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {language === 'en' ? 'Our Story' : 'Η Ιστορία μας'}
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
                <p>
                  {language === 'en'
                    ? 'What started as a small showroom in Athens has grown into Greece\'s most trusted electric vehicle retailer. Our founder\'s vision was simple: make sustainable transportation accessible to everyone.'
                    : 'Αυτό που ξεκίνησε ως ένα μικρό showroom στην Αθήνα έχει εξελιχθεί στον πιο αξιόπιστο λιανοπωλητή ηλεκτρικών οχημάτων στην Ελλάδα. Το όραμα του ιδρυτή μας ήταν απλό: να κάνουμε τη βιώσιμη μεταφορά προσβάσιμη σε όλους.'}
                </p>
                <p>
                  {language === 'en'
                    ? 'Today, we offer the most comprehensive selection of electric motorcycles, scooters, and bicycles in the country. Each product is carefully selected, tested, and backed by our expert service team.'
                    : 'Σήμερα, προσφέρουμε την πιο ολοκληρωμένη επιλογή ηλεκτρικών μοτοσικλετών, πατινιών και ποδηλάτων στη χώρα. Κάθε προϊόν επιλέγεται προσεκτικά, δοκιμάζεται και υποστηρίζεται από την ομάδα εξειδικευμένου service μας.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {language === 'en' ? 'Our Values' : 'Οι Αξίες μας'}
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="rounded-xl bg-card p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {value.title[language]}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {value.description[language]}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-secondary-foreground sm:text-4xl">
              {language === 'en'
                ? 'Visit Our Showroom'
                : 'Επισκεφθείτε το Showroom μας'}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {language === 'en'
                ? 'Experience our vehicles in person. Our expert team is ready to help you find the perfect ride.'
                : 'Ζήστε την εμπειρία των οχημάτων μας από κοντά. Η ομάδα εμπειρογνωμόνων μας είναι έτοιμη να σας βοηθήσει να βρείτε το τέλειο όχημα.'}
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-accent"
            >
              {language === 'en' ? 'Get Directions' : 'Οδηγίες'}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
