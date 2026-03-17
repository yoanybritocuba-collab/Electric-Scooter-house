import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { 
  MapPin, Phone, Mail, Clock
} from "lucide-react";

// Iconos originales de redes sociales (SVG)
const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TwitterIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.965-12.29A10.025 10.025 0 0024 4.59z"/>
  </svg>
);

const YoutubeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ViberIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.154 8.673c0-4.686-3.8-8.486-8.486-8.486H9.332c-4.686 0-8.486 3.8-8.486 8.486v5.336c0 4.686 3.8 8.486 8.486 8.486h5.336c4.686 0 8.486-3.8 8.486-8.486V8.673zM12 18.32c-3.485 0-6.32-2.835-6.32-6.32S8.515 5.68 12 5.68s6.32 2.835 6.32 6.32-2.835 6.32-6.32 6.32z"/>
  </svg>
);

const ContactPage = () => {
  const { t } = useLanguage();

  const handlePhoneClick = () => {
    window.location.href = 'tel:+302102799443';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:electrichousescooters@gmail.com';
  };

  const handleAddressClick = () => {
    window.open('https://maps.google.com/?q=Καρολίδου+10+Νέα+Ιωνία+14231', '_blank');
  };

  const handleViberClick = () => {
    window.open('viber://chat?number=+306993185757', '_blank');
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t("contact.address"),
      content: "Καρολίδου 10, Νέα Ιωνία 14231",
      action: handleAddressClick,
      color: "text-blue-500"
    },
    {
      icon: Phone,
      title: t("contact.phone"),
      content: "21 0279 9443",
      action: handlePhoneClick,
      color: "text-green-500"
    },
    {
      icon: Mail,
      title: t("contact.email"),
      content: "electrichousescooters@gmail.com",
      action: handleEmailClick,
      color: "text-yellow-500"
    },
    {
      icon: Clock,
      title: t("contact.hours"),
      content: (
        <>
          <p>{t("contact.weekdays")}: 10:00 - 20:00</p>
          <p>{t("contact.saturday")}: 10:00 - 14:00</p>
          <p>{t("contact.sunday")}: {t("contact.closed")}</p>
        </>
      ),
      color: "text-purple-500"
    }
  ];

  // Redes sociales con iconos originales
  const socialLinks = [
    { 
      icon: FacebookIcon, 
      href: "https://facebook.com", 
      label: "Facebook", 
      color: "hover:text-[#1877F2]",
      bgColor: "hover:bg-[#1877F2]/10"
    },
    { 
      icon: InstagramIcon, 
      href: "https://instagram.com", 
      label: "Instagram", 
      color: "hover:text-[#E4405F]",
      bgColor: "hover:bg-[#E4405F]/10"
    },
    { 
      icon: TwitterIcon, 
      href: "https://twitter.com", 
      label: "Twitter", 
      color: "hover:text-[#1DA1F2]",
      bgColor: "hover:bg-[#1DA1F2]/10"
    },
    { 
      icon: YoutubeIcon, 
      href: "https://youtube.com", 
      label: "YouTube", 
      color: "hover:text-[#FF0000]",
      bgColor: "hover:bg-[#FF0000]/10"
    },
    { 
      icon: ViberIcon, 
      action: handleViberClick,
      label: "Viber", 
      color: "hover:text-[#7360F2]",
      bgColor: "hover:bg-[#7360F2]/10"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </motion.div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6 hover:border-green-500/50 transition-all"
              >
                <button
                  onClick={item.action}
                  className="w-full text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-green-500/10 rounded-xl ${item.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{item.title}</h3>
                      <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                        {item.content}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Mapa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0a0a0a] rounded-2xl border border-green-900/30 p-6 hover:border-green-500/50 transition-all mb-12"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-green-500" />
            {t("contact.map")}
          </h2>
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3143.123456789!2d23.756789!3d38.012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDAwJzQ0LjQiTiAyM8KwNDUnMjQuNCJF!5e0!3m2!1sel!2sgr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
              className="w-full h-full"
            />
          </div>
        </motion.div>

        {/* Redes Sociales con iconos originales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-white mb-6">{t("footer.follow_us")}</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.action ? "#" : social.href}
                  onClick={(e) => {
                    if (social.action) {
                      e.preventDefault();
                      social.action();
                    }
                  }}
                  target={social.action ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className={`w-14 h-14 bg-[#0a0a0a] border border-green-900/30 rounded-xl flex items-center justify-center text-gray-400 transition-all group ${social.color} ${social.bgColor} hover:scale-110`}
                  title={social.label}
                >
                  <Icon size={24} className="group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;