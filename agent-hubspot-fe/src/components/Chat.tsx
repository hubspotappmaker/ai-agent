import React, { useEffect, useRef, useState } from 'react';
import { Send, User, Bot } from 'lucide-react';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(messages.length > 0);
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        isUser: true,
      };
      setMessages([...messages, newMessage]);
      setInputValue('');

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Thank you for sharing. I'll review this and get back to you as soon as possible.",
            isUser: false,
          },
        ]);
      }, 800);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[65vh] overflow-hidden flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <h3 className="font-semibold text-slate-800">AI Assistant</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser ? 'bg-[#667eea] text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-sm lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-2xl ${
                message.isUser ? 'bg-[#667eea] text-white rounded-tr-md' : 'bg-slate-100 text-slate-800 rounded-tl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        <button
          style={{ marginBottom: '10px' }}
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="px-4 py-3 bg-[#667eea] text-white rounded-xl hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Chat;


