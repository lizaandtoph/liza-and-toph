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

export interface Milestone {
  question: string;
  answer: string;
}

export interface Answers {
  // Core questionnaire data
  schemas: string[];
  barriers: string[];
  interests: string[];
  household_size?: number;
  
  // Milestone tracking by domain
  milestones?: {
    social_emotional?: Milestone;
    cognitive?: Milestone;
    language?: Milestone;
    motor?: Milestone;
  };
  
  // Version tracking to detect if user needs to retake questionnaire
  questionnaire_version?: number;
  
  // Optional: Full questionnaire additions (for future implementation)
  attention_span?: string;
  problem_solving_style?: string;
  problem_solving_approach?: string;
  sensory_seeking?: string[];
  sensory_avoiding?: string[];
  sensory_underresponsive?: string[];
  toy_accessibility?: string;
  cleanup_independence?: string;
  space_constraints?: string[];
  storage_preference?: string;
  
  // Full Questionnaire Data
  fullQuestionnaire?: {
    // Section 1: Basic Information
    basicInfo?: {
      gender?: string;
      premature?: boolean;
      weeksEarly?: number;
      primaryLanguages?: string;
      completedBy?: string;
      relationshipDuration?: string;
      completionDate?: string;
    };
    
    // Section 2: Developmental Milestones
    developmental?: {
      communication?: Record<string, string>;
      grossMotor?: Record<string, string>;
      fineMotor?: Record<string, string>;
      problemSolving?: Record<string, string>;
      personalSocial?: Record<string, string>;
    };
    
    // Section 3: Play Behavior and Preferences
    playBehavior?: {
      playTypes?: string[];
      focusTime?: string;
      playPreference?: string;
      initiatesPlay?: number;
      transitionReaction?: string;
      elaboratePlay?: number;
      activityPreference?: string;
      watchesOthers?: number;
      parallelPlay?: number;
      sharesTurns?: number;
      cooperativePlay?: number;
      conflictHandling?: string;
      invitesOthers?: number;
      followsRules?: number;
      symbolicPlay?: number;
      rolePlaying?: number;
      createsArt?: number;
      makesSongs?: number;
      buildsStructures?: number;
      creativeUse?: number;
      dramaticPlay?: number;
    };
    
    // Section 4: Temperament and Behavioral Characteristics
    temperament?: {
      excitementIntensity?: number;
      frustrationEase?: number;
      calmingSpeed?: number;
      newSituationReaction?: number;
      focusAbility?: number;
      activityLevel?: number;
      routineChangeSensitivity?: number;
      emotionExpression?: number;
      transitionAdaptation?: number;
      environmentSensitivity?: number;
    };
    
    // Section 5: Play Environment and Context
    environment?: {
      playMaterials?: string[];
      activePlayTime?: string;
      attendsDaycare?: boolean;
      daycareHours?: number;
      playsWithOthers?: string;
      playChallenges?: string;
      safetyConcerns?: string;
      parentSupport?: string;
      developmentGoals?: string;
    };
    
    // Section 6: Parent Observations and Concerns
    concerns?: {
      speech?: { hasConcern: boolean; details?: string };
      understanding?: { hasConcern: boolean; details?: string };
      handsFingers?: { hasConcern: boolean; details?: string };
      armsLegs?: { hasConcern: boolean; details?: string };
      behavior?: { hasConcern: boolean; details?: string };
      getsAlong?: { hasConcern: boolean; details?: string };
      learning?: { hasConcern: boolean; details?: string };
      independence?: { hasConcern: boolean; details?: string };
      developmentGoals?: string;
      additionalConcerns?: string;
    };
  };
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
  dismissedQuestionnaireUpdates: Record<string, number>;
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
  dismissQuestionnaireUpdate: (childId: string, version: number) => void;
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
      dismissedQuestionnaireUpdates: {},
      
      addChild: (childData, answers) => {
        const id = nanoid();
        const newChild: ChildProfile = { id, ...childData };
        set((state) => ({
          children: [...state.children, newChild],
          activeChildId: id,
          childAnswers: {
            ...state.childAnswers,
            [id]: answers || { schemas: [], barriers: [], interests: [], questionnaire_version: 2 }
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
        return state.childAnswers[childId] || { schemas: [], barriers: [], interests: [], questionnaire_version: 2 };
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
      
      dismissQuestionnaireUpdate: (childId, version) => {
        set((state) => ({
          dismissedQuestionnaireUpdates: {
            ...state.dismissedQuestionnaireUpdates,
            [childId]: version
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
        savedItems: { brands: [], professionals: [], products: [] },
        dismissedQuestionnaireUpdates: {}
      }),
    }),
    {
      name: 'liza-toph-storage',
    }
  )
);
