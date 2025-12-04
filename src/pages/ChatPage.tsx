import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { ChatSummary, MessageResponse, SendMessageResponse } from '../types/api';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

type RouteParams = {
  username: string;
};

export const ChatPage = () => {
  const { username: usernameParam } = useParams<RouteParams>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [chatId, setChatId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const username = usernameParam ?? '';

  const isOwnMessage = (message: MessageResponse) =>
    !!user && message.sender === user.username;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const chatsList = await ChatApi.getChats();
        setChats(chatsList);

        if (username) {
          const messagesList = await ChatApi.getMessages(username);
          setMessages(messagesList);

          const activeChat = chatsList.find(
            (chat) => chat.username === username
          );
          setChatId(activeChat?.chatId ?? null);
        } else {
          setMessages([]);
          setChatId(null);
        }
      } catch {
        setError('Unable to load messages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [username]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMessage.trim() || !username) return;

    setIsSending(true);
    setError('');
    try {
      const response: SendMessageResponse = await ChatApi.sendMessage(username, {
        content: newMessage.trim()
      });
      setChatId(response.chatId);

      const next: MessageResponse = {
        content: response.content,
        sentAt: response.sentAt,
        sender: user?.username ?? ''
      };

      setMessages((prev) => [...prev, next]);
      setNewMessage('');
    } catch {
      setError('Unable to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!chatId) return;
    void ChatApi.markSeen(chatId);
  }, [chatId]);

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="glass-panel flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Direct message
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            {username ? `Chat with ${username}` : 'Messages'}
          </h1>
        </div>
      </header>

      <section className="glass-panel grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-[280px_minmax(0,1fr)]">
        {error && (
          <p className="col-span-full mb-1 text-sm text-pink-400" role="alert">
            {error}
          </p>
        )}

        {/* Chats list */}
        <div className="flex min-h-0 flex-col border-b border-slate-800 pb-4 pr-2 md:border-b-0 md:border-r md:pb-0 md:pr-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Conversations
          </p>
          {isLoading && !username ? (
            <p className="text-sm text-slate-400">Loading conversations...</p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-slate-400">
              No conversations yet. Start a chat from a user profile.
            </p>
          ) : (
            <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
              {chats.map((chat) => (
                <li key={chat.chatId}>
                  <button
                    type="button"
                    onClick={() => navigate(`/chats/${chat.username}`)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                      username === chat.username
                        ? 'border-brand bg-slate-900 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">@{chat.username}</span>
                      {chat.lastMessage && (
                        <span className="truncate text-xs text-slate-400">
                          {chat.lastMessage}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active conversation */}
        <div className="flex min-h-0 flex-1 flex-col">
          {username ? (
            <>
              {isLoading ? (
                <EmptyState
                  title="Loading conversation..."
                  description="Fetching your messages."
                />
              ) : (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {messages.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        No messages yet. Say hi to start the conversation.
                      </p>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={`${message.sentAt}-${index}`}
                          className={`flex ${
                            isOwnMessage(message) ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs rounded-2xl px-3 py-2 text-sm shadow ${
                              isOwnMessage(message)
                                ? 'rounded-br-none bg-brand text-white'
                                : 'rounded-bl-none bg-slate-800 text-slate-50'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                              {new Date(message.sentAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="mt-4 flex items-end gap-3 border-t border-slate-800 pt-3"
                  >
                    <TextArea
                      rows={2}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full resize-none"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      isLoading={isSending}
                    >
                      Send
                    </Button>
                  </form>
                </>
              )}
            </>
          ) : (
            <EmptyState
              title="No chat selected"
              description="Choose a conversation from the list or start a new one from a profile."
            />
          )}
        </div>
      </section>
    </div>
  );
};


