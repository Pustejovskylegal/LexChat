'use client';

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'lexchat_history';

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="animate-bounce">.</span>
      <span className="animate-bounce delay-100">.</span>
      <span className="animate-bounce delay-200">.</span>
    </span>
  );
}

function getChatTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user');
  if (firstUserMessage) {
    const title = firstUserMessage.content.slice(0, 50);
    return title.length < firstUserMessage.content.length ? title + '...' : title;
  }
  return 'Nový chat';
}

function loadChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (err) {
    console.error('Failed to save chats:', err);
  }
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ahoj 👋 Jak ti mohu pomoci?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'internet' | 'database' | 'both'>('both');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Načíst chaty při načtení stránky
  useEffect(() => {
    const loadedChats = loadChats();
    setChats(loadedChats);
    
    // Pokud je v URL parametr q, vytvoř nový chat
    const question = searchParams.get('q');
    if (question) {
      setInput(decodeURIComponent(question));
    } else if (loadedChats.length > 0) {
      // Načíst poslední chat
      const lastChat = loadedChats[loadedChats.length - 1];
      setCurrentChatId(lastChat.id);
      setMessages(lastChat.messages);
    }
  }, [searchParams]);

  // Uložit chat při změně zpráv
  useEffect(() => {
    if (currentChatId && messages.length > 1) {
      const chat = chats.find((c) => c.id === currentChatId);
      if (chat) {
        const updatedChats = chats.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages,
                title: getChatTitle(messages),
                updatedAt: Date.now(),
              }
            : c
        );
        setChats(updatedChats);
        saveChats(updatedChats);
      }
    }
  }, [messages, currentChatId]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Nový chat',
      messages: [
        {
          role: 'assistant',
          content: 'Ahoj 👋 Jak ti mohu pomoci?',
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages(newChat.messages);
    setInput('');
    saveChats(updatedChats);
  };

  const loadChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setInput('');
      setSidebarOpen(false); // Zavřít sidebar na mobilu po výběru chatu
    }
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);
    saveChats(updatedChats);
    
    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        const lastChat = updatedChats[updatedChats.length - 1];
        loadChat(lastChat.id);
      } else {
        createNewChat();
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Pokud není aktuální chat, vytvoř nový
    if (!currentChatId) {
      createNewChat();
    }

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: input },
    ];

    setMessages(newMessages);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      const finalMessages: Message[] = [
        ...newMessages,
        {
          role: 'assistant',
          content: data.message?.content ?? 'Chyba odpovědi',
        },
      ];

      setMessages(finalMessages);

      // Aktualizovat nebo vytvořit chat
      if (currentChatId) {
        const updatedChats = chats.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: finalMessages,
                title: getChatTitle(finalMessages),
                updatedAt: Date.now(),
              }
            : c
        );
        setChats(updatedChats);
        saveChats(updatedChats);
      } else {
        // Vytvořit nový chat
        const newChat: Chat = {
          id: Date.now().toString(),
          title: getChatTitle(finalMessages),
          messages: finalMessages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const updatedChats = [...chats, newChat];
        setChats(updatedChats);
        setCurrentChatId(newChat.id);
        saveChats(updatedChats);
      }
    } catch (err) {
      const errorMessages: Message[] = [
        ...newMessages,
        {
          role: 'assistant',
          content: 'Došlo k chybě při komunikaci se serverem.',
        },
      ];
      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  // Předvyplnění otázky z URL parametru
  useEffect(() => {
    const question = searchParams.get('q');
    if (question && !currentChatId) {
      setInput(decodeURIComponent(question));
    }
  }, [searchParams, currentChatId]);

  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  
  // Filtrovat chaty podle vyhledávacího dotazu
  const filteredChats = sortedChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Zde můžeš přidat zpracování souboru
    // Například nahrání na server nebo zpracování lokálně
    console.log('Vybraný soubor:', file.name, file.type, file.size);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // TODO: Implementovat nahrání souboru na server
    // Například:
    // const formData = new FormData();
    // formData.append('file', file);
    // const res = await fetch('/api/upload', { method: 'POST', body: formData });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 relative">
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 border-r bg-white p-4 z-50 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">LexChat</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <button
          onClick={createNewChat}
          className="mb-4 rounded-lg border px-3 py-2.5 sm:py-2 text-sm hover:bg-gray-100 transition w-full"
        >
          ➕ Nový chat
        </button>

        {/* Vyhledávací lišta */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Vyhledat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            Historie chatů
          </div>
          {filteredChats.length === 0 ? (
            <div className="text-xs text-gray-400 px-2 py-4 text-center">
              {searchQuery ? 'Žádné chaty nenalezeny' : 'Zatím žádné chaty'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`group rounded-lg px-2 sm:px-2 py-2.5 sm:py-2 text-sm cursor-pointer transition ${
                  currentChatId === chat.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium truncate text-sm ${
                        currentChatId === chat.id
                          ? 'text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(chat.updatedAt).toLocaleDateString('cs-CZ', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="ml-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-red-600 transition p-1"
                    title="Smazat chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-3 text-xs text-gray-400">
          OpenLex © 2026
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col w-full md:w-auto">
        {/* MOBILE HEADER */}
        <div className="md:hidden border-b bg-white px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-blue-600">LexChat</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* SEARCH MODE SELECTOR */}
        <div className="border-b bg-white px-4 md:px-6 py-3 md:py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                Režim:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchMode('internet')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    searchMode === 'internet'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌐 Internet
                </button>
                <button
                  onClick={() => setSearchMode('database')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    searchMode === 'database'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📚 Databáze
                </button>
                <button
                  onClick={() => setSearchMode('both')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    searchMode === 'both'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔄 Obojí
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] sm:max-w-xl px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-base sm:text-sm break-words ${
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'mr-auto bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="max-w-[85%] sm:max-w-xl mr-auto bg-gray-100 text-gray-800 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-base sm:text-sm">
                <TypingDots />
              </div>
            )}
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t bg-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-3xl mx-auto space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleFileSelect}
              className="text-xs sm:text-sm rounded-md border px-2 sm:px-3 py-1.5 hover:bg-gray-100 transition flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a.75.75 0 11-1.06-1.06l10.94-10.94a4.5 4.5 0 10-6.364-6.364L1.086 11.318a6 6 0 108.486 8.486l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a7.5 7.5 0 01-10.607-10.607l10.94-10.94a6 6 0 018.486 8.486l-10.94 10.94a.75.75 0 11-1.06-1.06l10.94-10.94a4.5 4.5 0 00-6.364-6.364L1.086 11.318a6 6 0 008.486 8.486l7.693-7.693a.75.75 0 011.06 1.06z"
                />
              </svg>
              <span className="hidden sm:inline">Nahrát dokument</span>
              <span className="sm:hidden">Nahrát</span>
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Napiš dotaz…"
                className="flex-1 rounded-md border px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 sm:px-4 py-2.5 sm:py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                Odeslat
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
