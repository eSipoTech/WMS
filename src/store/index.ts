import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATIVO';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface ChatMessage {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    { id: '1', content: 'New shipment arrived at Dock 4. Please prioritize unloading.', senderName: 'Operations Lead', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', content: 'On it. Team assigned to Dock 4. ETA for completion: 45mins.', senderName: 'Warehouse Staff', createdAt: new Date(Date.now() - 3000000).toISOString() },
    { id: '3', content: 'System audit complete for morning shift. All protocols green.', senderName: 'Security Ops', createdAt: new Date(Date.now() - 1500000).toISOString() },
  ],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
}));
