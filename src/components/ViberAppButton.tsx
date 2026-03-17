import { FaViber } from "react-icons/fa";

const ViberButton = () => {
  return (
    <a
      href="viber://chat?number=+306993185757"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 bg-[#7360F2] hover:bg-[#5a4ac7] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 w-12 h-12"
      style={{
        bottom: '90px',
        right: '20px',
      }}
      aria-label="Viber"
    >
      {/* Ondas moradas */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#7360F2]/40 opacity-75 animate-ping"></span>
        <span className="absolute inline-flex h-3/4 w-3/4 rounded-full bg-[#7360F2]/30 opacity-50 animate-ping animation-delay-300"></span>
        <span className="absolute inline-flex h-1/2 w-1/2 rounded-full bg-[#7360F2]/20 opacity-25 animate-ping animation-delay-600"></span>
      </span>

      <FaViber size={24} className="relative z-10" />
    </a>
  );
};

export default ViberButton;