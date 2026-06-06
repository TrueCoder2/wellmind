import { DailyCheckIn, JournalEntry, UserProfile, ChatMessage } from '../types';

// Storage keys
const STORAGE_KEYS = {
  CHECK_INS: 'mindmate_checkins',
  JOURNALS: 'mindmate_journals',
  PROFILE: 'mindmate_profile',
  CHAT_SESSION: 'mindmate_chat',
};

// Seed records
const DEFAULT_PROFILE: UserProfile = {
  name: 'Sundar Pichai',
  examType: 'UPSC',
  targetYear: '2027',
  dailyStudyGoal: 8,
};

const SEED_CHECK_INS = (): DailyCheckIn[] => {
  const checkins: DailyCheckIn[] = [];
  const today = new Date();
  
  // Triggers and Moods
  const data = [
    { offset: 6, mood: '😐 Neutral', stress: 7, energy: 5, sleep: 'average', hours: 6.5, trigger: 'Academic Pressure', notes: 'First day reviewing standard syllabus. Felt underprepared.' },
    { offset: 5, mood: '😔 Low', stress: 8, energy: 4, sleep: 'poor', hours: 4.0, trigger: 'Mock Test Score', notes: 'Took a mock test and scores were lower than expected.' },
    { offset: 4, mood: '🙂 Good', stress: 5, energy: 7, sleep: 'good', hours: 8.5, trigger: 'none', notes: 'Revised modern history. Had a breakthrough on policy studies.' },
    { offset: 3, mood: '😀 Great', stress: 3, energy: 8, sleep: 'good', hours: 9.0, trigger: 'none', notes: 'Sleep was perfect, covered key economics updates smoothly.' },
    { offset: 2, mood: '😐 Neutral', stress: 6, energy: 6, sleep: 'average', hours: 7.5, trigger: 'Lack of Time', notes: 'Time management was hard, current affairs took too long.' },
    { offset: 1, mood: '😫 Stressed', stress: 9, energy: 3, sleep: 'poor', hours: 8.0, trigger: 'Family Expectations', notes: 'Feeling an exam-focused burden from chats at home.' },
  ];

  data.forEach(item => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.offset);
    const dateStr = d.toISOString().split('T')[0];
    
    checkins.push({
      id: `seed_ci_${item.offset}`,
      date: dateStr,
      timestamp: d.getTime(),
      mood: item.mood,
      stressLevel: item.stress,
      energyLevel: item.energy,
      sleepQuality: item.sleep as 'poor' | 'average' | 'good',
      studyHours: item.hours,
      stressTrigger: item.trigger,
      notes: item.notes,
      aiWellnessSummary: 'You showed stable performance, but high pressure triggers were visible. Prioritize micro-breaks.'
    });
  });

  return checkins;
};

const SEED_JOURNALS = (): JournalEntry[] => {
  const journals: JournalEntry[] = [];
  const today = new Date();
  
  // Seed entries
  const j1Date = new Date(today);
  j1Date.setDate(today.getDate() - 4);
  journals.push({
    id: 'seed_j_1',
    date: j1Date.toISOString().split('T')[0],
    timestamp: j1Date.getTime(),
    title: 'The Weight of the Syllabus',
    content: `Sometimes looking at the vast syllabus of the UPSC exam makes me feel completely paralyzed. There are so many subjects—history, polity, geography, ethics, current affairs... How does someone keep all of this in their head? Today I spent an hour just staring at my schedule without reading. Eventually, I calmed myself down, resolved to study just one chapter of history, and managed to do it. It was a small victory, but it taught me that I just need to take it one hour, one topic at a time. Trying to solve the whole exam at once is too scary.`,
    aiReflection: `**Observations:** You experienced feelings of paralysis from exam scope, followed by successful coping via micro-focusing (chunking your goals into smaller parts).\n\n**Coaching Guidance:** Highly adaptive coping choice! This approach ("segmentation") diminishes cognitive overload and interrupts negative runaway thoughts. When the general requirements feel paralyzing, continue treating each subject as isolated micro-tasks. You are building exceptional mental discipline.`
  });

  const j2Date = new Date(today);
  j2Date.setDate(today.getDate() - 1);
  journals.push({
    id: 'seed_j_2',
    date: j2Date.toISOString().split('T')[0],
    timestamp: j2Date.getTime(),
    title: 'Anxiety Before Mock Tests',
    content: `I have another complete mock testing day tomorrow morning. My stomach has been in knots all day today and I keep questioning if I am remembering anything at all. My parents called to encourage me which was sweet, but I felt a strong pressure to deliver. I studied for 8 hours but felt like I was mostly re-reading things out of fear. I'm going to try to sleep early tonight, although feeling restless.`,
    aiReflection: `**Observations:** Antedecent test anxiety coupled with performance pressure from family encouragement is triggering a state of cognitive restlessness.\n\n**Coaching Guidance:** Exam anxiety often manifests as frantic "over-studying" or hyper-vigilance. Going to sleep early is the high-yield decision tonight. Do some box breathing (4-4-4-4) for 5 minutes in bed to disengage your nervous system. Remember, a mock test is just a data collector, not a final verdict.`
  });

  return journals;
};

export const getStoredProfile = (): UserProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_PROFILE;
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getStoredCheckIns = (): DailyCheckIn[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  if (!data) {
    const seeds = SEED_CHECK_INS();
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(seeds));
    return seeds;
  }
  try {
    const parsed = JSON.parse(data) as DailyCheckIn[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
};

export const saveStoredCheckIns = (checkins: DailyCheckIn[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkins));
};

export const getStoredJournals = (): JournalEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
  if (!data) {
    const seeds = SEED_JOURNALS();
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(seeds));
    return seeds;
  }
  try {
    const parsed = JSON.parse(data) as JournalEntry[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
};

export const saveStoredJournals = (journals: JournalEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
};

export const getStoredChat = (): ChatMessage[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHAT_SESSION);
  if (!data) {
    const initialText = `Hello! I am your AI Exam Wellness Coach. 
Preparing for major exams like ${DEFAULT_PROFILE.examType} takes immense dedication and places high pressure on your mind. 

I am here to help you identify stress patterns, design custom coping workflows, and integrate smart study-life practices. 

How are your levels of burnout, energy, or anxiety feeling today? Let me help you stay grounded. 

*(Please note: I provide wellness educational support. I am not a mental health professional, and my counsel is supportive rather than diagnostic.)*`;
    const defaultChat = [{
      id: 'default_chat_1',
      sender: 'ai' as const,
      text: initialText,
      timestamp: Date.now(),
    }];
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSION, JSON.stringify(defaultChat));
    return defaultChat;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveStoredChat = (chat: ChatMessage[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHAT_SESSION, JSON.stringify(chat));
};

export const clearAllStorage = (): void => {
  localStorage.clear();
};
