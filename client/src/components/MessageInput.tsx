import { FormEvent, useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { ActiveConversation } from '../store/chatStore.js';
import { useSocket } from '../socket/useSocket.js';

const TYPING_DEBOUNCE_MS = 1500;

export default function MessageInput({ conversation }: { conversation: ActiveConversation }) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socket = useSocket();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function emitTyping() {
    if (!socket || conversation.type !== 'channel') return;
    if (typingTimeout.current) return;
    socket.emit('user:typing', { channelId: conversation.id });
    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, TYPING_DEBOUNCE_MS);
  }

  function send() {
    if (!socket || !text.trim()) return;
    const payload =
      conversation.type === 'channel'
        ? { channelId: conversation.id, content: text.trim() }
        : { recipientId: conversation.id, content: text.trim() };
    socket.emit('message:send', payload);
    setText('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function handleEmojiClick(data: EmojiClickData) {
    setText((prev) => prev + data.emoji);
    setShowEmojiPicker(false);
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <button type="button" onClick={() => setShowEmojiPicker((v) => !v)} aria-label="Emojis">
        😀
      </button>
      {showEmojiPicker && (
        <div className="emoji-picker-popover">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          emitTyping();
        }}
        placeholder="Digite uma mensagem..."
      />
      <button type="submit">Enviar</button>
    </form>
  );
}
