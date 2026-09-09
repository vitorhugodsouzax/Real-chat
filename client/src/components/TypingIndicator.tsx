import { useEffect, useRef, useState } from 'react';
import { ActiveConversation } from '../store/chatStore.js';
import { useSocket } from '../socket/useSocket.js';

export default function TypingIndicator({ conversation }: { conversation: ActiveConversation }) {
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socket = useSocket();
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    function onTyping(payload: { channelId: number; username: string }) {
      if (conversation.type !== 'channel' || payload.channelId !== conversation.id) return;
      setTypingUser(payload.username);
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
    }

    socket.on('user:typing', onTyping);
    return () => {
      socket.off('user:typing', onTyping);
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, [socket, conversation]);

  if (!typingUser) return null;
  return <p className="typing-indicator">{typingUser} está digitando...</p>;
}
