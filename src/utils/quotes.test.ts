import { describe, it, expect } from 'vitest';
import { EXAM_WELLNESS_QUOTES, getRandomQuote } from '../data/quotes';

describe('Quotes Integrity and Utilities', () => {
  it('should contain a solid list of exam wellness quotes', () => {
    expect(EXAM_WELLNESS_QUOTES).toBeDefined();
    expect(Array.isArray(EXAM_WELLNESS_QUOTES)).toBe(true);
    expect(EXAM_WELLNESS_QUOTES.length).toBeGreaterThan(0);
    
    // Each quote must be complete
    EXAM_WELLNESS_QUOTES.forEach(quote => {
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
      expect(quote.text.length).toBeGreaterThan(5);
      expect(quote.author.length).toBeGreaterThan(2);
    });
  });

  it('should deterministically fetch a random quote from the list', () => {
    const quote = getRandomQuote();
    expect(quote).toBeDefined();
    expect(quote).toHaveProperty('text');
    expect(quote).toHaveProperty('author');
    
    // Validate that the returned quote is a member of the official EXAM_WELLNESS_QUOTES array
    const includesQuote = EXAM_WELLNESS_QUOTES.some(
      q => q.text === quote.text && q.author === quote.author
    );
    expect(includesQuote).toBe(true);
  });
});
