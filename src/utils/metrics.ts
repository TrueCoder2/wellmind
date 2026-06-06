import { DailyCheckIn } from '../types';

/**
 * Calculates the consecutive days checked in.
 * A streak is maintained if there is a check-in either today or yesterday.
 */
export const calculateStreak = (logs: DailyCheckIn[]): number => {
  if (logs.length === 0) {
    return 0;
  }

  // Sort unique dates descending
  const uniqueDates = Array.from(new Set(logs.map(log => log.date)))
    .map(dStr => new Date(dStr))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const latest = uniqueDates[0];
  latest.setHours(0, 0, 0, 0);

  // If latest check in is neither today nor yesterday, streak is broken
  if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let currentStreak = 1;
  let checkDate = new Date(latest);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i]);
    prevDate.setHours(0, 0, 0, 0);

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

  return currentStreak;
};

/**
 * Computes a day score given a check-in and user study targets.
 */
export const calculateDayScore = (ci: DailyCheckIn, dailyStudyGoal: number): number => {
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
  let studyScore = 10;
  const goalDiff = ci.studyHours - dailyStudyGoal;
  if (goalDiff > 3) studyScore = 6; // Burning out
  else if (goalDiff < -4) studyScore = 7; // Anxiety/Loss of track

  const weightedDayScore = (moodScore * 0.3) + (sleepScore * 0.25) + (stressWellness * 0.25) + (energyWellness * 0.1) + (studyScore * 0.1);
  return weightedDayScore;
};

/**
 * Calculates the average weekly wellness score (0-100) from latest 7 check-ins.
 */
export const calculateWeeklyWellness = (logs: DailyCheckIn[], dailyStudyGoal: number): number => {
  if (logs.length === 0) {
    return 80;
  }

  const recents = logs.slice(0, 7);
  let scoreSum = 0;

  recents.forEach(ci => {
    scoreSum += calculateDayScore(ci, dailyStudyGoal);
  });

  const averageScore = Math.min(100, Math.round((scoreSum / recents.length) * 10));
  return averageScore || 80;
};
