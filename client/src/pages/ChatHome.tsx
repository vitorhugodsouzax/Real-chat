import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';
import { useSocket } from '../socket/useSocket.js';
import Sidebar from '../components/Sidebar.js';
import MessageList from '../components/MessageList.js';

export default function ChatHome() {
  const token = useAuthStore((s) => s.token);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  useEffect(() => {
    if (!socket || !activeConversation || activeConversation.type !== 'channel') return;
    socket.emit('channel:join', { channelId: activeConversation.id });
    return () => {
      socket.emit('channel:leave', { channelId: activeConversation.id });
    };
  }, [socket, activeConversation]);

  if (!token) return null;

  return (
    <div className="chat-home">
      <Sidebar />
      <main className="chat-panel">
        {activeConversation ? (
          <MessageList conversation={activeConversation} />
        ) : (
          <p>Selecione um canal para começar a conversar.</p>
        )}
      </main>
    </div>
  );
}
