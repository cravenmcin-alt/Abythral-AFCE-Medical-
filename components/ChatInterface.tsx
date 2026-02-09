
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PatientState } from '../types';
import { createChatSession } from '../services/geminiService';

interface Props {
  patient: PatientState;
  onNewMessage: (msg: ChatMessage) => void;
}

const ChatInterface: React.FC<Props> = ({ patient, onNewMessage }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChatSession(patient);
  }, [patient.id]); // Re-init on patient change, but usually id stays same

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [patient.chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    onNewMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMsg: ChatMessage = { role: 'model', text: response.text || "Connection to engine lost." };
      onNewMessage(modelMsg);
    } catch (err) {
      console.error(err);
      onNewMessage({ role: 'model', text: "Error: Engine calculation timeout." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-700 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {patient.chatHistory.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            <i className="fa-solid fa-comments text-2xl mb-2 block opacity-20"></i>
            Establish diagnostic dialogue with AFCE-M.
          </div>
        )}
        {patient.chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30' 
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 bg-slate-800/60 border-t border-slate-700 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Query engine state..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
