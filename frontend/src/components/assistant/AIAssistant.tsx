import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User as UserIcon, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  loading?: boolean;
  products?: any[];
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: 'bot', text: "Hey there! I'm your Zeronix AI. What high-end gear are you looking for today?" }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  // Listen for global open event (e.g. from navbar)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const currentMessage = message.trim();
    setChat(prev => [
      ...prev, 
      { role: 'user', text: currentMessage },
      { role: 'bot', text: "Searching our live inventory...", loading: true }
    ]);
    setMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const res = await api.get(`/products?search=${encodeURIComponent(currentMessage)}`);
      const products = res.data.data.slice(0, 4);

      setChat(prev => {
        const newChat = [...prev];
        newChat[newChat.length - 1] = {
          role: 'bot',
          text: products.length > 0 
            ? `I found ${products.length} ${products.length === 1 ? 'match' : 'matches'} that might be exactly what you need. Have a look:` 
            : `I couldn't find any exact matches for "${currentMessage}". Try searching for specific brands like "Intel" or "Asus", or you can contact our sales team at sales@zeronix.ae for custom orders.`,
          loading: false,
          products: products.length > 0 ? products : undefined
        };
        return newChat;
      });

    } catch (error) {
      console.error("AI Search Error:", error);
      setChat(prev => {
        const newChat = [...prev];
        newChat[newChat.length - 1] = {
          role: 'bot',
          text: "Oops! I had trouble connecting to the database. Please try again in a moment.",
          loading: false
        };
        return newChat;
      });
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "hidden lg:flex fixed bottom-10 right-10 z-[60] h-14 w-14 rounded-full bg-accent-primary text-white items-center justify-center shadow-premium transition-all duration-500 hover:scale-110 active:scale-95 group animate-anxiety",
          isOpen && "opacity-0 scale-0 pointer-events-none"
        )}
      >
        <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Overlay */}
      <div className={cn(
        "fixed inset-0 lg:inset-auto lg:bottom-10 lg:right-10 z-[70] transition-all duration-500 transform",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="bg-bg-primary lg:w-[420px] h-full lg:h-[650px] flex flex-col shadow-premium lg:rounded-2xl border border-border-subtle overflow-hidden">
          
          {/* Header */}
          <div className="p-4 md:p-5 bg-bg-surface flex items-center justify-between border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-primary flex items-center justify-center text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-text-primary">Zeronix AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
                  <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest">Active Now</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-bg-surface rounded-lg text-text-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar pb-8"
          >
            {chat.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col gap-3",
                msg.role === 'user' ? "items-end ml-auto" : "items-start mr-auto w-full"
              )}>
                <div className={cn(
                  "flex items-start gap-3 w-full",
                  msg.role === 'user' ? "flex-row-reverse max-w-[85%]" : "flex-row"
                )}>
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                    msg.role === 'user' ? "bg-bg-surface text-text-primary" : "bg-accent-primary text-white",
                    msg.loading && "animate-pulse"
                  )}>
                    {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  
                  <div className={cn(
                    "p-3.5 md:p-4 text-xs md:text-sm leading-relaxed flex-1",
                    msg.role === 'user' 
                      ? "bg-accent-primary text-white rounded-[20px_4px_20px_20px] max-w-full inline-block" 
                      : "bg-bg-surface border border-border-subtle text-text-primary rounded-[4px_20px_20px_20px] w-full"
                  )}>
                    {msg.loading ? (
                      <span className="flex items-center gap-2">
                         <span className="animate-pulse">{msg.text}</span>
                         <span className="flex gap-0.5">
                           <span className="h-1 w-1 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                           <span className="h-1 w-1 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                           <span className="h-1 w-1 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                         </span>
                      </span>
                    ) : msg.text}
                  </div>
                </div>

                {/* Render Simplified Chat Products */}
                {msg.products && msg.products.length > 0 && (
                  <div className="pl-11 w-full mt-2">
                    <div className="grid grid-cols-2 gap-3 w-full pr-2 pb-4">
                      {msg.products.map(product => {
                         const hasDiscount = !!product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);
                         const priceDisplay = hasDiscount ? product.sale_price : product.price;

                         return (
                          <Link to={`/products/${product.slug}`} key={product.id} className="group bg-bg-surface border border-border-subtle rounded-lg overflow-hidden hover:border-accent-primary/30 transition-colors flex flex-col h-[200px]">
                            <div className="h-28 bg-white p-3 flex items-center justify-center border-b border-border-subtle shrink-0">
                               {product.images && product.images[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                               ) : product.image ? (
                                  <img src={product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                               ) : null}
                            </div>
                            <div className="p-3 flex flex-col flex-grow justify-between bg-bg-surface">
                               <h4 className="text-[10px] md:text-xs font-bold text-text-primary line-clamp-2 leading-tight">{product.name}</h4>
                               <div className="flex items-center justify-between mt-2">
                                  <span className="text-[11px] md:text-xs font-bold text-accent-primary">AED {priceDisplay}</span>
                               </div>
                            </div>
                          </Link>
                         )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Suggestion Chips */}
          <div className="px-4 md:px-6 pt-4 pb-2 bg-bg-surface/50 border-t border-border-subtle">
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['RTX 4090 GPUs', 'Intel Processors', 'Gaming Storage'].map(chip => (
                   <button 
                     key={chip} 
                     onClick={() => setMessage(chip)}
                     className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border-subtle bg-bg-primary text-[10px] md:text-xs font-bold text-text-muted hover:border-accent-primary/50 hover:text-accent-primary transition-colors"
                   >
                     {chip}
                   </button>
                ))}
             </div>
          </div>

          {/* Input area */}
          <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 bg-bg-surface/50">
            <div className="relative group">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Zeronix AI..."
                className="w-full h-12 md:h-14 pl-12 pr-16 bg-bg-surface border border-border-subtle rounded-full focus:border-accent-primary/50 outline-none transition-all placeholder:text-text-muted/50 text-xs md:text-sm text-text-primary"
              />
              <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted/40 group-focus-within:text-accent-primary transition-colors" />
              <button 
                onClick={handleSend}
                disabled={!message.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-accent-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all"
              >
                <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
            </div>
            <p className="hidden md:block text-[9px] text-center text-text-muted mt-3 font-medium uppercase tracking-[0.1em] opacity-40 italic">
              AI fetching real-time database inventory
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
