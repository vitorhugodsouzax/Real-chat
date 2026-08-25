import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';
import Sidebar from '../components/Sidebar.js';

export default function ChatHome() {
  const token = useAuthStore((s) => s.token);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="chat-home">
      <Sidebar />
      <main className="chat-panel">
        {activeConversation ? (
          <p>Conversa selecionada: {activeConversation.name}</p>
        ) : (
          <p>Selecione um canal para começar a conversar.</p>
        )}
      </main>
    </div>
  );
}
