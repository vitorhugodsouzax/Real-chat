import { useEffect, useRef, useState } from 'react';
import { ActiveConversation } from '../store/chatStore.js';
import { getChannelMessages, getDirectMessages, Message } from '../api/messages.js';
import { API_URL } from '../api/client.js';
import { useSocket } from '../socket/useSocket.js';

type SystemEvent = { kind: 'joined'; username: string; id: string };
type ListItem = (Message & { kind: 'message' }) | SystemEvent;

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function renderContent(content: string) {
  const parts = content.split(URL_PATTERN);
  return parts.map((part, i) =>
    URL_PATTERN.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function resolveAttachmentUrl(url: string) {
  return /^https?:\/\//.test(url) ? url : `${API_URL}${url}`;
}

export default function MessageList({ conversation }: { conversation: ActiveConversation }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const socket = useSocket();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const fetcher = conversation.type === 'channel' ? getChannelMessages : getDirectMessages;
      const page = await fetcher(conversation.id);
      if (cancelled) return;
      setItems([...page.messages].reverse().map((m) => ({ ...m, kind: 'message' as const })));
      setNextCursor(page.nextCursor);
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [conversation]);

  useEffect(() => {
    if (!socket) return;

    function onMessageNew(message: Message) {
      const belongsHere =
        conversation.type === 'channel'
          ? message.channelId === conversation.id
          : message.senderId === conversation.id || message.recipientId === conversation.id;
      if (!belongsHere) return;
      setItems((prev) => [...prev, { ...message, kind: 'message' }]);
    }

    function onUserJoined(payload: { channelId: number; username: string }) {
      if (conversation.type !== 'channel' || payload.channelId !== conversation.id) return;
      setItems((prev) => [...prev, { kind: 'joined', username: payload.username, id: `joined-${Date.now()}` }]);
    }

    socket.on('message:new', onMessageNew);
    socket.on('user:joined', onUserJoined);
    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('user:joined', onUserJoined);
    };
  }, [socket, conversation]);

  async function loadMore() {
    if (!nextCursor) return;
    const fetcher = conversation.type === 'channel' ? getChannelMessages : getDirectMessages;
    const page = await fetcher(conversation.id, nextCursor);
    setItems((prev) => [...[...page.messages].reverse().map((m) => ({ ...m, kind: 'message' as const })), ...prev]);
    setNextCursor(page.nextCursor);
  }

  function handleScroll() {
    if (listRef.current && listRef.current.scrollTop === 0) {
      loadMore();
    }
  }

  return (
    <div className="message-list" ref={listRef} onScroll={handleScroll}>
      {items.map((item) =>
        item.kind === 'joined' ? (
          <div key={item.id} className="system-message">
            {item.username} entrou no canal
          </div>
        ) : (
          <div key={item.id} className="message">
            <strong>{item.senderUsername}</strong>
            {item.content && <span>{renderContent(item.content)}</span>}
            {item.attachmentType === 'image' && (
              <img src={resolveAttachmentUrl(item.attachmentUrl!)} alt="anexo" />
            )}
            {item.attachmentType === 'video' && (
              <video src={resolveAttachmentUrl(item.attachmentUrl!)} controls />
            )}
          </div>
        ),
      )}
    </div>
  );
}
