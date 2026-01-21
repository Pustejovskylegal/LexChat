import { useEffect, useState, useRef } from 'react';

export default function ChatWindow({ user }) {
  const [messages, setMessages] = useState([
    { from:'bot', text: 'Vítej! Jak ti mohu dnes pomoci?' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef();

  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [messages]);

  async function send(){
    if(!input) return;
    const text = input;
    setMessages(m=>[...m, {from:'user', text}]);
    setInput('');

    // call backend chat endpoint (stub)
    const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text })});
    const data = await res.json();
    setMessages(m=>[...m, {from:'bot', text: data.reply || 'Odpověď chatu...' }]);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto p-6 space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={m.from==='user' ? 'ml-auto bg-gradient-to-r from-primary to-accent text-white rounded-xl px-4 py-2 max-w-[78%]' : 'bg-white rounded-xl px-4 py-2 max-w-[78%]'}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-3">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Napiš dotaz..." className="flex-1 px-4 py-3 border rounded-md" />
          <button onClick={send} className="btn-primary">Odeslat</button>
        </div>
      </div>
    </div>
  );
}
