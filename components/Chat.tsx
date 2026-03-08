import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatProps {
  accentColor: string;
  whatsappNumber: string;
}

const Chat: React.FC<ChatProps> = ({ accentColor, whatsappNumber }) => {
  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
      <button 
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-[100]"
        style={{ backgroundColor: accentColor, color: '#000' }}
      >
        <MessageCircle size={24} />
      </button>
  );
};

export default Chat;
