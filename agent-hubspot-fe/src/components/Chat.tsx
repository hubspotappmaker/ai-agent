import React, { useEffect, useRef, useState } from 'react';
import { Send, User, Bot, Trash2, Download, Upload } from 'lucide-react';
import { message } from 'antd';
import { chatWithGpt } from '../service/chat.service';
import { useHubspotParams } from '../context/HubspotParamsContext';
import type { ChatMessage, ChatWithGptBody } from '../types/chat';
import { getCurrentEngine } from '../service/provider.service';

const Chat: React.FC = () => {
  const { params } = useHubspotParams();
  const portalId = (params?.portalId || 'default').toString();

  // --- LocalStorage helpers ---
  const getChatKey = (pid: string) => `chat.history.${pid}`;

  const loadHistory = (pid: string): ChatMessage[] => {
    try
    {
      const raw = localStorage.getItem(getChatKey(pid));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ChatMessage[];
      if (Array.isArray(parsed?.messages)) return parsed.messages as ChatMessage[];
      return [];
    } catch
    {
      return [];
    }
  };

  const saveHistory = (pid: string, messages: ChatMessage[]) => {
    try
    {
      localStorage.setItem(getChatKey(pid), JSON.stringify({ portalId: pid, messages }));
    } catch { /* noop */ }
  };

  // --- State ---
  const [history, setHistory] = useState<ChatMessage[]>(() => loadHistory(portalId));
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // typing bubble
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchEngine = async () => {
      try
      {
        const res = await getCurrentEngine(params.portalId!);
        const payload = res?.data?.data ?? res?.data ?? null;
        const typeKey = payload?.typeKey;
        if (typeKey)
        {
          localStorage.setItem('current_engine', typeKey);

        }
      } catch
      {
      }
    };
    fetchEngine();
  }, []);
  // Load history when portal changes
  useEffect(() => {
    const loaded = loadHistory(portalId);
    if (loaded.length > 0)
    {
      setHistory(loaded);
    } else
    {
      const init: ChatMessage[] = [{ role: 'assistant', content: 'Hello! How can I help you today?' }];
      setHistory(init);
      saveHistory(portalId, init);
    }
  }, [portalId]);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };
  useEffect(() => {
    scrollToBottom(history.length > 0);
  }, [history, isTyping]);

  // Persist history
  useEffect(() => {
    saveHistory(portalId, history);
  }, [history, portalId]);

  // --- Helpers: robust reply extractor ---
  const extractReplyText = (payload: any): string => {
    if (!payload) return '';
    if (typeof payload === 'string') return payload;
    if (typeof payload.data === 'string') return payload.data;
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.msg === 'string') return payload.msg;
    if (typeof payload?.data?.message === 'string') return payload.data.message;
    if (typeof payload?.data?.msg === 'string') return payload.data.msg;
    const choice = payload?.choices?.[0]?.message?.content;
    if (typeof choice === 'string') return choice;
    if (typeof payload.text === 'string') return payload.text;
    return '';
  };

  // --- Actions ---
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isSending) return;

    // Only support CHAT_GPT engine for now
    const engine = localStorage.getItem('current_engine');
    if (engine !== 'CHAT_GPT')
    {
      message.warning('This AI engine is not supported yet.');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    const body: ChatWithGptBody = { portalId, messages: nextHistory };

    try
    {
      const res = await chatWithGpt(body);

      if (res.status !== 201)
      {
        return;
      }
      const payload = (res?.data ?? res);

      const serverStatus =
        payload && typeof payload === 'object' && typeof payload.status === 'boolean'
          ? payload.status
          : true;

      const replyText = extractReplyText(payload);

      if (serverStatus && replyText)
      {
        const assistantMsg: ChatMessage = { role: 'assistant', content: replyText };
        setHistory(prev => [...prev, assistantMsg]);
      } else
      {
        setHistory(prev => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I could not parse the response.' },
        ]);
      }
    } catch
    {
      setHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally
    {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey)
    {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const init: ChatMessage[] = [{ role: 'assistant', content: 'Hello! How can I help you today?' }];
    setHistory(init);
    saveHistory(portalId, init);
    message.success('Chat cleared.');
  };

  const downloadChat = () => {
    const data = { portalId, messages: history, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `chat-${portalId}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    message.success('Chat exported.');
  };

  // --- Import chat (.json) ---
  // Validate & normalize imported structure
  const normalizeImported = (input: any): ChatMessage[] | null => {
    const list = Array.isArray(input) ? input : Array.isArray(input?.messages) ? input.messages : null;
    if (!Array.isArray(list)) return null;

    // basic shape check
    const valid = list.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    );
    return valid ? (list as ChatMessage[]) : null;
  };

  const onFileChosen = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try
      {
        const json = JSON.parse(reader.result as string);
        const msgs = normalizeImported(json);
        if (!msgs || msgs.length === 0)
        {
          message.error('Invalid file format. Expect {"messages":[...]} or an array of messages.');
          return;
        }
        setHistory(msgs);
        saveHistory(portalId, msgs);

        // optional heads-up if portalId differs, but non-blocking
        if (json?.portalId && json.portalId !== portalId)
        {
          message.info('Imported messages (note: portalId differs).');
        } else
        {
          message.success(`Imported ${msgs.length} messages.`);
        }
      } catch
      {
        message.error('Failed to read JSON file.');
      }
    };
    reader.onerror = () => message.error('Failed to read file.');
    reader.readAsText(file, 'utf-8');
  };

  const triggerImport = () => fileInputRef.current?.click();

  // --- Typing bubble ---
  const TypingBubble = () => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-700">
        <Bot className="w-4 h-4" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-md">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[65vh] overflow-hidden flex flex-col p-6">
      {/* hidden file input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChosen(f);
          // reset to allow choosing same file again
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-semibold text-slate-800">AI Assistant</h3>
          <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Online</span>
          <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full ml-2">Hubspot: {portalId}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerImport}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            title="Import JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={downloadChat}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            title="Download JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={clearChat}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
        {history.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-[#667eea] text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-sm lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-[#667eea] text-white rounded-tr-md' : 'bg-slate-100 text-slate-800 rounded-tl-md'
                  }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {isTyping && <TypingBubble />}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            disabled={isSending}
          />
        </div>
        <button
          style={{ marginBottom: '10px' }}
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="px-4 py-3 bg-[#667eea] text-white rounded-xl hover:bg-[#5a6de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          title={isSending ? 'Sending...' : 'Send'}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
