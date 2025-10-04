import { create } from 'zustand';

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
  setChild: (child: ChildProfile) => void;
  setAnswers: (answers: Answers) => void;
  setSubscribed: (subscribed: boolean) => void;
  reset: () => void;
}

export const useStore = create<Store>((set) => ({
  child: { name: '', ageBand: '' },
  answers: { schemas: [], barriers: [], interests: [] },
  subscribed: false,
  setChild: (child) => set({ child }),
  setAnswers: (answers) => set({ answers }),
  setSubscribed: (subscribed) => set({ subscribed }),
  reset: () => set({ 
    child: { name: '', ageBand: '' }, 
    answers: { schemas: [], barriers: [], interests: [] },
    subscribed: false 
  }),
}));
