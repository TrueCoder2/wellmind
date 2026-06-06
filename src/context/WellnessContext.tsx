import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { DailyCheckIn, JournalEntry, UserProfile, ChatMessage } from '../types';
import * as storage from '../utils/storage';

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
    calculateStreak(checkIns);
    calculateWeeklyWellness(checkIns);
  }, [checkIns]);

  // Initial trigger for AI Summary
  useEffect(() => {
    if (checkIns.length > 0) {
      generateDynamicSummary();
    }
  }, []);

  // Calculate consecutive check-in days
  const calculateStreak = (logs: DailyCheckIn[]) => {
    if (logs.length === 0) {
      setStreak(0);
      return;
    }

    // Sort unique dates descending
    const uniqueDates = Array.from(new Set(logs.map(log => log.date)))
      .map(dStr => new Date(dStr))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const latest = uniqueDates[0];
    latest.setHours(0,0,0,0);

    // If latest check in is neither today nor yesterday, streak is broken
    if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
      setStreak(0);
      return;
    }

    let currentStreak = 1;
    let checkDate = new Date(latest);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      prevDate.setHours(0,0,0,0);

      // Find the expected daily continuation
      const expectedDate = new Date(checkDate);
      expectedDate.setDate(checkDate.getDate() - 1);

      if (prevDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        checkDate = prevDate;
      } else if (prevDate.getTime() < expectedDate.getTime()) {
        // Gap found, stop counting
        break;
      }
    }

    setStreak(currentStreak);
  };

  // Derive simple wellness index from latest 7 check-ins
  const calculateWeeklyWellness = (logs: DailyCheckIn[]) => {
    if (logs.length === 0) {
      setWeeklyWellnessScore(80);
      return;
    }

    const recents = logs.slice(0, 7);
    let scoreSum = 0;

    recents.forEach(ci => {
      // Mood mapping to a 10-point scale
      let moodScore = 5;
      if (ci.mood.includes('Great')) moodScore = 10;
      else if (ci.mood.includes('Good')) moodScore = 8;
      else if (ci.mood.includes('Neutral')) moodScore = 6;
      else if (ci.mood.includes('Low')) moodScore = 3;
      else if (ci.mood.includes('Stressed')) moodScore = 2;

      // Sleep Quality mapping
      let sleepScore = 5;
      if (ci.sleepQuality === 'good') sleepScore = 10;
      if (ci.sleepQuality === 'average') sleepScore = 6;
      if (ci.sleepQuality === 'poor') sleepScore = 2;

      // Inverse stress (10 becomes 0 wellness, 1 becomes 10 wellness)
      const stressWellness = 11 - ci.stressLevel;

      // Energy level map
      const energyWellness = ci.energyLevel;

      // Perfect study hours vs wellness balance definition: Too much is bad, too little is okay.
      // Goal +/- 2 hours is 10. > Goal + 3 is 7 (overwork warning). < Goal - 4 is 6.
      let studyScore = 10;
      const goalDiff = ci.studyHours - userProfile.dailyStudyGoal;
      if (goalDiff > 3) studyScore = 6; // Burning out
      else if (goalDiff < -4) studyScore = 7; // Anxiety/Loss of track
      
      const weightedDayScore = (moodScore * 0.3) + (sleepScore * 0.25) + (stressWellness * 0.25) + (energyWellness * 0.1) + (studyScore * 0.1);
      scoreSum += weightedDayScore;
    });

    const averageScore = Math.min(100, Math.round((scoreSum / recents.length) * 10));
    setWeeklyWellnessScore(averageScore || 80);
  };

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
    calculateWeeklyWellness(defaultsCheckins);
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
