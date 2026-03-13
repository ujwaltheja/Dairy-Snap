import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { sendAssistantMessage, getSuggestions } from '../lib/aiService';
import type { AIMessage } from '../types';
import {
  Send, Bot, Lightbulb, Zap, X, ChevronDown, ChevronUp,
  AlertTriangle, Info, TrendingUp,
} from 'lucide-react';

const QUICK_COMMANDS = [
  'Fillet all edges to 0.5 mm',
  'Apply 18K yellow gold finish',
  'Generate diamond halo setting',
  'Ring size US 7',
  'Add symmetry mirror',
  'Export as STL',
];

export default function AIAssistant() {
  const { objects, aiMessages, addAIMessage, setAIPanel, suggestions, setSuggestions, setSuggestionsOpen, isSuggestionsOpen } = useSceneStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Greet on mount
  useEffect(() => {
    if (aiMessages.length === 0) {
      addAIMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '👋 Hi! I\'m your AI jewelry design assistant. Describe what you want to create, or try a quick command below.',
        timestamp: new Date(),
      });
    }
  }, []);

  const send = async (cmd?: string) => {
    const text = cmd ?? input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: AIMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date() };
    addAIMessage(userMsg);
    setLoading(true);

    try {
      const response = await sendAssistantMessage([...aiMessages, userMsg], text);
      addAIMessage({ id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    const result = await getSuggestions(objects, aiMessages.map((m) => m.content));
    setSuggestions(result.suggestions);
    setSuggestionsOpen(true);
  };

  return (
    <div className="flex flex-col bg-gray-900 border-t border-gray-700/50 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-purple-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">AI Design Assistant</span>
          <span className="text-[10px] bg-purple-600/30 text-purple-300 px-1.5 py-0.5 rounded-full">Mock Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSuggestions}
            className="flex items-center gap-1 text-[11px] text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 px-2 py-1 rounded transition-colors"
          >
            <Lightbulb size={12} /> Analyze
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-white p-1 rounded"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button onClick={() => setAIPanel(false)} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Suggestions strip */}
          {isSuggestionsOpen && suggestions.length > 0 && (
            <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-gray-700/30 bg-gray-800/40">
              {suggestions.map((s) => (
                <SuggestionChip key={s.id} suggestion={s} onDismiss={() => setSuggestions(suggestions.filter((x) => x.id !== s.id))} />
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 h-48 overflow-y-auto px-4 py-3 space-y-3">
            {aiMessages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Bot size={14} className="text-purple-400 animate-pulse" />
                <span className="animate-pulse">Thinking…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick commands */}
          <div className="flex gap-1.5 px-3 py-1.5 overflow-x-auto border-t border-gray-700/30 bg-gray-800/20">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => send(cmd)}
                className="whitespace-nowrap text-[10px] bg-gray-700/60 hover:bg-gray-600/80 text-gray-300 hover:text-white px-2.5 py-1 rounded-full transition-colors"
              >
                <Zap size={9} className="inline mr-1 text-yellow-400" />
                {cmd}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700/50">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Describe a design or give a command…"
              className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 placeholder-gray-500"
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && <Bot size={14} className="text-purple-400 mt-1 shrink-0" />}
      <div className={`max-w-[85%] text-xs px-3 py-2 rounded-xl whitespace-pre-wrap ${
        isUser
          ? 'bg-purple-600/30 text-white rounded-br-sm'
          : 'bg-gray-800 text-gray-200 rounded-bl-sm'
      }`}>
        {msg.content}
        <div className="text-[9px] text-gray-500 mt-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({ suggestion, onDismiss }: {
  suggestion: { id: string; type: string; message: string; action?: string; confidence: number };
  onDismiss: () => void;
}) {
  const icon = suggestion.type === 'warning' ? <AlertTriangle size={10} className="text-yellow-400" />
    : suggestion.type === 'optimization' ? <TrendingUp size={10} className="text-green-400" />
    : <Info size={10} className="text-blue-400" />;

  return (
    <div className="flex items-center gap-1.5 bg-gray-700/60 rounded-lg px-2.5 py-1.5 shrink-0 text-[10px] text-gray-300 max-w-xs">
      {icon}
      <span className="truncate">{suggestion.message}</span>
      {suggestion.action && (
        <button className="text-yellow-400 hover:text-yellow-300 whitespace-nowrap ml-1">
          {suggestion.action}
        </button>
      )}
      <button onClick={onDismiss} className="text-gray-500 hover:text-white ml-1">
        <X size={9} />
      </button>
    </div>
  );
}
