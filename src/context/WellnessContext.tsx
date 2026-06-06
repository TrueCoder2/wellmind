import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { DailyCheckIn, JournalEntry, UserProfile, ChatMessage } from '../types';
import * as storage from '../utils/storage';
import { calculateStreak as calcStreakMetric, calculateWeeklyWellness as calcWeeklyScoreMetric } from '../utils/metrics';

interface WellnessContextProps {
  userProfile: UserProfile;
  checkIns: DailyCheckIn[];
  journals: JournalEntry[];
  chatMessages: ChatMessage[];
  loading: boolean;
  aiSummary: string;
  isSummaryLoading: boolean;
  streak: number;
  weeklyWellnessScore: number;
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'timestamp'>) => Promise<void>;
  deleteCheckIn: (id: string) => void;
  addJournalEntry: (title: string, content: string) => Promise<string>;
  deleteJournal: (id: string) => void;
  getJournalReflection: (id: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  generateDynamicSummary: () => Promise<void>;
  resetAll: () => void;
}

const WellnessContext = createContext<WellnessContextProps | undefined>(undefined);

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};

export const WellnessProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(storage.getStoredProfile());
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(storage.getStoredCheckIns());
  const [journals, setJournals] = useState<JournalEntry[]>(storage.getStoredJournals());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(storage.getStoredChat());
  const [loading, setLoading] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [weeklyWellnessScore, setWeeklyWellnessScore] = useState<number>(80);

  // Sync state and derive metrics
  useEffect(() => {
    setStreak(calcStreakMetric(checkIns));
    setWeeklyWellnessScore(calcWeeklyScoreMetric(checkIns, userProfile.dailyStudyGoal));
  }, [checkIns, userProfile.dailyStudyGoal]);

  // Initial trigger for AI Summary
  useEffect(() => {
    if (checkIns.length > 0) {
      generateDynamicSummary();
    }
  }, []);

  const addCheckIn = async (ci: Omit<DailyCheckIn, 'id' | 'timestamp'>) => {
    const newCi: DailyCheckIn = {
      ...ci,
      id: `ci_${Date.now()}`,
      timestamp: Date.now(),
    };

    const updated = [newCi, ...checkIns];
    setCheckIns(updated);
    storage.saveStoredCheckIns(updated);

    // Dynamic prompt to trigger a micro AI wellness summary update
    try {
      setIsSummaryLoading(true);
      const res = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIns: updated }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const deleteCheckIn = (id: string) => {
    const updated = checkIns.filter(ci => ci.id !== id);
    setCheckIns(updated);
    storage.saveStoredCheckIns(updated);
  };

  const addJournalEntry = async (title: string, content: string): Promise<string> => {
    const id = `j_${Date.now()}`;
    const newJournal: JournalEntry = {
      id,
      title: title || 'Untitled Reflection',
      content,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      aiReflection: 'AI Coach is composing your personal reassurance guidelines...'
    };

    const updated = [newJournal, ...journals];
    setJournals(updated);
    storage.saveStoredJournals(updated);

    // Call server to trigger reflection asynchronously so user can see it load
    getJournalReflectionAsync(id, title, content, updated);
    return id;
  };

  const getJournalReflectionAsync = async (id: string, title: string, content: string, currentJournalsList: JournalEntry[]) => {
    try {
      const res = await fetch('/api/gemini/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      
      const reflectionText = data.success && data.reflection 
        ? data.reflection 
        : "AI Companion is currently restoring its network stack. Remember, focusing on bite-sized targets always builds steady results!";

      const updated = currentJournalsList.map(j => {
        if (j.id === id) {
          return { ...j, aiReflection: reflectionText };
        }
        return j;
      });

      setJournals(updated);
      storage.saveStoredJournals(updated);
    } catch (e) {
      const updated = currentJournalsList.map(j => {
        if (j.id === id) {
          return { ...j, aiReflection: "I couldn't generate a reflective analysis just now. Keep writing! Writing acts as therapeutic stress release in itself." };
        }
        return j;
      });
      setJournals(updated);
      storage.saveStoredJournals(updated);
    }
  };

  const getJournalReflection = async (id: string) => {
    const j = journals.find(entry => entry.id === id);
    if (!j) return;

    // Reset reflection to loading
    const updatedLoading = journals.map(entry => {
      if (entry.id === id) {
        return { ...entry, aiReflection: 'Analyzing and crafting personalized coping suggestions...' };
      }
      return entry;
    });
    setJournals(updatedLoading);

    await getJournalReflectionAsync(id, j.title, j.content, journals);
  };

  const deleteJournal = (id: string) => {
    const updated = journals.filter(j => j.id !== id);
    setJournals(updated);
    storage.saveStoredJournals(updated);
  };

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    storage.saveStoredProfile(profile);
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}_u`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    const withUser = [...chatMessages, userMsg];
    setChatMessages(withUser);
    storage.saveStoredChat(withUser);

    setLoading(true);

    try {
      const lastCi = checkIns[0] || null;
      const res = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: withUser,
          userProfile,
          lastCheckIn: lastCi
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `chat_${Date.now()}_a`,
        sender: 'ai',
        text: data.text || "I was unable to retrieve a response from server-side modules. Remember to verify your API configurations in Settings.",
        timestamp: Date.now()
      };
      
      const withBot = [...withUser, botMsg];
      setChatMessages(withBot);
      storage.saveStoredChat(withBot);
    } catch (e) {
      const botMsg: ChatMessage = {
        id: `chat_${Date.now()}_a`,
        sender: 'ai',
        text: "My neural models are currently resting before your next exam. Remember, sleeping early is a highly-yielding strategy!",
        timestamp: Date.now()
      };
      const withBot = [...withUser, botMsg];
      setChatMessages(withBot);
      storage.saveStoredChat(withBot);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const resetChat: ChatMessage[] = [
      {
        id: `chat_${Date.now()}_reset`,
        sender: 'ai',
        text: `Chat cleared! How can I assist you with your study schedules, test anxiety, or focus strategies right now?`,
        timestamp: Date.now()
      }
    ];
    setChatMessages(resetChat);
    storage.saveStoredChat(resetChat);
  };

  const generateDynamicSummary = async () => {
    if (checkIns.length === 0) {
      setAiSummary("Please complete your very first checklist form to receive detailed analytics insights.");
      return;
    }
    
    setIsSummaryLoading(true);
    try {
      const res = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIns }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary("Try configuring your Google Gemini key in Secrets to get high-performance personalized analytics summaries.");
      }
    } catch (e) {
      setAiSummary("We couldn't generate your dynamic profile insights at this tier. Take dynamic deep breaks!");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const resetAll = () => {
    storage.clearAllStorage();
    const defaultsProfile = storage.getStoredProfile();
    const defaultsCheckins = storage.getStoredCheckIns();
    const defaultsJournals = storage.getStoredJournals();
    const defaultsChat = storage.getStoredChat();

    setUserProfile(defaultsProfile);
    setCheckIns(defaultsCheckins);
    setJournals(defaultsJournals);
    setChatMessages(defaultsChat);
    setStreak(0);
    setWeeklyWellnessScore(calcWeeklyScoreMetric(defaultsCheckins, defaultsProfile.dailyStudyGoal));
    generateDynamicSummary();
  };

  return (
    <WellnessContext.Provider value={{
      userProfile,
      checkIns,
      journals,
      chatMessages,
      loading,
      aiSummary,
      isSummaryLoading,
      streak,
      weeklyWellnessScore,
      addCheckIn,
      deleteCheckIn,
      addJournalEntry,
      deleteJournal,
      getJournalReflection,
      updateProfile,
      sendChatMessage,
      clearChat,
      generateDynamicSummary,
      resetAll,
    }}>
      {children}
    </WellnessContext.Provider>
  );
};
