import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgeBand } from '@shared/ageUtils';
import { nanoid } from 'nanoid';

interface ChildProfile {
  id: string;
  name: string;
  birthday?: string;
  ageYears?: number;
  ageMonths?: number;
  ageBand: AgeBand | '';
}

interface Answers {
  schemas: string[];
  barriers: string[];
  interests: string[];
}

interface Store {
  children: ChildProfile[];
  activeChildId: string | null;
  childAnswers: Record<string, Answers>;
  subscribed: boolean;
  isLoggedIn: boolean;
  addChild: (child: Omit<ChildProfile, 'id'>, answers?: Answers) => string;
  updateChild: (id: string, child: Partial<ChildProfile>) => void;
  setActiveChild: (id: string) => void;
  getActiveChild: () => ChildProfile | null;
  setAnswers: (childId: string, answers: Answers) => void;
  getAnswers: (childId: string) => Answers;
  setSubscribed: (subscribed: boolean) => void;
  setLoggedIn: (isLoggedIn: boolean) => void;
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      children: [],
      activeChildId: null,
      childAnswers: {},
      subscribed: false,
      isLoggedIn: false,
      
      addChild: (childData, answers) => {
        const id = nanoid();
        const newChild: ChildProfile = { id, ...childData };
        set((state) => ({
          children: [...state.children, newChild],
          activeChildId: id,
          childAnswers: {
            ...state.childAnswers,
            [id]: answers || { schemas: [], barriers: [], interests: [] }
          }
        }));
        return id;
      },
      
      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map(child => 
            child.id === id ? { ...child, ...updates } : child
          )
        }));
      },
      
      setActiveChild: (id) => {
        set({ activeChildId: id });
      },
      
      getActiveChild: () => {
        const state = get();
        if (!state.activeChildId) return null;
        return state.children.find(c => c.id === state.activeChildId) || null;
      },
      
      setAnswers: (childId, answers) => {
        set((state) => ({
          childAnswers: {
            ...state.childAnswers,
            [childId]: answers
          }
        }));
      },
      
      getAnswers: (childId) => {
        const state = get();
        return state.childAnswers[childId] || { schemas: [], barriers: [], interests: [] };
      },
      
      setSubscribed: (subscribed) => set({ subscribed }),
      setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      
      reset: () => set({ 
        children: [],
        activeChildId: null,
        childAnswers: {},
        subscribed: false,
        isLoggedIn: false
      }),
    }),
    {
      name: 'liza-toph-storage',
    }
  )
);
