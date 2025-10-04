import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChildProfile {
  name: string;
  ageBand: 'newborn-2' | '2-5' | '5-8' | '';
}

interface Answers {
  schemas: string[];
  barriers: string[];
  interests: string[];
}

interface Store {
  child: ChildProfile;
  answers: Answers;
  subscribed: boolean;
  isLoggedIn: boolean;
  setChild: (child: ChildProfile) => void;
  setAnswers: (answers: Answers) => void;
  setSubscribed: (subscribed: boolean) => void;
  setLoggedIn: (isLoggedIn: boolean) => void;
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      child: { name: '', ageBand: '' },
      answers: { schemas: [], barriers: [], interests: [] },
      subscribed: false,
      isLoggedIn: false,
      setChild: (child) => set({ child }),
      setAnswers: (answers) => set({ answers }),
      setSubscribed: (subscribed) => set({ subscribed }),
      setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      reset: () => set({ 
        child: { name: '', ageBand: '' }, 
        answers: { schemas: [], barriers: [], interests: [] },
        subscribed: false,
        isLoggedIn: false
      }),
    }),
    {
      name: 'liza-toph-storage',
    }
  )
);
