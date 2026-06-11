import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { chatWithBot, getChatHistory } from '../services/chatbot.service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTED_QUESTIONS = [
  'Hướng dẫn đặt lịch khám bệnh',
  'Xem danh sách các chuyên khoa',
  'Đau đầu thì nên đặt khám chuyên khoa nào'
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user', text: string }[]>([
    { sender: 'bot', text: 'Xin chào! Tôi là trợ lý AI của bệnh viện. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true') {
      setIsOpen(true);
      sessionStorage.removeItem('justLoggedIn');
    }
  }, []);

  // Fetch history when opening for the first time
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      const fetchHistory = async () => {
        try {
          const history = await getChatHistory();
          if (history && history.length > 0) {
            const formattedHistory = history.map(msg => ({
              sender: msg.role === 'USER' ? 'user' : ('bot' as 'user' | 'bot'),
              text: msg.text
            }));
            setMessages(formattedHistory);
          }
        } catch (error) {
          console.error("Lỗi khi lấy lịch sử chat:", error);
        } finally {
          setHasLoadedHistory(true);
        }
      };
      fetchHistory();
    }
  }, [isOpen, hasLoadedHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: text }]);
    setIsLoading(true);

    try {
      const response = await chatWithBot(text);
      setMessages(prev => [...prev, { sender: 'bot', text: response.reply }]);
    } catch (error: any) {
      console.error("Lỗi khi kết nối với chatbot:", error);
      const errorMessage = error.response?.data?.reply
        || error.response?.data?.error
        || 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div ref={chatbotRef} className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[360px] h-[520px] flex flex-col mb-4 overflow-hidden border border-gray-100 animate-slide-up ring-1 ring-black/5">
          <div className="bg-gradient-to-r from-primary to-primary-light text-white p-4 flex justify-between items-center relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide leading-tight">MediCare AI</h3>
                <p className="text-[11px] text-teal-50 opacity-90 font-medium">Trực tuyến - Sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 transition-colors rounded-full p-2 relative z-10">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center mr-2 shrink-0 shadow-sm">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 outline-none text-[14px] leading-relaxed shadow-sm overflow-hidden ${msg.sender === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl rounded-br-sm whitespace-pre-wrap'
                      : 'bg-white border border-gray-100 text-slate-700 rounded-2xl rounded-bl-sm'
                    }`}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-1 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-1 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-[14px]" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        a: ({ node, ...props }) => <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center mr-2 shrink-0 shadow-sm">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            {/* Suggested Questions */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-col gap-2 mt-2 ml-10 animate-fade-in">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gợi ý cho bạn:</p>
                {SUGGESTED_QUESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(suggestion)}
                    className="text-left text-xs bg-primary/5 hover:bg-primary/10 border border-primary/15 hover:border-primary/25 text-primary-dark px-3.5 py-2.5 rounded-xl transition-all font-semibold active:scale-[0.98] cursor-pointer w-fit max-w-[95%] hover:shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <input
              type="text"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-60 placeholder-slate-400"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-2.5 rounded-full text-white transition-all transform ${isLoading || !input.trim()
                  ? 'bg-slate-200 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-md hover:scale-105 active:scale-95'
                }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 rounded-full shadow-[0_8px_16px_rgb(15,118,110,0.3)] hover:shadow-[0_12px_20px_rgb(15,118,110,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center animate-fade-in group relative"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          <MessageCircle className="h-7 w-7 relative z-10" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
