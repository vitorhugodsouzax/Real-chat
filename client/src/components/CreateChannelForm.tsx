import { FormEvent, useState } from 'react';
import { createChannel } from '../api/channels.js';

export default function CreateChannelForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createChannel({ name: name.trim(), topic: topic.trim() || undefined });
    setName('');
    setTopic('');
    onCreated();
  }

  return (
    <form className="create-channel-form" onSubmit={handleSubmit}>
      <input placeholder="nome do canal" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="tópico (opcional)" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <button type="submit">Criar canal</button>
    </form>
  );
}
