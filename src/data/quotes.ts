import { WellnessQuote } from '../types';

export const EXAM_WELLNESS_QUOTES: WellnessQuote[] = [
  {
    text: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and starting on the first one.",
    author: "Mark Twain"
  },
  {
    text: "Your exam score does not define your destiny, your potential, or your absolute human value. It is merely a diagnostic milestone on a much longer journey of learning.",
    author: "MindMate Counsel"
  },
  {
    text: "Give yourself permission to do less when you feel exhausted. Rest is not a waste of study hours; it is the vital active recovery that makes memory consolidation possible.",
    author: "Cognitive Psychology Guide"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep moving, one chapter, one page at a time.",
    author: "Winston Churchill"
  },
  {
    text: "Do not compare your progress with peers. Some topics take longer, some days are slower. Your only competitor is the version of you from yesterday.",
    author: "Aspirant Guide"
  },
  {
    text: "Deep breathing is a natural tranquilizer for the nervous system. By pacing your breathing, you command your brain to switch from fight-or-flight to focused learning.",
    author: "Neurobiology Study"
  },
  {
    text: "You can conquer anything if you divide it into small parts. Consistency defeats intensity every single time.",
    author: "Exam Mindset Guide"
  }
];

export const getRandomQuote = (): WellnessQuote => {
  const day = new Date().getDate();
  const index = day % EXAM_WELLNESS_QUOTES.length;
  return EXAM_WELLNESS_QUOTES[index];
};
