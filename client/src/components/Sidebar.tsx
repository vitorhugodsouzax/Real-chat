import { useEffect, useState } from 'react';
import { Channel, listChannels } from '../api/channels.js';
import { useChatStore } from '../store/chatStore.js';
import { useAuthStore } from '../store/authStore.js';
import CreateChannelForm from './CreateChannelForm.js';

export default function Sidebar() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const activeConversation = useChatStore((s) => s.activeConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  async function refresh() {
    setChannels(await listChannels());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>{user?.username}</span>
        <button onClick={logout}>Sair</button>
      </div>

      <h2>Canais</h2>
      <ul>
        {channels.map((c) => (
          <li key={c.id}>
            <button
              className={activeConversation?.type === 'channel' && activeConversation.id === c.id ? 'active' : ''}
              onClick={() => setActiveConversation({ type: 'channel', id: c.id, name: c.name })}
            >
              #{c.name}
            </button>
          </li>
        ))}
      </ul>

      <CreateChannelForm onCreated={refresh} />
    </aside>
  );
}
