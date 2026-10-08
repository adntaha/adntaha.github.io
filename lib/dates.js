// Date formatting in one place, always in Montréal time so a post written
// at 11pm doesn't show up as the next day.

const zone = 'America/Toronto';

// "Apr 5, 2026"
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-CA', { timeZone: zone, year: 'numeric', month: 'short', day: 'numeric' });

// "2026-04-05", for <time datetime> attributes
export const isoDate = (date) => new Date(date).toLocaleDateString('en-CA', { timeZone: zone });
