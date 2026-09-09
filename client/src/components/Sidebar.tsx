import { useEffect, useState } from 'react';
import { Channel, joinChannel, listChannels } from '../api/channels.js';
import { ApiError } from '../api/client.js';
import { ChatUser, listUsers } from '../api/users.js';
import { useChatStore } from '../store/chatStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useSocket } from '../socket/useSocket.js';
import CreateChannelForm from './CreateChannelForm.js';

export default function Sidebar() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [onlineIds, setOnlineIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();

  async function refresh() {
    try {
      setChannels(await listChannels());
      setError(null);
    } catch {
      setError('Não foi possível carregar os canais');
    }
  }

  useEffect(() => {
    refresh();
    listUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (!socket) return;
    function onPresence(payload: { onlineUserIds: number[] }) {
      setOnlineIds(payload.onlineUserIds);
    }
    socket.on('presence:update', onPresence);
    return () => {
      socket.off('presence:update', onPresence);
    };
  }, [socket]);

  async function handleSelectChannel(c: Channel) {
    try {
      await joinChannel(c.id);
      setActiveConversation({ type: 'channel', id: c.id, name: c.name });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar no canal');
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>{user?.username}</span>
        <button onClick={logout}>Sair</button>
      </div>

      <h2>Canais</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {channels.map((c) => (
          <li key={c.id}>
            <button
              className={activeConversation?.type === 'channel' && activeConversation.id === c.id ? 'active' : ''}
              onClick={() => handleSelectChannel(c)}
            >
              #{c.name}
            </button>
          </li>
        ))}
      </ul>

      <CreateChannelForm onCreated={refresh} />

      <h2>Mensagens diretas</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <button
              className={activeConversation?.type === 'dm' && activeConversation.id === u.id ? 'active' : ''}
              onClick={() => setActiveConversation({ type: 'dm', id: u.id, name: u.username })}
            >
              <span className={`presence-dot ${onlineIds.includes(u.id) ? 'online' : 'offline'}`} />
              {u.username}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
