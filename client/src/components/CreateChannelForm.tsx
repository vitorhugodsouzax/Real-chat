import { FormEvent, useState } from 'react';
import { createChannel } from '../api/channels.js';
import { ApiError } from '../api/client.js';

export default function CreateChannelForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await createChannel({ name: name.trim(), topic: topic.trim() || undefined });
      setName('');
      setTopic('');
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o canal');
    }
  }

  return (
    <form className="create-channel-form" onSubmit={handleSubmit}>
      <input placeholder="nome do canal" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="tópico (opcional)" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <button type="submit">Criar canal</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
