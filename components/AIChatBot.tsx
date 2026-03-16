import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { PortfolioData } from '../types';

interface AIChatBotProps {
  accentColor: string;
  data: PortfolioData;
  isLightMode?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ accentColor, data, isLightMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: `Hi! I'm an AI assistant for ${data.name}. Ask me anything about their skills, experience, or projects!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables.');
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are an AI assistant for ${data.name}'s portfolio website. 
      Your goal is to answer questions about ${data.name} based on the following information:
      
      Name: ${data.name}
      Title: ${data.title}
      Bio: ${data.bio}
      About: ${data.aboutText}
      Current Work: ${data.currentWork}
      Email: ${data.email}
      Phone: ${data.phone}
      
      Skills: ${data.skills.map((s) => s.name).join(', ')}
      
      Projects: ${data.projects.map((p) => p.title + ' - ' + p.description).join(' | ')}
      
      Job Experience: ${data.jobExperiences.map((j) => j.companyName + ' - ' + j.description + ' (' + j.duration + ')').join(' | ')}
      
      Be helpful, concise, and professional. If you don't know the answer based on this information, politely say so and suggest contacting ${data.name} directly.`;

      const conversationHistory = messages.map(msg => 
        `${msg.role === 'user' ? 'Visitor' : 'Assistant'}: ${msg.text}`
      ).join('\n\n');

      const prompt = `${conversationHistory}\n\nVisitor: ${userMessage.text}\nAssistant:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'Sorry, I could not generate a response.',
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error while processing your request. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-[100] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ backgroundColor: accentColor, color: '#000' }}
        aria-label="Open AI Chat"
      >
        <Bot size={24} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'} border rounded-2xl shadow-2xl flex flex-col z-[100] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-800/50'} rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor, color: '#000' }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>AI Assistant</h3>
              <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Ask about {data.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`${isLightMode ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'} transition-colors p-1`}
            aria-label="Close Chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : isLightMode
                      ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm'
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className={`markdown-body prose prose-sm max-w-none ${isLightMode ? '' : 'prose-invert'}`}>
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-white/5'} border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2`}>
                <Loader2 size={16} className={`animate-spin ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-800/30'} rounded-b-2xl`}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none transition-colors ${isLightMode ? 'bg-white border-slate-200 text-slate-900 focus:border-slate-400' : 'bg-slate-950 border-white/10 text-white focus:border-white/30'}`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentColor, color: '#000' }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChatBot;
