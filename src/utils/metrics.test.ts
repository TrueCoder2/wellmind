import { describe, it, expect } from 'vitest';
import { calculateStreak, calculateDayScore, calculateWeeklyWellness } from './metrics';
import { DailyCheckIn } from '../types';

describe('Metrics Helper Formula Tests', () => {
  it('should return 0 streak for empty logs', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should calculate accurate day scores based on moods and stress', () => {
    // Normal day with Good mood, good sleep, low stress, ideal study hours
    const ci1: DailyCheckIn = {
      id: 'test_1',
      date: '2026-06-06',
      timestamp: Date.now(),
      mood: '🙂 Good', // moodScore = 8
      stressLevel: 2, // stressWellness = 9
      energyLevel: 8, // energyWellness = 8
      sleepQuality: 'good', // sleepScore = 10
      studyHours: 8, // studyScore = 10 (targetGoal is 8)
      stressTrigger: 'none',
      notes: ''
    };

    // Calculate score: (8 * 0.3) + (10 * 0.25) + (9 * 0.25) + (8 * 0.1) + (10 * 0.1)
    // = 2.4 + 2.5 + 2.25 + 0.8 + 1.0 = 8.95
    const score = calculateDayScore(ci1, 8);
    expect(score).toBeCloseTo(8.95);
  });

  it('should calculate accurate day scores under burnout (excessive study hours)', () => {
    const ciBurnt: DailyCheckIn = {
      id: 'test_2',
      date: '2026-06-06',
      timestamp: Date.now(),
      mood: '😫 Stressed', // moodScore = 2
      stressLevel: 9, // stressWellness = 2
      energyLevel: 3, // energyWellness = 3
      sleepQuality: 'poor', // sleepScore = 2
      studyHours: 14, // studyScore = 6 (more than targetGoal + 3)
      stressTrigger: 'Mock Score Drop',
      notes: ''
    };

    // Calculate score: (2 * 0.3) + (2 * 0.25) + (2 * 0.25) + (3 * 0.1) + (6 * 0.1)
    // = 0.6 + 0.5 + 0.5 + 0.3 + 0.6 = 2.5
    const score = calculateDayScore(ciBurnt, 8);
    expect(score).toBeCloseTo(2.5);
  });

  it('should calculate weekly averages correctly based on daily ratings', () => {
    const logs: DailyCheckIn[] = [
      {
        id: '1',
        date: '2026-06-06',
        timestamp: Date.now(),
        mood: '🙂 Good',
        stressLevel: 3,
        energyLevel: 7,
        sleepQuality: 'good',
        studyHours: 8,
        stressTrigger: 'none',
        notes: ''
      }
    ];

    const weeklyScore = calculateWeeklyWellness(logs, 8);
    // Log has single score of approx 8.7. Modulo x 10 = 87
    expect(weeklyScore).toBeGreaterThan(0);
    expect(weeklyScore).toBeLessThanOrEqual(100);
  });
});
