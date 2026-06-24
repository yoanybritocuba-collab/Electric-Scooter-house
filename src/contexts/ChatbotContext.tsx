import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ChatbotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isEnabled: boolean;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled] = useState(() => {
    return import.meta.env.VITE_ENABLE_CHATBOT !== 'false';
  });

  return (
    <ChatbotContext.Provider value={{ isOpen, setIsOpen, isEnabled }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};