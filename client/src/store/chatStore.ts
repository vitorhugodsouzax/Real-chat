import { create } from 'zustand';

export type ActiveConversation =
  | { type: 'channel'; id: number; name: string }
  | { type: 'dm'; id: number; name: string };

type ChatState = {
  activeConversation: ActiveConversation | null;
  setActiveConversation: (c: ActiveConversation) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeConversation: null,
  setActiveConversation: (c) => set({ activeConversation: c }),
}));
