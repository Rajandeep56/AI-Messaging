// This file tests the formatTimestamp function from the chats screen
// Since it's not exported as a separate utility, we'll test it as a standalone function

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 7) {
    // Show date for messages older than a week
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (days > 0) {
    // Show day of week for messages within a week
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // Show time for messages from today
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}

describe('formatTimestamp', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should format today\'s messages as time', () => {
    const todayMorning = '2024-03-20T08:30:00Z';
    const result = formatTimestamp(todayMorning);
    
    // Should show time in 12-hour format
    expect(result).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });

  it('should format yesterday\'s messages as day of week', () => {
    const yesterday = '2024-03-19T10:00:00Z';
    const result = formatTimestamp(yesterday);
    
    // Should show day of week
    expect(result).toBe('Tue');
  });

  it('should format messages from this week as day of week', () => {
    const thisWeek = '2024-03-18T10:00:00Z';
    const result = formatTimestamp(thisWeek);
    
    // Should show day of week
    expect(result).toBe('Mon');
  });

  it('should format messages older than a week as date', () => {
    const lastWeek = '2024-03-12T10:00:00Z';
    const result = formatTimestamp(lastWeek);
    
    // Should show month and day
    expect(result).toBe('Mar 12');
  });

  it('should format messages much older as date', () => {
    const oldMessage = '2024-02-15T10:00:00Z';
    const result = formatTimestamp(oldMessage);
    
    // Should show month and day
    expect(result).toBe('Feb 15');
  });

  it('should handle edge case of exactly 7 days ago', () => {
    const exactlyWeekAgo = '2024-03-13T12:00:00Z';
    const result = formatTimestamp(exactlyWeekAgo);
    
    // Should show day of week (not date) since it's exactly 7 days
    expect(result).toBe('Wed');
  });

  it('should handle edge case of exactly 8 days ago', () => {
    const eightDaysAgo = '2024-03-12T12:00:00Z';
    const result = formatTimestamp(eightDaysAgo);
    
    // Should show date since it's more than 7 days
    expect(result).toBe('Mar 12');
  });

  it('should handle invalid date strings', () => {
    const invalidDate = 'invalid-date';
    
    expect(() => formatTimestamp(invalidDate)).toThrow();
  });

  it('should handle empty string', () => {
    const emptyString = '';
    
    expect(() => formatTimestamp(emptyString)).toThrow();
  });

  it('should handle future dates', () => {
    const futureDate = '2024-03-25T12:00:00Z';
    const result = formatTimestamp(futureDate);
    
    // Should still format correctly even for future dates
    expect(result).toBe('Mon');
  });

  it('should handle midnight times', () => {
    const midnight = '2024-03-20T00:00:00Z';
    const result = formatTimestamp(midnight);
    
    // Should show 12:00 AM
    expect(result).toBe('12:00 AM');
  });

  it('should handle noon times', () => {
    const noon = '2024-03-20T12:00:00Z';
    const result = formatTimestamp(noon);
    
    // Should show 12:00 PM
    expect(result).toBe('12:00 PM');
  });

  it('should handle single digit minutes', () => {
    const singleDigitMinute = '2024-03-20T10:05:00Z';
    const result = formatTimestamp(singleDigitMinute);
    
    // Should show 10:05 AM (with leading zero)
    expect(result).toBe('10:05 AM');
  });

  it('should handle different timezones correctly', () => {
    // Test with a timestamp that includes timezone info
    const withTimezone = '2024-03-20T10:00:00+05:30';
    const result = formatTimestamp(withTimezone);
    
    // Should still format correctly
    expect(result).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });
}); 