import { useEffect, useState } from 'react';
import { ActiveConversation } from '../store/chatStore.js';
import { useSocket } from '../socket/useSocket.js';

export default function TypingIndicator({ conversation }: { conversation: ActiveConversation }) {
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    function onTyping(payload: { channelId: number; username: string }) {
      if (conversation.type !== 'channel' || payload.channelId !== conversation.id) return;
      setTypingUser(payload.username);
      setTimeout(() => setTypingUser(null), 2000);
    }

    socket.on('user:typing', onTyping);
    return () => {
      socket.off('user:typing', onTyping);
    };
  }, [socket, conversation]);

  if (!typingUser) return null;
  return <p className="typing-indicator">{typingUser} está digitando...</p>;
}
