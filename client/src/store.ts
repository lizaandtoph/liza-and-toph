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

export interface ParentAccount {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SavedItems {
  brands: string[];
  professionals: string[];
  products: string[];
}

interface Store {
  children: ChildProfile[];
  activeChildId: string | null;
  childAnswers: Record<string, Answers>;
  subscribed: boolean;
  isLoggedIn: boolean;
  parentAccount: ParentAccount | null;
  savedItems: SavedItems;
  addChild: (child: Omit<ChildProfile, 'id'>, answers?: Answers) => string;
  updateChild: (id: string, child: Partial<ChildProfile>) => void;
  deleteChild: (id: string) => void;
  setActiveChild: (id: string) => void;
  getActiveChild: () => ChildProfile | null;
  setAnswers: (childId: string, answers: Answers) => void;
  getAnswers: (childId: string) => Answers;
  setSubscribed: (subscribed: boolean) => void;
  setLoggedIn: (isLoggedIn: boolean) => void;
  setParentAccount: (account: ParentAccount) => void;
  updateParentAccount: (updates: Partial<ParentAccount>) => void;
  addSavedItem: (category: keyof SavedItems, item: string) => void;
  removeSavedItem: (category: keyof SavedItems, item: string) => void;
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
      parentAccount: null,
      savedItems: { brands: [], professionals: [], products: [] },
      
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
      
      deleteChild: (id) => {
        set((state) => {
          const newChildren = state.children.filter(child => child.id !== id);
          const newChildAnswers = { ...state.childAnswers };
          delete newChildAnswers[id];
          
          let newActiveChildId = state.activeChildId;
          if (state.activeChildId === id) {
            newActiveChildId = newChildren.length > 0 ? newChildren[0].id : null;
          }
          
          return {
            children: newChildren,
            childAnswers: newChildAnswers,
            activeChildId: newActiveChildId
          };
        });
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
      setParentAccount: (account) => set({ parentAccount: account }),
      
      updateParentAccount: (updates) => {
        set((state) => ({
          parentAccount: state.parentAccount 
            ? { ...state.parentAccount, ...updates }
            : null
        }));
      },
      
      addSavedItem: (category, item) => {
        set((state) => ({
          savedItems: {
            ...state.savedItems,
            [category]: [...state.savedItems[category], item]
          }
        }));
      },
      
      removeSavedItem: (category, item) => {
        set((state) => ({
          savedItems: {
            ...state.savedItems,
            [category]: state.savedItems[category].filter(i => i !== item)
          }
        }));
      },
      
      reset: () => set({ 
        children: [],
        activeChildId: null,
        childAnswers: {},
        subscribed: false,
        isLoggedIn: false,
        parentAccount: null,
        savedItems: { brands: [], professionals: [], products: [] }
      }),
    }),
    {
      name: 'liza-toph-storage',
    }
  )
);
