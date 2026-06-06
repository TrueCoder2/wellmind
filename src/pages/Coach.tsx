import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Trash2, ArrowLeft, Loader2, PlayCircle, HelpCircle, User, Bot, AlertTriangle 
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

interface CoachProps {
  onNavigate: (view: string) => void;
}

const SAMPLE_QUESTIONS = [
  { text: "My mock scores just dropped and I feel completely paralyzed. How do I cope?", label: "Score Drop" },
  { text: "I have UPSC/JEE anxiety. Give me a micro-habit to stop comparing my progress with peers.", label: "Peer pressure" },
  { text: "I can't fall asleep because my brain is spinning with formulas. Help!", label: "Insomnia relief" },
  { text: "I study for 10 hours but still feel guilt that I did not do enough daily. Why?", label: "Study guilt" }
];

export default function Coach({ onNavigate }: CoachProps) {
  const { chatMessages, sendChatMessage, clearChat, loading, userProfile } = useWellness();
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll down when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setInputText('');
    await sendChatMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-100 flex flex-col h-[85vh]">
      
      {/* Title Bar */}
      <div className="flex items-center justify-between shrink-0">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-all border border-white/5 bg-slate-900/30 px-3 py-1.5 rounded-xl hover:border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </button>

        <button
          onClick={() => {
            if (confirm("Reset current exam chat context?")) {
              clearChat();
            }
          }}
          className="px-3 py-1.5 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Main Messaging Canvas */}
      <div className="flex-1 glass-panel border border-white/5 rounded-3xl p-4 sm:p-6 flex flex-col min-h-0 relative">
        <div className="absolute top-0 right-0 bg-indigo-500/5 w-40 h-40 rounded-l-full blur-2xl" />

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar-thin">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`p-2 h-9 w-9 rounded-xl shrink-0 flex items-center justify-center border ${
                  isUser 
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-violet-900/30 text-violet-300 border-violet-500/20'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Bubble */}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-indigo-600/90 text-white rounded-tr-none border border-indigo-500/20 font-sans' 
                    : 'bg-zinc-900/80 text-slate-200 rounded-tl-none border border-white/5 font-sans'
                }`}>
                  <div className="whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  
                  <div className="text-[9px] font-mono opacity-50 text-right mt-1.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* LOADING STATE bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="p-2 h-9 w-9 rounded-xl bg-violet-900/30 text-violet-300 border border-violet-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
              <div className="p-4 bg-zinc-900/80 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2 text-xs font-mono text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Evaluating study goal and stress factors...
              </div>
            </div>
          )}

          <div ref={chatScrollRef} />
        </div>

        {/* SAMPLE QUESTIONS PANE (Shows only when chat has few messages or as context shortcut) */}
        <div className="shrink-0 space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
            <Sparkles className="w-3" /> Quick Mental Aid Suggestions
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.text)}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-900/40 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-xl text-xs text-slate-300 text-left hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT TRAY */}
        <div className="shrink-0 pt-4 flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask about UPSC stress, ${userProfile.examType} syllabus burnout, time management...`}
            rows={1}
            className="flex-1 p-3 rounded-2xl glass-input text-xs sm:text-sm text-white resize-none"
            maxLength={500}
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={loading || !inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Disclaimer block */}
      <div className="shrink-0 flex gap-2 p-3 bg-zinc-950/40 rounded-2xl border border-white/5 text-[10px] font-mono text-slate-500 leading-normal text-left">
        <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <span>
          <strong>Educational Advisory Only:</strong> MindMate Coach is a customized educational helper script designed around stress relief and cognitive balance workflows. It does not replace psychiatric advice, medication administration, or emergency therapy contacts. If experiencing active crises, please contact official local hotlines immediately.
        </span>
      </div>

    </div>
  );
}
