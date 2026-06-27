import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ModuleId } from '../types';
import { Sparkles, Send, Volume2, VolumeX, Minimize2, Maximize2, RefreshCw } from 'lucide-react';

interface ChatPanelProps {
  moduleId: ModuleId;
  moduleName: string;
  onClose?: () => void;
}

const MODULE_SUGGESTIONS: Record<string, string[]> = {
  m1: [
    'Why is Helium so stable?',
    'What defines the atomic number of an element?',
    'Explain the Bohr model vs electron clouds.',
  ],
  m2: [
    'Why do Na and Cl form an ionic bond?',
    'Explain polar vs nonpolar covalent sharing.',
    'What physical properties do metallic bonds give copper?',
  ],
  m3: [
    'Why does plasma require extreme temperatures?',
    'How does pressure trigger condensation?',
    'What happens to kinetic energy during freezing?',
  ],
  m4: [
    'Explain what activation energy means.',
    'How does a chemical catalyst speed up reactions?',
    'Why must the count of reactant atoms match products?',
  ],
  m5: [
    'What makes an acid strong vs weak?',
    'How does a titration pH indicator change color?',
    'Why is water considered neutral at pH 7?',
  ],
  m6: [
    'Why is organic chemistry centred around Carbon?',
    'What do hydroxyl functional groups do?',
    'What is the formula of hexane and why?',
  ],
  dashboard: [
    'Explain how to earn chemistry badges!',
    'Tell me a fun chemistry joke!',
    'Explain why noble gases are noble.',
  ],
};

export default function ChatPanel({ moduleId, moduleName, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null); // message index currently speaking
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcoming message first when studying
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: `Greetings young scientist! ⚗️ I am ChemAI, your dedicated virtual chemistry advisor. We are currently studying **${moduleName}**. What intriguing questions can I dissolve for you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [moduleId, moduleName]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Gather relevant history
      const historyContext = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleName: moduleName,
          messages: historyContext,
        }),
      });

      if (!res.ok) {
        throw new Error('API communication error');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: 'ChemAI is in the lab — try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech Synthesis
  const handleSpeak = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === index) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }

      window.speechSynthesis.cancel(); // stop any current speech
      const cleanText = text.replace(/[*#]/g, ''); // strip markdown annotations
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      setIsSpeaking(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'model',
        text: `Understood! Memory cleared. Let's restart our discussion regarding **${moduleName}**. Ask me any chemical queries!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-violet-950/40 rounded-none sm:rounded-xl overflow-hidden backdrop-blur-md shadow-2xl relative">
      {/* Header HUD */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-violet-950/40">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6 rounded bg-violet-600/20 text-violet-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">Ask ChemAI Tutor</h3>
            <p className="text-[9px] text-zinc-500 font-mono tracking-tight">Active: {moduleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5" id="chat-header-actions">
          <button
            onClick={handleClearHistory}
            className="p-1 hover:bg-slate-800 text-zinc-400 hover:text-white rounded transition"
            title="Clear Chat History"
            id="clear-chat-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-zinc-400 hover:text-white rounded transition"
            title="Collapse Tutor Chat"
            id="collapse-chat-btn"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-zinc-400 hover:text-white rounded transition font-bold"
            title="Close Tutor Chat"
            id="close-chat-btn"
          >
            <span className="text-sm font-sans px-1">✕</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin" id="chat-messages-area">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            id={`chat-msg-${idx}`}
          >
            <div
              className={`px-3 py-2 text-xs leading-relaxed font-sans rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-violet-950/40 text-zinc-200 rounded-bl-none'
              }`}
            >
              <div className="prose prose-invert prose-xs">
                {msg.text.split('\n').map((line, lIdx) => (
                  <p key={lIdx} className="mb-1 last:mb-0">
                    {/* Simplified bold rendering for markdown ease */}
                    {line.split('**').map((part, pIdx) =>
                      pIdx % 2 === 1 ? <strong key={pIdx} className="text-teal-400 font-semibold">{part}</strong> : part
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* Turn metadata and Voice activation */}
            <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-zinc-500 font-mono">
              <span>{msg.timestamp}</span>
              {msg.role === 'model' && (
                <button
                  onClick={() => handleSpeak(msg.text, idx)}
                  className={`hover:text-zinc-300 transition ${isSpeaking === idx ? 'text-teal-400 animate-pulse' : ''}`}
                  id={`speak-btn-${idx}`}
                >
                  {isSpeaking === idx ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Typing Bubbling Beaker Animation */}
        {loading && (
          <div className="flex items-center gap-2 bg-slate-900/60 border border-violet-950/20 px-3 py-2 rounded-xl w-32" id="typing-indicator">
            {/* Liquid Beaker icon drawing with floating bubbles */}
            <div className="relative w-5 h-5 text-teal-400 flex items-center justify-center" id="bubbling-beaker">
              <svg className="w-full h-full stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M6 3h12M10 3v6l-4 8a3 3 0 003 4h10a3 3 0 003-4l-4-8V3" />
                <path d="M7.5 14h9" className="stroke-teal-500/40" />
              </svg>
              {/* Animated Floating Bubbles */}
              <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute top-1 right-2 w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute bottom-2 left-1/2 w-1.5 h-1.5 bg-teal-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-[10px] font-mono text-teal-400 animate-pulse uppercase">Simulating...</span>
          </div>
        )}
      </div>

      {/* Suggested contextual inputs */}
      <div className="px-4 py-2 border-t border-violet-950/20 bg-slate-950/30">
        <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider block mb-1">Suggested topics:</span>
        <div className="flex flex-wrap gap-1" id="suggestions-container">
          {MODULE_SUGGESTIONS[moduleId]?.map((s, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSendMessage(s)}
              className="text-[10px] text-zinc-400 hover:text-teal-400 bg-slate-900 hover:bg-violet-950/30 border border-violet-950/30 px-2 py-0.5 rounded-full text-left transition-all max-w-full truncate"
              id={`suggest-btn-${sIdx}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-slate-900 border-t border-violet-950/40 flex gap-2"
        id="chat-input-form"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Inquire about ${moduleName}...`}
          className="flex-1 bg-slate-950 border border-violet-950/50 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition font-mono"
          disabled={loading}
          id="chat-text-input"
        />
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg p-2.5 transition flex items-center justify-center disabled:opacity-50"
          disabled={!inputText.trim() || loading}
          id="chat-send-btn"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
