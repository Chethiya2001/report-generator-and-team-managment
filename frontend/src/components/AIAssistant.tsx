import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface Message { id: string; sender: 'user' | 'bot'; text: string; }

export const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', sender: 'bot',
    text: 'Ask about submission trends, workload, task distribution, or blocker counts. Team and project names are anonymized before data is sent.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;
    setMessages(items => [...items, { id: crypto.randomUUID(), sender: 'user', text: prompt }]);
    setInput('');
    setLoading(true);
    try {
      const result = await api<{ answer: string }>('/chat', { method: 'POST', body: JSON.stringify({ prompt }) });
      setMessages(items => [...items, { id: crypto.randomUUID(), sender: 'bot', text: result.answer }]);
    } catch (error) {
      setMessages(items => [...items, {
        id: crypto.randomUUID(), sender: 'bot',
        text: error instanceof Error ? error.message : 'The assistant is unavailable.'
      }]);
    } finally { setLoading(false); }
  };

  return <>
    <button onClick={() => setOpen(value => !value)} aria-label={open ? 'Close insights assistant' : 'Open insights assistant'}
      className="fixed bottom-5 right-4 z-50 flex h-11 items-center justify-center gap-2 rounded-full bg-[#18352c] px-4 text-sm font-medium text-white shadow-lg transition hover:bg-[#244d3f] sm:bottom-6 sm:right-6">
      {open ? <><X className="h-5 w-5" /><span>Close</span></> : <><Bot className="h-5 w-5" /><span>AI insights</span></>}
    </button>

    {open && <section className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[390px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
      <header className="border-b border-stone-200 px-5 py-4">
        <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-[#356b58]" /><h2 className="font-semibold text-stone-900">Team insights</h2></div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500"><ShieldCheck className="h-3.5 w-3.5" /> Anonymous aggregates only</div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f7f4] p-4">
        {messages.map(message => <div key={message.id} className={message.sender === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[88%]'}>
          <div className={message.sender === 'user'
            ? 'rounded-xl rounded-br-sm bg-[#285847] px-3.5 py-2.5 text-sm leading-relaxed text-white'
            : 'rounded-xl rounded-bl-sm border border-stone-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-stone-700'}>
            <span className="whitespace-pre-wrap">{message.text}</span>
          </div>
        </div>)}
        {loading && <div className="text-xs text-stone-500">Reviewing anonymized report data...</div>}
        <div ref={end} />
      </div>

      <form onSubmit={send} className="border-t border-stone-200 bg-white p-3">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} maxLength={500}
            placeholder="Ask about last week's workload..."
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#356b58] focus:ring-2 focus:ring-[#356b58]/10" />
          <button disabled={!input.trim() || loading} className="grid h-10 w-10 place-items-center rounded-lg bg-[#18352c] text-white disabled:opacity-40" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>}
  </>;
};
