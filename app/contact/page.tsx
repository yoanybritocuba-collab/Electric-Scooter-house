'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/lib/language-context'
import { contactInfo } from '@/lib/data'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const { language, t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send the form data to an API
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
              {t.nav.contact}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {language === 'en'
                ? 'Have questions? We\'d love to hear from you. Visit our showroom or get in touch.'
                : 'Έχετε ερωτήσεις; Θα χαρούμε να σας ακούσουμε. Επισκεφθείτε το showroom μας ή επικοινωνήστε μαζί μας.'}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {language === 'en' ? 'Contact Information' : 'Στοιχεία Επικοινωνίας'}
                </h2>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {language === 'en' ? 'Address' : 'Διεύθυνση'}
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        {contactInfo.address[language]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {language === 'en' ? 'Phone' : 'Τηλέφωνο'}
                      </h3>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="mt-1 block text-muted-foreground hover:text-primary"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Email</h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="mt-1 block text-muted-foreground hover:text-primary"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {language === 'en' ? 'Working Hours' : 'Ωράριο'}
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        {contactInfo.hours[language]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="mt-8 aspect-video overflow-hidden rounded-xl bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.2873737289387!2d23.726769215313167!3d37.97576167972155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bd172b5c0b8f%3A0x400bd2ce2b980c0!2sAthens%2C%20Greece!5e0!3m2!1sen!2sus!4v1635959562000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location"
                  />
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {language === 'en' ? 'Send us a Message' : 'Στείλτε μας Μήνυμα'}
                </h2>

                {submitted ? (
                  <div className="mt-8 rounded-xl bg-primary/10 p-8 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-primary" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      {language === 'en'
                        ? 'Message Sent!'
                        : 'Το Μήνυμα Στάλθηκε!'}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {language === 'en'
                        ? 'Thank you for contacting us. We\'ll get back to you within 24 hours.'
                        : 'Σας ευχαριστούμε που επικοινωνήσατε μαζί μας. Θα απαντήσουμε εντός 24 ωρών.'}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-sm font-medium text-primary hover:underline"
                    >
                      {language === 'en' ? 'Send another message' : 'Στείλτε άλλο μήνυμα'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-foreground"
                        >
                          {language === 'en' ? 'Name' : 'Όνομα'} *
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          className="mt-1.5 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          className="mt-1.5 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-foreground"
                      >
                        {language === 'en' ? 'Phone' : 'Τηλέφωνο'}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="mt-1.5 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-foreground"
                      >
                        {language === 'en' ? 'Subject' : 'Θέμα'} *
                      </label>
                      <select
                        id="subject"
                        required
                        className="mt-1.5 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">
                          {language === 'en' ? 'Select a subject' : 'Επιλέξτε θέμα'}
                        </option>
                        <option value="purchase">
                          {language === 'en'
                            ? 'Product Purchase Inquiry'
                            : 'Ερώτηση για Αγορά Προϊόντος'}
                        </option>
                        <option value="test-ride">
                          {language === 'en'
                            ? 'Book a Test Ride'
                            : 'Κράτηση Δοκιμαστικής'}
                        </option>
                        <option value="service">
                          {language === 'en' ? 'Service & Repairs' : 'Service & Επισκευές'}
                        </option>
                        <option value="other">
                          {language === 'en' ? 'Other' : 'Άλλο'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground"
                      >
                        {language === 'en' ? 'Message' : 'Μήνυμα'} *
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        required
                        className="mt-1.5 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-accent"
                    >
                      <Send className="h-5 w-5" />
                      {language === 'en' ? 'Send Message' : 'Αποστολή Μηνύματος'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
